const { z } = require('zod')
const { phone10, latLng } = require('./common')

const checkPhone = z.object({
  phone: phone10,
})

// PATCH /me - sab fields optional (partial update), route khud whitelist
// se filter karta hai, ye sirf jo bhi bheja gaya uska type check karta hai
const updateMe = z.object({
  gym_name: z.string().trim().min(1).max(200).optional(),
  timing: z.string().max(100).optional(),
  upi_id: z.string().max(200).optional(),
  upi_qr_url: z.string().url().max(1000).optional(),
  gym_lat: latLng,
  gym_lng: latLng,
  geo_radius: z.coerce.number().min(0).max(5000).optional(),
  // settings ek freeform JSON blob hai (fees + notification prefs) -
  // top-level shape check karte hain, deeply har field nahi
  settings: z
    .object({
      fees: z.record(z.string(), z.number().min(0)).optional(),
      notifications: z.record(z.string(), z.boolean()).optional(),
    })
    .passthrough()
    .optional(),
})

module.exports = { checkPhone, updateMe }
