import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'

export function usePrices() {
  const [prices,  setPrices]  = useState({
    monthly:   1500,
    quarterly: 4000,
    yearly:    15000,
  })
  const [loading, setLoading] = useState(true)

  const fetchPrices = async () => {
    // owner table RLS-locked hai - sirf fees (poori settings nahi)
    const res = await apiFetch('/api/owner/fees')

    if (res.success && res.fees) {
      setPrices(res.fees)
    }
    setLoading(false)
  }

  useEffect(() => {
    queueMicrotask(fetchPrices)
  }, [])

  return { prices, loading }
}
