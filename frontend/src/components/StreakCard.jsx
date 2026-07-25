function StreakCard({ streak, getStreakEmoji }) {
  const current = streak?.current || 0
  const longest = streak?.longest || 0

  return (
    <div className="bg-gradient-to-r from-orange-900/40 to-red-900/40 border border-orange-500/30 rounded-2xl p-4 mb-4">

      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <p className="text-orange-300 text-xs font-bold uppercase tracking-wider">
          Daily Streak
        </p>
        <span className="text-2xl">{getStreakEmoji(current)}</span>
      </div>

      {/* Current Streak */}
      <div className="flex items-end gap-2 mb-2">
        <span className="text-4xl font-black text-white">{current}</span>
        <span className="text-orange-300 text-sm font-bold mb-1">days</span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, (current / 30) * 100)}%` }}
        />
      </div>

      {/* Stats Row */}
      <div className="flex justify-between">
        <div>
          <p className="text-slate-400 text-[10px] font-bold uppercase">Best</p>
          <p className="text-white font-black">🏆 {longest} days</p>
        </div>
        <div className="text-right">
          <p className="text-slate-400 text-[10px] font-bold uppercase">Next Badge</p>
          <p className="text-white font-black text-xs">
            {current < 3  ? `${3  - current} days → 🥉` :
             current < 7  ? `${7  - current} days → 🔥` :
             current < 30 ? `${30 - current} days → 💪` :
             current < 100? `${100- current} days → 🏆` :
             '🏆 Legend!'}
          </p>
        </div>
      </div>

    </div>
  )
}

export default StreakCard