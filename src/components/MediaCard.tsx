import React from "react";
import { MediaItem } from "../types";
import { getBackdropUrl, getPosterUrl } from "../services/api";

interface MediaCardProps {
  item: MediaItem;
  onClick: () => void;
  progressPercent?: number;
  showRank?: boolean;
  aspect?: "landscape" | "portrait";
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onClick,
  progressPercent,
  showRank,
  aspect = "landscape"
}) => {
  const isLandscape = aspect === "landscape";
  const imageUrl = isLandscape
    ? (getBackdropUrl(item.backdrop_path) || getPosterUrl(item.poster_path))
    : (getPosterUrl(item.poster_path) || getBackdropUrl(item.backdrop_path));
  
  const year = item.release_date ? item.release_date.slice(0, 4) : "";
  const matchScore = item.matchScore || Math.min(99, Math.round((item.vote_average || 7.5) * 10 + 4));

  return (
    <div
      onClick={onClick}
      className="group relative cursor-pointer select-none focus:outline-none flex flex-col gap-1.5"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      {/* Vivarium Card Frame */}
      <div
        className={`relative w-full rounded-xl overflow-hidden bg-obsidian-surface1 border border-white/[0.08] group-hover:border-white/25 transition-all duration-300 shadow-[0_4px_14px_-6px_rgba(0,0,0,0.5)] group-hover:shadow-[0_14px_30px_-16px_rgba(0,0,0,0.85)] ${
          isLandscape ? "aspect-video" : "aspect-poster"
        }`}
      >
        <img
          src={imageUrl}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
        />

        {/* Vivarium Scrim Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 via-50% to-transparent pointer-events-none" />

        {/* Top 10 Stylized Rank Number */}
        {showRank && item.rank && item.rank <= 10 && (
          <div className="absolute bottom-2 left-3 z-10 font-black text-4xl sm:text-5xl text-white/30 tracking-tighter drop-shadow-lg select-none group-hover:text-white/50 transition-colors">
            #{item.rank}
          </div>
        )}

        {/* Floating Top-Right Hover Action Buttons (Vivarium Signature) */}
        <div className="absolute top-2.5 right-2.5 z-20 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0 flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-white text-obsidian flex items-center justify-center font-bold text-xs shadow-xl transition-transform hover:scale-110">
            ▶
          </div>
        </div>

        {/* Overlaid Title & Meta for Landscape Cards (Vivarium Style) */}
        {isLandscape ? (
          <div className="absolute bottom-2.5 left-3 right-3 z-10 flex flex-col pointer-events-none">
            <span className="text-sm font-bold text-white drop-shadow truncate group-hover:text-amber-200/90 transition-colors">
              {item.title}
            </span>
            <div className="flex items-center gap-2 text-[11px] font-semibold text-white/70 drop-shadow mt-0.5">
              <span className="text-[#4ade80]">{matchScore}% Match</span>
              {year && <span>{year}</span>}
              {item.vote_average > 0 && <span className="text-amber-300">★ {item.vote_average.toFixed(1)}</span>}
              {item.season && item.episode && (
                <span className="text-white/80">• S{item.season} E{item.episode}</span>
              )}
            </div>
          </div>
        ) : (
          <div className="absolute bottom-2 left-2.5 right-2.5 z-10 flex items-center justify-between text-[11px] font-bold text-white/80 pointer-events-none">
            <span className="text-[#4ade80]">{matchScore}% Match</span>
            {year && <span>{year}</span>}
          </div>
        )}

        {/* Continue watching progress */}
        {progressPercent !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-20">
            <div className="h-full bg-red-600" style={{ width: `${progressPercent}%` }} />
          </div>
        )}
      </div>

      {/* Info Underneath for Portrait Cards */}
      {!isLandscape && (
        <div className="flex flex-col gap-0.5 px-0.5">
          <span className="text-xs sm:text-sm font-bold text-white/90 truncate group-hover:text-white transition-colors" title={item.title}>
            {item.title}
          </span>
          <div className="flex items-center gap-2 text-[11px] text-white/50 font-medium">
            {year && <span>{year}</span>}
            {item.vote_average > 0 && <span className="text-amber-400">★ {item.vote_average.toFixed(1)}</span>}
          </div>
        </div>
      )}
    </div>
  );
};
