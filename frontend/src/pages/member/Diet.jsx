// import { useState, useEffect } from "react";
// import { supabase } from "../../lib/supabase";
// import useAuthStore from "../../store/authStore";

// const dietPlans = {
//   "Build Muscle": {
//     veg: {
//       calories: 2800,
//       protein: 140,
//       meals: [
//         {
//           time: "7:00 AM",
//           name: "Breakfast 🌅",
//           items: [
//             "4 Whole Eggs (boiled)",
//             "Paneer Bhurji (100g)",
//             "2 Whole Wheat Toast",
//             "1 Glass Milk",
//           ],
//           protein: 45,
//           calories: 550,
//         },
//         {
//           time: "10:00 AM",
//           name: "Mid Morning 🥜",
//           items: ["Handful Almonds (20g)", "1 Banana", "1 Glass Buttermilk"],
//           protein: 10,
//           calories: 250,
//         },
//         {
//           time: "1:00 PM",
//           name: "Lunch 🍱",
//           items: [
//             "2 Cups Dal (protein-rich)",
//             "1.5 Cup Rice",
//             "Paneer Sabzi (150g)",
//             "Salad",
//           ],
//           protein: 40,
//           calories: 650,
//         },
//         {
//           time: "4:00 PM",
//           name: "Pre-Workout 💪",
//           items: ["Peanut Butter Toast (2)", "1 Banana", "1 Glass Milk"],
//           protein: 20,
//           calories: 400,
//         },
//         {
//           time: "7:00 PM",
//           name: "Post-Workout 🏋️",
//           items: ["Whey Protein Shake", "1 Banana", "Handful Peanuts"],
//           protein: 30,
//           calories: 350,
//         },
//         {
//           time: "9:00 PM",
//           name: "Dinner 🌙",
//           items: ["3 Roti", "Soyabean Sabzi", "Curd (200g)", "Salad"],
//           protein: 35,
//           calories: 600,
//         },
//       ],
//     },
//     nonveg: {
//       calories: 2800,
//       protein: 160,
//       meals: [
//         {
//           time: "7:00 AM",
//           name: "Breakfast 🌅",
//           items: [
//             "5 Egg Whites + 2 Yolks",
//             "2 Whole Wheat Toast",
//             "1 Glass Milk",
//             "1 Banana",
//           ],
//           protein: 40,
//           calories: 500,
//         },
//         {
//           time: "10:00 AM",
//           name: "Mid Morning 🥜",
//           items: ["Boiled Chicken (100g)", "Handful Almonds", "1 Apple"],
//           protein: 30,
//           calories: 300,
//         },
//         {
//           time: "1:00 PM",
//           name: "Lunch 🍱",
//           items: ["Chicken Curry (200g)", "1.5 Cup Rice", "Dal", "Salad"],
//           protein: 50,
//           calories: 700,
//         },
//         {
//           time: "4:00 PM",
//           name: "Pre-Workout 💪",
//           items: ["Boiled Eggs (3)", "2 Bread Slices", "1 Banana"],
//           protein: 22,
//           calories: 380,
//         },
//         {
//           time: "7:00 PM",
//           name: "Post-Workout 🏋️",
//           items: ["Whey Protein Shake", "1 Banana", "Handful Peanuts"],
//           protein: 30,
//           calories: 320,
//         },
//         {
//           time: "9:00 PM",
//           name: "Dinner 🌙",
//           items: ["Grilled Fish/Chicken (150g)", "2 Roti", "Sabzi", "Salad"],
//           protein: 38,
//           calories: 600,
//         },
//       ],
//     },
//   },
//   "Lose Weight": {
//     veg: {
//       calories: 1600,
//       protein: 100,
//       meals: [
//         {
//           time: "7:00 AM",
//           name: "Breakfast 🌅",
//           items: [
//             "Oats with Milk (1 bowl)",
//             "2 Boiled Eggs",
//             "1 Glass Green Tea",
//           ],
//           protein: 20,
//           calories: 300,
//         },
//         {
//           time: "10:00 AM",
//           name: "Mid Morning 🥜",
//           items: ["1 Apple", "10 Almonds", "1 Glass Buttermilk (no sugar)"],
//           protein: 8,
//           calories: 150,
//         },
//         {
//           time: "1:00 PM",
//           name: "Lunch 🍱",
//           items: [
//             "1 Cup Dal",
//             "1 Cup Brown Rice",
//             "Lots of Salad",
//             "Curd (100g)",
//           ],
//           protein: 25,
//           calories: 400,
//         },
//         {
//           time: "4:00 PM",
//           name: "Evening Snack 🍎",
//           items: ["1 Cup Sprouts", "1 Glass Green Tea", "1 Orange"],
//           protein: 10,
//           calories: 150,
//         },
//         {
//           time: "7:00 PM",
//           name: "Dinner 🌙",
//           items: ["2 Roti (small)", "Sabzi (no oil)", "Dal", "Salad"],
//           protein: 18,
//           calories: 350,
//         },
//         {
//           time: "9:00 PM",
//           name: "Night 🌙",
//           items: ["1 Glass Warm Milk (low fat)", "5 Almonds"],
//           protein: 8,
//           calories: 100,
//         },
//       ],
//     },
//     nonveg: {
//       calories: 1600,
//       protein: 120,
//       meals: [
//         {
//           time: "7:00 AM",
//           name: "Breakfast 🌅",
//           items: [
//             "3 Egg Whites (boiled)",
//             "Oats (1 bowl)",
//             "1 Glass Green Tea",
//           ],
//           protein: 25,
//           calories: 280,
//         },
//         {
//           time: "10:00 AM",
//           name: "Mid Morning 🥜",
//           items: ["1 Apple", "10 Almonds", "1 Glass Buttermilk"],
//           protein: 8,
//           calories: 150,
//         },
//         {
//           time: "1:00 PM",
//           name: "Lunch 🍱",
//           items: ["Grilled Chicken (150g)", "1 Cup Brown Rice", "Salad", "Dal"],
//           protein: 40,
//           calories: 450,
//         },
//         {
//           time: "4:00 PM",
//           name: "Evening Snack 🍎",
//           items: ["Boiled Eggs (2)", "1 Glass Green Tea", "1 Orange"],
//           protein: 12,
//           calories: 150,
//         },
//         {
//           time: "7:00 PM",
//           name: "Dinner 🌙",
//           items: ["Grilled Fish (150g)", "2 Roti (small)", "Salad", "Sabzi"],
//           protein: 35,
//           calories: 400,
//         },
//       ],
//     },
//   },
//   "Stay Fit": {
//     veg: {
//       calories: 2000,
//       protein: 100,
//       meals: [
//         {
//           time: "7:00 AM",
//           name: "Breakfast 🌅",
//           items: ["Poha / Upma (1 bowl)", "2 Eggs", "1 Glass Milk", "1 Fruit"],
//           protein: 20,
//           calories: 400,
//         },
//         {
//           time: "11:00 AM",
//           name: "Mid Morning 🥜",
//           items: ["1 Fruit", "Handful Nuts", "1 Glass Buttermilk"],
//           protein: 8,
//           calories: 200,
//         },
//         {
//           time: "1:00 PM",
//           name: "Lunch 🍱",
//           items: ["2 Roti", "Dal", "Sabzi", "Curd", "Salad"],
//           protein: 25,
//           calories: 500,
//         },
//         {
//           time: "4:00 PM",
//           name: "Evening Snack ☕",
//           items: ["1 Cup Chai (less sugar)", "Handful Chana", "1 Fruit"],
//           protein: 10,
//           calories: 200,
//         },
//         {
//           time: "8:00 PM",
//           name: "Dinner 🌙",
//           items: ["2 Roti", "Dal/Sabzi", "Salad", "Curd"],
//           protein: 20,
//           calories: 450,
//         },
//       ],
//     },
//     nonveg: {
//       calories: 2000,
//       protein: 120,
//       meals: [
//         {
//           time: "7:00 AM",
//           name: "Breakfast 🌅",
//           items: ["3 Eggs (any style)", "2 Toast", "1 Glass Milk", "1 Banana"],
//           protein: 28,
//           calories: 450,
//         },
//         {
//           time: "11:00 AM",
//           name: "Mid Morning 🥜",
//           items: ["1 Fruit", "Handful Nuts", "1 Glass Buttermilk"],
//           protein: 8,
//           calories: 200,
//         },
//         {
//           time: "1:00 PM",
//           name: "Lunch 🍱",
//           items: ["Chicken Curry (150g)", "1.5 Cup Rice", "Dal", "Salad"],
//           protein: 40,
//           calories: 550,
//         },
//         {
//           time: "4:00 PM",
//           name: "Evening Snack ☕",
//           items: ["Boiled Egg (1)", "1 Cup Chai", "1 Fruit"],
//           protein: 10,
//           calories: 200,
//         },
//         {
//           time: "8:00 PM",
//           name: "Dinner 🌙",
//           items: ["Fish/Chicken (100g)", "2 Roti", "Sabzi", "Salad"],
//           protein: 30,
//           calories: 450,
//         },
//       ],
//     },
//   },
//   "Increase Strength": {
//     veg: {
//       calories: 3000,
//       protein: 150,
//       meals: [
//         {
//           time: "7:00 AM",
//           name: "Breakfast 🌅",
//           items: [
//             "5 Boiled Eggs",
//             "Paneer Paratha (2)",
//             "1 Glass Milk",
//             "1 Banana",
//           ],
//           protein: 50,
//           calories: 700,
//         },
//         {
//           time: "10:00 AM",
//           name: "Mid Morning 🥜",
//           items: ["Peanut Butter (2 tbsp) + Bread", "1 Glass Milk", "1 Banana"],
//           protein: 20,
//           calories: 400,
//         },
//         {
//           time: "1:00 PM",
//           name: "Lunch 🍱",
//           items: ["2 Cups Dal", "2 Cup Rice", "Paneer (150g)", "Curd", "Salad"],
//           protein: 45,
//           calories: 750,
//         },
//         {
//           time: "4:00 PM",
//           name: "Pre-Workout 💪",
//           items: ["Banana (2)", "Peanut Butter Toast", "1 Glass Milk"],
//           protein: 15,
//           calories: 450,
//         },
//         {
//           time: "7:00 PM",
//           name: "Post-Workout 🏋️",
//           items: ["Protein Shake", "2 Banana", "Peanuts (50g)"],
//           protein: 35,
//           calories: 450,
//         },
//         {
//           time: "9:30 PM",
//           name: "Dinner 🌙",
//           items: ["4 Roti", "Soya Sabzi", "Curd (200g)", "Salad"],
//           protein: 35,
//           calories: 650,
//         },
//       ],
//     },
//     nonveg: {
//       calories: 3200,
//       protein: 180,
//       meals: [
//         {
//           time: "7:00 AM",
//           name: "Breakfast 🌅",
//           items: [
//             "6 Egg Whites + 2 Yolk",
//             "3 Toast",
//             "1 Glass Milk",
//             "1 Banana",
//           ],
//           protein: 50,
//           calories: 650,
//         },
//         {
//           time: "10:00 AM",
//           name: "Mid Morning 🥜",
//           items: [
//             "Boiled Chicken (150g)",
//             "Peanut Butter Toast",
//             "1 Glass Milk",
//           ],
//           protein: 45,
//           calories: 450,
//         },
//         {
//           time: "1:00 PM",
//           name: "Lunch 🍱",
//           items: ["Chicken (250g)", "2 Cup Rice", "Dal", "Salad"],
//           protein: 55,
//           calories: 800,
//         },
//         {
//           time: "4:00 PM",
//           name: "Pre-Workout 💪",
//           items: ["3 Boiled Eggs", "2 Banana", "Peanuts"],
//           protein: 25,
//           calories: 450,
//         },
//         {
//           time: "7:00 PM",
//           name: "Post-Workout 🏋️",
//           items: ["Whey Protein", "2 Banana", "Milk"],
//           protein: 40,
//           calories: 400,
//         },
//         {
//           time: "9:30 PM",
//           name: "Dinner 🌙",
//           items: ["Grilled Chicken (200g)", "3 Roti", "Sabzi", "Curd"],
//           protein: 45,
//           calories: 650,
//         },
//       ],
//     },
//   },
//   "General Fitness": {
//     veg: {
//       calories: 1800,
//       protein: 90,
//       meals: [
//         {
//           time: "7:00 AM",
//           name: "Breakfast 🌅",
//           items: ["Idli/Dosa (3)", "Sambhar", "1 Glass Milk", "1 Fruit"],
//           protein: 15,
//           calories: 350,
//         },
//         {
//           time: "11:00 AM",
//           name: "Mid Morning 🥜",
//           items: ["1 Fruit", "10 Almonds", "1 Glass Lassi"],
//           protein: 8,
//           calories: 200,
//         },
//         {
//           time: "1:00 PM",
//           name: "Lunch 🍱",
//           items: ["2 Roti", "Dal", "Sabzi", "Curd", "Salad"],
//           protein: 22,
//           calories: 450,
//         },
//         {
//           time: "4:00 PM",
//           name: "Evening Snack ☕",
//           items: ["Chana Chaat", "1 Cup Chai", "1 Fruit"],
//           protein: 12,
//           calories: 200,
//         },
//         {
//           time: "8:00 PM",
//           name: "Dinner 🌙",
//           items: ["2 Roti", "Dal/Sabzi", "Salad", "Curd"],
//           protein: 18,
//           calories: 400,
//         },
//       ],
//     },
//     nonveg: {
//       calories: 1900,
//       protein: 110,
//       meals: [
//         {
//           time: "7:00 AM",
//           name: "Breakfast 🌅",
//           items: ["2 Eggs (any style)", "Poha/Upma", "1 Glass Milk", "1 Fruit"],
//           protein: 20,
//           calories: 380,
//         },
//         {
//           time: "11:00 AM",
//           name: "Mid Morning 🥜",
//           items: ["1 Fruit", "10 Almonds", "1 Glass Lassi"],
//           protein: 8,
//           calories: 200,
//         },
//         {
//           time: "1:00 PM",
//           name: "Lunch 🍱",
//           items: ["Chicken/Fish (100g)", "1.5 Cup Rice", "Dal", "Salad"],
//           protein: 35,
//           calories: 500,
//         },
//         {
//           time: "4:00 PM",
//           name: "Evening Snack ☕",
//           items: ["Boiled Egg (1)", "Chana", "1 Cup Chai"],
//           protein: 12,
//           calories: 200,
//         },
//         {
//           time: "8:00 PM",
//           name: "Dinner 🌙",
//           items: ["2 Roti", "Chicken/Fish (100g)", "Sabzi", "Salad"],
//           protein: 30,
//           calories: 450,
//         },
//       ],
//     },
//   },
// };

