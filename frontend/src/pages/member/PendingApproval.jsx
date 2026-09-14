import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  IoTimeOutline,
  IoFlagOutline,
  IoNotificationsOutline,
  IoRefreshOutline,
} from "react-icons/io5";
import { FiUser, FiSmartphone, FiMail } from "react-icons/fi";
import { apiFetch } from "../../lib/api";
import useAuthStore from "../../store/authStore";

function PendingApproval() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const setMember = useAuthStore((state) => state.setMember);
  const logout = useAuthStore((state) => state.logout);
  const [checking, setChecking] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const checkStatus = async () => {
    if (!user?.id) return;
    setChecking(true);

    const res = await apiFetch("/api/members/me");

    if (res.member?.status === "active") {
      setMember(res.member);
      navigate("/home", { replace: true });
    } else if (!res.success && res.message === "No member account found for this login") {
      // Owner ne request approve karne se pehle hi reject/delete kar di
      logout();
      navigate("/login", { replace: true });
    }

    setChecking(false);
  };

  useEffect(() => {
    // Real time status check
    const interval = setInterval(checkStatus, 30000); // Har 30 second
    return () => clearInterval(interval);
  }, []);

  const handleCancelRequest = async () => {
    if (!user?.id) {
      logout();
      navigate("/login");
      return;
    }

    if (
      !window.confirm(
        "Cancel your join request? You'll need to register again to rejoin.",
      )
    )
      return;

    setCancelling(true);
    try {
      // Backend route khud "status: pending" guard karta hai — owner ne
      // approve kar diya ho to delete nahi hoga (30s poll ke sath race
      // se bachne ke liye)
      await apiFetch("/api/members/me", { method: "DELETE" });
    } catch (err) {
      console.log("Cancel request error:", err);
    } finally {
      logout();
      navigate("/login");
    }
  };

  const infoRows = [
    { icon: FiUser, label: user?.name || "--" },
    { icon: FiSmartphone, label: `+91 ${user?.phone || "--"}` },
    { icon: IoFlagOutline, label: user?.goal || "General Fitness" },
    { icon: FiMail, label: user?.email || "--" },
  ];

  return (
    <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center px-6">
      {/* Icon */}
      <div
        className="w-20 h-20 rounded-2xl bg-violet-500/15 flex items-center justify-center text-violet-400 mb-6"
        style={{ animation: "float 3s ease-in-out infinite" }}
      >
        <IoTimeOutline size={36} />
      </div>

      {/* Title */}
      <h1 className="text-2xl font-extrabold text-white text-center">
        Request Under Review!
      </h1>
      <p className="text-slate-400 text-sm mt-2 text-center">
        We've received your joining request for
      </p>
      <p className="text-violet-400 font-extrabold text-lg mt-1">AB Fitness</p>

      {/* Member Info Card */}
      <div className="w-full max-w-sm mt-6 bg-[#1a1a2e] border border-white/7 rounded-2xl p-4">
        {user?.profile_photo && (
          <img
            src={user.profile_photo}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-violet-500"
          />
        )}

        {infoRows.map((row, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
          >
            <div className="w-7 h-7 rounded-full bg-violet-500/15 flex items-center justify-center text-violet-400 flex-shrink-0">
              <row.icon size={13} />
            </div>
            <span className="text-white text-sm">{row.label}</span>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="w-full max-w-sm mt-4 bg-violet-600/10 border border-violet-500/20 rounded-xl p-4">
        <p className="text-violet-300 text-xs text-center flex items-center justify-center gap-1.5">
          <IoNotificationsOutline size={13} />
          You'll get a notification when your request is approved!
        </p>
        <p className="text-slate-500 text-xs text-center mt-1">
          Usually approved within 24 hours
        </p>
      </div>

      {/* Check Status Button */}
      <button
        onClick={checkStatus}
        disabled={checking}
        className="mt-6 bg-violet-600 text-white font-bold py-3 px-8 rounded-xl text-sm disabled:opacity-50 flex items-center gap-2"
      >
        <IoRefreshOutline size={15} className={checking ? "animate-spin" : ""} />
        {checking ? "Checking..." : "Check Status"}
      </button>

      {/* Contact */}
      <p className="text-slate-500 text-xs mt-6 text-center">
        Need help? Contact your gym owner
      </p>

      {/* Cancel Request */}
      <button
        onClick={handleCancelRequest}
        disabled={cancelling}
        className="mt-4 text-red-400 text-xs font-bold disabled:opacity-50"
      >
        {cancelling ? "Cancelling..." : "Cancel Request"}
      </button>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
      `}</style>
    </div>
  );
}

export default PendingApproval;
