import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

function Home() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-slate-400 text-xs">Good morning 👋</p>
          <h1 className="text-xl font-black text-white mt-0.5">
            {user?.name || "Member"}
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold">
          {user?.name?.[0] || "M"}
        </div>
      </div>

      {/* Membership Card */}
      <div className="bg-gradient-to-r from-purple-900 to-purple-700 rounded-2xl p-4 mb-4 border border-purple-500/30">
        <p className="text-purple-300 text-xs font-bold uppercase tracking-wider">
          Membership
        </p>
        <p className="text-white font-black text-lg mt-1">
          {user?.plan || "Monthly Plan"}
        </p>
        <div className="flex justify-between items-center mt-2">
          <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full">
            ✓ Active
          </span>
          <span className="text-slate-300 text-xs">
            Expires: {user?.expires_at || "--"}
          </span>
        </div>
      </div>

      {/* Quick Actions */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-3">
        Quick Actions
      </p>
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { icon: "💪", label: "Workout" },
          { icon: "📅", label: "Attendance" },
          { icon: "💰", label: "Payments" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-[#1a1a2e] border border-white/7 rounded-xl p-3 text-center"
          >
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-white text-xs font-bold">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-3 rounded-xl text-sm"
      >
        Logout
      </button>
    </div>
  );
}

export default Home;
