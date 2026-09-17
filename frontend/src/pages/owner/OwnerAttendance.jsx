import { useState, useEffect } from 'react'
import {
  IoCalendarOutline,
  IoSearchOutline,
  IoCheckmarkCircle,
  IoPersonAddOutline,
} from 'react-icons/io5'
import { FiUsers, FiUserCheck, FiUserX, FiX } from 'react-icons/fi'
import { apiFetch } from '../../lib/api'
import { toast } from '../../lib/toast'

function MemberAvatar({ member, size = 'w-9 h-9', textSize = 'text-sm' }) {
  return member.profile_photo ? (
    <img
      src={member.profile_photo}
      alt={member.name}
      className={`${size} rounded-full object-cover flex-shrink-0`}
    />
  ) : (
    <div
      className={`${size} rounded-full bg-violet-600 flex items-center justify-center text-white font-extrabold ${textSize} flex-shrink-0`}
    >
      {member.name?.[0] || '?'}
    </div>
  )
}

function AttendanceSkeleton() {
  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">
      <div className="flex justify-between items-center mb-1">
        <div className="h-7 w-32 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-6 w-24 bg-white/5 rounded-full animate-pulse" />
      </div>
      <div className="h-4 w-28 bg-white/5 rounded-lg animate-pulse mt-2 mb-4" />
      <div className="flex gap-2 mb-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-11 bg-white/5 rounded-xl animate-pulse mb-4" />
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl divide-y divide-white/5">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse flex-shrink-0" />
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

function OwnerAttendance() {
  const [attendance, setAttendance] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [stats,      setStats]      = useState({ present: 0, expected: 0, absent: 0 })

  const [showCheckIn, setShowCheckIn] = useState(false)
  const [allMembers, setAllMembers] = useState([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [checkInSearch, setCheckInSearch] = useState('')
  const [checkingIn, setCheckingIn] = useState(false)

  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  const fetchAttendance = async () => {
    setLoading(true)
    try {
      // attendance table RLS-locked hai - owner-verified backend route se
      const attendanceRes = await apiFetch('/api/attendance/today')
      const data = attendanceRes.success ? attendanceRes.attendance : []

      // Total active members
      const statsRes = await apiFetch('/api/members/stats')
      const totalMembers = statsRes.success ? statsRes.active : 0

      if (attendanceRes.success) {
        setAttendance(data)
        setStats({
          present:  data.length,
          expected: totalMembers || 0,
          absent:   Math.max((totalMembers || 0) - data.length, 0),
        })
      }
    } catch (err) {
      console.log('Fetch attendance error:', err)
      toast.error("Couldn't load attendance - check your connection")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    queueMicrotask(fetchAttendance)
  }, [])

  const openCheckIn = async () => {
    setShowCheckIn(true)
    setCheckInSearch('')
    if (allMembers.length > 0) return
    setMembersLoading(true)
    try {
      // members table RLS-locked hai - owner-verified backend route se
      const res = await apiFetch('/api/members/list')
      setAllMembers(res.success ? res.members : [])
    } catch (err) {
      console.log('Fetch members error:', err)
      toast.error("Couldn't load members - check your connection")
    } finally {
      setMembersLoading(false)
    }
  }

  const checkedInIds = new Set(attendance.map((a) => a.member_id))

  // Har member hamesha list mein dikhta hai (search ho ya na ho) -
  // already-checked-in ya non-active ko hide nahi karte, sirf unka
  // status row par hi dikha dete hain, taaki owner ko pata chale wo
  // kyun check-in nahi ho sakte. Checkable members sabse upar aate hain
  const checkInResults = allMembers
    .filter((m) => {
      if (!checkInSearch.trim()) return true
      const q = checkInSearch.toLowerCase()
      const idDigits = m.member_id.toLowerCase().replace(/^gym-/, '')
      return (
        m.name.toLowerCase().includes(q) ||
        idDigits.includes(q) ||
        m.phone?.includes(q)
      )
    })
    .sort((a, b) => {
      const rank = (m) =>
        m.status === 'active' && !checkedInIds.has(m.id) ? 0 : checkedInIds.has(m.id) ? 1 : 2
      return rank(a) - rank(b)
    })

  const handleMarkPresent = async (member) => {
    setCheckingIn(true)
    try {
      const res = await apiFetch('/api/attendance/mark', {
        method: 'POST',
        body: JSON.stringify({ memberId: member.id }),
      })

      if (!res.success) {
        toast.error(res.message || 'Already checked in today!')
        return
      }

      toast.success(`${member.name} checked in!`)
      setShowCheckIn(false)
      fetchAttendance()
    } catch (err) {
      console.log('Manual check-in error:', err)
      toast.error("Couldn't check in - check your connection")
    } finally {
      setCheckingIn(false)
    }
  }

  const filtered = attendance.filter((a) =>
    a.members?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.members?.member_id?.includes(search)
  )

  if (loading) {
    return <AttendanceSkeleton />
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">

      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-2xl font-extrabold text-white">Attendance</h1>
        <span className="bg-violet-600/20 text-violet-400 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
          <IoCalendarOutline size={12} /> {todayFormatted}
        </span>
      </div>
      <p className="text-slate-400 text-sm mb-4">Today's check-ins</p>

      {/* Stats */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400 mb-1.5">
            <FiUserCheck size={13} />
          </div>
          <p className="text-emerald-400 text-2xl font-extrabold leading-none">{stats.present}</p>
          <p className="text-slate-500 text-[10px] font-bold uppercase mt-1.5">Present</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <div className="w-7 h-7 rounded-full bg-blue-500/15 flex items-center justify-center text-blue-400 mb-1.5">
            <FiUsers size={13} />
          </div>
          <p className="text-blue-400 text-2xl font-extrabold leading-none">{stats.expected}</p>
          <p className="text-slate-500 text-[10px] font-bold uppercase mt-1.5">Active</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <div className="w-7 h-7 rounded-full bg-red-500/15 flex items-center justify-center text-red-400 mb-1.5">
            <FiUserX size={13} />
          </div>
          <p className="text-red-400 text-2xl font-extrabold leading-none">{stats.absent}</p>
          <p className="text-slate-500 text-[10px] font-bold uppercase mt-1.5">Absent</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 mb-4">
        <IoSearchOutline size={15} className="text-slate-500" />
        <input
          placeholder="Search member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
        />
      </div>

      {/* Check-in List */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Today's Check-ins
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl divide-y divide-white/5 mb-4">
        {filtered.map((a) => (
          <div key={a.id} className="flex items-center gap-3 px-4 py-3">
            <MemberAvatar member={a.members || { name: 'M' }} />
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-bold truncate">{a.members?.name}</p>
              <p className="text-slate-400 text-xs mt-0.5">
                {a.members?.member_id} · {new Date(a.checked_in_at).toLocaleTimeString('en-IN', {
                  hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
            <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <IoCheckmarkCircle size={14} />
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            No check-ins today yet
          </div>
        )}
      </div>

      {/* Manual Check-in */}
      <button
        onClick={openCheckIn}
        className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
      >
        <IoPersonAddOutline size={16} /> Mark Attendance Manually
      </button>

      {/* Manual check-in sheet */}
      {showCheckIn && (
        <div
          className="fixed inset-0 z-[60] bg-black/70 flex items-end"
          onClick={() => setShowCheckIn(false)}
        >
          <div
            className="w-full max-h-[75vh] bg-[#1a1a2e] border-t border-white/10 rounded-t-3xl p-4 pb-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-white font-extrabold text-base">Mark Attendance</h2>
              <button
                onClick={() => setShowCheckIn(false)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400"
              >
                <FiX size={15} />
              </button>
            </div>

            <div className="flex items-center gap-2 bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2.5 mb-3">
              <IoSearchOutline size={15} className="text-slate-500" />
              <input
                placeholder="Search by name, ID or phone..."
                value={checkInSearch}
                onChange={(e) => setCheckInSearch(e.target.value)}
                autoFocus
                className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
              />
            </div>

            {membersLoading ? (
              <div className="space-y-1">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3 px-2.5 py-2.5">
                    <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse flex-shrink-0" />
                    <div className="flex-1">
                      <div className="h-3.5 w-28 bg-white/5 rounded animate-pulse" />
                      <div className="h-2.5 w-16 bg-white/5 rounded animate-pulse mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : checkInResults.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">
                {checkInSearch ? 'No member found' : 'No members yet'}
              </p>
            ) : (
              <div className="space-y-1">
                {checkInResults.map((m) => {
                  const alreadyIn = checkedInIds.has(m.id)
                  const notActive = m.status !== 'active'
                  const disabled = alreadyIn || notActive || checkingIn
                  return (
                    <button
                      key={m.id}
                      onClick={() => !alreadyIn && !notActive && handleMarkPresent(m)}
                      disabled={disabled}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-colors ${
                        disabled ? "opacity-50" : "active:bg-white/5"
                      }`}
                    >
                      <MemberAvatar member={m} />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-bold truncate">{m.name}</p>
                        <p className="text-slate-500 text-xs">{m.member_id}</p>
                      </div>
                      {alreadyIn ? (
                        <span className="text-emerald-400 text-xs font-bold flex-shrink-0">
                          Already In
                        </span>
                      ) : notActive ? (
                        <span className="text-slate-500 text-xs font-bold flex-shrink-0 capitalize">
                          {m.status}
                        </span>
                      ) : (
                        <span className="text-violet-400 text-xs font-bold flex-shrink-0">
                          Check In
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}

export default OwnerAttendance
