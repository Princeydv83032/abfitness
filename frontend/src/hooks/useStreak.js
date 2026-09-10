import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'

export function useStreak(memberId) {
  const [streak,  setStreak]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [badge,   setBadge]   = useState(null)

  const fetchStreak = async () => {
    setLoading(true)
    // streaks table RLS-locked hai - verifyMember token se req.member.id
    // match karke deta hai
    const res = await apiFetch('/api/members/me/streak')
    if (res.success && res.streak) setStreak(res.streak)
    setLoading(false)
  }

  useEffect(() => {
    if (memberId) queueMicrotask(fetchStreak)
  }, [memberId])

  const updateStreak = async () => {
    // current/longest ab yahan calculate nahi hote - backend khud karta
    // hai (client par trust nahi karte), taaki koi apni streak seedhe
    // arbitrarily set na kar sake
    const res = await apiFetch('/api/members/me/streak/increment', {
      method: 'POST',
    })

    if (!res.success) return streak

    setStreak(res.streak)
    if (res.badge) setBadge(res.badge)

    return res.streak
  }

  const getStreakEmoji = (days) => {
    if (days >= 100) return '🏆'
    if (days >= 30)  return '💪'
    if (days >= 7)   return '🔥'
    if (days >= 3)   return '⭐'
    return '💫'
  }

  return { streak, loading, badge, updateStreak, fetchStreak, getStreakEmoji }
}
