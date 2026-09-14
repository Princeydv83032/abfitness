import { useEffect, useState } from 'react'

function BadgePopup({ badge, onClose }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (badge) {
      setTimeout(() => setShow(true), 100)
      setTimeout(() => {
        setShow(false)
        setTimeout(onClose, 300)
      }, 3000)
    }
  }, [badge])

  if (!badge) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a2e] border border-violet-500/30 rounded-3xl p-8 text-center mx-6 transition-all duration-300"
        style={{
          transform: show ? 'scale(1)' : 'scale(0.5)',
          opacity:   show ? 1 : 0,
        }}
      >
        {/* Badge Emoji */}
        <div
          className="text-8xl mb-4"
          style={{ animation: 'bounce 0.5s ease infinite alternate' }}
        >
          {badge.emoji}
        </div>

        {/* Congrats */}
        <p className="text-violet-400 text-xs font-bold uppercase tracking-wider mb-2">
          New Achievement!
        </p>
        <h2 className="text-white text-2xl font-black mb-2">
          {badge.title}
        </h2>
        <p className="text-slate-400 text-sm">
          🔥 {badge.days} day streak achieved!
        </p>

        {/* Stars */}
        <div className="flex justify-center gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="text-2xl"
              style={{ animation: `bounce 0.5s ease ${i * 0.1}s infinite alternate` }}
            >
              ⭐
            </span>
          ))}
        </div>

        <p className="text-slate-500 text-xs mt-4">Tap to close</p>
      </div>

      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to   { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}

export default BadgePopup