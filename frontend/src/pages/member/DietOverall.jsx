import { useLocation, useNavigate } from "react-router-dom";

function DietOverall() {
  const navigate = useNavigate();
  const location = useLocation();
  const { plan, selectedGoal, isVeg } = location.state || {};

  if (!plan) {
    navigate("/diet");
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="w-8 h-8 bg-[#1a1a2e] border border-white/10 rounded-lg flex items-center justify-center text-white"
        >
          ←
        </button>
        <div>
          <h1 className="text-xl font-black text-white">Overall Diet Plan</h1>
          <p className="text-slate-400 text-xs">
            {selectedGoal} · {isVeg ? "🥦 Veg" : "🍗 Non-Veg"}
          </p>
        </div>
      </div>

      {/* Daily Summary */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-4 mb-4 border border-purple-500/30">
        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
          Daily Target
        </p>
        <div className="flex gap-4 mt-2">
          <div>
            <p className="text-white font-black text-2xl">{plan.calories}</p>
            <p className="text-purple-300 text-xs">Calories</p>
          </div>
          <div className="w-px bg-white/20"></div>
          <div>
            <p className="text-white font-black text-2xl">{plan.protein}g</p>
            <p className="text-purple-300 text-xs">Protein</p>
          </div>
          <div className="w-px bg-white/20"></div>
          <div>
            <p className="text-white font-black text-2xl">
              {plan.meals.length}
            </p>
            <p className="text-purple-300 text-xs">Meals</p>
          </div>
        </div>
      </div>

      {/* All Meals */}
      <div className="space-y-3">
        {plan.meals.map((meal, i) => (
          <div
            key={i}
            className="bg-[#1a1a2e] border border-white/7 rounded-xl p-4"
          >
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-white font-black text-sm">{meal.name}</p>
                <p className="text-slate-500 text-xs">⏰ {meal.time}</p>
              </div>
              <div className="text-right">
                <p className="text-purple-400 text-xs font-bold">
                  {meal.protein}g protein
                </p>
                <p className="text-slate-500 text-xs">{meal.calories} kcal</p>
              </div>
            </div>
            <div className="h-px bg-white/5 mb-2"></div>
            <div className="space-y-1">
              {meal.items.map((item, j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></div>
                  <p className="text-slate-300 text-xs">{item}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <p className="text-amber-400 font-bold text-sm mb-2">💡 Tips</p>
        {[
          "Khana khane se pehle paani piyo",
          "Raat ka khana halka rakhein",
          "Fried food se bachein",
          "Processed food avoid karein",
        ].map((tip, i) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></div>
            <p className="text-slate-300 text-xs">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DietOverall;
