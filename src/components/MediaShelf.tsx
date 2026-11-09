import React, { useRef } from "react";
import { MediaItem } from "../types";
import { MediaCard } from "./MediaCard";

interface MediaShelfProps {
  title: string;
  subtitle?: string;
  items: MediaItem[];
  onSelect: (item: MediaItem) => void;
}

export const MediaShelf: React.FC<MediaShelfProps> = ({ title, subtitle, items, onSelect }) => {
  const trackRef = useRef<HTMLDivElement>(null);

  if (!items.length) return null;

  const scroll = (direction: "left" | "right") => {
    if (!trackRef.current) return;
    const amount = trackRef.current.clientWidth * 0.75;
    trackRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth"
    });
  };

  return (
    <section className="relative my-8 px-6 sm:px-14">
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">{title}</h2>
          {subtitle && <p className="text-xs sm:text-sm font-medium text-white/50">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="w-8 h-8 rounded-full bg-obsidian-surface2 hover:bg-obsidian-surface3 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            ◀
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="w-8 h-8 rounded-full bg-obsidian-surface2 hover:bg-obsidian-surface3 border border-white/10 text-white/70 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            ▶
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map(item => (
          <div
            key={`${item.type}-${item.id}`}
            className="flex-none snap-start w-[calc((100%-16px)/2)] sm:w-[calc((100%-32px)/3)] md:w-[calc((100%-48px)/4)] lg:w-[calc((100%-64px)/5)] xl:w-[calc((100%-80px)/6)] min-w-[130px]"
          >
            <MediaCard item={item} onClick={() => onSelect(item)} />
          </div>
        ))}
      </div>
    </section>
  );
};
