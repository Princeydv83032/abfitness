import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const infoRows = [
    { label: "Phone", value: user?.phone || "--" },
    { label: "Plan", value: user?.plan || "--" },
    { label: "Joined", value: "Jan 2026" },
    { label: "Expires", value: user?.expires_at || "--" },
    { label: "Status", value: "Active ✅" },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Profile Hero */}
      <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-2xl p-4 flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
          {user?.name?.[0] || "M"}
        </div>
        <div>
          <h2 className="text-white font-black text-lg">
            {user?.name || "Member"}
          </h2>
          <p className="text-slate-400 text-xs mt-0.5">Member ID: GYM-0042</p>
          <span className="bg-purple-600/20 text-purple-400 text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
            💪 Build Muscle
          </span>
        </div>
      </div>

      {/* Info Section */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
        Personal Info
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl mb-4">
        {infoRows.map((row, i) => (
          <div
            key={i}
            className={`flex justify-between items-center px-4 py-3
              ${i !== infoRows.length - 1 ? "border-b border-white/5" : ""}`}
          >
            <span className="text-slate-400 text-sm">{row.label}</span>
            <span className="text-white text-sm font-semibold">
              {row.value}
            </span>
          </div>
        ))}
      </div>

      {/* Settings Section */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
        Settings
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl mb-4">
        <div className="flex justify-between items-center px-4 py-3 border-b border-white/5">
          <div>
            <p className="text-white text-sm font-semibold">
              Expiry Notifications
            </p>
            <p className="text-slate-500 text-xs">Alert 7 days before expiry</p>
          </div>
          <div className="w-10 h-5 bg-purple-600 rounded-full relative">
            <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="flex justify-between items-center px-4 py-3">
          <div>
            <p className="text-white text-sm font-semibold">
              Workout Reminders
            </p>
            <p className="text-slate-500 text-xs">Daily 6 AM reminder</p>
          </div>
          <div className="w-10 h-5 bg-white/10 rounded-full relative border border-white/10">
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-slate-400 rounded-full"></div>
          </div>
        </div>
      </div>

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

export default Profile;
