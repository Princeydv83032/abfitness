import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../store/authStore";

const indianFoods = [
  // Roti/Rice
  {
    name: "Roti (1 piece)",
    cal: 70,
    protein: 2.5,
    carbs: 15,
    fat: 0.5,
    category: "🫓 Roti/Rice",
  },
  {
    name: "Paratha (1 piece)",
    cal: 200,
    protein: 4,
    carbs: 30,
    fat: 8,
    category: "🫓 Roti/Rice",
  },
  {
    name: "Rice (1 cup cooked)",
    cal: 200,
    protein: 4,
    carbs: 44,
    fat: 0.5,
    category: "🫓 Roti/Rice",
  },
  {
    name: "Brown Rice (1 cup)",
    cal: 215,
    protein: 5,
    carbs: 45,
    fat: 1.5,
    category: "🫓 Roti/Rice",
  },
  {
    name: "Naan (1 piece)",
    cal: 260,
    protein: 8,
    carbs: 45,
    fat: 5,
    category: "🫓 Roti/Rice",
  },
  {
    name: "Poha (1 bowl)",
    cal: 180,
    protein: 4,
    carbs: 35,
    fat: 3,
    category: "🫓 Roti/Rice",
  },
  {
    name: "Upma (1 bowl)",
    cal: 200,
    protein: 5,
    carbs: 32,
    fat: 6,
    category: "🫓 Roti/Rice",
  },
  {
    name: "Idli (1 piece)",
    cal: 40,
    protein: 2,
    carbs: 8,
    fat: 0.5,
    category: "🫓 Roti/Rice",
  },
  {
    name: "Dosa (1 piece)",
    cal: 120,
    protein: 3,
    carbs: 20,
    fat: 3,
    category: "🫓 Roti/Rice",
  },
  // Dal/Sabzi
  {
    name: "Dal (1 cup)",
    cal: 115,
    protein: 8,
    carbs: 18,
    fat: 1,
    category: "🥣 Dal/Sabzi",
  },
  {
    name: "Rajma (1 cup)",
    cal: 220,
    protein: 14,
    carbs: 38,
    fat: 1,
    category: "🥣 Dal/Sabzi",
  },
  {
    name: "Chole (1 cup)",
    cal: 210,
    protein: 12,
    carbs: 35,
    fat: 3,
    category: "🥣 Dal/Sabzi",
  },
  {
    name: "Palak Paneer (1 bowl)",
    cal: 250,
    protein: 12,
    carbs: 10,
    fat: 18,
    category: "🥣 Dal/Sabzi",
  },
  {
    name: "Aloo Sabzi (1 bowl)",
    cal: 180,
    protein: 3,
    carbs: 30,
    fat: 6,
    category: "🥣 Dal/Sabzi",
  },
  {
    name: "Sambhar (1 bowl)",
    cal: 100,
    protein: 5,
    carbs: 15,
    fat: 2,
    category: "🥣 Dal/Sabzi",
  },
  // Protein
  {
    name: "Paneer (100g)",
    cal: 260,
    protein: 18,
    carbs: 2,
    fat: 20,
    category: "💪 Protein",
  },
  {
    name: "Egg (1 whole)",
    cal: 70,
    protein: 6,
    carbs: 0,
    fat: 5,
    category: "💪 Protein",
  },
  {
    name: "Egg White (1)",
    cal: 17,
    protein: 4,
    carbs: 0,
    fat: 0,
    category: "💪 Protein",
  },
  {
    name: "Chicken (100g boiled)",
    cal: 165,
    protein: 31,
    carbs: 0,
    fat: 4,
    category: "💪 Protein",
  },
  {
    name: "Fish (100g)",
    cal: 120,
    protein: 22,
    carbs: 0,
    fat: 3,
    category: "💪 Protein",
  },
  {
    name: "Soya Chunks (50g)",
    cal: 170,
    protein: 26,
    carbs: 12,
    fat: 1,
    category: "💪 Protein",
  },
  {
    name: "Whey Protein (1 scoop)",
    cal: 120,
    protein: 25,
    carbs: 3,
    fat: 1,
    category: "💪 Protein",
  },
  {
    name: "Tofu (100g)",
    cal: 80,
    protein: 9,
    carbs: 2,
    fat: 4,
    category: "💪 Protein",
  },
  // Dairy
  {
    name: "Milk (1 glass 200ml)",
    cal: 120,
    protein: 6,
    carbs: 10,
    fat: 5,
    category: "🥛 Dairy",
  },
  {
    name: "Curd (1 cup)",
    cal: 100,
    protein: 8,
    carbs: 8,
    fat: 4,
    category: "🥛 Dairy",
  },
  {
    name: "Buttermilk (1 glass)",
    cal: 40,
    protein: 3,
    carbs: 4,
    fat: 1,
    category: "🥛 Dairy",
  },
  {
    name: "Paneer (50g)",
    cal: 130,
    protein: 9,
    carbs: 1,
    fat: 10,
    category: "🥛 Dairy",
  },
  // Fruits
  {
    name: "Banana (1 medium)",
    cal: 90,
    protein: 1,
    carbs: 23,
    fat: 0,
    category: "🍎 Fruits",
  },
  {
    name: "Apple (1 medium)",
    cal: 80,
    protein: 0.5,
    carbs: 21,
    fat: 0,
    category: "🍎 Fruits",
  },
  {
    name: "Orange (1 medium)",
    cal: 60,
    protein: 1,
    carbs: 15,
    fat: 0,
    category: "🍎 Fruits",
  },
  {
    name: "Mango (1 cup)",
    cal: 100,
    protein: 1.5,
    carbs: 25,
    fat: 0.5,
    category: "🍎 Fruits",
  },
  {
    name: "Papaya (1 cup)",
    cal: 55,
    protein: 1,
    carbs: 14,
    fat: 0,
    category: "🍎 Fruits",
  },
  {
    name: "Watermelon (1 cup)",
    cal: 45,
    protein: 1,
    carbs: 11,
    fat: 0,
    category: "🍎 Fruits",
  },
  // Nuts
  {
    name: "Almonds (20g)",
    cal: 116,
    protein: 4,
    carbs: 4,
    fat: 10,
    category: "🥜 Nuts",
  },
  {
    name: "Peanuts (30g)",
    cal: 170,
    protein: 7,
    carbs: 5,
    fat: 14,
    category: "🥜 Nuts",
  },
  {
    name: "Peanut Butter (1 tbsp)",
    cal: 90,
    protein: 4,
    carbs: 3,
    fat: 8,
    category: "🥜 Nuts",
  },
  {
    name: "Cashews (20g)",
    cal: 110,
    protein: 3,
    carbs: 6,
    fat: 9,
    category: "🥜 Nuts",
  },
  // Drinks
  {
    name: "Green Tea (1 cup)",
    cal: 2,
    protein: 0,
    carbs: 0,
    fat: 0,
    category: "☕ Drinks",
  },
  {
    name: "Chai with Milk",
    cal: 60,
    protein: 2,
    carbs: 8,
    fat: 2,
    category: "☕ Drinks",
  },
  {
    name: "Lassi (1 glass)",
    cal: 150,
    protein: 6,
    carbs: 18,
    fat: 5,
    category: "☕ Drinks",
  },
  {
    name: "Coconut Water",
    cal: 45,
    protein: 2,
    carbs: 9,
    fat: 0,
    category: "☕ Drinks",
  },
];

