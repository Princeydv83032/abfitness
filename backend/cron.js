require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

const { sendNotification } = require('./routes/notifications')

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const muscleGroups = {
  Monday:    'Chest 💪',
  Tuesday:   'Biceps & Triceps 💪',
  Wednesday: 'Shoulders 🏋️',
  Thursday:  'Back 🔙',
  Friday:    'Legs 🦵',
  Saturday:  'Core & Cardio 🔥',
  Sunday:    'Rest Day 😴',
}

// Daily morning notification — 6 AM
async function sendMorningNotifications() {
  const today  = days[new Date().getDay()]
  const muscle = muscleGroups[today]

  console.log(`Sending morning notifications for ${today}...`)

  // Saare FCM tokens fetch karo
  const { data: tokens } = await supabase
    .from('fcm_tokens')
    .select('token, member_id')

  if (!tokens?.length) {
    console.log('No tokens found')
    return
  }

  let sent = 0
  for (const { token } of tokens) {
    const success = await sendNotification(
      token,
      `Good Morning! 🌅 Aaj ${today} hai`,
      `💪 ${muscle} Day! Gym time! 🏋️`
    )
    if (success) sent++
  }

  console.log(`Morning notifications sent: ${sent}/${tokens.length}`)
}

// Expiry reminder — 3 din pehle
async function sendExpiryReminders() {
  const in3days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]

  // Members jo 3 din mein expire honge
  const { data: members } = await supabase
    .from('members')
    .select('id, name, expires_at')
    .eq('expires_at', in3days)
    .eq('status', 'active')

  if (!members?.length) return

  for (const member of members) {
    // FCM token lo
    const { data: tokenData } = await supabase
      .from('fcm_tokens')
      .select('token')
      .eq('member_id', member.id)
      .single()

    if (!tokenData?.token) continue

    await sendNotification(
      tokenData.token,
      '⚠️ Membership Expiry Alert!',
      `${member.name}, aapki membership 3 din mein expire hogi! Abhi renew karo 💳`
    )
  }

  console.log(`Expiry reminders sent: ${members.length}`)
}

// Streak reminder — jo aaj nahi aaye
async function sendStreakReminders() {
  const today = new Date().toISOString().split('T')[0]

  // Jo members aaj nahi aaye but streak hai
  const { data: streaks } = await supabase
    .from('streaks')
    .select('member_id, current')
    .gt('current', 0)
    .neq('last_date', today)

  if (!streaks?.length) return

  for (const streak of streaks) {
    const { data: tokenData } = await supabase
      .from('fcm_tokens')
      .select('token')
      .eq('member_id', streak.member_id)
      .single()

    if (!tokenData?.token) continue

    await sendNotification(
      tokenData.token,
      '🔥 Streak Alert!',
      `${streak.current} din ki streak mat todna! Aaj bhi gym aao 💪`
    )
  }

  console.log(`Streak reminders sent: ${streaks.length}`)
}

module.exports = {
  sendMorningNotifications,
  sendExpiryReminders,
  sendStreakReminders,
}