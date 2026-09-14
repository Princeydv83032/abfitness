import { useState, useEffect } from "react";
import { apiFetch } from "../../lib/api";
import useAuthStore from "../../store/authStore";
import { FiTrash2, FiPlus, FiCheck, FiClock } from "react-icons/fi";
import {
  IoLeafOutline,
  IoFastFoodOutline,
  IoStatsChartOutline,
  IoCreateOutline,
  IoBulbOutline,
  IoCalendarOutline,
  IoRestaurantOutline,
} from "react-icons/io5";

const dietPlans = {
  "Build Muscle": {
    veg: {
      calories: 2800,
      protein: 140,
      meals: [
        {
          time: "7:00 AM",
          name: "Breakfast 🌅",
          items: [
            "4 Whole Eggs (boiled)",
            "Paneer Bhurji (100g)",
            "2 Whole Wheat Toast",
            "1 Glass Milk",
          ],
          protein: 45,
          calories: 550,
        },
        {
          time: "10:00 AM",
          name: "Mid Morning 🥜",
          items: ["Handful Almonds (20g)", "1 Banana", "1 Glass Buttermilk"],
          protein: 10,
          calories: 250,
        },
        {
          time: "1:00 PM",
          name: "Lunch 🍱",
          items: ["2 Cups Dal", "1.5 Cup Rice", "Paneer Sabzi (150g)", "Salad"],
          protein: 40,
          calories: 650,
        },
        {
          time: "4:00 PM",
          name: "Pre-Workout 💪",
          items: ["Peanut Butter Toast (2)", "1 Banana", "1 Glass Milk"],
          protein: 20,
          calories: 400,
        },
        {
          time: "7:00 PM",
          name: "Post-Workout 🏋️",
          items: ["Whey Protein Shake", "1 Banana", "Handful Peanuts"],
          protein: 30,
          calories: 350,
        },
        {
          time: "9:00 PM",
          name: "Dinner 🌙",
          items: ["3 Roti", "Soyabean Sabzi", "Curd (200g)", "Salad"],
          protein: 35,
          calories: 600,
        },
      ],
    },
    nonveg: {
      calories: 2800,
      protein: 160,
      meals: [
        {
          time: "7:00 AM",
          name: "Breakfast 🌅",
          items: [
            "5 Egg Whites + 2 Yolks",
            "2 Whole Wheat Toast",
            "1 Glass Milk",
            "1 Banana",
          ],
          protein: 40,
          calories: 500,
        },
        {
          time: "10:00 AM",
          name: "Mid Morning 🥜",
          items: ["Boiled Chicken (100g)", "Handful Almonds", "1 Apple"],
          protein: 30,
          calories: 300,
        },
        {
          time: "1:00 PM",
          name: "Lunch 🍱",
          items: ["Chicken Curry (200g)", "1.5 Cup Rice", "Dal", "Salad"],
          protein: 50,
          calories: 700,
        },
        {
          time: "4:00 PM",
          name: "Pre-Workout 💪",
          items: ["Boiled Eggs (3)", "2 Bread Slices", "1 Banana"],
          protein: 22,
          calories: 380,
        },
        {
          time: "7:00 PM",
          name: "Post-Workout 🏋️",
          items: ["Whey Protein Shake", "1 Banana", "Handful Peanuts"],
          protein: 30,
          calories: 320,
        },
        {
          time: "9:00 PM",
          name: "Dinner 🌙",
          items: ["Grilled Fish/Chicken (150g)", "2 Roti", "Sabzi", "Salad"],
          protein: 38,
          calories: 600,
        },
      ],
    },
  },
  "Lose Weight": {
    veg: {
      calories: 1600,
      protein: 100,
      meals: [
        {
          time: "7:00 AM",
          name: "Breakfast 🌅",
          items: [
            "Oats with Milk (1 bowl)",
            "2 Boiled Eggs",
            "1 Glass Green Tea",
          ],
          protein: 20,
          calories: 300,
        },
        {
          time: "10:00 AM",
          name: "Mid Morning 🥜",
          items: ["1 Apple", "10 Almonds", "1 Glass Buttermilk"],
          protein: 8,
          calories: 150,
        },
        {
          time: "1:00 PM",
          name: "Lunch 🍱",
          items: [
            "1 Cup Dal",
            "1 Cup Brown Rice",
            "Lots of Salad",
            "Curd (100g)",
          ],
          protein: 25,
          calories: 400,
        },
        {
          time: "4:00 PM",
          name: "Evening Snack 🍎",
          items: ["1 Cup Sprouts", "1 Glass Green Tea", "1 Orange"],
          protein: 10,
          calories: 150,
        },
        {
          time: "7:00 PM",
          name: "Dinner 🌙",
          items: ["2 Roti (small)", "Sabzi (no oil)", "Dal", "Salad"],
          protein: 18,
          calories: 350,
        },
        {
          time: "9:00 PM",
          name: "Night 🌙",
          items: ["1 Glass Warm Milk (low fat)", "5 Almonds"],
          protein: 8,
          calories: 100,
        },
      ],
    },
    nonveg: {
      calories: 1600,
      protein: 120,
      meals: [
        {
          time: "7:00 AM",
          name: "Breakfast 🌅",
          items: [
            "3 Egg Whites (boiled)",
            "Oats (1 bowl)",
            "1 Glass Green Tea",
          ],
          protein: 25,
          calories: 280,
        },
        {
          time: "10:00 AM",
          name: "Mid Morning 🥜",
          items: ["1 Apple", "10 Almonds", "1 Glass Buttermilk"],
          protein: 8,
          calories: 150,
        },
        {
          time: "1:00 PM",
          name: "Lunch 🍱",
          items: ["Grilled Chicken (150g)", "1 Cup Brown Rice", "Salad", "Dal"],
          protein: 40,
          calories: 450,
        },
        {
          time: "4:00 PM",
          name: "Evening Snack 🍎",
          items: ["Boiled Eggs (2)", "1 Glass Green Tea", "1 Orange"],
          protein: 12,
          calories: 150,
        },
        {
          time: "7:00 PM",
          name: "Dinner 🌙",
          items: ["Grilled Fish (150g)", "2 Roti (small)", "Salad", "Sabzi"],
          protein: 35,
          calories: 400,
        },
      ],
    },
  },
  "Stay Fit": {
    veg: {
      calories: 2000,
      protein: 100,
      meals: [
        {
          time: "7:00 AM",
          name: "Breakfast 🌅",
          items: ["Poha/Upma (1 bowl)", "2 Eggs", "1 Glass Milk", "1 Fruit"],
          protein: 20,
          calories: 400,
        },
        {
          time: "11:00 AM",
          name: "Mid Morning 🥜",
          items: ["1 Fruit", "Handful Nuts", "1 Glass Buttermilk"],
          protein: 8,
          calories: 200,
        },
        {
          time: "1:00 PM",
          name: "Lunch 🍱",
          items: ["2 Roti", "Dal", "Sabzi", "Curd", "Salad"],
          protein: 25,
          calories: 500,
        },
        {
          time: "4:00 PM",
          name: "Snack ☕",
          items: ["1 Cup Chai", "Handful Chana", "1 Fruit"],
          protein: 10,
          calories: 200,
        },
        {
          time: "8:00 PM",
          name: "Dinner 🌙",
          items: ["2 Roti", "Dal/Sabzi", "Salad", "Curd"],
          protein: 20,
          calories: 450,
        },
      ],
    },
    nonveg: {
      calories: 2000,
      protein: 120,
      meals: [
        {
          time: "7:00 AM",
          name: "Breakfast 🌅",
          items: ["3 Eggs", "2 Toast", "1 Glass Milk", "1 Banana"],
          protein: 28,
          calories: 450,
        },
        {
          time: "11:00 AM",
          name: "Mid Morning 🥜",
          items: ["1 Fruit", "Handful Nuts", "1 Glass Buttermilk"],
          protein: 8,
          calories: 200,
        },
        {
          time: "1:00 PM",
          name: "Lunch 🍱",
          items: ["Chicken Curry (150g)", "1.5 Cup Rice", "Dal", "Salad"],
          protein: 40,
          calories: 550,
        },
        {
          time: "4:00 PM",
          name: "Snack ☕",
          items: ["Boiled Egg (1)", "1 Cup Chai", "1 Fruit"],
          protein: 10,
          calories: 200,
        },
        {
          time: "8:00 PM",
          name: "Dinner 🌙",
          items: ["Fish/Chicken (100g)", "2 Roti", "Sabzi", "Salad"],
          protein: 30,
          calories: 450,
        },
      ],
    },
  },
  "Increase Strength": {
    veg: {
      calories: 3000,
      protein: 150,
      meals: [
        {
          time: "7:00 AM",
          name: "Breakfast 🌅",
          items: [
            "5 Boiled Eggs",
            "Paneer Paratha (2)",
            "1 Glass Milk",
            "1 Banana",
          ],
          protein: 50,
          calories: 700,
        },
        {
          time: "10:00 AM",
          name: "Mid Morning 🥜",
          items: ["Peanut Butter + Bread", "1 Glass Milk", "1 Banana"],
          protein: 20,
          calories: 400,
        },
        {
          time: "1:00 PM",
          name: "Lunch 🍱",
          items: ["2 Cups Dal", "2 Cup Rice", "Paneer (150g)", "Curd", "Salad"],
          protein: 45,
          calories: 750,
        },
        {
          time: "4:00 PM",
          name: "Pre-Workout 💪",
          items: ["Banana (2)", "Peanut Butter Toast", "1 Glass Milk"],
          protein: 15,
          calories: 450,
        },
        {
          time: "7:00 PM",
          name: "Post-Workout 🏋️",
          items: ["Protein Shake", "2 Banana", "Peanuts (50g)"],
          protein: 35,
          calories: 450,
        },
        {
          time: "9:30 PM",
          name: "Dinner 🌙",
          items: ["4 Roti", "Soya Sabzi", "Curd (200g)", "Salad"],
          protein: 35,
          calories: 650,
        },
      ],
    },
    nonveg: {
      calories: 3200,
      protein: 180,
      meals: [
        {
          time: "7:00 AM",
          name: "Breakfast 🌅",
          items: [
            "6 Egg Whites + 2 Yolk",
            "3 Toast",
            "1 Glass Milk",
            "1 Banana",
          ],
          protein: 50,
          calories: 650,
        },
        {
          time: "10:00 AM",
          name: "Mid Morning 🥜",
          items: [
            "Boiled Chicken (150g)",
            "Peanut Butter Toast",
            "1 Glass Milk",
          ],
          protein: 45,
          calories: 450,
        },
        {
          time: "1:00 PM",
          name: "Lunch 🍱",
          items: ["Chicken (250g)", "2 Cup Rice", "Dal", "Salad"],
          protein: 55,
          calories: 800,
        },
        {
          time: "4:00 PM",
          name: "Pre-Workout 💪",
          items: ["3 Boiled Eggs", "2 Banana", "Peanuts"],
          protein: 25,
          calories: 450,
        },
        {
          time: "7:00 PM",
          name: "Post-Workout 🏋️",
          items: ["Whey Protein", "2 Banana", "Milk"],
          protein: 40,
          calories: 400,
        },
        {
          time: "9:30 PM",
          name: "Dinner 🌙",
          items: ["Grilled Chicken (200g)", "3 Roti", "Sabzi", "Curd"],
          protein: 45,
          calories: 650,
        },
      ],
    },
  },
  "General Fitness": {
    veg: {
      calories: 1800,
      protein: 90,
      meals: [
        {
          time: "7:00 AM",
          name: "Breakfast 🌅",
          items: ["Idli/Dosa (3)", "Sambhar", "1 Glass Milk", "1 Fruit"],
          protein: 15,
          calories: 350,
        },
        {
          time: "11:00 AM",
          name: "Mid Morning 🥜",
          items: ["1 Fruit", "10 Almonds", "1 Glass Lassi"],
          protein: 8,
          calories: 200,
        },
        {
          time: "1:00 PM",
          name: "Lunch 🍱",
          items: ["2 Roti", "Dal", "Sabzi", "Curd", "Salad"],
          protein: 22,
          calories: 450,
        },
        {
          time: "4:00 PM",
          name: "Snack ☕",
          items: ["Chana Chaat", "1 Cup Chai", "1 Fruit"],
          protein: 12,
          calories: 200,
        },
        {
          time: "8:00 PM",
          name: "Dinner 🌙",
          items: ["2 Roti", "Dal/Sabzi", "Salad", "Curd"],
          protein: 18,
          calories: 400,
        },
      ],
    },
    nonveg: {
      calories: 1900,
      protein: 110,
      meals: [
        {
          time: "7:00 AM",
          name: "Breakfast 🌅",
          items: ["2 Eggs", "Poha/Upma", "1 Glass Milk", "1 Fruit"],
          protein: 20,
          calories: 380,
        },
        {
          time: "11:00 AM",
          name: "Mid Morning 🥜",
          items: ["1 Fruit", "10 Almonds", "1 Glass Lassi"],
          protein: 8,
          calories: 200,
        },
        {
          time: "1:00 PM",
          name: "Lunch 🍱",
          items: ["Chicken/Fish (100g)", "1.5 Cup Rice", "Dal", "Salad"],
          protein: 35,
          calories: 500,
        },
        {
          time: "4:00 PM",
          name: "Snack ☕",
          items: ["Boiled Egg (1)", "Chana", "1 Cup Chai"],
          protein: 12,
          calories: 200,
        },
        {
          time: "8:00 PM",
          name: "Dinner 🌙",
          items: ["2 Roti", "Chicken/Fish (100g)", "Sabzi", "Salad"],
          protein: 30,
          calories: 450,
        },
      ],
    },
  },
};

