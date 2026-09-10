const { z } = require('zod')
const { phone10 } = require('./common')

// PATCH /me - member apna profile update karta hai
const updateMe = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  goal: z.string().max(100).optional(),
  profile_photo: z.string().url().max(1000).optional(),
  // notification_prefs / custom_diet freeform JSON blobs hain - shape
  // Diet.jsx/Profile.jsx ke hisaab se vary karta hai, sirf object hona
  // chahiye ye check karte hain
  notification_prefs: z.record(z.string(), z.any()).optional(),
  is_veg: z.boolean().optional(),
  // custom_diet Diet.jsx se ek array of meal objects ({id, name, time,
  // items}) ke roop mein aata hai, object nahi
  custom_diet: z.array(z.any()).optional(),
})

const fcmToken = z.object({
  token: z.string().min(10).max(500),
})

const addPhoto = z.object({
  photo_url: z.string().url().max(1000),
  weight: z.union([z.string(), z.number()]).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
  month: z.string().max(50).nullable().optional(),
})

const register = z.object({
  name: z.string().trim().min(1).max(100),
  phone: phone10,
  age: z.union([z.string(), z.number()]).nullable().optional(),
  goal: z.string().max(100).optional(),
  profilePhoto: z.string().url().max(1000),
})

// PATCH /:id - owner kisi bhi member ko edit karta hai
const ownerUpdateMember = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  phone: phone10.optional(),
  plan: z.enum(['monthly', 'quarterly', 'yearly']).optional(),
  status: z.enum(['pending', 'active', 'paused', 'expired']).optional(),
  joined_at: z.string().optional(),
  expires_at: z.string().optional(),
})

module.exports = { updateMe, fcmToken, addPhoto, register, ownerUpdateMember }
