import React from "react";
import { MediaType } from "../types";

interface NavbarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onTabChange, onOpenSearch }) => {
  const tabs = [
    { id: "all", label: "Home" },
    { id: "movie", label: "Movies" },
    { id: "tv", label: "TV Shows" },
    { id: "anime", label: "Anime" },
    { id: "watchlist", label: "My List" }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-[70px] px-6 sm:px-12 flex items-center justify-between z-40 bg-obsidian/75 backdrop-blur-xl border-b border-white/[0.07] transition-colors">
      <div className="flex items-center gap-8">
        <button
          onClick={() => onTabChange("all")}
          className="flex items-center gap-3 text-white cursor-pointer select-none group"
        >
          <img
            src="/assets/logo.jpg"
            alt="KapFlix"
            className="w-9 h-9 rounded-lg object-cover border border-white/20 shadow-md group-hover:border-white/40 transition"
          />
          <span className="font-extrabold tracking-widest text-lg uppercase bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
            KapFlix
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-1.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition ${
                currentTab === tab.id
                  ? "bg-white text-obsidian shadow-sm"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 bg-obsidian-surface2 hover:bg-obsidian-surface3 border border-white/10 hover:border-white/20 text-white/80 hover:text-white px-3.5 py-1.5 rounded-full text-sm font-medium transition cursor-pointer"
          title="Search (Press /)"
        >
          <svg className="w-4 h-4 text-white/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span className="hidden sm:inline">Search</span>
          <span className="text-[11px] font-bold bg-white/10 text-white/40 px-1.5 py-0.5 rounded">/</span>
        </button>
      </div>
    </header>
  );
};
