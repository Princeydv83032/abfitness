import { useState, useEffect } from "react";
import {
  IoFlameOutline,
  IoSearchOutline,
  IoRestaurantOutline,
  IoNutritionOutline,
  IoBarbellOutline,
  IoWaterOutline,
  IoLeafOutline,
  IoFastFoodOutline,
  IoCafeOutline,
  IoAppsOutline,
} from "react-icons/io5";
import { FiPlus, FiMinus, FiTrash2 } from "react-icons/fi";
import { apiFetch } from "../../lib/api";
import useAuthStore from "../../store/authStore";

const indianFoods = [
  // Roti/Rice
  { name: "Roti (1 piece)", cal: 70, protein: 2.5, carbs: 15, fat: 0.5, category: "Roti/Rice" },
  { name: "Paratha (1 piece)", cal: 200, protein: 4, carbs: 30, fat: 8, category: "Roti/Rice" },
  { name: "Rice (1 cup cooked)", cal: 200, protein: 4, carbs: 44, fat: 0.5, category: "Roti/Rice" },
  { name: "Brown Rice (1 cup)", cal: 215, protein: 5, carbs: 45, fat: 1.5, category: "Roti/Rice" },
  { name: "Naan (1 piece)", cal: 260, protein: 8, carbs: 45, fat: 5, category: "Roti/Rice" },
  { name: "Poha (1 bowl)", cal: 180, protein: 4, carbs: 35, fat: 3, category: "Roti/Rice" },
  { name: "Upma (1 bowl)", cal: 200, protein: 5, carbs: 32, fat: 6, category: "Roti/Rice" },
  { name: "Idli (1 piece)", cal: 40, protein: 2, carbs: 8, fat: 0.5, category: "Roti/Rice" },
  { name: "Dosa (1 piece)", cal: 120, protein: 3, carbs: 20, fat: 3, category: "Roti/Rice" },
  // Dal/Sabzi
  { name: "Dal (1 cup)", cal: 115, protein: 8, carbs: 18, fat: 1, category: "Dal/Sabzi" },
  { name: "Rajma (1 cup)", cal: 220, protein: 14, carbs: 38, fat: 1, category: "Dal/Sabzi" },
  { name: "Chole (1 cup)", cal: 210, protein: 12, carbs: 35, fat: 3, category: "Dal/Sabzi" },
  { name: "Palak Paneer (1 bowl)", cal: 250, protein: 12, carbs: 10, fat: 18, category: "Dal/Sabzi" },
  { name: "Aloo Sabzi (1 bowl)", cal: 180, protein: 3, carbs: 30, fat: 6, category: "Dal/Sabzi" },
  { name: "Sambhar (1 bowl)", cal: 100, protein: 5, carbs: 15, fat: 2, category: "Dal/Sabzi" },
  // Protein
  { name: "Paneer (100g)", cal: 260, protein: 18, carbs: 2, fat: 20, category: "Protein" },
  { name: "Egg (1 whole)", cal: 70, protein: 6, carbs: 0, fat: 5, category: "Protein" },
  { name: "Egg White (1)", cal: 17, protein: 4, carbs: 0, fat: 0, category: "Protein" },
  { name: "Chicken (100g boiled)", cal: 165, protein: 31, carbs: 0, fat: 4, category: "Protein" },
  { name: "Fish (100g)", cal: 120, protein: 22, carbs: 0, fat: 3, category: "Protein" },
  { name: "Soya Chunks (50g)", cal: 170, protein: 26, carbs: 12, fat: 1, category: "Protein" },
  { name: "Whey Protein (1 scoop)", cal: 120, protein: 25, carbs: 3, fat: 1, category: "Protein" },
  { name: "Tofu (100g)", cal: 80, protein: 9, carbs: 2, fat: 4, category: "Protein" },
  // Dairy
  { name: "Milk (1 glass 200ml)", cal: 120, protein: 6, carbs: 10, fat: 5, category: "Dairy" },
  { name: "Curd (1 cup)", cal: 100, protein: 8, carbs: 8, fat: 4, category: "Dairy" },
  { name: "Buttermilk (1 glass)", cal: 40, protein: 3, carbs: 4, fat: 1, category: "Dairy" },
  { name: "Paneer (50g)", cal: 130, protein: 9, carbs: 1, fat: 10, category: "Dairy" },
  // Fruits
  { name: "Banana (1 medium)", cal: 90, protein: 1, carbs: 23, fat: 0, category: "Fruits" },
  { name: "Apple (1 medium)", cal: 80, protein: 0.5, carbs: 21, fat: 0, category: "Fruits" },
  { name: "Orange (1 medium)", cal: 60, protein: 1, carbs: 15, fat: 0, category: "Fruits" },
  { name: "Mango (1 cup)", cal: 100, protein: 1.5, carbs: 25, fat: 0.5, category: "Fruits" },
  { name: "Papaya (1 cup)", cal: 55, protein: 1, carbs: 14, fat: 0, category: "Fruits" },
  { name: "Watermelon (1 cup)", cal: 45, protein: 1, carbs: 11, fat: 0, category: "Fruits" },
  // Nuts
  { name: "Almonds (20g)", cal: 116, protein: 4, carbs: 4, fat: 10, category: "Nuts" },
  { name: "Peanuts (30g)", cal: 170, protein: 7, carbs: 5, fat: 14, category: "Nuts" },
  { name: "Peanut Butter (1 tbsp)", cal: 90, protein: 4, carbs: 3, fat: 8, category: "Nuts" },
  { name: "Cashews (20g)", cal: 110, protein: 3, carbs: 6, fat: 9, category: "Nuts" },
  // Drinks
  { name: "Green Tea (1 cup)", cal: 2, protein: 0, carbs: 0, fat: 0, category: "Drinks" },
  { name: "Chai with Milk", cal: 60, protein: 2, carbs: 8, fat: 2, category: "Drinks" },
  { name: "Lassi (1 glass)", cal: 150, protein: 6, carbs: 18, fat: 5, category: "Drinks" },
  { name: "Coconut Water", cal: 45, protein: 2, carbs: 9, fat: 0, category: "Drinks" },
];

