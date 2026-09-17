const { z } = require('zod')
const { phone10 } = require('./common')

const plan = z.enum(['monthly', 'quarterly', 'yearly'])
const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD')

const createOrder = z.object({
  plan,
})

const verify = z.object({
  razorpay_order_id: z.string().min(1).max(200),
  razorpay_payment_id: z.string().min(1).max(200),
  razorpay_signature: z.string().min(1).max(500),
})

const addMember = z.object({
  name: z.string().trim().min(1).max(100),
  phone: phone10,
  plan,
  paymentMethod: z.enum(['cash', 'upi']).optional(),
  upiRef: z.string().max(200).optional(),
  joinDate: dateStr.optional(),
  profilePhoto: z.string().max(2000).optional().nullable(),
})

const logPayment = z.object({
  memberId: z.string().min(1).max(100),
  plan,
  method: z.enum(['cash', 'upi']).optional(),
  upiRef: z.string().max(200).optional(),
  paymentDate: dateStr.optional(),
})

module.exports = { createOrder, verify, addMember, logPayment }
