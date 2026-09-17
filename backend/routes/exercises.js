const router = require('express').Router()
const { createClient } = require('@supabase/supabase-js')
const { verifyMember, verifyOwner } = require('../middleware/auth')
const { validate } = require('../middleware/validate')
const { addExercise, updateExercise } = require('../validators/exercises')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// exercises table poore gym ka shared workout/video schedule hai (kisi
// member ka private data nahi) - isliye har logged-in member ye dekh
// sakta hai, sirf likhna (add/delete) owner-only hai

// ═══════════════════════════════════════════════════════════
// Member reads
// ═══════════════════════════════════════════════════════════

// Home.jsx ka weekly carousel - har din ka thumbnail + video (looping
// "gif" jaisa dikhane ke liye) + count
router.get('/week', verifyMember, async (req, res) => {
  const { data, error } = await supabase
    .from('exercises')
    .select('day, thumbnail_url, video_url')
    .order('order_index')

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, exercises: data })
})

// Workout.jsx - ek din ki poori exercise list
router.get('/day/:day', verifyMember, async (req, res) => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('day', req.params.day)
    .order('order_index')

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, exercises: data })
})

// ═══════════════════════════════════════════════════════════
// Owner — video library manage karna
// ═══════════════════════════════════════════════════════════

router.get('/videos', verifyOwner, async (req, res) => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .not('video_url', 'is', null)
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true, videos: data })
})

router.post('/', verifyOwner, validate(addExercise), async (req, res) => {
  const { name, muscle_group, day, sets, reps, tip, video_url, thumbnail_url } = req.body

  if (!name || !day) {
    return res.status(400).json({ success: false, message: 'name and day required' })
  }

  const { error } = await supabase.from('exercises').insert({
    name,
    muscle_group: muscle_group || null,
    day,
    // Pehle khali chhodne par bhi "3 sets / 10-12 reps" force ho jaata
    // tha - Rest Day jaisi entries pe bhi ye ajeeb dikhta tha. Ab sirf
    // jo diya gaya hai wahi save hota hai, baaki null
    sets: sets ? parseInt(sets) : null,
    reps: reps || null,
    tip: tip || null,
    video_url: video_url || null,
    thumbnail_url: thumbnail_url || null,
    order_index: 0,
  })

  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

router.get('/:id', verifyOwner, async (req, res) => {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('id', req.params.id)
    .single()

  if (error || !data) return res.status(404).json({ success: false, message: 'Video not found' })
  res.json({ success: true, exercise: data })
})

router.patch('/:id', verifyOwner, validate(updateExercise), async (req, res) => {
  const { name, muscle_group, day, sets, reps, tip, video_url, thumbnail_url } = req.body

  const updates = {}
  if (name !== undefined) updates.name = name
  if (day !== undefined) updates.day = day
  if (muscle_group !== undefined) updates.muscle_group = muscle_group || null
  if (sets !== undefined) updates.sets = sets ? parseInt(sets) : null
  if (reps !== undefined) updates.reps = reps || null
  if (tip !== undefined) updates.tip = tip || null
  if (video_url !== undefined) updates.video_url = video_url || null
  if (thumbnail_url !== undefined) updates.thumbnail_url = thumbnail_url || null

  const { error } = await supabase.from('exercises').update(updates).eq('id', req.params.id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

router.delete('/:id', verifyOwner, async (req, res) => {
  const { error } = await supabase.from('exercises').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ success: false, error: error.message })
  res.json({ success: true })
})

module.exports = router
