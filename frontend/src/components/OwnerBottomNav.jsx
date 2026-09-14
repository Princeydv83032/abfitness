import { useNavigate, useLocation } from "react-router-dom";
import {
  IoGrid,
  IoGridOutline,
  IoPeople,
  IoPeopleOutline,
  IoCash,
  IoCashOutline,
  IoVideocam,
  IoVideocamOutline,
  IoSettings,
  IoSettingsOutline,
} from "react-icons/io5";

const tabs = [
  {
    icon: IoGridOutline,
    activeIcon: IoGrid,
    label: "Dashboard",
    path: "/owner/dashboard",
  },
  {
    icon: IoPeopleOutline,
    activeIcon: IoPeople,
    label: "Members",
    path: "/owner/members",
  },
  {
    icon: IoCashOutline,
    activeIcon: IoCash,
    label: "Payments",
    path: "/owner/payments",
  },
  {
    icon: IoVideocamOutline,
    activeIcon: IoVideocam,
    label: "Videos",
    path: "/owner/videos",
  },
  {
    icon: IoSettingsOutline,
    activeIcon: IoSettings,
    label: "Settings",
    path: "/owner/settings",
  },
];

function OwnerBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#13131f] border-t border-white/7 flex z-50">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.path;
        const Icon = isActive ? tab.activeIcon : tab.icon;
        return (
          <button
            key={tab.path}
            onClick={() => navigate(tab.path)}
            className="flex-1 flex flex-col items-center justify-center py-1.5 gap-0.5"
          >
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                isActive
                  ? "bg-violet-500/15 text-violet-400"
                  : "text-slate-500"
              }`}
            >
              <Icon size={17} />
            </div>
            <span
              className={`text-[10px] font-bold ${
                isActive ? "text-violet-400" : "text-slate-500"
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default OwnerBottomNav;
