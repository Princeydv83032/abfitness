const { z } = require('zod')

const withToken = z.object({
  token: z.string().min(10).max(500),
})

const sendInvoice = z.object({
  memberId: z.string().min(1).max(100),
  paymentId: z.string().min(1).max(100),
})

const sendWelcome = z.object({
  memberId: z.string().min(1).max(100),
})

module.exports = { withToken, sendInvoice, sendWelcome }
