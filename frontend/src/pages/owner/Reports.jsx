import { useState, useEffect } from 'react'
import {
  IoCashOutline,
  IoCalendarOutline,
  IoBarChartOutline,
  IoSparklesOutline,
  IoWarningOutline,
} from 'react-icons/io5'
import { FiSmartphone, FiUsers, FiPercent } from 'react-icons/fi'
import { apiFetch } from '../../lib/api'
import { toast } from '../../lib/toast'

function ReportsSkeleton() {
  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">
      <div className="flex justify-between items-center mb-4">
        <div className="h-7 w-28 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-8 w-32 bg-white/5 rounded-xl animate-pulse" />
      </div>
      <div className="h-28 bg-white/5 rounded-2xl animate-pulse mb-4" />
      <div className="h-32 bg-white/5 rounded-xl animate-pulse mb-4" />
      <div className="h-40 bg-white/5 rounded-xl animate-pulse mb-4" />
      <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
    </div>
  )
}

function SectionHeader({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400 flex-shrink-0">
        <Icon size={14} />
      </div>
      <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">
        {label}
      </p>
    </div>
  )
}

function Reports() {
  const [stats,    setStats]    = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [month,    setMonth]    = useState(new Date().toISOString().slice(0, 7))

  const fetchReports = async () => {
    setLoading(true)

    // "${month}-31" jaisa hardcoded end-date galat tha - Sept/Apr/Jun/Nov
    // (30-din wale mahino) mein invalid date banti thi, jisse Postgres
    // filter hi fail ho jaata tha aur poora report 0 dikhata tha. Ab
    // asli month-boundary compute karte hain, har mahine ke liye sahi
    const [year, mon] = month.split('-').map(Number)
    const monthStart = `${month}-01`
    // paid_at ek timestamp hai - agle mahine ki 1 tareek "lte" ke saath
    // is poore mahine ko sahi cover karti hai
    const nextMonthStart = new Date(Date.UTC(year, mon, 1)).toISOString().slice(0, 10)
    // attendance ka "date" column plain date hai - yahan agle mahine ki
    // 1 tareek nahi, isi mahine ka aakhri din chahiye
    const lastDayOfMonth = new Date(Date.UTC(year, mon, 0)).toISOString().slice(0, 10)

    try {
      // Active/new-this-month/expired counts — members table RLS-locked
      // hai, owner-verified backend route se, ek hi call mein teeno
      const memberStatsRes = await apiFetch(`/api/members/stats?month=${month}`)
      const activeMembers = memberStatsRes.success ? memberStatsRes.active : 0
      const newMembers = memberStatsRes.success ? memberStatsRes.newThisMonth : 0
      const expiredMembers = memberStatsRes.success ? memberStatsRes.expired : 0

      // Monthly payments — payments table RLS-locked hai, owner-verified
      // backend route se
      const paymentsRes = await apiFetch(
        `/api/payment/all?from=${monthStart}&to=${nextMonthStart}`,
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
        `/api/attendance/count?from=${monthStart}&to=${lastDayOfMonth}`,
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
    } catch (err) {
      console.log('Fetch reports error:', err)
      toast.error("Couldn't load reports - check your connection")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(fetchReports)
  }, [month])

  if (loading) {
    return <ReportsSkeleton />
  }

  const memberStatRows = [
    { label: 'Total Active Members', value: stats?.activeMembers, icon: FiUsers, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    { label: 'New Joins This Month', value: `+${stats?.newMembers}`, icon: IoSparklesOutline, color: 'text-violet-400', bg: 'bg-violet-500/15' },
    { label: 'Expired Members',      value: stats?.expiredMembers, icon: IoWarningOutline, color: 'text-red-400', bg: 'bg-red-500/15' },
    { label: 'Total Attendance',     value: stats?.totalAttendance, icon: IoCalendarOutline, color: 'text-blue-400', bg: 'bg-blue-500/15' },
    { label: 'Payments This Month',  value: stats?.totalPayments, icon: IoCashOutline, color: 'text-amber-400', bg: 'bg-amber-500/15' },
  ]

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-extrabold text-white">Reports</h1>
        <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-1.5">
          <IoCalendarOutline size={13} className="text-slate-500" />
          <input
            type="month"
            lang="en-GB"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="bg-transparent text-white text-xs outline-none"
          />
        </div>
      </div>

      {/* Revenue Card */}
      <div className="bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 rounded-2xl p-4 mb-5 border border-violet-500/30">
        <p className="text-violet-200 text-xs font-bold uppercase tracking-wider">
          Total Revenue — {new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' })}
        </p>
        <p className="text-white font-extrabold text-3xl mt-1 tracking-tight">
          ₹{stats?.revenue.toLocaleString('en-IN')}
        </p>
        <div className="flex gap-2 mt-3">
          <div className="flex-1 bg-white/15 rounded-xl p-2 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white flex-shrink-0">
              <IoCashOutline size={13} />
            </div>
            <div>
              <p className="text-violet-200 text-[9px] font-bold uppercase">Cash</p>
              <p className="text-white font-extrabold text-sm">
                ₹{stats?.cash.toLocaleString('en-IN')}
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
                ₹{stats?.upi.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Bars */}
      <SectionHeader icon={IoBarChartOutline} label="Revenue by Week" />
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl p-4 mb-5">
        {stats?.weeks.map((amt, i) => (
          <div key={i} className="flex items-center gap-3 mb-3 last:mb-0">
            <div className="text-slate-400 text-xs w-10 flex-shrink-0">Wk {i + 1}</div>
            <div className="flex-1 h-2 bg-[#0d0d14] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-600 to-violet-400 rounded-full transition-all"
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
      <SectionHeader icon={FiUsers} label="Member Stats" />
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl mb-5">
        {memberStatRows.map((row, i, arr) => (
          <div
            key={row.label}
            className={`flex justify-between items-center px-3.5 py-2.5
              ${i !== arr.length - 1 ? 'border-b border-white/5' : ''}`}
          >
            <span className="text-slate-300 text-sm flex items-center gap-2.5">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${row.bg} ${row.color}`}>
                <row.icon size={13} />
              </span>
              {row.label}
            </span>
            <span className={`text-sm font-extrabold ${row.color}`}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Payment Breakdown */}
      <SectionHeader icon={IoCashOutline} label="Payment Breakdown" />
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl">
        {[
          { label: 'Cash Collected', icon: IoCashOutline, value: `₹${stats?.cash.toLocaleString('en-IN')}`, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
          { label: 'UPI Collected',  icon: FiSmartphone,  value: `₹${stats?.upi.toLocaleString('en-IN')}`,  color: 'text-violet-400', bg: 'bg-violet-500/15' },
          { label: 'UPI % of Total', icon: FiPercent,     value: stats?.revenue > 0 ? `${Math.round((stats.upi / stats.revenue) * 100)}%` : '0%', color: 'text-blue-400', bg: 'bg-blue-500/15' },
        ].map((row, i, arr) => (
          <div
            key={row.label}
            className={`flex justify-between items-center px-3.5 py-2.5
              ${i !== arr.length - 1 ? 'border-b border-white/5' : ''}`}
          >
            <span className="text-slate-300 text-sm flex items-center gap-2.5">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${row.bg} ${row.color}`}>
                <row.icon size={13} />
              </span>
              {row.label}
            </span>
            <span className={`text-sm font-extrabold ${row.color}`}>{row.value}</span>
          </div>
        ))}
      </div>

    </div>
  )
}

export default Reports
