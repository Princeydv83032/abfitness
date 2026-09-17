import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiUser, FiPhone, FiLink, FiCalendar } from 'react-icons/fi'
import { IoCameraOutline, IoCheckmarkCircle, IoCashOutline, IoCheckmarkCircleOutline } from 'react-icons/io5'
import { FiSmartphone } from 'react-icons/fi'
import { apiFetch } from '../../lib/api'
import { usePrices } from '../../hooks/usePrices'
import { toast } from '../../lib/toast'

function AddMember() {
  const navigate = useNavigate()
  const { prices: planPrices, loading: pricesLoading } = usePrices()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [photoUrl, setPhotoUrl] = useState('')
  const [form, setForm] = useState({
    name:          '',
    phone:         '',
    plan:          'monthly',
    paymentMethod: 'cash',
    upiRef:        '',
    joinDate:      new Date().toISOString().split('T')[0],
  })

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const getExpiry = (joinDate, plan) => {
    const date = new Date(joinDate)
    if (plan === 'monthly')   date.setMonth(date.getMonth() + 1)
    if (plan === 'quarterly') date.setMonth(date.getMonth() + 3)
    if (plan === 'yearly')    date.setFullYear(date.getFullYear() + 1)
    return date.toISOString().split('T')[0]
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
    formData.append('folder', 'member_photos')

    // XMLHttpRequest — fetch() has no reliable upload-progress event,
    // xhr.upload.onprogress does, which is what drives the % ring
    setUploading(true)
    setUploadProgress(0)

    const xhr = new XMLHttpRequest()
    xhr.open(
      'POST',
      `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
    )

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setUploadProgress((event.loaded / event.total) * 100)
      }
    }

    xhr.onload = () => {
      setUploading(false)
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText)
        setPhotoUrl(data.secure_url)
      } else {
        console.log('Photo upload error:', xhr.responseText)
        toast.error('Photo upload failed. Please try again.')
      }
    }

    xhr.onerror = () => {
      setUploading(false)
      console.log('Photo upload error: network error')
      toast.error('Photo upload failed. Please try again.')
    }

    xhr.send(formData)
  }

  const handleSubmit = async () => {
    if (!form.name || form.phone.length !== 10) return
    setLoading(true)

    try {
      // members + payments dono RLS-locked hain - owner-verified backend
      // route hi member add karta hai aur amount khud owner ke set kiye
      // fees se nikalta hai (client se amount trust nahi karte)
      const res = await apiFetch('/api/payment/add-member', {
        method: 'POST',
        body: JSON.stringify({
          name:          form.name,
          phone:         form.phone,
          plan:          form.plan,
          paymentMethod: form.paymentMethod,
          upiRef:        form.upiRef,
          joinDate:      form.joinDate,
          profilePhoto:  photoUrl || null,
        }),
      })

      if (!res.success) throw new Error(res.message || res.error || 'Failed to add member')

      toast.success(`${form.name} added! ID: ${res.member.member_id}`)
      navigate('/owner/members')

    } catch (error) {
      toast.error('Error: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">

      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 bg-[#1a1a2e] border border-white/10 rounded-lg flex items-center justify-center text-white"
        >
          <FiArrowLeft size={15} />
        </button>
        <h1 className="text-xl font-extrabold text-white">Add New Member</h1>
      </div>

      {/* Photo upload — mandatory-style, progress ring while uploading */}
      <div className="text-center mb-5">
        <div className="relative w-20 h-20 mx-auto">
          <label
            htmlFor="member-photo-upload"
            className={`block w-20 h-20 ${uploading ? '' : 'cursor-pointer'}`}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Member"
                className="w-20 h-20 rounded-full object-cover border-4 border-violet-500"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#1a1a2e] border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-slate-500">
                <IoCameraOutline size={20} />
                <span className="text-[9px] mt-0.5">Add Photo</span>
              </div>
            )}
          </label>
          <input
            id="member-photo-upload"
            type="file"
            accept="image/*"
            onChange={handlePhotoSelect}
            disabled={uploading}
            className="hidden"
          />

          {/* Upload progress ring */}
          {uploading && (
            <div className="absolute inset-0 rounded-full bg-black/65 flex items-center justify-center">
              <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="5" />
                <circle
                  cx="40" cy="40" r="35" fill="none"
                  stroke="#8b5cf6" strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 35}
                  strokeDashoffset={2 * Math.PI * 35 * (1 - uploadProgress / 100)}
                  style={{ transition: 'stroke-dashoffset 0.15s linear' }}
                />
              </svg>
              <span className="relative z-10 text-white text-xs font-extrabold">
                {uploadProgress.toFixed(0)}%
              </span>
            </div>
          )}
        </div>
        <p className="text-xs font-bold mt-2 uppercase tracking-wider">
          {uploading ? (
            <span className="text-violet-400">Uploading...</span>
          ) : photoUrl ? (
            <span className="text-emerald-400 flex items-center justify-center gap-1">
              <IoCheckmarkCircle size={12} /> Photo added
            </span>
          ) : (
            <span className="text-slate-500">Optional</span>
          )}
        </p>
      </div>

      <div className="space-y-4">

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name *</label>
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <FiUser size={14} className="text-slate-500" />
            <input
              placeholder="Member's full name"
              value={form.name}
              onChange={set('name')}
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number *</label>
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <FiPhone size={14} className="text-slate-500" />
            <input
              type="tel"
              placeholder="10 digit mobile number"
              maxLength={10}
              value={form.phone}
              onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value.replace(/\D/g, '') }))}
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Membership Plan *</label>
          <div className="flex gap-2 mt-1.5">
            {['monthly', 'quarterly', 'yearly'].map((p) => (
              <button
                key={p}
                onClick={() => setForm((prev) => ({ ...prev, plan: p }))}
                className={`flex-1 rounded-xl p-2.5 text-center border transition-all
                  ${form.plan === p
                    ? 'bg-violet-600 border-violet-600 text-white'
                    : 'bg-[#1a1a2e] border-white/10 text-slate-400'
                  }`}
              >
                <div className="text-xs font-bold capitalize">{p}</div>
                {pricesLoading ? (
                  <div className="h-3.5 w-10 bg-white/10 rounded animate-pulse mx-auto mt-1" />
                ) : (
                  <div className="text-sm font-extrabold mt-0.5">
                    ₹{(planPrices[p] || 0).toLocaleString('en-IN')}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Payment Method *</label>
          <div className="flex gap-2 mt-1.5">
            {[
              { key: 'cash', icon: IoCashOutline, label: 'Cash' },
              { key: 'upi',  icon: FiSmartphone,  label: 'UPI'  },
            ].map((m) => (
              <button
                key={m.key}
                onClick={() => setForm((prev) => ({ ...prev, paymentMethod: m.key }))}
                className={`flex-1 rounded-xl p-3 text-center border transition-all
                  ${form.paymentMethod === m.key
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400'
                    : 'bg-[#1a1a2e] border-white/10 text-slate-400'
                  }`}
              >
                <m.icon size={18} className="mx-auto mb-0.5" />
                <div className="text-xs font-bold">{m.label}</div>
              </button>
            ))}
          </div>
        </div>

        {form.paymentMethod === 'upi' && (
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">UPI Reference</label>
            <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
              <FiLink size={14} className="text-slate-500" />
              <input
                placeholder="Transaction ID"
                value={form.upiRef}
                onChange={set('upiRef')}
                className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
              />
            </div>
          </div>
        )}

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Join Date</label>
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <FiCalendar size={14} className="text-slate-500" />
            <input
              type="date"
              lang="en-GB"
              value={form.joinDate}
              onChange={set('joinDate')}
              className="bg-transparent outline-none text-white text-sm flex-1"
            />
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-2">
          <IoCheckmarkCircleOutline size={16} className="text-emerald-400 flex-shrink-0" />
          <div>
            <p className="text-emerald-400 text-xs font-bold">Membership Valid Until</p>
            <p className="text-white font-extrabold text-lg mt-0.5">
              {new Date(getExpiry(form.joinDate, form.plan))
                .toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!form.name || form.phone.length !== 10 || loading || pricesLoading || uploading}
          className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            'Adding...'
          ) : pricesLoading ? (
            'Loading prices...'
          ) : (
            <>
              <IoCheckmarkCircle size={16} />
              Add Member — ₹{(planPrices[form.plan] || 0).toLocaleString('en-IN')}
            </>
          )}
        </button>

      </div>
    </div>
  )
}

export default AddMember
