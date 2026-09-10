import { useState, useEffect } from 'react'
import { apiFetch } from '../../lib/api'

function Reports() {
  const [stats,    setStats]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [month,    setMonth]    = useState(new Date().toISOString().slice(0, 7))

  const fetchReports = async () => {
    setLoading(true)

    const monthStart = `${month}-01`
    const monthEnd   = `${month}-31`

    // Active/new-this-month/expired counts — members table RLS-locked
    // hai, owner-verified backend route se, ek hi call mein teeno
    const memberStatsRes = await apiFetch(`/api/members/stats?month=${month}`)
    const activeMembers = memberStatsRes.success ? memberStatsRes.active : 0
    const newMembers = memberStatsRes.success ? memberStatsRes.newThisMonth : 0
    const expiredMembers = memberStatsRes.success ? memberStatsRes.expired : 0

    // Monthly payments — payments table RLS-locked hai, owner-verified
    // backend route se
    const paymentsRes = await apiFetch(
      `/api/payment/all?from=${monthStart}&to=${monthEnd}`,
    )
    const paymentsData = paymentsRes.success ? paymentsRes.payments : []

    const revenue = paymentsData?.reduce((s, p) => s + p.amount, 0) || 0
    const cash    = paymentsData?.filter((p) => p.method === 'cash').reduce((s, p) => s + p.amount, 0) || 0
    const upi     = paymentsData?.filter((p) => p.method === 'upi').reduce((s, p) => s + p.amount, 0)  || 0

    // Weekly breakdown
    const weeks = [0, 0, 0, 0]
    paymentsData?.forEach((p) => {
      const day  = new Date(p.paid_at).getDate()
      const week = Math.min(Math.floor((day - 1) / 7), 3)
      weeks[week] += p.amount
    })

    const maxWeek = Math.max(...weeks, 1)

    // Total attendance this month — attendance table RLS-locked hai,
    // owner-verified backend route se
    const attendanceCountRes = await apiFetch(
      `/api/attendance/count?from=${monthStart}&to=${monthEnd}`,
    )
    const totalAttendance = attendanceCountRes.success ? attendanceCountRes.count : 0

    setStats({
      activeMembers:  activeMembers  || 0,
      newMembers:     newMembers     || 0,
      expiredMembers: expiredMembers || 0,
      revenue, cash, upi,
      totalPayments:  paymentsData?.length || 0,
      weeks,
      maxWeek,
      totalAttendance: totalAttendance || 0,
    })

    setLoading(false)
  }

  useEffect(() => {
    queueMicrotask(fetchReports)
  }, [month])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-black text-white">Reports</h1>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-1.5 text-white text-xs outline-none"
        />
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-4 mb-4 border border-purple-500/30">
        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
          Total Revenue — {new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
        <p className="text-white font-black text-3xl mt-1 tracking-tight">
          ₹{stats?.revenue.toLocaleString('en-IN')}
        </p>
        <div className="flex gap-2 mt-3">
          <div className="flex-1 bg-white/15 rounded-xl p-2">
            <p className="text-purple-200 text-[9px] font-bold uppercase">💵 Cash</p>
            <p className="text-white font-black text-sm mt-0.5">
              ₹{stats?.cash.toLocaleString('en-IN')}
            </p>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl p-2">
            <p className="text-purple-200 text-[9px] font-bold uppercase">📱 UPI</p>
            <p className="text-white font-black text-sm mt-0.5">
              ₹{stats?.upi.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Bars */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
        Revenue by Week
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl p-4 mb-4">
        {stats?.weeks.map((amt, i) => (
          <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
            <div className="text-slate-400 text-xs w-10 flex-shrink-0">Wk {i + 1}</div>
            <div className="flex-1 h-2 bg-[#0d0d14] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all"
                style={{ width: `${stats.maxWeek > 0 ? (amt / stats.maxWeek) * 100 : 0}%` }}
              />
            </div>
            <div className="text-white text-xs font-bold w-20 text-right flex-shrink-0">
              ₹{amt.toLocaleString('en-IN')}
            </div>
          </div>
        ))}
      </div>

      {/* Member Stats */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
        Member Stats
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl mb-4">
        {[
          { label: 'Total Active Members', value: stats?.activeMembers,  color: 'text-green-400'  },
          { label: 'New Joins This Month', value: `+${stats?.newMembers}`, color: 'text-purple-400' },
          { label: 'Expired Members',      value: stats?.expiredMembers, color: 'text-red-400'    },
          { label: 'Total Attendance',     value: stats?.totalAttendance, color: 'text-blue-400'  },
          { label: 'Payments This Month',  value: stats?.totalPayments,  color: 'text-amber-400'  },
        ].map((row, i, arr) => (
          <div
            key={i}
            className={`flex justify-between items-center px-4 py-3
              ${i !== arr.length - 1 ? 'border-b border-white/5' : ''}`}
          >
            <span className="text-slate-400 text-sm">{row.label}</span>
            <span className={`text-sm font-black ${row.color}`}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Payment Breakdown */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
        Payment Breakdown
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl">
        {[
          { label: '💵 Cash Collected', value: `₹${stats?.cash.toLocaleString('en-IN')}`,    color: 'text-green-400'  },
          { label: '📱 UPI Collected',  value: `₹${stats?.upi.toLocaleString('en-IN')}`,     color: 'text-purple-400' },
          { label: 'UPI % of Total',    value: stats?.revenue > 0 ? `${Math.round((stats.upi / stats.revenue) * 100)}%` : '0%', color: 'text-blue-400' },
        ].map((row, i, arr) => (
          <div
            key={i}
            className={`flex justify-between items-center px-4 py-3
              ${i !== arr.length - 1 ? 'border-b border-white/5' : ''}`}
          >
            <span className="text-slate-400 text-sm">{row.label}</span>
            <span className={`text-sm font-black ${row.color}`}>{row.value}</span>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Reports