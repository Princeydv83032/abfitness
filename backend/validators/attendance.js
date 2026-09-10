const { z } = require('zod')

const checkIn = z.object({
  lat: z.union([z.string(), z.number()]).nullable().optional(),
  lng: z.union([z.string(), z.number()]).nullable().optional(),
})

// Supabase ka default id format UUID hi hota hai, lekin poori tarah pakka
// nahi hai schema dekhe bina - isliye sirf non-empty string enforce karo,
// UUID format nahi (galat reject na ho jaaye)
const mark = z.object({
  memberId: z.string().min(1).max(100),
})

module.exports = { checkIn, mark }
