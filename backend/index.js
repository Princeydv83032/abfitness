require('dotenv').config()
const express = require('express')
const cors    = require('cors')
const cron    = require('node-cron')

const app = express()

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://abfitness-beryl.vercel.app'
  ],
  credentials: true
}))

app.use(express.json())

// Routes
app.use('/api/auth',          require('./routes/auth'))
app.use('/api/notifications', require('./routes/notifications').router)

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'AB Fitness Backend Running! 🏋️' })
})

// ── Cron Jobs ─────────────────────────────────────────
const {
  sendMorningNotifications,
  sendExpiryReminders,
  sendStreakReminders,
} = require('./cron')

// 6:00 AM daily — Morning notification
cron.schedule('0 6 * * *', () => {
  console.log('Running morning notifications...')
  sendMorningNotifications()
}, { timezone: 'Asia/Kolkata' })

// 8:00 PM daily — Streak reminder
cron.schedule('0 20 * * *', () => {
  console.log('Running streak reminders...')
  sendStreakReminders()
}, { timezone: 'Asia/Kolkata' })

// 10:00 AM daily — Expiry reminders
cron.schedule('0 10 * * *', () => {
  console.log('Running expiry reminders...')
  sendExpiryReminders()
}, { timezone: 'Asia/Kolkata' })

console.log('Cron jobs scheduled ✅')

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})