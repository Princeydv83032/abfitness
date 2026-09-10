const router = require('express').Router()
const { createClient } = require('@supabase/supabase-js')
const { verifyFirebaseToken, verifyMember, verifyOwner } = require('../middleware/auth')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// ═══════════════════════════════════════════════════════════
// Pre-auth — OTP bhejne se pehle check karna hai ki ye phone owner ka
// hai ya nahi. Sirf boolean bhejo, poora row nahi - pehle ye query poora
// gym config (upi_id, coordinates, fees settings) kisi bhi anon ko de
// deti thi sirf phone number daal ke
// ═══════════════════════════════════════════════════════════
router.post('/check-phone', async (req, res) => {
  const { phone } = req.body
  if (!phone) return res.status(400).json({ success: false, message: 'Phone required' })

  const { data } = await supabase
    .from('owner')
    .select('id')
    .eq('phone', phone)
    .maybeSingle()

  res.json({ success: true, exists: !!data })
})

// ═══════════════════════════════════════════════════════════
// Owner-only — apni settings dekhna/badalna
// ═══════════════════════════════════════════════════════════

// OTP verify hone ke baad - verifyOwner middleware ne already row match
// karke req.owner attach kar diya hai, dobara query karne ki zaroorat nahi
router.get('/me', verifyOwner, async (req, res) => {
  res.json({ success: true, owner: req.owner })
})

const OWNER_UPDATABLE_FIELDS = [
  'gym_name', 'timing', 'upi_id', 'upi_qr_url',
  'gym_lat', 'gym_lng', 'geo_radius', 'settings',
]

router.patch('/me', verifyOwner, async (req, res) => {
  const updates = {}
  for (const key of OWNER_UPDATABLE_FIELDS) {
    if (key in req.body) updates[key] = req.body[key]
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No valid fields to update' })
  }

  // req.owner.id se update karo - gym_name se nahi, wo mutable field hai
  // (agar owner naam badal ke save kare to purana .eq("gym_name", ...)
  // wala filter silently 0 rows match karta, koi error bhi nahi aata)
  const { data, error } = await supabase
    .from('owner')
    .update(updates)
    .eq('id', req.owner.id)
    .select()
    .single()

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, owner: data })
})

// ═══════════════════════════════════════════════════════════
// Member + Owner dono ke liye — low-sensitivity reads
// ═══════════════════════════════════════════════════════════

// Membership fees — Payments/AddMember/LogPayment page ke liye. Sirf fees
// bhejo, poori settings nahi (jisme owner ke notification prefs bhi hain)
router.get('/fees', verifyFirebaseToken, async (req, res) => {
  const { data, error } = await supabase.from('owner').select('settings').single()
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, fees: data?.settings?.fees || null })
})

// Geofence info — member check-in ke waqt distance calculate karne ke
// liye. Sirf yahi 4 columns, poora row nahi (upi_id/address wagera nahi)
router.get('/geofence', verifyMember, async (req, res) => {
  const { data, error } = await supabase
    .from('owner')
    .select('gym_lat, gym_lng, geo_radius, gym_name')
    .single()

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, ...data })
})

module.exports = router
