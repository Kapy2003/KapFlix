import { StreamParams, StreamServer } from "../types";

export const SERVERS: Record<StreamServer, string> = {
  vidlink: "Server 1 (VidLink)",
  vidsrc: "Server 2 (VidSrc)",
  embedsu: "Server 3 (EmbedSu)",
  multiembed: "Server 4 (MultiEmbed)"
};

export function getStreamUrl({ type, id, season = 1, episode = 1, server = "vidlink" }: StreamParams): string {
  const isMovie = type === "movie";
  const s = Math.max(1, Number(season) || 1);
  const e = Math.max(1, Number(episode) || 1);

  switch (server) {
    case "vidsrc":
      return isMovie
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${s}/${e}`;
    case "embedsu":
      return isMovie
        ? `https://embed.su/embed/movie/${id}`
        : `https://embed.su/embed/tv/${id}/${s}/${e}`;
    case "multiembed":
      return isMovie
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}`;
    case "vidlink":
    default:
      return isMovie
        ? `https://vidlink.pro/movie/${id}`
        : `https://vidlink.pro/tv/${id}/${s}/${e}`;
  }
}
