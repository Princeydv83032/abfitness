const router = require('express').Router()
const { createClient } = require('@supabase/supabase-js')
const { verifyFirebaseToken, verifyMember, verifyOwner } = require('../middleware/auth')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const PLAN_DAYS = { monthly: 30, quarterly: 90, yearly: 365 }

// ═══════════════════════════════════════════════════════════
// Member-self routes — apna hi profile, verifyMember se req.member milta hai
// ═══════════════════════════════════════════════════════════

router.get('/me', verifyMember, async (req, res) => {
  res.json({ success: true, member: req.member })
})

// Sirf ye fields self-update kar sakta hai - status/plan/expires_at jaisi
// cheezein sirf owner-side routes se hi badalti hain
const SELF_UPDATABLE_FIELDS = ['name', 'goal', 'profile_photo', 'notification_prefs', 'is_veg', 'custom_diet']

router.patch('/me', verifyMember, async (req, res) => {
  const updates = {}
  for (const key of SELF_UPDATABLE_FIELDS) {
    if (key in req.body) updates[key] = req.body[key]
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No valid fields to update' })
  }

  const { data, error } = await supabase
    .from('members')
    .update(updates)
    .eq('id', req.member.id)
    .select()
    .single()

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, member: data })
})

// "Cancel Request" — sirf apni pending request delete kar sakta hai
router.delete('/me', verifyMember, async (req, res) => {
  if (req.member.status !== 'pending') {
    return res.status(400).json({ success: false, message: 'Only a pending request can be cancelled' })
  }

  const { error } = await supabase
    .from('members')
    .delete()
    .eq('id', req.member.id)
    .eq('status', 'pending')

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

// ═══════════════════════════════════════════════════════════
// Registration / pre-account routes — abhi koi members row exist nahi
// karti, isliye verifyMember use nahi ho sakta, sirf token verify hota hai
// ═══════════════════════════════════════════════════════════

const buildIdentityFilter = ({ uid, email }) =>
  email ? `google_id.eq.${uid},email.eq.${email}` : `google_id.eq.${uid}`

// Login / duplicate-check — is Google account se pehle se koi member hai?
router.get('/lookup', verifyFirebaseToken, async (req, res) => {
  const { uid, email } = req.firebaseUser

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .or(buildIdentityFilter({ uid, email }))
    .order('created_at', { ascending: true })
    .limit(1)

  if (error) return res.status(500).json({ success: false, error: error.message })

  let member = data?.[0] || null

  // Phone/OTP se pehle join kiya tha to google_id abhi tak save nahi -
  // login pe backfill kar do
  if (member && !member.google_id && uid) {
    await supabase.from('members').update({ google_id: uid }).eq('id', member.id)
    member = { ...member, google_id: uid }
  }

  res.json({ success: true, member })
})

// Naya registration
router.post('/register', verifyFirebaseToken, async (req, res) => {
  const { name, phone, age, goal, profilePhoto } = req.body
  const { uid, email } = req.firebaseUser

  if (!name || !phone || phone.length !== 10 || !profilePhoto) {
    return res.status(400).json({ success: false, message: 'Name, 10-digit phone aur profile photo zaroori hain' })
  }

  try {
    // Defense in depth - registration ke waqt hi dobara duplicate check
    // (race condition / retry se bachne ke liye)
    const { data: existing } = await supabase
      .from('members')
      .select('id')
      .or(buildIdentityFilter({ uid, email }))
      .limit(1)

    if (existing?.length) {
      return res.status(409).json({ success: false, message: 'This account is already registered' })
    }

    // member_id atomically generate karo (last row ke number se +1)
    const { data: last } = await supabase
      .from('members')
      .select('member_id')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const lastNum = last?.member_id ? parseInt(last.member_id.replace('GYM-', '')) || 0 : 0
    const memberId = `GYM-${String(lastNum + 1).padStart(4, '0')}`

    const { data: member, error } = await supabase
      .from('members')
      .insert({
        member_id: memberId,
        name,
        phone,
        email: email || null,
        google_id: uid,
        age: age ? parseInt(age) : null,
        plan: 'monthly',
        joined_at: new Date().toISOString().split('T')[0],
        expires_at: new Date().toISOString().split('T')[0],
        status: 'pending',
        self_registered: true,
        profile_photo: profilePhoto,
        goal: goal || 'General Fitness',
      })
      .select()
      .single()

    if (error) throw error

    res.json({ success: true, member })
  } catch (err) {
    console.log('Register error:', err)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ═══════════════════════════════════════════════════════════
// Owner-side routes — arbitrary members, verifyOwner se protected
// ═══════════════════════════════════════════════════════════

router.get('/list', verifyOwner, async (req, res) => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, members: data })
})

router.get('/pending', verifyOwner, async (req, res) => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, members: data })
})