// function Diet() {
//   const user = useAuthStore((state) => state.user);
//   const [member, setMember] = useState(null);
//   const [isVeg, setIsVeg] = useState(true);
//   const [loading, setLoading] = useState(true);
//   const [saving, setSaving] = useState(false);

//   useEffect(() => {
//     if (user?.id) fetchMember();
//   }, [user]);

//   const fetchMember = async () => {
//     setLoading(true);
//     const { data } = await supabase
//       .from("members")
//       .select("*")
//       .eq("id", user.id)
//       .single();

//     if (data) {
//       setMember(data);
//       setIsVeg(data.is_veg !== false); // Default veg
//     }
//     setLoading(false);
//   };

//   const toggleDiet = async (veg) => {
//     setIsVeg(veg);
//     setSaving(true);
//     await supabase.from("members").update({ is_veg: veg }).eq("id", user.id);
//     setSaving(false);
//   };

//   const goal = member?.goal || "General Fitness";
//   const dietKey = isVeg ? "veg" : "nonveg";
//   const plan =
//     dietPlans[goal]?.[dietKey] || dietPlans["General Fitness"][dietKey];

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
//         <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
//       {/* Header */}
//       <h1 className="text-2xl font-black text-white mb-1">Diet Plan 🥗</h1>
//       <p className="text-slate-400 text-sm mb-4">
//         Based on your goal:{" "}
//         <span className="text-purple-400 font-bold">{goal}</span>
//       </p>

