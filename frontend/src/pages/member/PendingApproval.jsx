import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
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

    const { data } = await supabase
      .from("members")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data?.status === "active") {
      setMember(data);
      navigate("/home", { replace: true });
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
      // status: "pending" guard — never delete a member the owner may have
      // just approved (avoids a race with the 30s status poll)
      await supabase
        .from("members")
        .delete()
        .eq("id", user.id)
        .eq("status", "pending");
    } catch (err) {
      console.log("Cancel request error:", err);
    } finally {
      logout();
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center px-6">
      {/* Icon */}
      <div
        className="text-8xl mb-6"
        style={{ animation: "float 3s ease-in-out infinite" }}
      >
        ⏳
      </div>

      {/* Title */}
      <h1 className="text-2xl font-black text-white text-center">
        Request Under Review!
      </h1>
      <p className="text-slate-400 text-sm mt-2 text-center">
        We've received your joining request for
      </p>
      <p className="text-purple-400 font-black text-lg mt-1">AB Fitness 💪</p>

      {/* Member Info Card */}
      <div className="w-full max-w-sm mt-6 bg-[#1a1a2e] border border-white/7 rounded-2xl p-4">
        {user?.profile_photo && (
          <img
            src={user.profile_photo}
            alt="Profile"
            className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-purple-500"
          />
        )}

        {[
          { icon: "👤", label: user?.name || "--" },
          { icon: "📱", label: `+91 ${user?.phone || "--"}` },
          { icon: "🎯", label: user?.goal || "General Fitness" },
          { icon: "📧", label: user?.email || "--" },
        ].map((row, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0"
          >
            <span className="text-lg">{row.icon}</span>
            <span className="text-white text-sm">{row.label}</span>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="w-full max-w-sm mt-4 bg-purple-600/10 border border-purple-500/20 rounded-xl p-4">
        <p className="text-purple-300 text-xs text-center">
          🔔 You'll get a notification when your request is approved!
        </p>
        <p className="text-slate-500 text-xs text-center mt-1">
          Usually approved within 24 hours
        </p>
      </div>

      {/* Check Status Button */}
      <button
        onClick={checkStatus}
        disabled={checking}
        className="mt-6 bg-purple-600 text-white font-bold py-3 px-8 rounded-xl text-sm disabled:opacity-50"
      >
        {checking ? "⏳ Checking..." : "🔄 Check Status"}
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
        {cancelling ? "⏳ Cancelling..." : "Cancel Request"}
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
