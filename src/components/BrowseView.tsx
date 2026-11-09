import React, { useState, useEffect } from "react";
import { MediaItem, BrowseFilters } from "../types";
import { ApiService, SERVICES, STUDIOS, GENRES, YEARS, RATINGS } from "../services/api";
import { MediaCard } from "./MediaCard";

interface BrowseViewProps {
  onSelect: (item: MediaItem) => void;
}

export const BrowseView: React.FC<BrowseViewProps> = ({ onSelect }) => {
  const [filters, setFilters] = useState<BrowseFilters>({
    type: "movie",
    service: "",
    studio: "",
    genre: "",
    year: "",
    rating: 0,
    sortBy: "popularity.desc"
  });

  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    ApiService.discoverMedia(filters)
      .then(res => {
        if (!cancelled) setItems(res);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [filters]);

  const updateFilter = <K extends keyof BrowseFilters>(key: K, value: BrowseFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="px-4 sm:px-10 pt-24 pb-12 max-w-7xl mx-auto flex flex-col gap-8 animate-fade-in">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Explore & Discover</h1>
        <p className="text-sm text-white/50">Filter cinema by studio, network, release era, and rating threshold.</p>
      </div>

      {/* Filter Bar with Glassmorphic styling */}
      <div className="p-5 rounded-2xl bg-obsidian-surface1/80 border border-white/10 backdrop-blur-xl flex flex-col gap-4 shadow-xl">
        {/* Type toggle: Movies vs TV */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => updateFilter("type", "movie")}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              filters.type === "movie"
                ? "bg-white text-obsidian shadow-glow"
                : "bg-obsidian-surface2 text-white/60 hover:text-white border border-white/5"
            }`}
          >
            Movies
          </button>
          <button
            onClick={() => updateFilter("type", "tv")}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
              filters.type === "tv"
                ? "bg-white text-obsidian shadow-glow"
                : "bg-obsidian-surface2 text-white/60 hover:text-white border border-white/5"
            }`}
          >
            TV Series
          </button>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Services */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Service</label>
            <select
              value={filters.service || ""}
              onChange={(e) => updateFilter("service", e.target.value)}
              className="bg-obsidian-surface2 border border-white/10 text-white text-xs font-semibold px-3 py-2 rounded-xl outline-none cursor-pointer"
            >
              {SERVICES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {/* Studios */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Studio / Creator</label>
            <select
              value={filters.studio || ""}
              onChange={(e) => updateFilter("studio", e.target.value)}
              className="bg-obsidian-surface2 border border-white/10 text-white text-xs font-semibold px-3 py-2 rounded-xl outline-none cursor-pointer"
            >
              {STUDIOS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          {/* Genres */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Genre</label>
            <select
              value={filters.genre || ""}
              onChange={(e) => updateFilter("genre", e.target.value)}
              className="bg-obsidian-surface2 border border-white/10 text-white text-xs font-semibold px-3 py-2 rounded-xl outline-none cursor-pointer"
            >
              {GENRES.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
            </select>
          </div>

          {/* Year */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Release Era</label>
            <select
              value={filters.year || ""}
              onChange={(e) => updateFilter("year", e.target.value)}
              className="bg-obsidian-surface2 border border-white/10 text-white text-xs font-semibold px-3 py-2 rounded-xl outline-none cursor-pointer"
            >
              {YEARS.map(y => <option key={y.id} value={y.id}>{y.label}</option>)}
            </select>
          </div>

          {/* Rating */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-white/50 uppercase tracking-wider">Rating</label>
            <select
              value={filters.rating || 0}
              onChange={(e) => updateFilter("rating", Number(e.target.value))}
              className="bg-obsidian-surface2 border border-white/10 text-white text-xs font-semibold px-3 py-2 rounded-xl outline-none cursor-pointer"
            >
              {RATINGS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="text-center py-24 text-white/40">Discovering matching titles...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-24 text-white/40">No titles match these combined filters. Try widening your criteria.</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {items.map(item => (
            <MediaCard key={`${item.type}-${item.id}`} item={item} onClick={() => onSelect(item)} />
          ))}
        </div>
      )}
    </div>
  );
};
