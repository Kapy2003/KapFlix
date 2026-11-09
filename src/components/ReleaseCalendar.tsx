import React, { useState, useEffect } from "react";
import { MediaItem } from "../types";
import { ApiService, getBackdropUrl } from "../services/api";
import { MediaCard } from "./MediaCard";

interface ReleaseCalendarProps {
  onSelect: (item: MediaItem) => void;
}

export const ReleaseCalendar: React.FC<ReleaseCalendarProps> = ({ onSelect }) => {
  const [data, setData] = useState<{ movies: MediaItem[]; tvs: MediaItem[] }>({ movies: [], tvs: [] });
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "movie" | "tv">("all");

  useEffect(() => {
    let cancelled = false;
    ApiService.getUpcomingReleases()
      .then(res => {
        if (!cancelled) setData(res);
      })
      .catch(() => {
        if (!cancelled) setData({ movies: [], tvs: [] });
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const allItems = [
    ...(filterType === "tv" ? [] : data.movies),
    ...(filterType === "movie" ? [] : data.tvs)
  ].sort((a, b) => {
    const da = a.release_date || "9999-99-99";
    const db = b.release_date || "9999-99-99";
    return da.localeCompare(db);
  });

  return (
    <div className="px-4 sm:px-10 pt-24 pb-12 max-w-7xl mx-auto flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Global Release Calendar</h1>
          <p className="text-sm text-white/50">Upcoming theatrical debuts and television air dates worldwide.</p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 bg-obsidian-surface1 border border-white/10 p-1 rounded-full">
          <button
            onClick={() => setFilterType("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              filterType === "all" ? "bg-white text-obsidian" : "text-white/60 hover:text-white"
            }`}
          >
            All Releases
          </button>
          <button
            onClick={() => setFilterType("movie")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              filterType === "movie" ? "bg-white text-obsidian" : "text-white/60 hover:text-white"
            }`}
          >
            Theatrical Movies
          </button>
          <button
            onClick={() => setFilterType("tv")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
              filterType === "tv" ? "bg-white text-obsidian" : "text-white/60 hover:text-white"
            }`}
          >
            TV Air Dates
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-28 text-white/40">Gathering global release calendars...</div>
      ) : allItems.length === 0 ? (
        <div className="text-center py-28 text-white/40">No upcoming release dates cataloged.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {allItems.map(item => {
            const dateStr = item.release_date || "TBA";
            let formattedDate = dateStr;
            try {
              if (item.release_date) {
                const [y, m, d] = item.release_date.split("-");
                const date = new Date(Number(y), Number(m) - 1, Number(d));
                formattedDate = date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              }
            } catch {}

            return (
              <div
                key={`${item.type}-${item.id}`}
                onClick={() => onSelect(item)}
                className="group p-3.5 rounded-2xl bg-obsidian-surface1/70 hover:bg-obsidian-surface2 border border-white/5 hover:border-white/20 transition-all flex gap-4 cursor-pointer select-none backdrop-blur-md"
              >
                <div className="relative w-24 sm:w-28 aspect-poster rounded-xl overflow-hidden bg-obsidian-surface3 flex-none">
                  <img
                    src={getBackdropUrl(item.poster_path)}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-obsidian/80 text-[10px] font-extrabold uppercase text-white/80">
                    {item.type}
                  </span>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                  <div className="flex flex-col gap-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cert-pg bg-cert-pg/10 px-2.5 py-0.5 rounded-full w-fit">
                      📅 {formattedDate}
                    </span>
                    <h3 className="text-base font-extrabold text-white truncate group-hover:text-white" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">
                      {item.overview || "Premiere release announcement."}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs font-semibold text-white/40">
                      {item.vote_average ? `★ ${item.vote_average.toFixed(1)}` : "Anticipated"}
                    </span>
                    <span className="text-xs font-bold text-white/80 group-hover:text-white flex items-center gap-1">
                      Details ➔
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
