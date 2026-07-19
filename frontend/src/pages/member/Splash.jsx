import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0d0d14] flex flex-col items-center justify-center">
      {/* Logo */}
      <div className="text-7xl mb-6">🏋️</div>

      {/* App Name */}
      <h1 className="text-4xl font-black text-white tracking-tight">
        AB <span className="text-purple-500">Fitness</span>
      </h1>

      {/* Tagline */}
      <p className="text-slate-400 text-sm mt-3 text-center px-8">
        Your gym, your workouts, your progress
      </p>

      {/* Loading dots */}
      <div className="flex gap-2 mt-16">
        <div className="w-2 h-2 rounded-full bg-purple-500"></div>
        <div className="w-2 h-2 rounded-full bg-purple-400"></div>
        <div className="w-2 h-2 rounded-full bg-purple-300"></div>
      </div>
    </div>
  );
}

export default Splash;