const categories = ["All", ...new Set(indianFoods.map((f) => f.category))];

function CalorieCounter() {
  const user = useAuthStore((state) => state.user);

  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("All");
  const [addedMeals, setAddedMeals] = useState([]);
  const [goalCal, setGoalCal] = useState(2000);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const totalCal = addedMeals.reduce(
    (s, m) => s + m.cal * (m.quantity || 1),
    0,
  );
  const totalProtein = addedMeals.reduce(
    (s, m) => s + m.protein * (m.quantity || 1),
    0,
  );
  const totalCarbs = addedMeals.reduce(
    (s, m) => s + m.carbs * (m.quantity || 1),
    0,
  );
  const totalFat = addedMeals.reduce(
    (s, m) => s + m.fat * (m.quantity || 1),
    0,
  );
  const percentage = Math.min(100, Math.round((totalCal / goalCal) * 100));
  const remaining = Math.max(0, goalCal - totalCal);

  useEffect(() => {
    if (user?.id) fetchLog();
  }, [user]);

  const fetchLog = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("calorie_logs")
      .select("*")
      .eq("member_id", user.id)
      .eq("date", today)
      .maybeSingle();

    if (data) {
      setAddedMeals(data.meals || []);
      setGoalCal(data.goal_cal || 2000);
    }
    setLoading(false);
  };

  const saveLog = async (meals) => {
    setSaving(true);
    await supabase.from("calorie_logs").upsert(
      {
        member_id: user.id,
        date: today,
        meals,
        total_cal: meals.reduce((s, m) => s + m.cal * (m.quantity || 1), 0),
        goal_cal: goalCal,
      },
      { onConflict: "member_id,date" },
    );
    setSaving(false);
  };

  const addFood = async (food) => {
    const existing = addedMeals.findIndex((m) => m.name === food.name);
    let newMeals;

    if (existing !== -1) {
      newMeals = addedMeals.map((m, i) =>
        i === existing ? { ...m, quantity: (m.quantity || 1) + 1 } : m,
      );
    } else {
      newMeals = [
        ...addedMeals,
        { ...food, quantity: 1, addedAt: new Date().toISOString() },
      ];
    }

    setAddedMeals(newMeals);
    await saveLog(newMeals);
    setShowSearch(false);
    setSearch("");
  };

  const updateQuantity = async (index, delta) => {
    const newMeals = addedMeals
      .map((m, i) => {
        if (i !== index) return m;
        const newQty = (m.quantity || 1) + delta;
        if (newQty <= 0) return null;
        return { ...m, quantity: newQty };
      })
      .filter(Boolean);

    setAddedMeals(newMeals);
    await saveLog(newMeals);
  };

  const removeFood = async (index) => {
    const newMeals = addedMeals.filter((_, i) => i !== index);
    setAddedMeals(newMeals);
    await saveLog(newMeals);
  };

  const filteredFoods = indianFoods.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === "All" || f.category === selectedCat;
    return matchSearch && matchCat;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-black text-white">Calorie Counter 🔥</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {new Date().toLocaleDateString("en-IN", {
              weekday: "long",
              day: "2-digit",
              month: "short",
            })}
          </p>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="bg-purple-600 text-white text-xs font-bold px-3 py-2 rounded-xl"
        >
          + Add Food
        </button>
      </div>

      {/* Daily Summary Card */}
      <div
        className={`rounded-2xl p-4 mb-4 border ${
          totalCal > goalCal
            ? "bg-gradient-to-r from-red-900/40 to-orange-900/40 border-red-500/30"
            : "bg-gradient-to-r from-purple-900 to-purple-700 border-purple-500/30"
        }`}
      >
        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
          Today's Calories
        </p>
        <div className="flex items-end gap-2 mt-1">
          <span className="text-white font-black text-4xl">{totalCal}</span>
          <span className="text-purple-300 text-sm mb-1">/ {goalCal} kcal</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden mt-3 mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalCal > goalCal ? "bg-red-400" : "bg-green-400"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-purple-200 text-xs">{percentage}% of goal</span>
          <span className="text-purple-200 text-xs">
            {totalCal > goalCal
              ? `${totalCal - goalCal} kcal over!`
              : `${remaining} kcal remaining`}
          </span>
        </div>
      </div>

      {/* Macros Row */}
      <div className="flex gap-2 mb-4">
        {[
          {
            label: "Protein",
            value: `${totalProtein.toFixed(0)}g`,
            color: "text-blue-400",
          },
          {
            label: "Carbs",
            value: `${totalCarbs.toFixed(0)}g`,
            color: "text-amber-400",
          },
          {
            label: "Fat",
            value: `${totalFat.toFixed(0)}g`,
            color: "text-pink-400",
          },
        ].map((m) => (
          <div
            key={m.label}
            className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-xl p-3 text-center"
          >
            <p className="text-slate-400 text-[9px] font-bold uppercase">
              {m.label}
            </p>
            <p className={`text-xl font-black mt-1 ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Food Search */}
      {showSearch && (
        <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-2xl p-4 mb-4">
          <p className="text-white font-black text-sm mb-3">🔍 Search Food</p>

          <div className="flex items-center gap-2 bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2.5 mb-3">
            <span>🔍</span>
            <input
              placeholder="Search Indian food..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
            />
          </div>

          {/* Category Filter */}
          <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all
                  ${
                    selectedCat === cat
                      ? "bg-purple-600 border-purple-600 text-white"
                      : "bg-[#0d0d14] border-white/10 text-slate-400"
                  }`}
              >
                {cat === "All" ? "All" : cat.split(" ").slice(1).join(" ")}
              </button>
            ))}
          </div>

          {/* Food List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredFoods.map((food, i) => (
              <button
                key={i}
                onClick={() => addFood(food)}
                className="w-full flex items-center justify-between p-2.5 bg-[#0d0d14] rounded-xl active:bg-purple-600/10 transition-all"
              >
                <div className="text-left">
                  <p className="text-white text-xs font-bold">{food.name}</p>
                  <p className="text-slate-500 text-[10px]">
                    P: {food.protein}g · C: {food.carbs}g · F: {food.fat}g
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-purple-400 font-black text-sm">
                    {food.cal}
                  </p>
                  <p className="text-slate-500 text-[9px]">kcal</p>
                </div>
              </button>
            ))}
            {filteredFoods.length === 0 && (
              <p className="text-center text-slate-500 text-sm py-4">
                No food found
              </p>
            )}
          </div>
        </div>
      )}

      {/* Today's Food Log */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Today's Food Log
      </p>

      {addedMeals.length === 0 ? (
        <div className="text-center py-10 bg-[#1a1a2e] border border-white/7 rounded-xl">
          <div className="text-4xl mb-2">🍽️</div>
          <p className="text-slate-400 text-sm">No food logged today</p>
          <p className="text-slate-600 text-xs mt-1">
            Tap "+ Add Food" to start
          </p>
        </div>
      ) : (
        <div className="bg-[#1a1a2e] border border-white/7 rounded-xl divide-y divide-white/5">
          {addedMeals.map((meal, i) => (
            <div key={i} className="flex items-center gap-2 px-4 py-3">
              {/* Food Info */}
              <div className="flex-1">
                <p className="text-white text-sm font-bold">{meal.name}</p>
                <p className="text-slate-500 text-xs">
                  P: {(meal.protein * (meal.quantity || 1)).toFixed(0)}g · C:{" "}
                  {(meal.carbs * (meal.quantity || 1)).toFixed(0)}g · F:{" "}
                  {(meal.fat * (meal.quantity || 1)).toFixed(0)}g
                </p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => updateQuantity(i, -1)}
                  className="w-6 h-6 rounded-full bg-white/10 text-white text-sm flex items-center justify-center"
                >
                  −
                </button>
                <span className="text-white text-xs font-black w-4 text-center">
                  {meal.quantity || 1}
                </span>
                <button
                  onClick={() => updateQuantity(i, 1)}
                  className="w-6 h-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center"
                >
                  +
                </button>
              </div>

              {/* Calories */}
              <div className="text-right w-12">
                <p className="text-purple-400 font-black text-sm">
                  {meal.cal * (meal.quantity || 1)}
                </p>
                <p className="text-slate-500 text-[9px]">kcal</p>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeFood(i)}
                className="text-red-400 text-sm ml-1"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Saving indicator */}
      {saving && (
        <p className="text-center text-slate-500 text-xs mt-3">⏳ Saving...</p>
      )}
    </div>
  );
}

export default CalorieCounter;
