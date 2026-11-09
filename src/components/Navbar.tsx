import React from "react";

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenSearch: () => void;
  onSurpriseMe: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange, onOpenSearch, onSurpriseMe }) => {
  const tabs = [
    { id: "all", label: "Home", icon: "⌂" },
    { id: "movie", label: "Movies", icon: "🎬" },
    { id: "tv", label: "Series", icon: "📺" },
    { id: "browse", label: "Browse", icon: "🧭" },
    { id: "calendar", label: "Releases", icon: "📅" },
    { id: "watchlist", label: "My List", icon: "🔖" }
  ];

  return (
    <>
      {/* Floating Island Top Bar (Vivarium Signature) */}
      <header className="fixed top-4 left-0 right-0 px-4 sm:px-10 flex items-center justify-between z-40 pointer-events-none select-none">
        {/* Left: Brand Circle Glass Button */}
        <div className="pointer-events-auto">
          <button
            onClick={() => onTabChange("all")}
            className="viv-round-btn group shadow-xl"
            title="KapFlix Home"
          >
            <img
              src="/assets/logo.jpg"
              alt="KapFlix"
              className="w-7 h-7 rounded-full object-cover transition-transform group-hover:scale-110"
            />
          </button>
        </div>

        {/* Center: Floating Island Nav Pill (Desktop) */}
        <nav className="hidden md:flex pointer-events-auto viv-glass-pill p-1.5 rounded-full items-center gap-1 shadow-2xl">
          {tabs.map(tab => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-1.5 rounded-full text-[13px] tracking-wide transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-white/[0.18] text-white font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
                    : "text-white/60 hover:text-white hover:bg-white/[0.06] font-medium"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Right: Round Glass Action Buttons */}
        <div className="pointer-events-auto flex items-center gap-2.5">
          <button
            onClick={onSurpriseMe}
            className="viv-round-btn text-base shadow-xl"
            title="Surprise Me (Random Acclaimed Gem)"
          >
            🎲
          </button>

          <button
            onClick={onOpenSearch}
            className="viv-round-btn shadow-xl relative"
            title="Search (Press /)"
          >
            <svg className="w-4 h-4 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </div>
      </header>

      {/* Floating Bottom Dock (Mobile Vivarium Style) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 md:hidden pointer-events-auto">
        <nav className="viv-glass-pill px-3 py-2 rounded-full flex items-center gap-1.5 shadow-2xl">
          {tabs.map(tab => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-2.5 py-1 rounded-full text-xs flex flex-col items-center gap-0.5 transition ${
                  isActive
                    ? "bg-white/20 text-white font-bold"
                    : "text-white/50 hover:text-white"
                }`}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="text-[10px]">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
};
