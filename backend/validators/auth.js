const { z } = require('zod')
const { phone10 } = require('./common')

const sendOtp = z.object({
  phone: phone10,
})

const verifyOtp = z.object({
  phone: phone10,
  otp: z.string().regex(/^\d{4}$/, 'must be a 4-digit code'),
})

module.exports = { sendOtp, verifyOtp }