//       {/* Veg / Non-Veg Toggle */}
//       <div className="flex gap-2 mb-4">
//         <button
//           onClick={() => toggleDiet(true)}
//           className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
//             isVeg
//               ? "bg-green-500/20 border-green-500 text-green-400"
//               : "bg-[#1a1a2e] border-white/10 text-slate-400"
//           }`}
//         >
//           🥦 Vegetarian
//         </button>
//         <button
//           onClick={() => toggleDiet(false)}
//           className={`flex-1 py-2.5 rounded-xl text-sm font-bold border transition-all ${
//             !isVeg
//               ? "bg-red-500/20 border-red-500 text-red-400"
//               : "bg-[#1a1a2e] border-white/10 text-slate-400"
//           }`}
//         >
//           🍗 Non-Vegetarian
//         </button>
//       </div>

//       {/* Daily Summary */}
//       <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-4 mb-4 border border-purple-500/30">
//         <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
//           Daily Target
//         </p>
//         <div className="flex gap-4 mt-2">
//           <div>
//             <p className="text-white font-black text-2xl">{plan.calories}</p>
//             <p className="text-purple-300 text-xs">Calories</p>
//           </div>
//           <div className="w-px bg-white/20"></div>
//           <div>
//             <p className="text-white font-black text-2xl">{plan.protein}g</p>
//             <p className="text-purple-300 text-xs">Protein</p>
//           </div>
//           <div className="w-px bg-white/20"></div>
//           <div>
//             <p className="text-white font-black text-2xl">
//               {plan.meals.length}
//             </p>
//             <p className="text-purple-300 text-xs">Meals</p>
//           </div>
//         </div>
//       </div>

