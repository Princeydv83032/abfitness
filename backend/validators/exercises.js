const { z } = require('zod')

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const addExercise = z.object({
  name: z.string().trim().min(1).max(200),
  muscle_group: z.string().max(100).nullable().optional(),
  day: z.enum(DAYS),
  sets: z.union([z.string(), z.number()]).nullable().optional(),
  // reps aksar range string hota hai ("10-12"), isliye number force nahi
  // karte
  reps: z.string().max(50).nullable().optional(),
  tip: z.string().max(1000).nullable().optional(),
  // thumbnail optional hai (upload skip ho sakta hai), tab client null
  // bhejta hai
  video_url: z.string().url().max(1000).nullable().optional(),
  thumbnail_url: z.string().url().max(1000).nullable().optional(),
})

// Edit flow - sab fields optional, sirf jo change ho rahe hain wahi
// bhejta hai client
const updateExercise = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  muscle_group: z.string().max(100).nullable().optional(),
  day: z.enum(DAYS).optional(),
  sets: z.union([z.string(), z.number()]).nullable().optional(),
  reps: z.string().max(50).nullable().optional(),
  tip: z.string().max(1000).nullable().optional(),
  video_url: z.string().url().max(1000).nullable().optional(),
  thumbnail_url: z.string().url().max(1000).nullable().optional(),
})

module.exports = { addExercise, updateExercise }
