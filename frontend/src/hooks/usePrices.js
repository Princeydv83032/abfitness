import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function usePrices() {
  const [prices,  setPrices]  = useState({
    monthly:   1500,
    quarterly: 4000,
    yearly:    15000,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPrices()
  }, [])

  const fetchPrices = async () => {
    const { data } = await supabase
      .from('owner')
      .select('settings')
      .single()

    if (data?.settings?.fees) {
      setPrices(data.settings.fees)
    }
    setLoading(false)
  }

  return { prices, loading }
}