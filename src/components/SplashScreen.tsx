import React, { useEffect, useState } from "react";

interface SplashScreenProps {
  isLoading: boolean;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ isLoading }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setVisible(false), 450);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-obsidian transition-opacity duration-500 ${
        isLoading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="relative flex flex-col items-center">
        {/* Ambient Backing Glow */}
        <div className="absolute inset-0 w-36 h-36 -m-4 bg-white/10 rounded-full blur-2xl animate-pulse" />

        <img
          src="/assets/logo.jpg"
          alt="KapFlix"
          className="relative w-24 h-24 rounded-2xl object-cover shadow-2xl border border-white/20 animate-pulse"
        />

        <div className="mt-6 flex flex-col items-center gap-1 text-center">
          <span className="text-xl font-black tracking-widest text-white uppercase">KapFlix</span>
          <span className="text-xs font-semibold text-white/40 tracking-wider">PREPARING CINEMA</span>
        </div>
      </div>
    </div>
  );
};
