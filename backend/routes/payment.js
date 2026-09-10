const router    = require('express').Router()
const Razorpay  = require('razorpay')
const crypto    = require('crypto')
const { createClient } = require('@supabase/supabase-js')
const { sendInvoiceEmail } = require('../utils/email')
const { verifyMember, verifyOwner } = require('../middleware/auth')
const { paymentLimiter } = require('../middleware/rateLimit')
const { validate } = require('../middleware/validate')
const {
  createOrder,
  verify: verifySchema,
  addMember,
  logPayment,
} = require('../validators/payment')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

const PLAN_DAYS = { monthly: 30, quarterly: 90, yearly: 365 }

// Owner ke settings.fees mein value na ho to bhi order create ho sake
const DEFAULT_FEES = { monthly: 1500, quarterly: 4000, yearly: 15000 }

// Owner Settings page se jo fees set kiye gaye hain wahi charge honge —
// client jo bhi amount bheje use kabhi trust nahi karte
const getFees = async () => {
  const { data } = await supabase.from('owner').select('settings').single()
  return { ...DEFAULT_FEES, ...(data?.settings?.fees || {}) }
}

// ── Create Order ─────────────────────────────────────
// memberId client se nahi, verified token se - warna koi bhi kisi aur
// member ke liye order bana sakta tha
router.post('/create-order', paymentLimiter, verifyMember, validate(createOrder), async (req, res) => {
  const { plan } = req.body
  const memberId = req.member.id

  if (!PLAN_DAYS[plan]) {
    return res.status(400).json({ success: false, message: 'Invalid plan' })
  }

  try {
    const fees   = await getFees()
    const amount = fees[plan]

    const order = await razorpay.orders.create({
      amount:   amount * 100, // Paise mein
      currency: 'INR',
      receipt:  `receipt_${Date.now()}`,
      notes: {
        memberId,
        plan,
      }
    })

    res.json({
      success:  true,
      orderId:  order.id,
      amount:   order.amount,
      currency: order.currency,
      keyId:    process.env.RAZORPAY_KEY_ID,
    })

  } catch (err) {
    console.log('Razorpay order error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── Verify Payment ───────────────────────────────────
// Payment record karo + member activate karo — /verify (client-side, turant
// UX ke liye) aur webhook (Razorpay se server-to-server, agar client-side
// call kabhi bhi na pahunche to backstop) dono isi ek function ko call
// karte hain, taaki dono paths mein exactly same idempotency/logic ho aur
// do jagah maintain na karni pade
async function fulfillPayment(razorpay_order_id, razorpay_payment_id) {
  // memberId/plan/amount client se nahi, Razorpay ke order se khud nikalo —
  // order.notes wahi hai jo create-order ke waqt server ne set kiya tha,
  // isliye ye tamper-proof source of truth hai
  const order    = await razorpay.orders.fetch(razorpay_order_id)
  const memberId = order.notes?.memberId
  const plan     = order.notes?.plan
  const amount   = order.amount / 100 // paise → rupees

  if (!memberId || !PLAN_DAYS[plan]) {
    return { success: false, message: 'Invalid order' }
  }

  // Same payment dobara process na ho jaaye - client /verify aur webhook
  // dono isi ek payment ke liye call ho sakte hain (race condition), aur
  // client retry/double-click bhi ho sakta hai
  const { data: existing } = await supabase
    .from('payments')
    .select('id')
    .eq('upi_ref', razorpay_payment_id)
    .maybeSingle()

  if (existing) {
    const { data: member } = await supabase
      .from('members')
      .select('expires_at')
      .eq('id', memberId)
      .single()
    return { success: true, alreadyProcessed: true, expiresAt: member?.expires_at, paymentId: razorpay_payment_id }
  }

  const today      = new Date()
  const expiryDate = new Date()
  expiryDate.setDate(today.getDate() + PLAN_DAYS[plan])
  const expiresAt = expiryDate.toISOString().split('T')[0]

  const { data: payment, error: paymentError } = await supabase
    .from('payments')
    .insert({
      member_id: memberId,
      amount,
      method:    'razorpay',
      upi_ref:   razorpay_payment_id,
      plan,
      paid_at:   new Date().toISOString(),
    })
    .select()
    .single()

  if (paymentError) throw paymentError

  await supabase
    .from('members')
    .update({
      expires_at: expiresAt,
      plan,
      status: 'active',
    })
    .eq('id', memberId)

  const { data: member } = await supabase
    .from('members')
    .select('*')
    .eq('id', memberId)
    .single()

  const { data: owner } = await supabase
    .from('owner')
    .select('gym_name')
    .single()

  if (member?.email) {
    sendInvoiceEmail({ member, payment, gymName: owner?.gym_name })
      .catch((err) => console.log('Invoice email error:', err.message))
  }

  return { success: true, expiresAt, paymentId: razorpay_payment_id }
}

router.post('/verify', paymentLimiter, validate(verifySchema), async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body

  try {
    // Signature verify karo (checkout response ka signature - alag secret,
    // webhook wale se alag hai)
    const body     = razorpay_order_id + '|' + razorpay_payment_id
    const expected = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' })
    }

    const result = await fulfillPayment(razorpay_order_id, razorpay_payment_id)
    if (!result.success) {
      return res.status(400).json(result)
    }

    res.json(result)
  } catch (err) {
    console.log('Verify error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── Razorpay Webhook (server-to-server backstop) ──────
// Agar checkout beech mein interrupt ho jaaye (tab band, network drop) to
// client ka /verify call kabhi backend tak pahunchta hi nahi, chahe
// Razorpay ne actually charge kar liya ho — is route ke bina aisa payment
// hamesha ke liye "missing" reh jaata. Razorpay khud seedha yahan hit
// karta hai jab payment capture hoti hai, chahe client kahin bhi ho.
//
// Signature raw request body par verify hoti hai (JSON.parse karne se
// pehle wale exact bytes) - isliye is route ko index.js mein express.json()
// se pehle apna khud ka express.raw() middleware milta hai, req.body yahan
// ek Buffer hota hai, string nahi.
async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature']
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!webhookSecret) {
      console.log('Webhook error: RAZORPAY_WEBHOOK_SECRET not configured')
      return res.status(500).json({ success: false, message: 'Webhook not configured' })
    }

    if (!signature) {
      return res.status(400).json({ success: false, message: 'Missing signature' })
    }

    const expected = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body) // raw Buffer
      .digest('hex')

    if (expected !== signature) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature' })
    }

    const payload = JSON.parse(req.body.toString('utf8'))

    // Sirf successful payment capture handle karo - baaki events (jaise
    // order.paid, payment.failed) ko 200 se acknowledge karo taaki Razorpay
    // retry na kare, lekin kuch process nahi karte
    if (payload.event !== 'payment.captured') {
      return res.json({ success: true, ignored: payload.event })
    }

    const payment = payload.payload?.payment?.entity
    if (!payment?.order_id || !payment?.id) {
      return res.json({ success: true, message: 'No payment entity in payload' })
    }

    const result = await fulfillPayment(payment.order_id, payment.id)
    if (!result.success) {
      console.log('Webhook: fulfillPayment failed', result.message, payment.order_id)
    }

    // Hamesha 200 bhejo agar humne payload process kar liya (chahe
    // fulfillPayment ka logic-level result false ho) - warna Razorpay
    // isi cheez ko baar-baar retry karta rahega
    res.json({ success: true })
  } catch (err) {
    console.log('Webhook error:', err)
    // 500 sirf real/transient failure (DB down, etc.) ke liye - Razorpay
    // ise retry karega
    res.status(500).json({ success: false, error: err.message })
  }
}

// ── Member: apna payment history ──────────────────────
router.get('/my-history', verifyMember, async (req, res) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('member_id', req.member.id)
    .order('paid_at', { ascending: false })

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, payments: data })
})