const weeklyPlan = {
  Monday: {
    focus: "Chest Day 💪",
    extra: "High protein — Pre workout meal important",
  },
  Tuesday: { focus: "Arms Day 💪", extra: "Moderate carbs — BCAA helpful" },
  Wednesday: {
    focus: "Shoulders Day 🏋️",
    extra: "Medium calories — Stay hydrated",
  },
  Thursday: { focus: "Back Day 🔙", extra: "High carbs — Energy needed" },
  Friday: {
    focus: "Legs Day 🦵",
    extra: "Highest calories day — Heavy workout",
  },
  Saturday: {
    focus: "Core & Cardio 🔥",
    extra: "Light meals — Focus on hydration",
  },
  Sunday: { focus: "Rest Day 😴", extra: "Light food — Recovery meals" },
};

const goals = [
  "Build Muscle",
  "Lose Weight",
  "Stay Fit",
  "Increase Strength",
  "General Fitness",
];
const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Data fetch hone tak asli layout ke shape ka skeleton
function DietSkeleton() {
  const pulse = "bg-white/5 animate-pulse rounded-xl";
  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-5 pb-20">
      <div className={`h-7 w-40 mb-4 ${pulse}`} />
      <div className="flex gap-2 mb-3">
        <div className={`h-10 flex-1 ${pulse}`} />
        <div className={`h-10 flex-1 ${pulse}`} />
      </div>
      <div className={`h-14 mb-4 ${pulse}`} />
      <div className={`h-24 mb-3 rounded-3xl ${pulse}`} />
      <div className={`h-52 mb-3 rounded-2xl ${pulse}`} />
      <div className={`h-40 rounded-2xl ${pulse}`} />
    </div>
  );
}

