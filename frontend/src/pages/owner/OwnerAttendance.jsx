import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

function OwnerAttendance() {
  const [attendance, setAttendance] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [search,     setSearch]     = useState('')
  const [stats,      setStats]      = useState({ present: 0, expected: 0 })

  const today = new Date().toISOString().split('T')[0]
  const todayFormatted = new Date().toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  })

  useEffect(() => {
    fetchAttendance()
  }, [])

  const fetchAttendance = async () => {
    setLoading(true)

    // Today's check-ins with member info
    const { data, error } = await supabase
      .from('attendance')
      .select('*, members(name, member_id)')
      .eq('date', today)
      .order('checked_in_at', { ascending: false })

    // Total active members
    const { count: totalMembers } = await supabase
      .from('members')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    if (!error) {
      setAttendance(data)
      setStats({
        present:  data.length,
        expected: totalMembers || 0,
        absent:   (totalMembers || 0) - data.length,
      })
    }
    setLoading(false)
  }

  const handleManualCheckIn = async () => {
    const phone = prompt('Enter member phone number:')
    if (!phone) return

    // Member dhundho
    const { data: member } = await supabase
      .from('members')
      .select('id, name')
      .eq('phone', phone)
      .single()

    if (!member) {
      alert('Member not found!')
      return
    }

    // Check-in karo
    const { error } = await supabase
      .from('attendance')
      .insert({
        member_id:     member.id,
        date:          today,
        checked_in_at: new Date().toISOString(),
      })

    if (error) {
      alert('Already checked in today!')
    } else {
      alert(`${member.name} checked in! ✅`)
      fetchAttendance()
    }
  }

  const filtered = attendance.filter((a) =>
    a.members?.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.members?.member_id?.includes(search)
  )

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">

      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h1 className="text-2xl font-black text-white">Attendance</h1>
        <span className="bg-purple-600/20 text-purple-400 text-xs font-bold px-3 py-1 rounded-full">
          📅 {todayFormatted}
        </span>
      </div>
      <p className="text-slate-400 text-sm mb-4">Today's check-ins</p>

      {/* Stats */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Present</p>
          <p className="text-green-400 text-2xl font-black mt-1">{stats.present}</p>
          <p className="text-slate-500 text-xs">today</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Active</p>
          <p className="text-blue-400 text-2xl font-black mt-1">{stats.expected}</p>
          <p className="text-slate-500 text-xs">members</p>
        </div>
        <div className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3">
          <p className="text-slate-400 text-[9px] font-bold uppercase tracking-wider">Absent</p>
          <p className="text-red-400 text-2xl font-black mt-1">{stats.absent}</p>
          <p className="text-slate-500 text-xs">today</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-3 py-2.5 mb-4">
        <span>🔍</span>
        <input
          placeholder="Search member..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
        />
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
        </div>
      )}

      {/* Check-in List */}
      {!loading && (
        <>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
            Today's Check-ins
          </p>
          <div className="bg-[#1a1a2e] border border-white/7 rounded-xl divide-y divide-white/5 mb-4">
            {filtered.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white font-black text-sm flex-shrink-0">
                  {a.members?.name?.[0] || 'M'}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm font-bold">{a.members?.name}</p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    {a.members?.member_id} · {new Date(a.checked_in_at).toLocaleTimeString('en-IN', {
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="w-7 h-7 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-green-400 text-xs">
                  ✓
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
            onClick={handleManualCheckIn}
            className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm"
          >
            ➕ Mark Attendance Manually
          </button>
        </>
      )}

    </div>
  )
}

export default OwnerAttendance