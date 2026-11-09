import React, { useState, useEffect } from "react";
import { MediaItem } from "../types";
import { getBackdropUrl } from "../services/api";

interface HeroBannerProps {
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onDetails: (item: MediaItem) => void;
  onWatchTrailer: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem) => void;
  isInWatchlist: (item: MediaItem) => boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  items,
  onPlay,
  onDetails,
  onWatchTrailer,
  onToggleWatchlist,
  isInWatchlist
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate spotlight every 8 seconds
  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!items.length) {
    return (
      <div className="relative w-full h-[70vh] min-h-[540px] flex items-end p-8 sm:p-14 bg-obsidian-surface1 animate-pulse">
        <div className="w-1/2 h-16 bg-white/5 rounded-lg" />
      </div>
    );
  }

  const active = items[currentIndex] || items[0];
  const backdrop = getBackdropUrl(active.backdrop_path);
  const year = active.release_date ? active.release_date.slice(0, 4) : "";
  const matchScore = active.matchScore || 96;
  const rank = active.rank || currentIndex + 1;

  const certBadge = active.vote_average >= 8.2 ? { label: "18+", color: "bg-[#d4172a]" }
    : active.vote_average >= 7.5 ? { label: "15+", color: "bg-[#e4177c]" }
    : active.vote_average >= 6.8 ? { label: "12+", color: "bg-[#f2701f]" }
    : { label: "PG", color: "bg-[#f6b400]" };

  return (
    <section className="relative px-4 sm:px-10 pt-20 sm:pt-24 pb-8 select-none">
      {/* Vivarium Signature Framed Hero Stage */}
      <div className="relative w-full h-[68vh] min-h-[500px] max-h-[760px] rounded-2xl sm:rounded-3xl border border-white/[0.09] overflow-hidden flex items-end p-6 sm:p-12 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9)] bg-obsidian-surface1">
        {/* Background Backdrops with cross-fade */}
        {items.map((item, idx) => (
          <img
            key={item.id}
            src={getBackdropUrl(item.backdrop_path)}
            alt={item.title}
            className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-1000 ${
              idx === currentIndex ? "opacity-100 scale-[1.01]" : "opacity-0 scale-100 pointer-events-none"
            }`}
            style={{ transitionProperty: "opacity, transform" }}
          />
        ))}

        {/* Vivarium Layered Cinema Vignette Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/70 via-40% to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/80 via-45% to-transparent pointer-events-none" />

        {/* Hero Content */}
        <div className="relative z-10 max-w-2xl flex flex-col gap-3.5 animate-fade-in" key={active.id}>
          {/* Vivarium Meta Tags Row */}
          <div className="flex items-center flex-wrap gap-2 text-xs font-semibold">
            {/* Cert Badge */}
            <span className={`px-2 py-0.5 rounded text-[11px] font-black text-white ${certBadge.color} shadow-sm`}>
              {certBadge.label}
            </span>
            {/* Rank Badge */}
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-600/90 text-white font-bold text-[11px] uppercase tracking-wider">
              🔥 #{rank} Today
            </span>
            {/* Match */}
            <span className="text-[#4ade80] font-bold text-xs tracking-wide">
              {matchScore}% Match
            </span>
            {year && <span className="px-2 py-0.5 rounded bg-white/10 text-white/80 text-[11px]">{year}</span>}
            <span className="px-2 py-0.5 rounded bg-white/10 text-white/70 text-[10px] tracking-wider uppercase font-bold">4K UHD</span>
            <span className="px-2 py-0.5 rounded bg-white/10 text-white/70 text-[10px] tracking-wider uppercase font-bold">Dolby</span>
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-white drop-shadow-xl">
            {active.title}
          </h1>

          {/* Tagline */}
          {active.tagline && (
            <p className="text-xs sm:text-sm font-medium italic text-white/70 tracking-wide">
              “{active.tagline}”
            </p>
          )}

          {/* Synopsis */}
          <p className="text-xs sm:text-sm text-white/75 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-xl">
            {active.overview || "Stream this title in high definition with cinema audio."}
          </p>

          {/* Vivarium Buttons */}
          <div className="flex items-center flex-wrap gap-3 pt-2">
            <button
              onClick={() => onPlay(active)}
              className="viv-btn-hero cursor-pointer text-sm sm:text-base"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Watch Now</span>
            </button>

            <button
              onClick={() => onWatchTrailer(active)}
              className="viv-btn-glass cursor-pointer text-sm"
            >
              <svg className="w-4 h-4 fill-current text-white/80" viewBox="0 0 24 24">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              <span>Trailer</span>
            </button>

            <button
              onClick={() => onDetails(active)}
              className="viv-btn-glass cursor-pointer text-sm"
            >
              <svg className="w-4 h-4 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
              <span>Details</span>
            </button>

            <button
              onClick={() => onToggleWatchlist(active)}
              className="viv-round-btn cursor-pointer shadow-lg"
              title={isInWatchlist(active) ? "Remove from List" : "Add to List"}
            >
              {isInWatchlist(active) ? "✓" : "+"}
            </button>
          </div>
        </div>

        {/* Carousel Slide Indicators */}
        <div className="absolute bottom-6 right-6 z-20 hidden sm:flex items-center gap-1.5 viv-glass-pill px-3 py-1.5 rounded-full">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/30 hover:bg-white/60"
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
