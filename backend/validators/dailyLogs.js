const { z } = require('zod')

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD')

const water = z.object({
  date: dateStr,
  glasses: z.coerce.number().min(0).max(50),
  goal: z.coerce.number().min(1).max(50),
})

const supplements = z.object({
  date: dateStr,
  // { supplementId: boolean } shape - CalorieCounter/Home.jsx dono se
  // freeform keys aate hain (creatine, whey, etc.)
  supplements: z.record(z.string(), z.boolean()),
})

// Ek food item - indianFoods array se aata hai (name/cal/protein/carbs/fat
// fixed) + quantity/addedAt jo add karte waqt lagta hai. Extra unknown
// fields bhi allow karo (zod strips them, koi harm nahi)
// .passthrough() - food object mein category/addedAt jaise extra fields
// bhi aate hain, unhe strip nahi karna warna data silently khoyega
const mealItem = z
  .object({
    name: z.string().max(200),
    cal: z.coerce.number().min(0).max(5000),
    protein: z.coerce.number().min(0).max(500).optional(),
    carbs: z.coerce.number().min(0).max(1000).optional(),
    fat: z.coerce.number().min(0).max(500).optional(),
    quantity: z.coerce.number().min(0).max(100).optional(),
  })
  .passthrough()

const calories = z.object({
  date: dateStr,
  meals: z.array(mealItem).max(200),
  goal_cal: z.coerce.number().min(0).max(20000).optional(),
})

module.exports = { water, supplements, calories }
