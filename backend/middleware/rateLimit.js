const rateLimit = require('express-rate-limit')

// Sab /api routes pe - generous limit, normal use mein kisi ko nahi
// lagega, sirf scraping/abuse rokta hai
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
})

// Public, no-auth endpoints jahan brute-force/enumeration ka risk hai -
// phone-check (owner exists ya nahi), registration, notification triggers
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later' },
})

// Payment endpoints - real DB writes + Razorpay API calls involved
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later' },
})

module.exports = { generalLimiter, authLimiter, paymentLimiter }
