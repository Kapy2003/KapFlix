export type MediaType = "movie" | "tv";

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface MediaItem {
  id: number;
  type: MediaType;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  tagline?: string;
  runtime?: number;
  genres?: Array<string | { id: number; name: string }>;
  adult?: boolean;
  rank?: number;
  matchScore?: number;
  cast?: CastMember[];
  season?: number;
  episode?: number;
  totalEpisodes?: number;
}

export interface Episode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  runtime?: number;
  air_date?: string;
}

export interface Season {
  id: number;
  season_number: number;
  name: string;
  episode_count: number;
}

export interface VideoTrailer {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
}

export type StreamServer = "vidlink" | "vidsrc" | "embedsu" | "multiembed";

export interface StreamParams {
  type: MediaType;
  id: number;
  season?: number;
  episode?: number;
  server?: StreamServer;
}

export interface WatchHistoryItem {
  id: number;
  type: MediaType;
  title: string;
  season?: number;
  episode?: number;
  poster_path: string | null;
  backdrop_path: string | null;
  updatedAt: number;
}

export interface BrowseFilters {
  type: MediaType;
  service?: string;
  studio?: string;
  genre?: string;
  year?: string;
  rating?: number;
  sortBy?: string;
}
