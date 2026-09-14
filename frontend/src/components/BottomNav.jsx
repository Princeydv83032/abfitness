import { useNavigate, useLocation } from "react-router-dom";
import {
  IoHome,
  IoHomeOutline,
  IoBarbell,
  IoBarbellOutline,
  IoRestaurant,
  IoRestaurantOutline,
  IoCalendar,
  IoCalendarOutline,
  IoPerson,
  IoPersonOutline,
} from "react-icons/io5";

const tabs = [
  { icon: IoHomeOutline, activeIcon: IoHome, label: "Home", path: "/home" },
  {
    icon: IoBarbellOutline,
    activeIcon: IoBarbell,
    label: "Workout",
    path: "/workout",
  },
  {
    icon: IoRestaurantOutline,
    activeIcon: IoRestaurant,
    label: "Diet",
    path: "/diet",
  },
  {
    icon: IoCalendarOutline,
    activeIcon: IoCalendar,
    label: "Attendance",
    path: "/attendance",
  },
  {
    icon: IoPersonOutline,
    activeIcon: IoPerson,
    label: "Profile",
    path: "/profile",
  },
];

function BottomNav() {
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
            onClick={() => navigate(tab.path, { replace: true })}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1"
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                isActive
                  ? "bg-violet-500/15 text-violet-400"
                  : "text-slate-500"
              }`}
            >
              <Icon size={19} />
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

export default BottomNav;
