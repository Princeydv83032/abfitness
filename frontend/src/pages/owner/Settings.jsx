import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import useAuthStore from "../../store/authStore";

function Settings() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [qrUploading, setQrUploading] = useState(false);

  const [gymName, setGymName] = useState("");
  const [timing, setTiming] = useState("");
  const [upiId, setUpiId] = useState("");
  const [qrUrl, setQrUrl] = useState("");

  const [gymLat, setGymLat] = useState("");
  const [gymLng, setGymLng] = useState("");
  const [geoRadius, setGeoRadius] = useState(100);
  const [locating, setLocating] = useState(false);

  const [fees, setFees] = useState({
    monthly: 1500,
    quarterly: 4000,
    yearly: 15000,
  });
  const [notifications, setNotifications] = useState({
    expiryAlerts: true,
    dailySummary: true,
    newMemberAlert: false,
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data } = await supabase.from("owner").select("*").single();

    if (data) {
      setGymName(data.gym_name || "");
      setTiming(data.timing || "5:00 AM - 10:00 PM");
      setUpiId(data.upi_id || "");
      setQrUrl(data.upi_qr_url || "");
      setGymLat(data.gym_lat || "");
      setGymLng(data.gym_lng || "");
      setGeoRadius(data.geo_radius || 100);
      if (data.settings?.fees) setFees(data.settings.fees);
      if (data.settings?.notifications)
        setNotifications(data.settings.notifications);
    }
    setLoading(false);
  };

  const handleQRUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setQrUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "upload_preset",
      import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
    );
    formData.append("folder", "gym_qr");

    try {
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData },
      );
      const data = await res.json();

      if (!data.secure_url) {
        alert("Upload failed");
        return;
      }

      setQrUrl(data.secure_url);

      await supabase
        .from("owner")
        .update({ upi_qr_url: data.secure_url })
        .eq("gym_name", gymName);

      alert("✅ QR Code uploaded!");
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setQrUploading(false);
    }
  };

  const detectLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      alert("Location not supported");
      setLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGymLat(pos.coords.latitude);
        setGymLng(pos.coords.longitude);
        setLocating(false);
        alert("✅ Gym location captured! Save karo.");
      },
      (err) => {
        alert("Location access denied");
        setLocating(false);
      },
      { enableHighAccuracy: true },
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);

    const { error } = await supabase
      .from("owner")
      .update({
        gym_name: gymName,
        timing: timing,
        upi_id: upiId,
        gym_lat: gymLat || null,
        gym_lng: gymLng || null,
        geo_radius: geoRadius || 100,
        settings: { fees, notifications },
      })
      .eq("gym_name", gymName);

    if (!error) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } else {
      alert("Save failed: " + error.message);
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
    return (
      <div className="min-h-screen bg-[#0d0d14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-purple-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d14] px-4 pt-12 pb-24">
      <h1 className="text-2xl font-black text-white mb-4">Settings</h1>

      {/* Gym Profile */}
      <div className="bg-[#1a1a2e] border border-purple-500/30 rounded-2xl p-4 flex items-center gap-4 mb-5">
        <div className="w-14 h-14 rounded-full bg-purple-600 flex items-center justify-center text-white text-2xl font-black flex-shrink-0">
          {gymName?.[0] || "A"}
        </div>
        <div>
          <h2 className="text-white font-black text-lg">{gymName}</h2>
          <p className="text-slate-400 text-xs mt-0.5">
            Owner · +91 {user?.phone || "--"}
          </p>
          <span className="bg-purple-600/20 text-purple-400 text-xs font-bold px-2 py-0.5 rounded-full mt-1 inline-block">
            👑 Admin
          </span>
        </div>
      </div>

      {/* Gym Info */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Gym Info
      </p>
      <div className="space-y-3 mb-5">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Gym Name
          </label>
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <span>🏋️</span>
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
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <span>⏰</span>
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
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Membership Fees
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl mb-5">
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
                  setFees((prev) => ({
                    ...prev,
                    [item.key]: parseInt(e.target.value) || 0,
                  }))
                }
                className="bg-transparent outline-none text-white text-sm font-bold w-20 text-right"
              />
            </div>
          </div>
        ))}
      </div>

      {/* UPI Payment */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        UPI Payment
      </p>
      <div className="space-y-3 mb-5">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            UPI ID
          </label>
          <div className="flex items-center gap-2 bg-[#1a1a2e] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <span>📱</span>
            <input
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="bg-transparent outline-none text-white text-sm flex-1 placeholder:text-slate-600"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            UPI QR Code
          </label>
          <div className="mt-1.5">
            {qrUrl ? (
              <div className="text-center bg-[#1a1a2e] border border-white/10 rounded-2xl p-4">
                <img
                  src={qrUrl}
                  alt="UPI QR"
                  className="w-48 h-48 object-contain bg-white rounded-xl p-2 mx-auto"
                />
                <p className="text-slate-400 text-xs mt-2">
                  Members will scan this to pay
                </p>
                <label
                  htmlFor="qr-upload"
                  className="block text-center mt-2 text-purple-400 text-xs font-bold cursor-pointer"
                >
                  ✏️ Change QR Code
                </label>
              </div>
            ) : (
              <label
                htmlFor="qr-upload"
                className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-white/10 rounded-xl bg-[#1a1a2e] cursor-pointer"
              >
                <div className="text-3xl mb-2">📷</div>
                <p className="text-slate-400 text-sm">
                  {qrUploading ? "⏳ Uploading..." : "Tap to upload QR code"}
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Members will scan this to pay
                </p>
              </label>
            )}
            <input
              id="qr-upload"
              type="file"
              accept="image/*"
              onChange={handleQRUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Geo-fencing */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        📍 Attendance Location
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl p-4 mb-5">
        {/* Status */}
        {gymLat && gymLng ? (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 mb-3">
            <p className="text-green-400 text-xs font-bold">
              ✅ Gym Location Set
            </p>
            <p className="text-slate-400 text-xs mt-1">
              {parseFloat(gymLat).toFixed(6)}, {parseFloat(gymLng).toFixed(6)}
            </p>
            <p className="text-slate-500 text-xs mt-0.5">
              Members can only check-in within {geoRadius}m
            </p>
          </div>
        ) : (
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 mb-3">
            <p className="text-amber-400 text-xs font-bold">
              ⚠️ Location Not Set
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Members can check-in from anywhere
            </p>
          </div>
        )}

        {/* Radius */}
        <div className="mb-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Allowed Radius
          </label>
          <div className="flex items-center gap-2 bg-[#0d0d14] border border-white/10 rounded-xl px-4 py-3 mt-1.5">
            <span>📏</span>
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
          className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50"
        >
          {locating
            ? "⏳ Detecting location..."
            : "📍 Set Current Location as Gym"}
        </button>

        {/* Remove Location */}
        {gymLat && gymLng && (
          <button
            onClick={() => {
              setGymLat("");
              setGymLng("");
            }}
            className="w-full bg-red-500/10 border border-red-500/20 text-red-400 font-bold py-2.5 rounded-xl text-xs mt-2"
          >
            🗑️ Remove Location Restriction
          </button>
        )}
      </div>

      {/* Notifications */}
      <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
        Notifications
      </p>
      <div className="bg-[#1a1a2e] border border-white/7 rounded-xl mb-5">
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

      {success && (
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-3 mb-4 text-center">
          <p className="text-green-400 font-bold text-sm">✅ Settings saved!</p>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full bg-purple-600 text-white font-bold py-3 rounded-xl text-sm mb-3 disabled:opacity-50"
      >
        {saving ? "⏳ Saving..." : "💾 Save Changes"}
      </button>

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
