import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoBusinessOutline,
  IoTimeOutline,
  IoCashOutline,
  IoLocationOutline,
  IoNotificationsOutline,
  IoNavigateOutline,
  IoCheckmarkCircle,
  IoWarningOutline,
  IoShieldCheckmarkOutline,
} from "react-icons/io5";
import { FiClock, FiCalendar, FiLogOut, FiTrash2, FiSave } from "react-icons/fi";
import { apiFetch } from "../../lib/api";
import { getCache, setCache, hasCache } from "../../lib/pageCache";
import useAuthStore from "../../store/authStore";
import { toast } from "../../lib/toast";

const PLAN_ICONS = { monthly: FiCalendar, quarterly: FiClock, yearly: IoTimeOutline };

function SettingsSkeleton() {
  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">
      <div className="h-7 w-28 bg-white/5 rounded-lg animate-pulse mb-4" />
      <div className="h-24 bg-white/5 rounded-2xl animate-pulse mb-5" />
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="mb-5">
          <div className="h-3.5 w-24 bg-white/5 rounded animate-pulse mb-2" />
          <div className="h-28 bg-white/5 rounded-2xl animate-pulse" />
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="w-7 h-7 rounded-lg bg-violet-500/15 flex items-center justify-center text-violet-400 flex-shrink-0">
        <Icon size={14} />
      </div>
      <p className="text-slate-300 text-xs font-bold uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
}

