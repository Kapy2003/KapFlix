import React from "react";
import { MediaItem } from "../types";
import { getBackdropUrl } from "../services/api";

interface HeroBannerProps {
  item: MediaItem | null;
  onPlay: (item: MediaItem) => void;
  onDetails: (item: MediaItem) => void;
  onToggleWatchlist: (item: MediaItem) => void;
  isInWatchlist: boolean;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  item,
  onPlay,
  onDetails,
  onToggleWatchlist,
  isInWatchlist
}) => {
  if (!item) {
    return (
      <div className="relative w-full h-[65vh] min-h-[500px] flex items-end p-8 sm:p-14 bg-obsidian-surface1 animate-pulse">
        <div className="w-1/2 h-16 bg-white/5 rounded-lg" />
      </div>
    );
  }

  const backdrop = getBackdropUrl(item.backdrop_path);
  const year = item.release_date ? item.release_date.slice(0, 4) : "";
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const cert = item.adult ? "18+" : (item.vote_average >= 8 ? "16+" : "12+");

  return (
    <section className="relative w-full h-[70vh] min-h-[520px] max-h-[760px] flex items-end px-6 sm:px-14 pb-14 overflow-hidden">
      {/* Backdrop Image */}
      <img
        src={backdrop}
        alt={item.title}
        className="absolute inset-0 w-full h-full object-cover object-top filter brightness-90 transition-transform duration-1000 scale-[1.01]"
      />

      {/* Layered Masks / Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-obsidian via-obsidian/85 via-40% to-transparent" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-2xl flex flex-col gap-4">
        <div className="flex items-center flex-wrap gap-2.5 text-xs font-bold tracking-wide">
          <span className={`px-2 py-0.5 rounded border ${
            cert === "18+" ? "border-cert-18 text-cert-18" :
            cert === "16+" ? "border-cert-15 text-cert-15" : "border-cert-12 text-cert-12"
          }`}>
            {cert}
          </span>
          {year && <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80">{year}</span>}
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white/80 uppercase">Ultra HD</span>
          {rating && (
            <span className="flex items-center gap-1 text-star">
              ★ {rating}
            </span>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05] text-white drop-shadow-md">
          {item.title}
        </h1>

        <p className="text-sm sm:text-base text-white/80 line-clamp-3 leading-relaxed drop-shadow">
          {item.overview || "High definition streaming with multi-server playback."}
        </p>

        <div className="flex items-center flex-wrap gap-3 pt-2">
          <button
            onClick={() => onPlay(item)}
            className="inline-flex items-center gap-2 bg-white hover:bg-white/90 text-obsidian font-bold text-sm sm:text-base px-6 py-3 rounded-full shadow-glow transition-all transform hover:scale-[1.02] cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span>Watch Now</span>
          </button>

          <button
            onClick={() => onDetails(item)}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base px-5 py-3 rounded-full border border-white/10 backdrop-blur-md transition cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <span>Details & Episodes</span>
          </button>

          <button
            onClick={() => onToggleWatchlist(item)}
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm sm:text-base px-4 py-3 rounded-full border border-white/10 backdrop-blur-md transition cursor-pointer"
            title={isInWatchlist ? "Remove from List" : "Add to List"}
          >
            {isInWatchlist ? "✓ In List" : "+ List"}
          </button>
        </div>
      </div>
    </section>
  );
};
