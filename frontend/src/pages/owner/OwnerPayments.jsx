import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { IoWalletOutline, IoCashOutline } from 'react-icons/io5'
import { FiPlus, FiSmartphone, FiX } from 'react-icons/fi'
import { apiFetch } from '../../lib/api'
import { getCache, setCache, hasCache } from '../../lib/pageCache'

function PaymentsSkeleton() {
  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">
      <div className="flex justify-between items-center mb-4">
        <div className="h-7 w-28 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-9 w-28 bg-white/5 rounded-xl animate-pulse" />
      </div>
      <div className="h-28 bg-white/5 rounded-2xl animate-pulse mb-4" />
      <div className="flex gap-2 mb-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 h-8 bg-white/5 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl divide-y divide-white/5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse flex-shrink-0" />
            <div className="flex-1">
              <div className="h-3.5 w-28 bg-white/5 rounded animate-pulse" />
              <div className="h-2.5 w-20 bg-white/5 rounded animate-pulse mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OwnerPayments() {
  const navigate             = useNavigate()
  // Tab wapas aane par cached list turant - skeleton sirf pehli baar
  const [payments, setPayments] = useState(() => getCache('ownerPayments') ?? [])
  const [loading,  setLoading]  = useState(() => !hasCache('ownerPayments'))
  const [filter,   setFilter]   = useState('all')
  const [preview,  setPreview]  = useState(null)

  const fetchPayments = async () => {
    // Cache hai to skeleton mat dikhao - silently refresh karo
    if (!hasCache('ownerPayments')) setLoading(true)
    // payments table RLS-locked hai, owner-verified backend route se
    const res = await apiFetch('/api/payment/all')
    if (res.success) {
      setPayments(res.payments)
      setCache('ownerPayments', res.payments)
    }
    setLoading(false)
  }

  useEffect(() => {
    queueMicrotask(fetchPayments)
  }, [])

  const filtered = payments.filter((p) =>
    filter === 'all' ? true : p.method === filter
  )

  const total = payments.reduce((s, p) => s + p.amount, 0)
  const cash  = payments.filter((p) => p.method === 'cash').reduce((s, p) => s + p.amount, 0)
  const upi   = payments.filter((p) => p.method === 'upi').reduce((s, p) => s + p.amount, 0)

  if (loading) {
    return <PaymentsSkeleton />
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold text-white">Payments</h1>
        <button
          onClick={() => navigate('/owner/payments/log')}
          className="bg-violet-600 text-white text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1.5"
        >
          <FiPlus size={14} /> Log Payment
        </button>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 rounded-2xl p-4 mb-4 border border-violet-500/30">
        <p className="text-violet-200 text-xs font-bold uppercase tracking-wider">
          Total Revenue
        </p>
        <p className="text-white font-extrabold text-3xl mt-1 tracking-tight">
          ₹{total.toLocaleString('en-IN')}
        </p>
        <div className="flex gap-2 mt-3">
          <div className="flex-1 bg-white/15 rounded-xl p-2 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white flex-shrink-0">
              <IoCashOutline size={13} />
            </div>
            <div>
              <p className="text-violet-200 text-[9px] font-bold uppercase">Cash</p>
              <p className="text-white font-extrabold text-sm">
                ₹{cash.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl p-2 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white flex-shrink-0">
              <FiSmartphone size={12} />
            </div>
            <div>
              <p className="text-violet-200 text-[9px] font-bold uppercase">UPI</p>
              <p className="text-white font-extrabold text-sm">
                ₹{upi.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4">
        {['all', 'cash', 'upi'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border uppercase transition-colors
              ${filter === f
                ? 'bg-violet-600 border-violet-600 text-white'
                : 'bg-[#1a1a2e] border-white/10 text-slate-400'
              }`}
          >
            {f === 'all' ? `All (${payments.length})` : f}
          </button>
        ))}
      </div>

      {/* Payments List */}
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl divide-y divide-white/5">
        {filtered.map((p) => (
          <div
            key={p.id}
            onClick={() => p.member_id && navigate(`/owner/members/${p.member_id}`)}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-white/5"
          >
            {/* Avatar — tap opens a profile preview instead of navigating */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                setPreview(p.members || null)
              }}
              className="flex-shrink-0"
            >
              {p.members?.profile_photo ? (
                <img
                  src={p.members.profile_photo}
                  alt={p.members?.name}
                  className="w-10 h-10 rounded-full object-cover border border-violet-500/30"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center text-white font-extrabold text-sm">
                  {p.members?.name?.[0] || '?'}
                </div>
              )}
            </button>

            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">
                {p.members?.name || 'Unknown'}
              </p>
              <p className="text-slate-500 text-xs mt-0.5 truncate">
                {new Date(p.paid_at).toLocaleDateString('en-IN', {
                  day: '2-digit', month: 'short', year: 'numeric'
                })} · {p.plan}
                {p.upi_ref && ` · ${p.upi_ref}`}
              </p>
            </div>

            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                ${p.method === 'upi' ? 'bg-violet-600/20 text-violet-400' : 'bg-emerald-500/20 text-emerald-400'}`}
            >
              {p.method === 'upi' ? <FiSmartphone size={13} /> : <IoCashOutline size={15} />}
            </div>

            <p className="text-emerald-400 font-extrabold text-sm flex-shrink-0">
              ₹{p.amount.toLocaleString('en-IN')}
            </p>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-10">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2 text-slate-500">
              <IoWalletOutline size={22} />
            </div>
            <p className="text-slate-400 text-sm">No payments found</p>
          </div>
        )}
      </div>

      {/* Profile preview */}
      {preview && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-6"
          onClick={() => setPreview(null)}
        >
          <button
            onClick={() => setPreview(null)}
            className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-white"
          >
            <FiX size={18} />
          </button>
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            {preview.profile_photo ? (
              <img
                src={preview.profile_photo}
                alt={preview.name}
                className="w-full rounded-2xl object-contain max-h-[65vh]"
              />
            ) : (
              <div className="w-40 h-40 rounded-full bg-violet-600 flex items-center justify-center text-white text-5xl font-extrabold mx-auto">
                {preview.name?.[0] || '?'}
              </div>
            )}
            <p className="text-white font-extrabold text-lg mt-3">{preview.name}</p>
            <p className="text-slate-400 text-sm">{preview.member_id}</p>
          </div>
        </div>
      )}

    </div>
  )
}

export default OwnerPayments
