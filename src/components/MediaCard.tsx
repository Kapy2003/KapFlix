import React from "react";
import { MediaItem } from "../types";
import { getPosterUrl } from "../services/api";

interface MediaCardProps {
  item: MediaItem;
  onClick: () => void;
  progressPercent?: number;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item, onClick, progressPercent }) => {
  const poster = getPosterUrl(item.poster_path);
  const year = item.release_date ? item.release_date.slice(0, 4) : "";
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const isTv = item.type === "tv";
  const isAnime = item.type === "anime";

  return (
    <div
      onClick={onClick}
      className="group flex flex-col gap-2 cursor-pointer select-none transition-transform duration-200 hover:-translate-y-1.5 focus:outline-none"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
    >
      <div className="relative w-full aspect-poster rounded-xl overflow-hidden bg-obsidian-surface2 border border-white/5 group-hover:border-white/20 shadow-poster transition-all">
        <img
          src={poster}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Media type badge */}
        <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-obsidian/80 backdrop-blur-sm border border-white/10 text-[10px] font-extrabold tracking-wider text-white/80 uppercase">
          {isTv ? "TV" : isAnime ? "ANIME" : "MOVIE"}
        </span>

        {/* Rating badge */}
        {rating && (
          <span className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded bg-obsidian/80 backdrop-blur-sm border border-white/10 text-[11px] font-bold text-star">
            ★ {rating}
          </span>
        )}

        {/* Continue watching progress */}
        {progressPercent !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-brand" style={{ width: `${progressPercent}%` }} />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-semibold text-white/95 truncate group-hover:text-white" title={item.title}>
          {item.title}
        </span>
        <div className="flex items-center gap-1.5 text-xs text-white/40 font-medium">
          {year && <span>{year}</span>}
          {item.season && item.episode && (
            <span>• S{item.season} E{item.episode}</span>
          )}
        </div>
      </div>
    </div>
  );
};
