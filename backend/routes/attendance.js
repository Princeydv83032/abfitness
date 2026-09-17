const router = require('express').Router()
const { createClient } = require('@supabase/supabase-js')
const { verifyMember, verifyOwner } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { checkIn, mark } = require('../validators/attendance')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Haversine distance in meters - same formula jo pehle frontend mein tha,
// ab server-side bhi taaki koi anon-key se seedha attendance insert karke
// geofence bypass na kar sake
const getDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371000
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

// ═══════════════════════════════════════════════════════════
// Member-self routes
// ═══════════════════════════════════════════════════════════

// Is month ke apne records - Attendance.jsx (list + calendar) aur
// Home.jsx (count + "checked in today" dono isi se derive karte hain)
router.get('/me', verifyMember, async (req, res) => {
  const month = req.query.month || new Date().toISOString().slice(0, 7)

  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('member_id', req.member.id)
    .gte('date', `${month}-01`)
    .order('date', { ascending: true })

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, attendance: data })
})

// Check-in - geofence validation ab yahan hoti hai (client sirf apni
// coordinates bhejta hai, distance/radius decision server karta hai) aur
// date bhi server ke clock se aata hai, client ke "today" par trust nahi
router.post('/check-in', verifyMember, validate(checkIn), async (req, res) => {
  const { lat, lng } = req.body
  const today = new Date().toISOString().split('T')[0]

  try {
    const { data: owner } = await supabase
      .from('owner')
      .select('gym_lat, gym_lng, geo_radius, gym_name')
      .single()

    if (owner?.gym_lat && owner?.gym_lng) {
      if (lat == null || lng == null) {
        return res.status(400).json({ success: false, message: 'Location required to check in' })
      }

      const radius = owner.geo_radius || 100
      const distance = getDistance(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(owner.gym_lat),
        parseFloat(owner.gym_lng),
      )

      if (distance > radius) {
        return res.status(403).json({
          success: false,
          message: 'Too far from gym',
          distance: Math.round(distance),
          radius,
          gymName: owner.gym_name || 'AB Fitness',
        })
      }
    }

    const { error } = await supabase.from('attendance').insert({
      member_id: req.member.id,
      date: today,
      checked_in_at: new Date().toISOString(),
    })

    if (error) {
      return res.status(409).json({ success: false, message: 'Already checked in today' })
    }

    res.json({ success: true })
  } catch (err) {
    console.log('Check-in error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

// ═══════════════════════════════════════════════════════════
// Owner-only routes
// ═══════════════════════════════════════════════════════════

// Aaj ke check-ins, member info ke saath - OwnerAttendance.jsx list ke liye
router.get('/today', verifyOwner, async (req, res) => {
  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('attendance')
    .select('*, members(name, member_id, profile_photo, phone)')
    .eq('date', today)
    .order('checked_in_at', { ascending: false })

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, attendance: data })
})

// Manual check-in - owner kisi member ko phone se dhundh ke mark karta hai
router.post('/mark', verifyOwner, validate(mark), async (req, res) => {
  const { memberId } = req.body
  if (!memberId) return res.status(400).json({ success: false, message: 'memberId required' })

  const today = new Date().toISOString().split('T')[0]

  const { error } = await supabase.from('attendance').insert({
    member_id: memberId,
    date: today,
    checked_in_at: new Date().toISOString(),
  })

  if (error) {
    return res.status(409).json({ success: false, message: 'Already checked in today' })
  }

  res.json({ success: true })
})

// Count - Reports.jsx (poore mahine ka total), OwnerDashboard.jsx (aaj ka
// total), MemberDetail.jsx (ek member ka is mahine ka total) - sab isi
// se serve hote hain query params ke through
router.get('/count', verifyOwner, async (req, res) => {
  const { memberId, date, from, to } = req.query

  let query = supabase.from('attendance').select('*', { count: 'exact', head: true })

  if (memberId) query = query.eq('member_id', memberId)
  if (date) query = query.eq('date', date)
  if (from) query = query.gte('date', from)
  if (to) query = query.lte('date', to)

  const { count, error } = await query
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, count: count || 0 })
})

module.exports = router
