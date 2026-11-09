import React, { useState, useEffect, useRef } from "react";
import { MediaItem } from "../types";
import { ApiService } from "../services/api";
import { MediaCard } from "./MediaCard";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSelect }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(() => {
      ApiService.searchMulti(query)
        .then(res => setResults(res))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 p-6 sm:p-12 bg-obsidian/90 backdrop-blur-2xl flex flex-col items-center animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-2xl relative">
        <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search movies, TV series, actors..."
          className="w-full viv-glass-pill text-white placeholder-white/40 text-base sm:text-lg px-14 py-3.5 rounded-full outline-none shadow-2xl transition"
        />

        <button
          onClick={onClose}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 viv-round-btn !w-8 !h-8 text-xs cursor-pointer"
        >
          ✕
        </button>
      </div>

      <div className="w-full max-w-5xl mt-8 flex-1 overflow-y-auto">
        {loading ? (
          <div className="text-center py-20 text-white/40">Searching catalog...</div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
            {results.map(item => (
              <MediaCard
                key={`${item.type}-${item.id}`}
                item={item}
                aspect="landscape"
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
              />
            ))}
          </div>
        ) : query ? (
          <div className="text-center py-20 text-white/40">No titles found for "{query}".</div>
        ) : (
          <div className="text-center py-20 text-white/30 text-sm">
            Start typing to instantly search movies and television series.
          </div>
        )}
      </div>
    </div>
  );
};