// ── Owner: sabka payment history (optional ?from=&to= date filter) ───
router.get('/all', verifyOwner, async (req, res) => {
  const { from, to } = req.query
  let query = supabase
    .from('payments')
    .select('*, members(name, member_id)')
    .order('paid_at', { ascending: false })

  if (from) query = query.gte('paid_at', from)
  if (to) query = query.lte('paid_at', to)

  const { data, error } = await query
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, payments: data })
})

// ── Owner: ek specific member ka payment history ──────
router.get('/member/:memberId', verifyOwner, async (req, res) => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('member_id', req.params.memberId)
    .order('paid_at', { ascending: false })

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, payments: data })
})

// ── Owner: naya member add karo (+ initial payment) ───────────────────
router.post('/add-member', verifyOwner, validate(addMember), async (req, res) => {
  const { name, phone, plan, paymentMethod, upiRef, joinDate } = req.body

  if (!name || !phone || phone.length !== 10) {
    return res.status(400).json({ success: false, message: 'Invalid name/phone' })
  }
  if (!PLAN_DAYS[plan]) {
    return res.status(400).json({ success: false, message: 'Invalid plan' })
  }

  try {
    const { count } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
    const memberId = `GYM-${String((count || 0) + 1).padStart(4, '0')}`

    const expiryDate = new Date(joinDate || new Date())
    expiryDate.setDate(expiryDate.getDate() + PLAN_DAYS[plan])
    const expiresAt = expiryDate.toISOString().split('T')[0]

    const { data: member, error: memberError } = await supabase
      .from('members')
      .insert({
        member_id:  memberId,
        name,
        phone,
        plan,
        joined_at:  joinDate || new Date().toISOString().split('T')[0],
        expires_at: expiresAt,
        status:     'active',
      })
      .select()
      .single()

    if (memberError) throw memberError

    const fees = await getFees()

    await supabase.from('payments').insert({
      member_id: member.id,
      amount:    fees[plan],
      method:    paymentMethod || 'cash',
      upi_ref:   upiRef || null,
      plan,
    })

    res.json({ success: true, member })
  } catch (err) {
    console.log('Add member error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── Owner: existing member ke liye manual payment log karo ────────────
router.post('/log', verifyOwner, validate(logPayment), async (req, res) => {
  const { memberId, plan, method, upiRef } = req.body

  if (!memberId || !PLAN_DAYS[plan]) {
    return res.status(400).json({ success: false, message: 'Invalid member/plan' })
  }

  try {
    const fees = await getFees()

    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + PLAN_DAYS[plan])
    const expiresAt = expiryDate.toISOString().split('T')[0]

    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        member_id: memberId,
        amount:    fees[plan],
        method:    method || 'cash',
        upi_ref:   upiRef || null,
        plan,
        paid_at:   new Date().toISOString(),
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    const { error: memberError } = await supabase
      .from('members')
      .update({ expires_at: expiresAt, plan, status: 'active' })
      .eq('id', memberId)

    if (memberError) throw memberError

    const { data: member } = await supabase
      .from('members')
      .select('*')
      .eq('id', memberId)
      .single()

    if (member?.email) {
      sendInvoiceEmail({ member, payment, gymName: req.owner.gym_name })
        .catch((err) => console.log('Invoice email error:', err.message))
    }

    res.json({ success: true, payment, expiresAt })
  } catch (err) {
    console.log('Log payment error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ── Owner: member picker list (LogPayment page ke liye) ───────────────
router.get('/members-for-logging', verifyOwner, async (req, res) => {
  const { data, error } = await supabase
    .from('members')
    .select('id, name, member_id, plan, expires_at, email')
    .order('name')

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, members: data })
})

module.exports = { router, handleWebhook }
