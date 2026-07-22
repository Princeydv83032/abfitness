import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'

function Profile() {
  const navigate = useNavigate()
  const user     = useAuthStore((state) => state.user)
  const logout   = useAuthStore((state) => state.logout)
  const [member,  setMember]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) fetchMember()
  }, [user])

  const fetchMember = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('members')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) setMember(data)
    setLoading(false)
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    )
  }

  const infoRows = [
    { label: 'Phone',   value: member?.phone                          },
    { label: 'Plan',    value: member?.plan?.charAt(0).toUpperCase() + member?.plan?.slice(1) },
    { label: 'Joined',  value: new Date(member?.joined_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
    { label: 'Expires', value: new Date(member?.expires_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
    { label: 'Status',  value: member?.status === 'active' ? 'Active ✅' : 'Expired ❌' },
  ]

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">

      {/* Profile Hero */}
      <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-2xl p-4 flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
          {member?.name?.[0] || 'M'}
        </div>
        <div>
          <h2 className="text-white font-black text-lg">{member?.name}</h2>
          <p className="text-slate-400 text-xs mt-0.5">{member?.member_id}</p>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block
            ${member?.status === 'active'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-red-500/20 text-red-400'
            }`}>
            {member?.status === 'active' ? '✓ Active' : '⚠️ Expired'}
          </span>
        </div>
      </div>

      {/* Info */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Membership Info
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl mb-4">
        {infoRows.map((row, i) => (
          <div
            key={i}
            className={`flex justify-between items-center px-4 py-3
              ${i !== infoRows.length - 1 ? 'border-b border-white/5' : ''}`}
          >
            <span className="text-slate-400 text-sm">{row.label}</span>
            <span className="text-white text-sm font-semibold">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-3 rounded-xl text-sm"
      >
        Log Out
      </button>

    </div>
  )
}

export default Profile