router.get('/expiring', verifyOwner, async (req, res) => {
  const days = parseInt(req.query.days) || 7
  const today = new Date().toISOString().split('T')[0]
  const future = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('members')
    .select('*')
    .gte('expires_at', today)
    .lte('expires_at', future)
    .eq('status', 'active')

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, members: data })
})

// active/new-this-month/expired counts — OwnerDashboard aur Reports dono
// isi ko use karte hain
router.get('/stats', verifyOwner, async (req, res) => {
  const { month } = req.query // "YYYY-MM", optional

  try {
    const [activeRes, expiredRes, newRes] = await Promise.all([
      supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('members').select('*', { count: 'exact', head: true }).eq('status', 'expired'),
      month
        ? supabase
            .from('members')
            .select('*', { count: 'exact', head: true })
            .gte('joined_at', `${month}-01`)
            .lte('joined_at', `${month}-31`)
        : Promise.resolve({ count: 0 }),
    ])

    res.json({
      success: true,
      active: activeRes.count || 0,
      expired: expiredRes.count || 0,
      newThisMonth: newRes.count || 0,
    })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

router.get('/lookup-by-phone', verifyOwner, async (req, res) => {
  const { phone } = req.query
  if (!phone) return res.status(400).json({ success: false, message: 'Phone required' })

  const { data, error } = await supabase
    .from('members')
    .select('id, name')
    .eq('phone', phone)
    .maybeSingle()

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, member: data })
})

router.get('/:id', verifyOwner, async (req, res) => {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (error || !data) return res.status(404).json({ success: false, message: 'Member not found' })
  res.json({ success: true, member: data })
})

const OWNER_UPDATABLE_FIELDS = ['name', 'phone', 'plan', 'status', 'joined_at', 'expires_at']

router.patch('/:id', verifyOwner, async (req, res) => {
  const updates = {}
  for (const key of OWNER_UPDATABLE_FIELDS) {
    if (key in req.body) updates[key] = req.body[key]
  }

  const { data, error } = await supabase
    .from('members')
    .update(updates)
    .eq('id', req.params.id)
    .select()
    .single()

  if (error || !data) {
    return res.status(400).json({ success: false, message: error?.message || 'Update failed' })
  }
  res.json({ success: true, member: data })
})

router.delete('/:id', verifyOwner, async (req, res) => {
  const { error } = await supabase.from('members').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

// Pending member ko approve karo — status active + expiry plan ke hisaab
// se calculate. .select().single() zaroori hai warna 0-row update bhi
// "success" dikh jaata (jo pehle ek real bug tha)
router.post('/:id/approve', verifyOwner, async (req, res) => {
  try {
    const { data: member } = await supabase
      .from('members')
      .select('plan')
      .eq('id', req.params.id)
      .single()

    if (!member) return res.status(404).json({ success: false, message: 'Member not found' })

    const today = new Date()
    const expiry = new Date(today)
    expiry.setDate(expiry.getDate() + (PLAN_DAYS[member.plan] || 30))

    const { data: updated, error } = await supabase
      .from('members')
      .update({
        status: 'active',
        joined_at: today.toISOString().split('T')[0],
        expires_at: expiry.toISOString().split('T')[0],
      })
      .eq('id', req.params.id)
      .select()
      .single()

    if (error || !updated) {
      return res.status(400).json({ success: false, message: error?.message || 'Approve failed' })
    }

    res.json({ success: true, member: updated })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

module.exports = router
