import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

function OwnerPayments() {
  const navigate             = useNavigate()
  const [payments, setPayments] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [filter,   setFilter]   = useState('all')

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('payments')
      .select('*, members(name, member_id)')
      .order('paid_at', { ascending: false })

    if (!error) setPayments(data)
    setLoading(false)
  }

  const filtered = payments.filter((p) =>
    filter === 'all' ? true : p.method === filter
  )

  const total = payments.reduce((s, p) => s + p.amount, 0)
  const cash  = payments.filter((p) => p.method === 'cash').reduce((s, p) => s + p.amount, 0)
  const upi   = payments.filter((p) => p.method === 'upi').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-black text-white">Payments</h1>
        <button
          onClick={() => navigate('/owner/payments/log')}
          className="bg-purple-600 text-white text-xs font-bold px-3 py-2 rounded-xl"
        >
          + Log Payment
        </button>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-4 mb-4 border border-purple-500/30">
        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
          Total Revenue
        </p>
        <p className="text-white font-black text-3xl mt-1 tracking-tight">
          ₹{total.toLocaleString('en-IN')}
        </p>
        <div className="flex gap-2 mt-3">
          <div className="flex-1 bg-white/15 rounded-xl p-2">
            <p className="text-purple-200 text-[9px] font-bold uppercase">💵 Cash</p>
            <p className="text-white font-black text-sm mt-0.5">
              ₹{cash.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl p-2">
            <p className="text-purple-200 text-[9px] font-bold uppercase">📱 UPI</p>
            <p className="text-white font-black text-sm mt-0.5">
              ₹{upi.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {['all', 'cash', 'upi'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border uppercase
              ${filter === f
                ? 'bg-purple-600 border-purple-600 text-white'
                : 'bg-[#1a1a2e] border-white/10 text-slate-400'
              }`}
          >
            {f === 'all' ? `All (${payments.length})` : f}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
        </div>
      )}

      {/* Payments List */}
      {!loading && (
        <div className="bg-[#1a1a2e] border border-white/7 rounded-xl divide-y divide-white/5">
          {filtered.map((p) => (
            <div key={p.id} className="flex items-center gap-3 px-4 py-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0
                ${p.method === 'upi' ? 'bg-purple-600/20' : 'bg-green-500/20'}`}>
                {p.method === 'upi' ? '📱' : '💵'}
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-bold">
                  {p.members?.name || 'Unknown'}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {new Date(p.paid_at).toLocaleDateString('en-IN', {
                    day: '2-digit', month: 'short', year: 'numeric'
                  })} · {p.plan}
                  {p.upi_ref && ` · ${p.upi_ref}`}
                </p>
              </div>
              <p className="text-green-400 font-black text-sm">
                ₹{p.amount.toLocaleString('en-IN')}
              </p>
            </div>
          ))}

          {filtered.length === 0 && !loading && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No payments found
            </div>
          )}
        </div>
      )}

    </div>
  )
}

export default OwnerPayments