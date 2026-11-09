import React, { useState, useEffect } from "react";
import { MediaItem, Season, Episode } from "../types";
import { ApiService, getBackdropUrl, getPosterUrl } from "../services/api";

interface EpisodeDrawerProps {
  item: MediaItem | null;
  onClose: () => void;
  onPlayEpisode: (item: MediaItem, seasonNum: number, episodeNum: number) => void;
  onToggleWatchlist: (item: MediaItem) => void;
  isInWatchlist: boolean;
}

export const EpisodeDrawer: React.FC<EpisodeDrawerProps> = ({
  item,
  onClose,
  onPlayEpisode,
  onToggleWatchlist,
  isInWatchlist
}) => {
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!item) return;

    if (item.type === "tv" || item.type === "anime") {
      setLoading(true);
      ApiService.getTvDetails(item.id)
        .then(({ seasons: sList }) => {
          setSeasons(sList);
          if (sList.length > 0) {
            setSelectedSeason(sList[0].season_number);
          }
        })
        .catch(() => setSeasons([]))
        .finally(() => setLoading(false));
    } else {
      setSeasons([]);
      setEpisodes([]);
    }
  }, [item]);

  useEffect(() => {
    if (!item || (item.type !== "tv" && item.type !== "anime") || !selectedSeason) return;

    setLoading(true);
    ApiService.getTvSeasonEpisodes(item.id, selectedSeason)
      .then(eps => setEpisodes(eps))
      .catch(() => setEpisodes([]))
      .finally(() => setLoading(false));
  }, [item, selectedSeason]);

  if (!item) return null;

  const backdrop = getBackdropUrl(item.backdrop_path);
  const year = item.release_date ? item.release_date.slice(0, 4) : "";
  const rating = item.vote_average ? item.vote_average.toFixed(1) : null;
  const isSeries = item.type === "tv" || item.type === "anime";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-obsidian-surface1 border border-white/10 rounded-2xl overflow-y-auto shadow-modal flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-obsidian/80 hover:bg-obsidian border border-white/10 text-white flex items-center justify-center transition cursor-pointer"
        >
          ✕
        </button>

        {/* Hero Header */}
        <div className="relative h-64 sm:h-80 w-full overflow-hidden flex-none">
          <img src={backdrop} alt={item.title} className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian-surface1 via-obsidian-surface1/60 to-transparent" />
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 flex flex-col gap-6 -mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white">{item.title}</h2>
              <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-white/60">
                {year && <span>{year}</span>}
                {rating && <span className="text-star">★ {rating}</span>}
                <span className="px-2 py-0.5 rounded bg-white/10 uppercase">{item.type}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onPlayEpisode(item, 1, 1)}
                className="bg-white hover:bg-white/90 text-obsidian font-bold px-6 py-2.5 rounded-full shadow-glow transition cursor-pointer"
              >
                ▶ Play
              </button>
              <button
                onClick={() => onToggleWatchlist(item)}
                className="bg-white/10 hover:bg-white/20 text-white font-semibold px-4 py-2.5 rounded-full border border-white/10 transition cursor-pointer"
              >
                {isInWatchlist ? "✓ In List" : "+ Add to List"}
              </button>
            </div>
          </div>

          <p className="text-sm sm:text-base text-white/70 leading-relaxed">
            {item.overview || "No synopsis available."}
          </p>

          {/* Episode Section for TV & Anime */}
          {isSeries && (
            <div className="mt-4 pt-6 border-t border-white/10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Episodes</h3>
                {seasons.length > 1 && (
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    className="bg-obsidian-surface2 border border-white/10 text-white text-sm font-semibold px-3 py-1.5 rounded-lg outline-none cursor-pointer"
                  >
                    {seasons.map(s => (
                      <option key={s.id} value={s.season_number}>
                        {s.name} ({s.episode_count} eps)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {loading ? (
                <div className="py-12 text-center text-white/40 text-sm">Loading episodes...</div>
              ) : episodes.length === 0 ? (
                <div className="py-12 text-center text-white/40 text-sm">No episodes listed for this season.</div>
              ) : (
                <div className="flex flex-col gap-3 max-h-96 overflow-y-auto pr-1">
                  {episodes.map(ep => {
                    const still = ep.still_path ? getBackdropUrl(ep.still_path) : getPosterUrl(item.poster_path);
                    return (
                      <div
                        key={ep.id}
                        onClick={() => onPlayEpisode(item, selectedSeason, ep.episode_number)}
                        className="group flex gap-4 p-3 rounded-xl bg-obsidian-surface2 hover:bg-obsidian-surface3 border border-white/5 hover:border-white/15 cursor-pointer transition items-center"
                      >
                        <div className="relative w-32 sm:w-40 aspect-still rounded-lg overflow-hidden flex-none bg-obsidian-surface3">
                          <img src={still} alt={ep.name} className="w-full h-full object-cover" loading="lazy" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white font-bold text-lg">
                            ▶
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="text-sm font-bold text-white truncate">
                              {ep.episode_number}. {ep.name}
                            </h4>
                            {ep.runtime && (
                              <span className="text-xs text-white/40 flex-none">{ep.runtime}m</span>
                            )}
                          </div>
                          <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                            {ep.overview || `Episode ${ep.episode_number}`}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