function Settings() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  // Tab wapas aane par cached settings turant - skeleton sirf pehli baar
  const cached = getCache("ownerSettings");
  const [loading, setLoading] = useState(!cached);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [gymName, setGymName] = useState(cached?.gym_name || "");
  const [timing, setTiming] = useState(cached?.timing || "");

  const [gymLat, setGymLat] = useState(cached?.gym_lat || "");
  const [gymLng, setGymLng] = useState(cached?.gym_lng || "");
  const [geoRadius, setGeoRadius] = useState(cached?.geo_radius || 100);
  const [locating, setLocating] = useState(false);

  const [fees, setFees] = useState(
    cached?.settings?.fees || {
      monthly: 1500,
      quarterly: 4000,
      yearly: 15000,
    },
  );
  const [notifications, setNotifications] = useState(
    cached?.settings?.notifications || {
      expiryAlerts: true,
      dailySummary: true,
      newMemberAlert: false,
    },
  );

  const fetchSettings = async (retrying = false) => {
    // Cache hai to skeleton mat dikhao - silently refresh karo
    if (!hasCache("ownerSettings")) setLoading(true);
    // owner table RLS-locked hai - verifyOwner middleware token se row match
    // karke deta hai
    const res = await apiFetch("/api/owner/me");

    // Fresh page load ke turant baad Firebase ka session kabhi-kabhi abhi
    // restore ho hi raha hota hai - us waqt token nahi milta aur ye call
    // 401 ke saath fail ho jaati hai. Pehle ye silently khaali fields chhoड़
    // deta tha (Save karne par empty gym_name DB mein chala jaata) - ab
    // ek baar khud retry karo, warna user ko saaf bata do
    if (!res.success) {
      if (!retrying) {
        setTimeout(() => fetchSettings(true), 1000);
        return;
      }
      setLoading(false);
      toast.error("Gym settings load nahi ho paayi. Please reload karo.");
      return;
    }

    const data = res.owner;
    setCache("ownerSettings", data);
    setGymName(data.gym_name || "");
    setTiming(data.timing || "5:00 AM - 10:00 PM");
    setGymLat(data.gym_lat || "");
    setGymLng(data.gym_lng || "");
    setGeoRadius(data.geo_radius || 100);
    if (data.settings?.fees) setFees(data.settings.fees);
    if (data.settings?.notifications)
      setNotifications(data.settings.notifications);
    setLoading(false);
  };

  useEffect(() => {
    queueMicrotask(() => fetchSettings());
  }, []);

  const detectLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      toast.error("Location not supported");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGymLat(pos.coords.latitude);
        setGymLng(pos.coords.longitude);
        setLocating(false);
        toast.success("Gym location captured! Save to apply.");
      },
      () => {
        toast.error("Location access denied");
        setLocating(false);
      },
      { enableHighAccuracy: true },
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    const res = await apiFetch("/api/owner/me", {
      method: "PATCH",
      body: JSON.stringify({
        gym_name: gymName,
        timing: timing,
        gym_lat: gymLat || null,
        gym_lng: gymLng || null,
        geo_radius: geoRadius || 100,
        settings: { fees, notifications },
      }),
    });

    if (res.success) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      toast.error("Save failed: " + (res.error || res.message || "Unknown error"));
    }
    setSaving(false);
  };

  const toggleNotif = (key) =>
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleLogout = () => {
    logout();
    navigate("/owner/login");
  };

  if (loading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-20">
      <h1 className="text-2xl font-extrabold text-white mb-4">Settings</h1>

      {/* Gym Profile */}
      <div className="rounded-2xl p-4 mb-5 bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 border border-violet-400/20 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-white/15 border-2 border-white/20 flex items-center justify-center text-white text-2xl font-extrabold flex-shrink-0">
          {gymName?.[0] || "A"}
        </div>
        <div className="min-w-0">
          <h2 className="text-white font-extrabold text-lg truncate">{gymName}</h2>
          <p className="text-white/60 text-xs mt-0.5">
            Owner · +91 {user?.phone || "--"}
          </p>
          <span className="bg-white/15 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 inline-flex items-center gap-1">
            <IoShieldCheckmarkOutline size={11} /> Admin
          </span>
        </div>
      </div>

      {/* Gym Info */}
      <SectionHeader icon={IoBusinessOutline} label="Gym Info" />
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl p-3.5 space-y-3 mb-5">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Gym Name
          </label>
          <div className="flex items-center gap-2 bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <IoBusinessOutline size={14} className="text-slate-500" />
            <input
              value={gymName}
              onChange={(e) => setGymName(e.target.value)}
              placeholder="Gym name"
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
            />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Timing
          </label>
          <div className="flex items-center gap-2 bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <FiClock size={14} className="text-slate-500" />
            <input
              value={timing}
              onChange={(e) => setTiming(e.target.value)}
              placeholder="5:00 AM - 10:00 PM"
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
            />
          </div>
        </div>
      </div>

      {/* Membership Fees */}
      <SectionHeader icon={IoCashOutline} label="Membership Fees" />
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl mb-5">
        {[
          { key: "monthly", label: "Monthly Plan" },
          { key: "quarterly", label: "Quarterly Plan" },
          { key: "yearly", label: "Yearly Plan" },
        ].map((item, i, arr) => {
          const PlanIcon = PLAN_ICONS[item.key];
          return (
            <div
              key={item.key}
              className={`flex justify-between items-center px-4 py-3
                ${i !== arr.length - 1 ? "border-b border-white/5" : ""}`}
            >
              <span className="text-slate-300 text-sm flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 flex-shrink-0">
                  <PlanIcon size={13} />
                </div>
                {item.label}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400 text-sm">₹</span>
                <input
                  type="number"
                  value={fees[item.key]}
                  onChange={(e) =>
                    setFees((prev) => ({
                      ...prev,
                      [item.key]: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="bg-transparent outline-none text-white text-sm font-bold w-20 text-right"
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Attendance Location */}
      <SectionHeader icon={IoLocationOutline} label="Attendance Location" />
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl p-4 mb-5">
        {/* Status */}
        {gymLat && gymLng ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 mb-3 flex items-center gap-2">
            <IoCheckmarkCircle size={16} className="text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-emerald-400 text-xs font-bold">Gym Location Set</p>
              <p className="text-slate-400 text-xs mt-1">
                {parseFloat(gymLat).toFixed(6)}, {parseFloat(gymLng).toFixed(6)}
              </p>
              <p className="text-slate-500 text-xs mt-0.5">
                Members can only check-in within {geoRadius}m
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-3 flex items-center gap-2">
            <IoWarningOutline size={16} className="text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-amber-400 text-xs font-bold">Location Not Set</p>
              <p className="text-slate-400 text-xs mt-1">
                Members can check-in from anywhere
              </p>
            </div>
          </div>
        )}

        {/* Radius */}
        <div className="mb-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Allowed Radius
          </label>
          <div className="flex items-center gap-2 bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <IoLocationOutline size={14} className="text-slate-500" />
            <input
              type="number"
              value={geoRadius}
              onChange={(e) => setGeoRadius(parseInt(e.target.value) || 100)}
              className="bg-transparent outline-none text-white text-sm flex-1"
            />
            <span className="text-slate-400 text-xs font-bold">meters</span>
          </div>
        </div>

        {/* Set Location Button */}
        <button
          onClick={detectLocation}
          disabled={locating}
          className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <IoNavigateOutline size={15} />
          {locating ? "Detecting location..." : "Set Current Location as Gym"}
        </button>

        {/* Remove Location */}
        {gymLat && gymLng && (
          <button
            onClick={() => {
              setGymLat("");
              setGymLng("");
            }}
            className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-2.5 rounded-xl text-xs mt-2 flex items-center justify-center gap-1.5"
          >
            <FiTrash2 size={12} /> Remove Location Restriction
          </button>
        )}
      </div>

      {/* Notifications */}
      <SectionHeader icon={IoNotificationsOutline} label="Notifications" />
      <div className="bg-[#1a1a2e] border border-white/7 rounded-2xl mb-5">
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
            <button
              onClick={() => toggleNotif(item.key)}
              className={`w-11 h-6 rounded-full relative transition-colors flex-shrink-0
                ${notifications[item.key] ? "bg-violet-600" : "bg-white/10 border border-white/10"}`}
            >
              <div
                className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all
                ${notifications[item.key] ? "right-1" : "left-1"}`}
              />
            </button>
          </div>
        ))}
      </div>

      {success && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 rounded-xl p-3 mb-4 text-center flex items-center justify-center gap-2">
          <IoCheckmarkCircle size={15} className="text-emerald-400" />
          <p className="text-emerald-400 font-bold text-sm">Settings saved!</p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-violet-600 text-white font-bold py-3 rounded-xl text-sm mb-3 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        <FiSave size={15} />
        {saving ? "Saving..." : "Save Changes"}
      </button>

      <button
        onClick={handleLogout}
        className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-3 rounded-xl text-sm flex items-center justify-center gap-2"
      >
        <FiLogOut size={15} /> Log Out
      </button>
    </div>
  );
}

export default Settings;
