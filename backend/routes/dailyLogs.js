const router = require('express').Router()
const { createClient } = require('@supabase/supabase-js')
const { verifyMember } = require('../middleware/auth')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// ═══════════════════════════════════════════════════════════
// Member-self routes — water_logs aur supplement_logs dono per-day,
// per-member rows hain (unique on member_id+date), sab kuch req.member.id
// se scoped, client ke memberId par trust nahi karte
// ═══════════════════════════════════════════════════════════

router.get('/water', verifyMember, async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('water_logs')
    .select('*')
    .eq('member_id', req.member.id)
    .eq('date', date)
    .maybeSingle()

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, log: data })
})

router.post('/water', verifyMember, async (req, res) => {
  const { date, glasses, goal } = req.body
  if (!date || glasses == null || goal == null) {
    return res.status(400).json({ success: false, message: 'date, glasses, goal required' })
  }

  const { error } = await supabase.from('water_logs').upsert(
    { member_id: req.member.id, date, glasses, goal },
    { onConflict: 'member_id,date' },
  )

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

router.get('/supplements', verifyMember, async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('supplement_logs')
    .select('*')
    .eq('member_id', req.member.id)
    .eq('date', date)
    .maybeSingle()

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, log: data })
})

router.post('/supplements', verifyMember, async (req, res) => {
  const { date, supplements } = req.body
  if (!date || !supplements) {
    return res.status(400).json({ success: false, message: 'date, supplements required' })
  }

  const { error } = await supabase.from('supplement_logs').upsert(
    { member_id: req.member.id, date, supplements },
    { onConflict: 'member_id,date' },
  )

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

module.exports = router
