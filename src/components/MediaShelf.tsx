import React, { useRef } from "react";
import { MediaItem } from "../types";
import { MediaCard } from "./MediaCard";

interface MediaShelfProps {
  title: string;
  subtitle?: string;
  items: MediaItem[];
  showRank?: boolean;
  aspect?: "landscape" | "portrait";
  onSelect: (item: MediaItem) => void;
}

export const MediaShelf: React.FC<MediaShelfProps> = ({
  title,
  subtitle,
  items,
  showRank,
  aspect = showRank ? "portrait" : "landscape",
  onSelect
}) => {
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

  const itemWidth = aspect === "landscape"
    ? "w-[82%] sm:w-[48%] md:w-[32%] lg:w-[24%] xl:w-[19.2%]"
    : "w-[44%] sm:w-[31%] md:w-[23%] lg:w-[18%] xl:w-[15%]";

  return (
    <section className="relative my-7 px-4 sm:px-10">
      <div className="flex items-end justify-between mb-3.5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">{title}</h2>
          {subtitle && <p className="text-xs text-white/50 font-normal mt-0.5">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => scroll("left")}
            aria-label="Scroll left"
            className="viv-round-btn !w-8 !h-8 text-xs cursor-pointer"
          >
            ◀
          </button>
          <button
            onClick={() => scroll("right")}
            aria-label="Scroll right"
            className="viv-round-btn !w-8 !h-8 text-xs cursor-pointer"
          >
            ▶
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-3.5 overflow-x-auto pb-4 scroll-smooth scrollbar-none snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map(item => (
          <div
            key={`${item.type}-${item.id}`}
            className={`flex-none snap-start ${itemWidth} min-w-[140px]`}
          >
            <MediaCard
              item={item}
              onClick={() => onSelect(item)}
              showRank={showRank}
              aspect={aspect}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
