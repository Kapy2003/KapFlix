import React from "react";
import { VideoTrailer } from "../types";

interface TrailerModalProps {
  trailer: VideoTrailer | null;
  title: string;
  onClose: () => void;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({ trailer, title, onClose }) => {
  if (!trailer) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8 animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl flex flex-col">
        <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-black/60 text-white/80 border border-white/10 backdrop-blur-md truncate max-w-xs">
            {title} — {trailer.name}
          </span>
          <button
            onClick={onClose}
            aria-label="Close Trailer"
            className="viv-round-btn !w-8 !h-8 text-xs cursor-pointer"
          >
            ✕
          </button>
        </div>

        <iframe
          src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0&modestbranding=1`}
          title={`${title} Trailer`}
          className="w-full h-full border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};
