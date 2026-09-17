import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiUser, FiPhone, FiCalendar, FiClock, FiCheck } from 'react-icons/fi'
import { apiFetch } from '../../lib/api'
import { toast } from '../../lib/toast'

function EditMemberSkeleton() {
  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-10">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-6 w-32 bg-white/5 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-4">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}

function EditMember() {
  const navigate = useNavigate()
  const { id }   = useParams()

  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [form, setForm] = useState({
    name:       '',
    phone:      '',
    plan:       'monthly',
    status:     'active',
    joined_at:  '',
    expires_at: '',
  })

  const fetchMember = async () => {
    setLoading(true)
    const res = await apiFetch(`/api/members/${id}`)
    const data = res.success ? res.member : null

    if (data) {
      setForm({
        name:       data.name       || '',
        phone:      data.phone      || '',
        plan:       data.plan       || 'monthly',
        status:     data.status     || 'active',
        joined_at:  data.joined_at  || '',
        expires_at: data.expires_at || '',
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    if (id) queueMicrotask(fetchMember)
  }, [id])

  const set = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const handleSave = async () => {
    if (!form.name || !form.phone) return
    setSaving(true)

    const res = await apiFetch(`/api/members/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        name:       form.name,
        phone:      form.phone,
        plan:       form.plan,
        status:     form.status,
        joined_at:  form.joined_at,
        expires_at: form.expires_at,
      }),
    })

    if (res.success) {
      toast.success('Member updated successfully!')
      navigate(`/owner/members/${id}`)
    } else {
      toast.error('Something went wrong: ' + (res.message || res.error))
    }
    setSaving(false)
  }

  if (loading) {
    return <EditMemberSkeleton />
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">

      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 bg-[#1a1a2e] border border-white/10 rounded-lg flex items-center justify-center text-white"
        >
          <FiArrowLeft size={15} />
        </button>
        <h1 className="text-xl font-extrabold text-white">Edit Member</h1>
      </div>

      <div className="space-y-4">

        {/* Name */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Full Name *
          </label>
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

        {/* Phone */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Phone Number *
          </label>
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

        {/* Plan */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Membership Plan
          </label>
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
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Status
          </label>
          <div className="flex gap-2 mt-1.5">
            {[
              { key: 'active',  label: 'Active',  color: 'bg-emerald-500/15 border-emerald-500 text-emerald-400'  },
              { key: 'paused',  label: 'Paused',  color: 'bg-amber-500/15 border-amber-500 text-amber-400'  },
              { key: 'expired', label: 'Expired', color: 'bg-red-500/15   border-red-500   text-red-400'    },
            ].map((s) => (
              <button
                key={s.key}
                onClick={() => setForm((prev) => ({ ...prev, status: s.key }))}
                className={`flex-1 rounded-xl p-2.5 text-center border transition-all text-xs font-bold
                  ${form.status === s.key ? s.color : 'bg-[#1a1a2e] border-white/10 text-slate-400'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Join Date */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Join Date
          </label>
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <FiCalendar size={14} className="text-slate-500" />
            <input
              type="date"
              lang="en-GB"
              value={form.joined_at}
              onChange={set('joined_at')}
              className="bg-transparent outline-none text-white text-sm flex-1"
            />
          </div>
        </div>

        {/* Expiry Date */}
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Expiry Date
          </label>
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <FiClock size={14} className="text-slate-500" />
            <input
              type="date"
              lang="en-GB"
              value={form.expires_at}
              onChange={set('expires_at')}
              className="bg-transparent outline-none text-white text-sm flex-1"
            />
          </div>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={!form.name || form.phone.length !== 10 || saving}
          className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? (
            'Saving...'
          ) : (
            <>
              <FiCheck size={15} /> Save Changes
            </>
          )}
        </button>

      </div>
    </div>
  )
}

export default EditMember
