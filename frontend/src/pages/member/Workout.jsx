import { useState } from "react";

const weeklyPlan = {
  Monday: {
    muscle: "Chest 💪",
    exercises: [
      {
        name: "Bench Press",
        sets: 3,
        reps: 12,
        tip: "Keep your back flat on the bench",
      },
      {
        name: "Incline Dumbbell",
        sets: 3,
        reps: 10,
        tip: "Set bench at 30-45 degrees",
      },
      {
        name: "Cable Flyes",
        sets: 3,
        reps: 15,
        tip: "Squeeze hard at the top",
      },
      {
        name: "Push Ups",
        sets: 2,
        reps: 20,
        tip: "Go till failure on last set",
      },
    ],
  },
  Tuesday: {
    muscle: "Biceps & Triceps 💪",
    exercises: [
      { name: "Bicep Curl", sets: 3, reps: 12, tip: "Do not swing your body" },
      {
        name: "Tricep Pushdown",
        sets: 3,
        reps: 15,
        tip: "Keep elbows fixed to sides",
      },
      { name: "Hammer Curl", sets: 3, reps: 12, tip: "Control the movement" },
      {
        name: "Skull Crushers",
        sets: 3,
        reps: 12,
        tip: "Lower the bar slowly",
      },
    ],
  },
  Wednesday: {
    muscle: "Shoulders 🏋️",
    exercises: [
      {
        name: "Shoulder Press",
        sets: 3,
        reps: 10,
        tip: "Do not arch your back",
      },
      { name: "Lateral Raises", sets: 3, reps: 15, tip: "Lead with elbows" },
      {
        name: "Front Raises",
        sets: 3,
        reps: 12,
        tip: "Keep arms slightly bent",
      },
    ],
  },
  Thursday: {
    muscle: "Back 🔙",
    exercises: [
      { name: "Pull Ups", sets: 3, reps: 10, tip: "Full range of motion" },
      { name: "Barbell Row", sets: 3, reps: 12, tip: "Keep chest up" },
      { name: "Lat Pulldown", sets: 3, reps: 12, tip: "Pull to your chest" },
    ],
  },
  Friday: {
    muscle: "Legs 🦵",
    exercises: [
      { name: "Squats", sets: 4, reps: 10, tip: "Knees behind toes" },
      { name: "Leg Press", sets: 3, reps: 12, tip: "Do not lock your knees" },
      { name: "Lunges", sets: 3, reps: 12, tip: "Keep your torso upright" },
    ],
  },
  Saturday: {
    muscle: "Core & Cardio 🔥",
    exercises: [
      { name: "Plank", sets: 3, reps: 60, tip: "Keep body in straight line" },
      { name: "Crunches", sets: 3, reps: 20, tip: "Exhale at the top" },
      { name: "Running", sets: 1, reps: 20, tip: "20 minutes steady pace" },
    ],
  },
  Sunday: { muscle: "Rest Day 😴", exercises: [] },
};

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const shortDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function Workout() {
  const todayIndex = new Date().getDay();
  const todayName = days[todayIndex === 0 ? 6 : todayIndex - 1];
  const [selectedDay, setSelectedDay] = useState(todayName);

  const plan = weeklyPlan[selectedDay];

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Header */}
      <h1 className="text-2xl font-black text-white mb-1">Weekly Workout</h1>
      <p className="text-slate-400 text-sm mb-4">Tap a day to see exercises</p>

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {days.map((day, i) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all
              ${
                selectedDay === day
                  ? "bg-purple-600 border-purple-600 text-white"
                  : "bg-[#1a1a2e] border-white/10 text-slate-400"
              }`}
          >
            {shortDays[i]}
          </button>
        ))}
      </div>

      {/* Today's Plan Header */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-4 mb-4 border border-purple-500/30">
        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
          {selectedDay}
        </p>
        <p className="text-white font-black text-xl mt-1">{plan.muscle}</p>
        <p className="text-purple-300 text-xs mt-1">
          {plan.exercises.length} exercises
        </p>
      </div>

      {/* Rest Day */}
      {plan.exercises.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-3">😴</div>
          <p className="text-white font-bold text-lg">Rest Day</p>
          <p className="text-slate-400 text-sm mt-1">
            Recovery is part of the process!
          </p>
        </div>
      )}

      {/* Exercise List */}
      <div className="space-y-3">
        {plan.exercises.map((ex, i) => (
          <div
            key={i}
            className="bg-[#1a1a2e] border border-white/7 rounded-xl p-3 flex items-center gap-3"
          >
            {/* Number */}
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center text-purple-400 font-black text-sm flex-shrink-0">
              {i + 1}
            </div>

            {/* Info */}
            <div className="flex-1">
              <p className="text-white font-bold text-sm">{ex.name}</p>
              <p className="text-slate-400 text-xs mt-0.5">
                {ex.sets} Sets × {ex.reps} Reps
              </p>
              <p className="text-purple-400 text-xs mt-0.5">💡 {ex.tip}</p>
            </div>

            {/* Play button */}
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs flex-shrink-0">
              ▶
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Workout;
