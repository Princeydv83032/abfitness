import { useNavigate, useLocation } from "react-router-dom";

const tabs = [
  { icon: "📊", label: "Dashboard", path: "/owner/dashboard" },
  { icon: "👥", label: "Members", path: "/owner/members" },
  { icon: "💰", label: "Payments", path: "/owner/payments" },
  { icon: "🎥", label: "Videos", path: "/owner/videos" },
  { icon: "⚙️", label: "Settings", path: "/owner/settings" },
];

function OwnerBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#13131f] border-t border-white/7 flex z-50">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex-1 flex flex-col items-center justify-center py-3 gap-1"
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span
              className={`text-[10px] font-bold
              ${isActive ? "text-purple-400" : "text-slate-500"}`}
            >
              {tab.label}
            </span>
            {isActive && (
              <div className="absolute bottom-0 w-8 h-0.5 bg-purple-500 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
}

export default OwnerBottomNav;