//       {/* Meal Plan */}
//       <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
//         Today's Meal Plan
//       </p>

//       <div className="space-y-3">
//         {plan.meals.map((meal, i) => (
//           <div
//             key={i}
//             className="bg-[#1a1a2e] border border-white/7 rounded-xl p-4"
//           >
//             {/* Meal Header */}
//             <div className="flex justify-between items-center mb-2">
//               <div>
//                 <p className="text-white font-black text-sm">{meal.name}</p>
//                 <p className="text-slate-500 text-xs">⏰ {meal.time}</p>
//               </div>
//               <div className="text-right">
//                 <p className="text-purple-400 text-xs font-bold">
//                   {meal.protein}g protein
//                 </p>
//                 <p className="text-slate-500 text-xs">{meal.calories} kcal</p>
//               </div>
//             </div>

//             {/* Divider */}
//             <div className="h-px bg-white/5 mb-2"></div>

//             {/* Food Items */}
//             <div className="space-y-1">
//               {meal.items.map((item, j) => (
//                 <div key={j} className="flex items-center gap-2">
//                   <div className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0"></div>
//                   <p className="text-slate-300 text-xs">{item}</p>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ))}
//       </div>

//       {/* Tips */}
//       <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
//         <p className="text-amber-400 font-bold text-sm mb-2">💡 Tips</p>
//         <div className="space-y-1">
//           {[
//             "Khana khane se pehle paani piyo",
//             "Raat ka khana halka rakhein",
//             "Fried food se bachein",
//             "Processed food avoid karein",
//           ].map((tip, i) => (
//             <div key={i} className="flex items-center gap-2">
//               <div className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0"></div>
//               <p className="text-slate-300 text-xs">{tip}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Diet;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../store/authStore";

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

