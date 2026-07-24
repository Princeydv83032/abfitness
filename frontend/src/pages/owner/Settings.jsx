import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import useAuthStore from '../../store/authStore'

function Settings() {
  const navigate = useNavigate()
  const user     = useAuthStore((state) => state.user)
  const logout   = useAuthStore((state) => state.logout)

  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState(false)
  const [upiId,     setUpiId]     = useState('')
const [qrUrl,     setQrUrl]     = useState('')
const [qrUploading, setQrUploading] = useState(false)

  const [gymName, setGymName] = useState('')
  const [timing,  setTiming]  = useState('')
  const [fees, setFees] = useState({
    monthly:   1500,
    quarterly: 4000,
    yearly:    15000,
  })
  const [notifications, setNotifications] = useState({
    expiryAlerts:   true,
    dailySummary:   true,
    newMemberAlert: false,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('owner')
      .select('*')
      .single()

    if (data) {
      setGymName(data.gym_name || '')
      setTiming(data.timing   || '5:00 AM - 10:00 PM')
      setUpiId(data.upi_id    || '')  // ye add karo
  setQrUrl(data.upi_qr_url || '') // ye add karo

      // Settings JSON se fees load karo
      if (data.settings?.fees) {
        setFees(data.settings.fees)
      }
      if (data.settings?.notifications) {
        setNotifications(data.settings.notifications)
      }
    }
    setLoading(false)
  }

 const handleQRUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  setQrUploading(true)

  // Cloudinary pe upload karo
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
  formData.append('folder', 'gym_qr')

  try {
    const res  = await fetch(
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )
    const data = await res.json()

    // Supabase mein save karo
    await supabase
      .from('owner')
      .update({ upi_qr_url: data.secure_url })
      .eq('gym_name', gymName)

    setQrUrl(data.secure_url)
    alert('✅ QR Code uploaded!')
  } catch (err) {
    alert('Upload failed')
  } finally {
    setQrUploading(false)
  }
}

  const toggleNotif = (key) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))

  const handleLogout = () => {
    logout()
    navigate('/owner/login')
  }

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
      <h1 className="text-2xl font-black text-white mb-4">Settings</h1>

      {/* Gym Profile */}
      <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-2xl p-4 flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
          {gymName?.[0] || 'A'}
        </div>
        <div>
          <h2 className="text-white font-black text-lg">{gymName}</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Owner · +91 {user?.phone || '--'}
          </p>
          <span className="bg-purple-600/20 text-purple-400 text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
            👑 Admin
          </span>
        </div>
      </div>

      {/* Gym Info */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Gym Info
      </p>
      <div className="space-y-3 mb-5">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Gym Name
          </label>
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <span>🏋️</span>
            <input
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              placeholder="Gym name"
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Timing
          </label>
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <span>⏰</span>
            <input
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
              placeholder="5:00 AM - 10:00 PM"
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Membership Fees */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Membership Fees
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl mb-5">
        {[
          { key: 'monthly',   label: 'Monthly Plan'   },
          { key: 'quarterly', label: 'Quarterly Plan' },
          { key: 'yearly',    label: 'Yearly Plan'    },
        ].map((item, i, arr) => (
          <div
            key={item.key}
            className={`flex justify-between items-center px-4 py-3
              ${i !== arr.length - 1 ? 'border-b border-white/5' : ''}`}
          >
            <span className="text-slate-300 text-sm">{item.label}</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-sm">₹</span>
              <input
                type="number"
                value={fees[item.key]}
                onChange={(e) =>
                  setFees((prev) => ({ ...prev, [item.key]: parseInt(e.target.value) || 0 }))
                }
                className="bg-transparent outline-none text-white text-sm font-bold w-20 text-right"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Notifications
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl mb-5">
        {[
          { key: 'expiryAlerts',   label: 'Expiry Alerts',    sub: '7 days before member expires'  },
          { key: 'dailySummary',   label: 'Daily Summary',    sub: 'End of day payment summary'    },
          { key: 'newMemberAlert', label: 'New Member Alert', sub: 'Notify when member is added'   },
        ].map((item, i, arr) => (
          <div
            key={item.key}
            className={`flex justify-between items-center px-4 py-3
              ${i !== arr.length - 1 ? 'border-b border-white/5' : ''}`}
          >
            <div>
              <p className="text-white text-sm font-semibold">{item.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{item.sub}</p>
            </div>
            <div
              onClick={() => toggleNotif(item.key)}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-all
                ${notifications[item.key] ? 'bg-purple-600' : 'bg-white/10 border border-white/10'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all
                ${notifications[item.key] ? 'right-1' : 'left-1'}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Success Message */}
      {success && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 mb-4 text-center">
          <p className="text-green-400 font-bold text-sm">✅ Settings saved successfully!</p>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm mb-3 disabled:opacity-50"
      >
        {saving ? '⏳ Saving...' : '💾 Save Changes'}
      </button>

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

export default Settings