import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useStreak(memberId) {
  const [streak,  setStreak]  = useState(null)
  const [loading, setLoading] = useState(true)
  const [badge,   setBadge]   = useState(null)

  useEffect(() => {
    if (memberId) fetchStreak()
  }, [memberId])

  const fetchStreak = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('streaks')
      .select('*')
      .eq('member_id', memberId)
      .single()

    if (data) setStreak(data)
    setLoading(false)
  }

  const updateStreak = async () => {
    const today     = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    // Existing streak fetch karo
    const { data: existing } = await supabase
      .from('streaks')
      .select('*')
      .eq('member_id', memberId)
      .single()

    let newCurrent = 1
    let newLongest = existing?.longest || 0

    if (existing) {
      if (existing.last_date === today) {
        // Aaj already update hua — kuch mat karo
        return existing
      } else if (existing.last_date === yesterday) {
        // Kal bhi aaya tha — streak +1
        newCurrent = (existing.current || 0) + 1
      } else {
        // Miss kiya — reset
        newCurrent = 1
      }
    }

    // Longest update karo
    if (newCurrent > newLongest) newLongest = newCurrent

    // Upsert karo
    const { data: updated } = await supabase
      .from('streaks')
      .upsert({
        member_id:  memberId,
        current:    newCurrent,
        longest:    newLongest,
        last_date:  today,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'member_id' })
      .select()
      .single()

    setStreak(updated)

    // Badge check karo
    const earnedBadge = getBadge(newCurrent)
    if (earnedBadge) setBadge(earnedBadge)

    return updated
  }

  const getBadge = (days) => {
    if (days === 100) return { emoji: '🏆', title: 'Legend!',       days: 100 }
    if (days === 30)  return { emoji: '💪', title: 'Month Master!', days: 30  }
    if (days === 7)   return { emoji: '🔥', title: 'Week Warrior!', days: 7   }
    if (days === 3)   return { emoji: '🥉', title: 'Beginner!',     days: 3   }
    return null
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