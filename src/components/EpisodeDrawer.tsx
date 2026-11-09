import React, { useState, useEffect } from "react";
import { MediaItem, Season, Episode, VideoTrailer, CastMember } from "../types";
import { ApiService, getBackdropUrl, getPosterUrl, getProfileUrl } from "../services/api";

interface EpisodeDrawerProps {
  item: MediaItem | null;
  onClose: () => void;
  onPlayEpisode: (item: MediaItem, seasonNum: number, episodeNum: number) => void;
  onToggleWatchlist: (item: MediaItem) => void;
  isInWatchlist: boolean;
  onOpenTrailer: (trailer: VideoTrailer, title: string) => void;
  onSelectRecommendation: (item: MediaItem) => void;
}

export const EpisodeDrawer: React.FC<EpisodeDrawerProps> = ({
  item,
  onClose,
  onPlayEpisode,
  onToggleWatchlist,
  isInWatchlist,
  onOpenTrailer,
  onSelectRecommendation
}) => {
  const [detailedItem, setDetailedItem] = useState<MediaItem | null>(null);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [trailers, setTrailers] = useState<VideoTrailer[]>([]);
  const [recommendations, setRecommendations] = useState<MediaItem[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState<boolean>(false);

  useEffect(() => {
    if (!item) {
      setDetailedItem(null);
      return;
    }

    setDetailedItem(item);

    // Fetch rich details, cast, trailers, recommendations in one call
    ApiService.getFullDetails(item.id, item.type)
      .then(res => {
        setDetailedItem(res.item);
        setSeasons(res.seasons);
        setCast(res.cast);
        setTrailers(res.trailers);
        setRecommendations(res.recommendations);
        if (res.seasons.length > 0) {
          setSelectedSeason(res.seasons[0].season_number);
        }
      })
      .catch((err) => {
        console.error("Failed rich details", err);
      });
  }, [item]);

  useEffect(() => {
    if (!item || item.type !== "tv" || !selectedSeason) return;

    setLoadingEpisodes(true);
    ApiService.getTvSeasonEpisodes(item.id, selectedSeason)
      .then(eps => setEpisodes(eps))
      .catch(() => setEpisodes([]))
      .finally(() => setLoadingEpisodes(false));
  }, [item, selectedSeason]);

  if (!item) return null;

  const current = detailedItem || item;
  const backdrop = getBackdropUrl(current.backdrop_path);
  const year = current.release_date ? current.release_date.slice(0, 4) : "";
  const rating = current.vote_average ? current.vote_average.toFixed(1) : null;
  const matchScore = current.matchScore || 96;
  const isSeries = current.type === "tv";
  const mainTrailer = trailers[0] || null;

  // Format runtime
  const formatRuntime = (mins?: number) => {
    if (!mins) return "";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-8 bg-black/85 backdrop-blur-2xl animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] bg-obsidian-surface1 border border-white/10 rounded-2xl overflow-y-auto shadow-modal flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-30 viv-round-btn shadow-xl cursor-pointer"
        >
          ✕
        </button>

        {/* Hero Header with Panoramic Backdrop */}
        <div className="relative h-72 sm:h-96 w-full overflow-hidden flex-none">
          <img src={backdrop} alt={current.title} className="w-full h-full object-cover object-top" />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian-surface1 via-obsidian-surface1/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-obsidian-surface1 via-transparent to-transparent opacity-80" />

          {/* Quick Play overlay button right on the backdrop */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={() => onPlayEpisode(current, 1, 1)}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white text-obsidian flex items-center justify-center text-2xl sm:text-3xl font-black shadow-[0_10px_36px_rgba(255,255,255,0.25)] transition transform hover:scale-110 active:scale-95 cursor-pointer pl-1"
              title="Play Now"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 flex flex-col gap-6 -mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <span className="text-[#4ade80] font-bold text-xs">{matchScore}% Match</span>
                {year && <span className="text-white/60">{year}</span>}
                {current.runtime && <span className="text-white/60">{formatRuntime(current.runtime)}</span>}
                <span className="px-2 py-0.5 rounded bg-white/10 uppercase text-[10px] tracking-wider text-white/80">
                  {isSeries ? "Series" : "Cinema"}
                </span>
                {rating && <span className="text-amber-400 font-bold">★ {rating}</span>}
              </div>

              <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">{current.title}</h2>

              {current.tagline && (
                <p className="text-xs sm:text-sm font-medium italic text-white/70 mt-1">
                  “{current.tagline}”
                </p>
              )}
            </div>

            <div className="flex items-center flex-wrap gap-2.5">
              <button
                onClick={() => onPlayEpisode(current, 1, 1)}
                className="viv-btn-hero cursor-pointer text-sm"
              >
                <span>▶ Play {isSeries ? "S1 E1" : "Now"}</span>
              </button>

              {mainTrailer && (
                <button
                  onClick={() => onOpenTrailer(mainTrailer, current.title)}
                  className="viv-btn-glass cursor-pointer text-sm"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  <span>Trailer</span>
                </button>
              )}

              <button
                onClick={() => onToggleWatchlist(current)}
                className="viv-btn-glass cursor-pointer text-sm"
              >
                {isInWatchlist ? "✓ In List" : "+ Add to List"}
              </button>
            </div>
          </div>

          {/* Overview */}
          <p className="text-sm sm:text-base text-white/80 leading-relaxed max-w-3xl">
            {current.overview || "No synopsis available."}
          </p>

          {/* Top Cast Row */}
          {cast.length > 0 && (
            <div className="flex flex-col gap-2.5 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/50">Starring Cast</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {cast.map(c => (
                  <div key={c.id} className="flex items-center gap-2.5 p-2 rounded-xl bg-obsidian-surface2/60 border border-white/5">
                    <img
                      src={getProfileUrl(c.profile_path)}
                      alt={c.name}
                      className="w-10 h-10 rounded-full object-cover flex-none bg-obsidian-surface3"
                      loading="lazy"
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate">{c.name}</span>
                      <span className="text-[10px] text-white/40 truncate">{c.character || "Actor"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Episode Section for TV Series */}
          {isSeries && (
            <div className="mt-2 pt-6 border-t border-white/10 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Episodes</h3>
                {seasons.length > 1 && (
                  <select
                    value={selectedSeason}
                    onChange={(e) => setSelectedSeason(Number(e.target.value))}
                    className="bg-obsidian-surface2 border border-white/10 text-white text-xs font-semibold px-3 py-1.5 rounded-lg outline-none cursor-pointer"
                  >
                    {seasons.map(s => (
                      <option key={s.id} value={s.season_number}>
                        {s.name} ({s.episode_count} eps)
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {loadingEpisodes ? (
                <div className="py-12 text-center text-white/40 text-sm">Loading episodes...</div>
              ) : episodes.length === 0 ? (
                <div className="py-12 text-center text-white/40 text-sm">No episodes listed for this season.</div>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1">
                  {episodes.map(ep => {
                    const still = ep.still_path ? getBackdropUrl(ep.still_path) : getPosterUrl(current.poster_path);
                    return (
                      <div
                        key={ep.id}
                        onClick={() => onPlayEpisode(current, selectedSeason, ep.episode_number)}
                        className="group flex gap-4 p-2.5 rounded-xl bg-obsidian-surface2 hover:bg-obsidian-surface3 border border-white/5 hover:border-white/15 cursor-pointer transition items-center"
                      >
                        <div className="relative w-28 sm:w-36 aspect-still rounded-lg overflow-hidden flex-none bg-obsidian-surface3">
                          <img src={still} alt={ep.name} className="w-full h-full object-cover" loading="lazy" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white font-bold text-lg">
                            ▶
                          </div>
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
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

          {/* More Content Based on This (Recommendations) */}
          {recommendations.length > 0 && (
            <div className="mt-2 pt-6 border-t border-white/10 flex flex-col gap-3">
              <h3 className="text-lg font-bold text-white">More Like This</h3>
              <div className="flex gap-3 overflow-x-auto pb-3 scroll-smooth scrollbar-none snap-x snap-mandatory" style={{ scrollbarWidth: "none" }}>
                {recommendations.map(rec => (
                  <div
                    key={`${rec.type}-${rec.id}`}
                    onClick={() => onSelectRecommendation(rec)}
                    className="flex-none snap-start w-32 cursor-pointer group flex flex-col gap-1.5"
                  >
                    <div className="relative w-full aspect-poster rounded-lg overflow-hidden bg-obsidian-surface3 border border-white/5 group-hover:border-white/20 transition">
                      <img
                        src={getPosterUrl(rec.poster_path)}
                        alt={rec.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <span className="text-xs font-semibold text-white/80 truncate group-hover:text-white" title={rec.title}>
                      {rec.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