const categories = ["All", ...new Set(indianFoods.map((f) => f.category))];

const CATEGORY_ICONS = {
  All: IoAppsOutline,
  "Roti/Rice": IoRestaurantOutline,
  "Dal/Sabzi": IoNutritionOutline,
  Protein: IoBarbellOutline,
  Dairy: IoWaterOutline,
  Fruits: IoLeafOutline,
  Nuts: IoFastFoodOutline,
  Drinks: IoCafeOutline,
};

function CalorieSkeleton() {
  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">
      <div className="flex justify-between items-center mb-4">
        <div>
          <div className="h-7 w-44 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-3.5 w-28 bg-white/5 rounded-lg animate-pulse mt-2" />
        </div>
        <div className="h-9 w-24 bg-white/5 rounded-xl animate-pulse" />
      </div>
      <div className="h-32 bg-white/5 rounded-2xl animate-pulse mb-4" />
      <div className="flex gap-2 mb-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex-1 h-20 bg-white/5 rounded-xl animate-pulse" />
        ))}
      </div>
      <div className="h-4 w-32 bg-white/5 rounded-lg animate-pulse mb-2" />
      <div className="h-24 bg-white/5 rounded-xl animate-pulse" />
    </div>
  );
}

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
  const overGoal = totalCal > goalCal;

  const fetchLog = async () => {
    setLoading(true);
    // calorie_logs table RLS-locked hai - verifyMember token se
    // req.member.id match karke deta hai
    const res = await apiFetch(`/api/logs/calories?date=${today}`);
    if (res.success && res.log) {
      setAddedMeals(res.log.meals || []);
      setGoalCal(res.log.goal_cal || 2000);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) queueMicrotask(fetchLog);
  }, [user]);

  const saveLog = async (meals) => {
    setSaving(true);
    await apiFetch("/api/logs/calories", {
      method: "POST",
      body: JSON.stringify({ date: today, meals, goal_cal: goalCal }),
    });
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
    return <CalorieSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/15 flex items-center justify-center text-orange-400 flex-shrink-0">
            <IoFlameOutline size={20} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              Calorie Counter
            </h1>
            <p className="text-slate-500 text-xs mt-0.5">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "2-digit",
                month: "short",
              })}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="bg-violet-600 text-white text-xs font-bold px-3 py-2.5 rounded-xl flex items-center gap-1.5 flex-shrink-0"
        >
          <FiPlus size={14} />
          Add Food
        </button>
      </div>

      {/* Daily Summary Card */}
      <div
        className={`rounded-2xl p-4 mb-4 border ${
          overGoal
            ? "bg-gradient-to-br from-red-900/40 to-orange-900/40 border-red-500/30"
            : "bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 border-violet-500/30"
        }`}
      >
        <p className="text-violet-200 text-xs font-bold uppercase tracking-wider">
          Today's Calories
        </p>
        <div className="flex items-end gap-2 mt-1">
          <span className="text-white font-extrabold text-4xl">{totalCal}</span>
          <span className="text-violet-200 text-sm mb-1">/ {goalCal} kcal</span>
        </div>
        <div className="h-2 bg-white/15 rounded-full overflow-hidden mt-3 mb-2">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              overGoal ? "bg-red-300" : "bg-white"
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <div className="flex justify-between">
          <span className="text-violet-200 text-xs">{percentage}% of goal</span>
          <span className="text-violet-200 text-xs">
            {overGoal
              ? `${totalCal - goalCal} kcal over!`
              : `${remaining} kcal remaining`}
          </span>
        </div>
      </div>

      {/* Macros Row */}
      <div className="flex gap-2.5 mb-5">
        {[
          {
            label: "Protein",
            value: `${totalProtein.toFixed(0)}g`,
            icon: IoBarbellOutline,
            color: "text-blue-400",
            bg: "bg-blue-500/15",
          },
          {
            label: "Carbs",
            value: `${totalCarbs.toFixed(0)}g`,
            icon: IoNutritionOutline,
            color: "text-amber-400",
            bg: "bg-amber-500/15",
          },
          {
            label: "Fat",
            value: `${totalFat.toFixed(0)}g`,
            icon: IoWaterOutline,
            color: "text-pink-400",
            bg: "bg-pink-500/15",
          },
        ].map((m) => (
          <div
            key={m.label}
            className="flex-1 bg-[#1a1a2e] border border-white/7 rounded-2xl p-3"
          >
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center mb-2 ${m.bg} ${m.color}`}
            >
              <m.icon size={14} />
            </div>
            <p className={`text-xl font-extrabold leading-none ${m.color}`}>
              {m.value}
            </p>
            <p className="text-slate-500 text-[10px] font-bold uppercase mt-1.5">
              {m.label}
            </p>
          </div>
        ))}
      </div>

      {/* Food Search */}
      {showSearch && (
        <div className="bg-[#1a1a2e] border border-violet-500/25 rounded-2xl p-4 mb-4">
          <p className="text-white font-extrabold text-sm mb-3">Search Food</p>

          <div className="flex items-center gap-2 bg-[#0d0d14] border border-white/10 rounded-xl px-3 py-2.5 mb-3">
            <IoSearchOutline size={15} className="text-slate-500" />
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
            {categories.map((cat) => {
              const CatIcon = CATEGORY_ICONS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all
                    ${
                      selectedCat === cat
                        ? "bg-violet-600 border-violet-600 text-white"
                        : "bg-[#0d0d14] border-white/10 text-slate-400"
                    }`}
                >
                  {CatIcon && <CatIcon size={12} />}
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Food List */}
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredFoods.map((food, i) => (
              <button
                key={i}
                onClick={() => addFood(food)}
                className="w-full flex items-center justify-between p-2.5 bg-[#0d0d14] rounded-xl active:bg-violet-600/10 transition-all"
              >
                <div className="text-left">
                  <p className="text-white text-xs font-bold">{food.name}</p>
                  <p className="text-slate-500 text-[10px]">
                    P: {food.protein}g · C: {food.carbs}g · F: {food.fat}g
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-violet-400 font-extrabold text-sm">
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
          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-2 text-slate-500">
            <IoFastFoodOutline size={22} />
          </div>
          <p className="text-slate-400 text-sm">No food logged today</p>
          <p className="text-slate-600 text-xs mt-1">
            Tap "Add Food" to start
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
                  className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center"
                >
                  <FiMinus size={11} />
                </button>
                <span className="text-white text-xs font-extrabold w-4 text-center">
                  {meal.quantity || 1}
                </span>
                <button
                  onClick={() => updateQuantity(i, 1)}
                  className="w-6 h-6 rounded-full bg-violet-600 text-white flex items-center justify-center"
                >
                  <FiPlus size={11} />
                </button>
              </div>

              {/* Calories */}
              <div className="text-right w-12">
                <p className="text-violet-400 font-extrabold text-sm">
                  {meal.cal * (meal.quantity || 1)}
                </p>
                <p className="text-slate-500 text-[9px]">kcal</p>
              </div>

              {/* Remove */}
              <button
                onClick={() => removeFood(i)}
                className="text-red-400 ml-1"
              >
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Saving indicator */}
      {saving && (
        <p className="text-center text-slate-500 text-xs mt-3">Saving...</p>
      )}
    </div>
  );
}

export default CalorieCounter;
