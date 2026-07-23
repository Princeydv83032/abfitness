import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../../store/authStore";

function Splash() {
  const navigate = useNavigate();
  const { isLoggedIn, role } = useAuthStore();
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);

    const timer = setTimeout(() => {
      if (isLoggedIn) {
        navigate(role === "owner" ? "/owner/dashboard" : "/home", {
          replace: true,
        });
      } else {
        navigate("/login", { replace: true });
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center overflow-hidden">
      {/* Glow */}
      <div
        className="absolute w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.3) 0%, transparent 70%)",
          transform: animate ? "scale(1.2)" : "scale(0)",
          opacity: animate ? 1 : 0,
          transition: "all 0.8s ease-out",
        }}
      />

      {/* Logo */}
      <div
        style={{
          transform: animate ? "scale(1)" : "scale(0.2)",
          opacity: animate ? 1 : 0,
          transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        className="flex flex-col items-center"
      >
        <img
          src="/icon-192.png"
          alt="AB Fitness"
          className="w-32 h-32 rounded-3xl mb-6 shadow-2xl"
          style={{ boxShadow: "0 20px 60px rgba(124,58,237,0.4)" }}
        />
        <h1 className="text-4xl font-black text-white tracking-tight">
          AB <span className="text-purple-500">Fitness</span>
        </h1>
        <p className="text-slate-400 text-sm mt-2 text-center px-8">
          Your gym, your workouts, your progress
        </p>
      </div>

      {/* Dots */}
      <div
        className="flex gap-2 mt-16"
        style={{
          opacity: animate ? 1 : 0,
          transition: "opacity 0.5s ease 0.5s",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-purple-500"
            style={{
              animation: `dotPulse 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}

export default Splash;