function Diet() {
  const user = useAuthStore((state) => state.user);

  const [isVeg, setIsVeg] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState("General Fitness");
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState("Monday");

  // Custom diet
  const [customMeals, setCustomMeals] = useState([]);
  const [newMealName, setNewMealName] = useState("");
  const [newMealItems, setNewMealItems] = useState("");
  const [newMealTime, setNewMealTime] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [savingCustom, setSavingCustom] = useState(false);

  const fetchMember = async () => {
    setLoading(true);
    const res = await apiFetch("/api/members/me");
    const data = res.success ? res.member : null;

    if (data) {
      setIsVeg(data.is_veg !== false);
      setSelectedGoal(data.goal || "General Fitness");
      if (data.custom_diet) setCustomMeals(data.custom_diet);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) queueMicrotask(fetchMember);
  }, [user]);

  const toggleDiet = async (veg) => {
    setIsVeg(veg);
    await apiFetch("/api/members/me", {
      method: "PATCH",
      body: JSON.stringify({ is_veg: veg }),
    });
  };

  const addCustomMeal = async () => {
    if (!newMealName || !newMealItems) return;
    setSavingCustom(true);

    const newMeal = {
      id: Date.now(),
      name: newMealName,
      time: newMealTime || "Anytime",
      items: newMealItems.split(",").map((i) => i.trim()),
    };

    const updated = [...customMeals, newMeal];
    setCustomMeals(updated);

    await apiFetch("/api/members/me", {
      method: "PATCH",
      body: JSON.stringify({ custom_diet: updated }),
    });

    setNewMealName("");
    setNewMealItems("");
    setNewMealTime("");
    setShowAddForm(false);
    setSavingCustom(false);
  };

  const deleteCustomMeal = async (id) => {
    const updated = customMeals.filter((m) => m.id !== id);
    setCustomMeals(updated);
    await apiFetch("/api/members/me", {
      method: "PATCH",
      body: JSON.stringify({ custom_diet: updated }),
    });
  };

  const dietKey = isVeg ? "veg" : "nonveg";
  const plan =
    dietPlans[selectedGoal]?.[dietKey] || dietPlans["General Fitness"][dietKey];

  if (loading) {
    return <DietSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-5 pb-20">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center text-violet-400 flex-shrink-0">
          <IoRestaurantOutline size={18} />
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">
          Diet Plan
        </h1>
      </div>

      {/* Veg Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => toggleDiet(true)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold border transition-colors ${
            isVeg
              ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
              : "bg-[#1a1a2e] border-white/7 text-slate-400"
          }`}
        >
          <IoLeafOutline size={15} />
          Vegetarian
        </button>
        <button
          onClick={() => toggleDiet(false)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-extrabold border transition-colors ${
            !isVeg
              ? "bg-red-500/15 border-red-500/40 text-red-400"
              : "bg-[#1a1a2e] border-white/7 text-slate-400"
          }`}
        >
          <IoFastFoodOutline size={15} />
          Non-Vegetarian
        </button>
      </div>

      {/* Goal Dropdown */}
      <div className="mb-4">
        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Goal
        </label>
        <select
          value={selectedGoal}
          onChange={(e) => setSelectedGoal(e.target.value)}
          className="w-full bg-[#1a1a2e] border border-white/7 rounded-xl px-4 py-3 mt-1.5 text-white text-sm font-semibold outline-none"
        >
          {goals.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Section 1 — Today's Meal Plan (summary + full list, sab isi page
      pe - pehle "Overall Diet Plan" alag page pe navigate karta tha jo
      "Weekly Plan" ke andar dikh rahi same meals dobara dikhata tha) */}
      <div className="rounded-3xl p-4 mb-3 bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 border border-violet-400/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <IoStatsChartOutline size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-white/70 text-[10px] font-bold uppercase tracking-wider">
              Today's Meal Plan
            </p>
            <p className="text-white font-extrabold text-lg leading-tight mt-0.5 truncate">
              {selectedGoal}
            </p>
            <div className="flex gap-2.5 mt-1.5 flex-wrap">
              <span className="text-white/70 text-[10px] font-semibold">
                {plan.calories} kcal
              </span>
              <span className="text-white/70 text-[10px] font-semibold">
                {plan.protein}g protein
              </span>
              <span className="text-white/70 text-[10px] font-semibold">
                {plan.meals.length} meals
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl p-3.5 mb-3 space-y-3">
        {plan.meals.map((meal, i) => (
          <div
            key={i}
            className={
              i !== plan.meals.length - 1 ? "pb-3 border-b border-white/5" : ""
            }
          >
            <div className="flex justify-between items-center mb-1.5">
              <div>
                <p className="text-white font-extrabold text-sm">
                  {meal.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <FiClock size={11} className="text-slate-500" />
                  <p className="text-slate-500 text-xs">{meal.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-violet-400 text-xs font-bold">
                  {meal.protein}g protein
                </p>
                <p className="text-slate-500 text-xs">{meal.calories} kcal</p>
              </div>
            </div>
            <div className="space-y-0.5">
              {meal.items.map((item, j) => (
                <div key={j} className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-violet-500 flex-shrink-0"></div>
                  <p className="text-slate-300 text-xs">{item}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Section 2 — This Week's Focus (workout-day + diet tip context
      only - "Weekly Plan" ka purana naam galat expectation deta tha ki
      har din ka alag diet hai; asal mein yahi ek plan hai, sirf gym ke
      us din ke focus ke hisaab se ek tip badalta hai) */}
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl p-3.5 mb-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400 flex-shrink-0">
            <IoCalendarOutline size={16} />
          </div>
          <p className="text-white font-extrabold text-sm">
            This Week's Focus
          </p>
        </div>

        {/* Day Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 mb-3 -mx-3.5 px-3.5">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-colors ${
                activeDay === day
                  ? "bg-violet-600 text-white"
                  : "bg-white/5 text-slate-400"
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Day Info */}
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-white font-extrabold text-sm">
            {weeklyPlan[activeDay].focus}
          </p>
          <div className="flex items-start gap-1.5 mt-1.5">
            <IoBulbOutline
              size={13}
              className="text-violet-400 mt-0.5 flex-shrink-0"
            />
            <p className="text-slate-400 text-xs leading-snug">
              {weeklyPlan[activeDay].extra}
            </p>
          </div>
        </div>
      </div>

      {/* Section 3 — Custom Diet Plan */}
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl p-3.5">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400 flex-shrink-0">
              <IoCreateOutline size={16} />
            </div>
            <div>
              <p className="text-white text-sm font-extrabold">
                My Custom Diet Plan
              </p>
              <p className="text-slate-500 text-[10px]">Add your own meals</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
          >
            <FiPlus size={17} />
          </button>
        </div>

        {/* Add Meal Form */}
        {showAddForm && (
          <div className="bg-white/5 rounded-xl p-3 mb-3 space-y-2">
            <input
              placeholder="Meal name (e.g. Breakfast)"
              value={newMealName}
              onChange={(e) => setNewMealName(e.target.value)}
              className="w-full bg-[#0d0d14] border border-white/10 rounded-lg px-3 py-2.5 text-white text-xs outline-none placeholder:text-slate-600"
            />
            <div>
              <div className="flex items-center gap-2 bg-[#0d0d14] border border-white/10 rounded-lg px-3 py-2.5">
                <FiClock size={13} className="text-slate-500 flex-shrink-0" />
                <input
                  type="time"
                  step="900"
                  value={newMealTime}
                  onChange={(e) => setNewMealTime(e.target.value)}
                  className="w-full bg-transparent text-white text-xs outline-none"
                />
              </div>
              <p className="text-slate-600 text-[10px] mt-1">
                Time set karo to us waqt reminder notification bhi milegi
                (khali chhodne pe "Anytime" — koi reminder nahi)
              </p>
            </div>
            <textarea
              placeholder="Food items (comma separated): Eggs, Milk, Toast"
              value={newMealItems}
              onChange={(e) => setNewMealItems(e.target.value)}
              rows={2}
              className="w-full bg-[#0d0d14] border border-white/10 rounded-lg px-3 py-2.5 text-white text-xs outline-none placeholder:text-slate-600 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={addCustomMeal}
                disabled={!newMealName || !newMealItems || savingCustom}
                className="flex-1 flex items-center justify-center gap-1.5 bg-violet-600 text-white font-bold py-2.5 rounded-lg text-xs disabled:opacity-50"
              >
                {savingCustom ? (
                  "Saving..."
                ) : (
                  <>
                    <FiCheck size={14} /> Save Meal
                  </>
                )}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-white/5 text-slate-400 font-bold py-2.5 rounded-lg text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Custom Meals List */}
        {customMeals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-slate-500 text-sm">No custom meals added yet</p>
            <p className="text-slate-600 text-xs mt-1">
              Tap the + button to create your own plan
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {customMeals.map((meal) => (
              <div key={meal.id} className="bg-white/5 rounded-xl p-3">
                <div className="flex justify-between items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-bold">
                      {meal.name}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <FiClock size={11} className="text-slate-500" />
                      <p className="text-slate-500 text-xs">{meal.time}</p>
                    </div>
                    <div className="mt-1.5 space-y-0.5">
                      {meal.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-violet-500 flex-shrink-0"></div>
                          <p className="text-slate-300 text-xs">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCustomMeal(meal.id)}
                    className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 flex-shrink-0 active:scale-95 transition-transform"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Diet;