function Diet() {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [isVeg, setIsVeg] = useState(true);
  const [selectedGoal, setSelectedGoal] = useState("General Fitness");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeDay, setActiveDay] = useState("Monday");

  // Custom diet
  const [customMeals, setCustomMeals] = useState([]);
  const [newMealName, setNewMealName] = useState("");
  const [newMealItems, setNewMealItems] = useState("");
  const [newMealTime, setNewMealTime] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [savingCustom, setSavingCustom] = useState(false);

  useEffect(() => {
    if (user?.id) fetchMember();
  }, [user]);

  const fetchMember = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("members")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setMember(data);
      setIsVeg(data.is_veg !== false);
      setSelectedGoal(data.goal || "General Fitness");
      if (data.custom_diet) setCustomMeals(data.custom_diet);
    }
    setLoading(false);
  };

  const toggleDiet = async (veg) => {
    setIsVeg(veg);
    await supabase.from("members").update({ is_veg: veg }).eq("id", user.id);
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

    await supabase
      .from("members")
      .update({ custom_diet: updated })
      .eq("id", user.id);

    setNewMealName("");
    setNewMealItems("");
    setNewMealTime("");
    setShowAddForm(false);
    setSavingCustom(false);
  };

  const deleteCustomMeal = async (id) => {
    const updated = customMeals.filter((m) => m.id !== id);
    setCustomMeals(updated);
    await supabase
      .from("members")
      .update({ custom_diet: updated })
      .eq("id", user.id);
  };

  const dietKey = isVeg ? "veg" : "nonveg";
  const plan =
    dietPlans[selectedGoal]?.[dietKey] || dietPlans["General Fitness"][dietKey];

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
      <h1 className="text-2xl font-black text-white mb-1">Diet Plan 🥗</h1>

      {/* Veg Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => toggleDiet(true)}
          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
            isVeg
              ? "bg-green-500/20 border-green-500 text-green-400"
              : "bg-[#1a1a2e] border-white/10 text-slate-400"
          }`}
        >
          🥦 Vegetarian
        </button>
        <button
          onClick={() => toggleDiet(false)}
          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
            !isVeg
              ? "bg-red-500/20 border-red-500 text-red-400"
              : "bg-[#1a1a2e] border-white/10 text-slate-400"
          }`}
        >
          🍗 Non-Vegetarian
        </button>
      </div>

      {/* Goal Dropdown */}
      <div className="mb-4">
        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Goal
        </label>
        <select
          value={selectedGoal}
          onChange={(e) => setSelectedGoal(e.target.value)}
          className="w-full bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5 text-white text-sm outline-none"
        >
          {goals.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </div>

      {/* Section 1 — Overall Diet Plan */}
      <div
        onClick={() =>
          navigate("/diet/overall", { state: { plan, selectedGoal, isVeg } })
        }
        className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-4 mb-3 border border-purple-500/30 cursor-pointer"
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
              📊 Overall Diet Plan
            </p>
            <p className="text-white font-black text-lg mt-1">{selectedGoal}</p>
            <div className="flex gap-4 mt-2">
              <span className="text-purple-200 text-xs">
                {plan.calories} kcal
              </span>
              <span className="text-purple-200 text-xs">
                {plan.protein}g protein
              </span>
              <span className="text-purple-200 text-xs">
                {plan.meals.length} meals
              </span>
            </div>
          </div>
          <span className="text-white text-2xl">→</span>
        </div>
      </div>

      {/* Section 2 — Weekly Plan */}
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl p-4 mb-3">
        <div className="flex justify-between items-center mb-3">
          <p className="text-white text-sm font-black">📅 Weekly Plan</p>
        </div>

        {/* Day Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border transition-all
                ${
                  activeDay === day
                    ? "bg-purple-600 border-purple-600 text-white"
                    : "bg-[#0d0d14] border-white/10 text-slate-400"
                }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>

        {/* Day Info */}
        <div className="bg-[#0d0d14] rounded-xl p-3 mb-3">
          <p className="text-white font-black text-sm">
            {weeklyPlan[activeDay].focus}
          </p>
          <p className="text-slate-400 text-xs mt-1">
            💡 {weeklyPlan[activeDay].extra}
          </p>
        </div>

        {/* Meals for selected day */}
        <div className="space-y-2">
          {plan.meals.map((meal, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 w-16">{meal.time}</span>
                <span className="text-white text-xs font-bold">
                  {meal.name}
                </span>
              </div>
              <span className="text-purple-400 text-xs">{meal.protein}g</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3 — Custom Diet Plan */}
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-white text-sm font-black">
              ✏️ My Custom Diet Plan
            </p>
            <p className="text-slate-400 text-xs mt-0.5">Add your own meals</p>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-purple-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl"
          >
            + Add Meal
          </button>
        </div>

        {/* Add Meal Form */}
        {showAddForm && (
          <div className="bg-[#0d0d14] rounded-xl p-3 mb-3 space-y-2">
            <input
              placeholder="Meal name (e.g. Breakfast)"
              value={newMealName}
              onChange={(e) => setNewMealName(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none placeholder:text-slate-600"
            />
            <input
              placeholder="Time (e.g. 8:00 AM)"
              value={newMealTime}
              onChange={(e) => setNewMealTime(e.target.value)}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none placeholder:text-slate-600"
            />
            <textarea
              placeholder="Food items (comma separated): Eggs, Milk, Toast"
              value={newMealItems}
              onChange={(e) => setNewMealItems(e.target.value)}
              rows={2}
              className="w-full bg-[#1a1a2e] border border-white/10 rounded-lg px-3 py-2 text-white text-xs outline-none placeholder:text-slate-600 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={addCustomMeal}
                disabled={!newMealName || !newMealItems || savingCustom}
                className="flex-1 bg-purple-600 text-white font-bold py-2 rounded-lg text-xs disabled:opacity-50"
              >
                {savingCustom ? "⏳ Saving..." : "✅ Save Meal"}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-white/5 text-slate-400 font-bold py-2 rounded-lg text-xs"
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
              Tap "+ Add Meal" to create your own plan
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {customMeals.map((meal) => (
              <div key={meal.id} className="bg-[#0d0d14] rounded-xl p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-white text-sm font-bold">{meal.name}</p>
                    <p className="text-slate-500 text-xs">⏰ {meal.time}</p>
                    <div className="mt-1 space-y-0.5">
                      {meal.items.map((item, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-purple-500"></div>
                          <p className="text-slate-300 text-xs">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteCustomMeal(meal.id)}
                    className="text-red-400 text-xs ml-2"
                  >
                    🗑️
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
