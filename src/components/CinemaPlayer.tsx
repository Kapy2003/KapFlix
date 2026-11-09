import React, { useState } from "react";
import { MediaItem, StreamServer } from "../types";
import { SERVERS, getStreamUrl } from "../services/streams";

interface CinemaPlayerProps {
  item: MediaItem;
  season?: number;
  episode?: number;
  totalEpisodes?: number;
  onClose: () => void;
  onNavigateEpisode?: (delta: number) => void;
}

export const CinemaPlayer: React.FC<CinemaPlayerProps> = ({
  item,
  season = 1,
  episode = 1,
  totalEpisodes,
  onClose,
  onNavigateEpisode
}) => {
  const [server, setServer] = useState<StreamServer>("vidlink");

  const streamUrl = getStreamUrl({
    type: item.type,
    id: item.id,
    season,
    episode,
    server
  });

  const isSeries = item.type === "tv" || item.type === "anime";

  return (
    <div className="fixed inset-0 z-50 bg-[#040404] flex flex-col animate-fade-in">
      {/* Top Bar */}
      <div className="h-14 px-4 sm:px-6 flex items-center justify-between bg-obsidian-surface1 border-b border-white/10 z-10 flex-none">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-sm sm:text-base font-bold text-white truncate max-w-xs sm:max-w-md">
            {item.title}
          </span>
          {isSeries && (
            <span className="px-2 py-0.5 rounded bg-white/10 text-xs font-semibold text-white/80">
              S{season} : E{episode}
            </span>
          )}
        </div>

        {/* Server Selector Tabs */}
        <div className="hidden md:flex items-center gap-1.5">
          {(Object.keys(SERVERS) as StreamServer[]).map(sKey => (
            <button
              key={sKey}
              onClick={() => setServer(sKey)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer ${
                server === sKey
                  ? "bg-white text-obsidian"
                  : "bg-obsidian-surface2 hover:bg-obsidian-surface3 border border-white/5 text-white/60 hover:text-white"
              }`}
            >
              {SERVERS[sKey]}
            </button>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {isSeries && onNavigateEpisode && (
            <>
              <button
                onClick={() => onNavigateEpisode(-1)}
                disabled={episode <= 1}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold text-white transition cursor-pointer"
              >
                ⏮ Prev
              </button>
              <button
                onClick={() => onNavigateEpisode(1)}
                disabled={totalEpisodes !== undefined && episode >= totalEpisodes}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:pointer-events-none text-xs font-semibold text-white transition cursor-pointer"
              >
                Next ⏭
              </button>
            </>
          )}

          <button
            onClick={onClose}
            aria-label="Close Player"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Video Iframe Container */}
      <div className="relative flex-1 w-full h-full bg-black flex items-center justify-center">
        <iframe
          src={streamUrl}
          className="w-full h-full border-none bg-black"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </div>
  );
};
