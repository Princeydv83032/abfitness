import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

function Settings() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [notifications, setNotifications] = useState({
    expiryAlerts: true,
    dailySummary: true,
    newMemberAlert: false,
  });

  const [fees, setFees] = useState({
    monthly: 1500,
    quarterly: 4000,
    yearly: 15000,
  });

  const toggleNotif = (key) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = () => {
    logout();
    navigate("/owner/login");
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Header */}
      <h1 className="text-2xl font-black text-white mb-4">Settings</h1>

      {/* Gym Profile */}
      <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-2xl p-4 flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
          {user?.gymName?.[0] || "A"}
        </div>
        <div>
          <h2 className="text-white font-black text-lg">
            {user?.gymName || "AB Fitness"}
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Owner · +91 {user?.phone || "--"}
          </p>
          <span className="bg-purple-600/20 text-purple-400 text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
            👑 Admin
          </span>
        </div>
      </div>

      {/* Membership Fees */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Membership Fees
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl mb-4">
        {[
          { key: "monthly", label: "Monthly Plan" },
          { key: "quarterly", label: "Quarterly Plan" },
          { key: "yearly", label: "Yearly Plan" },
        ].map((item, i, arr) => (
          <div
            key={item.key}
            className={`flex justify-between items-center px-4 py-3
              ${i !== arr.length - 1 ? "border-b border-white/5" : ""}`}
          >
            <span className="text-slate-300 text-sm">{item.label}</span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-sm">₹</span>
              <input
                type="number"
                value={fees[item.key]}
                onChange={(e) =>
                  setFees((prev) => ({ ...prev, [item.key]: e.target.value }))
                }
                className="bg-transparent outline-none text-white text-sm font-bold w-16 text-right"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Notifications
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl mb-4">
        {[
          {
            key: "expiryAlerts",
            label: "Expiry Alerts",
            sub: "7 days before member expires",
          },
          {
            key: "dailySummary",
            label: "Daily Summary",
            sub: "End of day payment summary",
          },
          {
            key: "newMemberAlert",
            label: "New Member Alert",
            sub: "Notify when member is added",
          },
        ].map((item, i, arr) => (
          <div
            key={item.key}
            className={`flex justify-between items-center px-4 py-3
              ${i !== arr.length - 1 ? "border-b border-white/5" : ""}`}
          >
            <div>
              <p className="text-white text-sm font-semibold">{item.label}</p>
              <p className="text-slate-500 text-xs mt-0.5">{item.sub}</p>
            </div>
            <div
              onClick={() => toggleNotif(item.key)}
              className={`w-11 h-6 rounded-full relative cursor-pointer transition-all
                ${notifications[item.key] ? "bg-purple-600" : "bg-white/10 border border-white/10"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all
                ${notifications[item.key] ? "right-1" : "left-1"}`}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Workout Schedule */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Workout Schedule
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl mb-4">
        <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
          <p className="text-white text-sm font-semibold">Weekly Split</p>
          <span className="text-purple-400 text-xs font-bold cursor-pointer">
            Edit ✏️
          </span>
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <p className="text-white text-sm font-semibold">Exercise Videos</p>
          <span
            onClick={() => navigate("/owner/videos")}
            className="text-purple-400 text-xs font-bold cursor-pointer"
          >
            7 uploaded →
          </span>
        </div>
      </div>

      {/* Save Button */}
      <button className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm mb-3">
        💾 Save Changes
      </button>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-3 rounded-xl text-sm"
      >
        Log Out
      </button>
    </div>
  );
}

export default Settings;
