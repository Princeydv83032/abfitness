import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import { supabase } from './supabase'

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

export async function initNotifications(memberId) {
  try {
    if (!('Notification' in window)) {
      console.log('Notifications not supported')
      return false
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      console.log('Notification permission denied')
      return false
    }

    // Service worker manually register karo
    const swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js')
    await navigator.serviceWorker.ready

    const messaging = getMessaging()
    const token     = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: swRegistration,
    })

    if (!token) {
      console.log('No FCM token received')
      return false
    }

    console.log('FCM Token:', token)

    // Token Supabase mein save karo
    await supabase
      .from('fcm_tokens')
      .upsert({
        member_id: memberId,
        token:     token,
      }, { onConflict: 'member_id' })

    // Foreground notifications handle karo
    onMessage(messaging, (payload) => {
      console.log('Foreground message:', payload)
      if (Notification.permission === 'granted') {
        new Notification(payload.notification.title, {
          body:  payload.notification.body,
          icon:  '/icon-192.png',
          badge: '/icon-192.png',
        })
      }
    })

    console.log('Notifications initialized ✅')
    return true

  } catch (error) {
    console.log('Notification init error:', error)
    return false
  }
}

export async function sendTestNotification() {
  if (Notification.permission === 'granted') {
    new Notification('AB Fitness 🏋️', {
      body:  'Notifications are working! 💪',
      icon:  '/icon-192.png',
      badge: '/icon-192.png',
    })
  }
}