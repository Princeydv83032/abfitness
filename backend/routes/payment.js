const router    = require('express').Router()
const Razorpay  = require('razorpay')
const crypto    = require('crypto')
const { createClient } = require('@supabase/supabase-js')
const { sendInvoiceEmail } = require('../utils/email')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// ── Create Order ─────────────────────────────────────
router.post('/create-order', async (req, res) => {
  const { amount, memberId, plan } = req.body

  try {
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
router.post('/verify', async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    memberId,
    plan,
    amount,
  } = req.body

  try {
    // Step 1 — Signature verify karo
    const body      = razorpay_order_id + '|' + razorpay_payment_id
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' })
    }

    // Step 2 — Expiry calculate karo
    const today = new Date()
    let expiryDate = new Date()

    if (plan === 'monthly')   expiryDate.setDate(today.getDate() + 30)
    if (plan === 'quarterly') expiryDate.setDate(today.getDate() + 90)
    if (plan === 'yearly')    expiryDate.setDate(today.getDate() + 365)

    const expiresAt = expiryDate.toISOString().split('T')[0]

    // Step 3 — Payment Supabase mein save karo
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

    // Step 4 — Member update karo
    await supabase
      .from('members')
      .update({
        expires_at: expiresAt,
        plan,
        status: 'active',
      })
      .eq('id', memberId)

    // Step 5 — Invoice email bhejo
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

    res.json({
      success:   true,
      expiresAt,
      paymentId: razorpay_payment_id,
    })

  } catch (err) {
    console.log('Verify error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router