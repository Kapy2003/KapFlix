import { MediaItem, Season, Episode, VideoTrailer, BrowseFilters, MediaType, CastMember } from "../types";

// shortcut: static client demo key, upgrade to server env proxy if rate-limited
const TMDB_KEY = "4e44d9029b1270a757cddc766a1bcb63";
const TMDB_BASE = "https://api.themoviedb.org/3";
export const TMDB_IMG = "https://image.tmdb.org/t/p";

export const SERVICES = [
  { id: "", label: "All Services" },
  { id: "213", label: "Netflix" },
  { id: "49", label: "HBO / Max" },
  { id: "2739", label: "Disney+" },
  { id: "2552", label: "Apple TV+" },
  { id: "1024", label: "Amazon Prime" }
];

export const STUDIOS = [
  { id: "", label: "All Studios" },
  { id: "41077", label: "A24" },
  { id: "174", label: "Warner Bros" },
  { id: "33", label: "Universal" },
  { id: "420", label: "Marvel Studios" },
  { id: "4", label: "Paramount" },
  { id: "5", label: "Sony Pictures" }
];

export const GENRES = [
  { id: "", label: "All Genres" },
  { id: "28", label: "Action" },
  { id: "878", label: "Sci-Fi" },
  { id: "18", label: "Drama" },
  { id: "35", label: "Comedy" },
  { id: "27", label: "Horror" },
  { id: "53", label: "Thriller" },
  { id: "16", label: "Animation" },
  { id: "9648", label: "Mystery" },
  { id: "10749", label: "Romance" }
];

export const YEARS = [
  { id: "", label: "All Years" },
  { id: "2026", label: "2026" },
  { id: "2025", label: "2025" },
  { id: "2024", label: "2024" },
  { id: "2023", label: "2023" },
  { id: "2020", label: "2020s" },
  { id: "2010", label: "2010s" },
  { id: "2000", label: "2000s" }
];

export const RATINGS = [
  { id: 0, label: "Any Rating" },
  { id: 8, label: "★ 8.0+ Masterpieces" },
  { id: 7, label: "★ 7.0+ High Quality" },
  { id: 6, label: "★ 6.0+ Entertaining" }
];

export function getPosterUrl(path: string | null): string {
  if (!path) return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&q=80";
  if (path.startsWith("http")) return path;
  return `${TMDB_IMG}/w500${path}`;
}

export function getBackdropUrl(path: string | null): string {
  if (!path) return "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=1280&q=80";
  if (path.startsWith("http")) return path;
  return `${TMDB_IMG}/original${path}`;
}

export function getProfileUrl(path: string | null): string {
  if (!path) return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80";
  return `${TMDB_IMG}/w185${path}`;
}

function mapTmdbItem(item: any, defaultType: MediaType, rank?: number): MediaItem {
  const vote = item.vote_average || 0;
  // Calculate a magnetic match score (e.g. 96% Match)
  const matchScore = vote > 0 ? Math.min(99, Math.max(76, Math.round(vote * 10 + (item.popularity > 50 ? 5 : 2)))) : 85;

  return {
    id: item.id,
    type: item.media_type || defaultType,
    title: item.title || item.name || item.original_title || item.original_name || "Untitled",
    overview: item.overview || "",
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    vote_average: vote,
    release_date: item.release_date || item.first_air_date || "",
    adult: item.adult,
    genres: item.genres,
    rank,
    matchScore,
    tagline: item.tagline,
    runtime: item.runtime
  };
}

export const ApiService = {
  async tmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const query = new URLSearchParams({ api_key: TMDB_KEY, ...params }).toString();
    const res = await fetch(`${TMDB_BASE}${endpoint}?${query}`);
    if (!res.ok) throw new Error(`TMDB HTTP ${res.status}`);
    return res.json();
  },

  async getSpotlightMovies(): Promise<MediaItem[]> {
    const data = await this.tmdb<{ results: any[] }>("/trending/movie/day");
    return (data.results || []).slice(0, 5).map((m, idx) => mapTmdbItem(m, "movie", idx + 1));
  },

  async getTrendingMovies(): Promise<MediaItem[]> {
    const data = await this.tmdb<{ results: any[] }>("/trending/movie/day");
    return (data.results || []).map((m, idx) => mapTmdbItem(m, "movie", idx + 1));
  },

  async getPopularTv(): Promise<MediaItem[]> {
    const data = await this.tmdb<{ results: any[] }>("/trending/tv/day");
    return (data.results || []).map((t, idx) => mapTmdbItem(t, "tv", idx + 1));
  },

  async getTopRatedMovies(): Promise<MediaItem[]> {
    const data = await this.tmdb<{ results: any[] }>("/movie/top_rated");
    return (data.results || []).map(m => mapTmdbItem(m, "movie"));
  },

  async getHighOctane(): Promise<MediaItem[]> {
    const data = await this.tmdb<{ results: any[] }>("/discover/movie", {
      with_genres: "28,53",
      sort_by: "popularity.desc"
    });
    return (data.results || []).map(m => mapTmdbItem(m, "movie"));
  },

  async getMindBending(): Promise<MediaItem[]> {
    const data = await this.tmdb<{ results: any[] }>("/discover/movie", {
      with_genres: "878,9648",
      sort_by: "popularity.desc"
    });
    return (data.results || []).map(m => mapTmdbItem(m, "movie"));
  },

  async getRandomGem(): Promise<MediaItem> {
    const data = await this.tmdb<{ results: any[] }>("/movie/top_rated", {
      page: String(Math.floor(Math.random() * 4) + 1)
    });
    const pool = data.results || [];
    const pick = pool[Math.floor(Math.random() * pool.length)];
    return mapTmdbItem(pick, "movie");
  },

  async searchMulti(query: string): Promise<MediaItem[]> {
    if (!query.trim()) return [];
    const data = await this.tmdb<{ results: any[] }>("/search/multi", { query: query.trim() });
    return (data.results || [])
      .filter(item => item.media_type === "movie" || item.media_type === "tv")
      .map(item => mapTmdbItem(item, item.media_type));
  },

  async getFullDetails(id: number, type: MediaType): Promise<{
    item: MediaItem;
    seasons: Season[];
    cast: CastMember[];
    trailers: VideoTrailer[];
    recommendations: MediaItem[];
  }> {
    const data = await this.tmdb<any>(`/${type}/${id}`, {
      append_to_response: "credits,videos,recommendations"
    });

    const item = mapTmdbItem(data, type);
    item.tagline = data.tagline || "";
    item.runtime = data.runtime || (data.episode_run_time ? data.episode_run_time[0] : undefined);
    item.genres = data.genres || [];

    const seasons: Season[] = (data.seasons || [])
      .filter((s: any) => s.season_number > 0)
      .map((s: any) => ({
        id: s.id,
        season_number: s.season_number,
        name: s.name,
        episode_count: s.episode_count
      }));

    const cast: CastMember[] = (data.credits?.cast || []).slice(0, 6).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character || "",
      profile_path: c.profile_path
    }));

    const trailers: VideoTrailer[] = (data.videos?.results || [])
      .filter((v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"))
      .map((v: any) => ({
        id: v.id,
        key: v.key,
        name: v.name,
        site: v.site,
        type: v.type
      }));

    const recommendations: MediaItem[] = (data.recommendations?.results || [])
      .slice(0, 12)
      .map((r: any) => mapTmdbItem(r, type));

    return { item, seasons, cast, trailers, recommendations };
  },

  async getTvSeasonEpisodes(tvId: number, seasonNumber: number): Promise<Episode[]> {
    const data = await this.tmdb<{ episodes: any[] }>(`/tv/${tvId}/season/${seasonNumber}`);
    return (data.episodes || []).map(ep => ({
      id: ep.id,
      episode_number: ep.episode_number,
      name: ep.name || `Episode ${ep.episode_number}`,
      overview: ep.overview || "",
      still_path: ep.still_path,
      runtime: ep.runtime,
      air_date: ep.air_date
    }));
  },

  async getTrailers(id: number, type: MediaType): Promise<VideoTrailer[]> {
    try {
      const data = await this.tmdb<{ results: any[] }>(`/${type}/${id}/videos`);
      return (data.results || [])
        .filter(v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"))
        .map(v => ({
          id: v.id,
          key: v.key,
          name: v.name,
          site: v.site,
          type: v.type
        }));
    } catch {
      return [];
    }
  },

  async discoverMedia(filters: BrowseFilters): Promise<MediaItem[]> {
    const params: Record<string, string> = {
      sort_by: filters.sortBy || "popularity.desc"
    };

    if (filters.genre) params.with_genres = filters.genre;
    if (filters.rating && filters.rating > 0) {
      params["vote_average.gte"] = String(filters.rating);
      params["vote_count.gte"] = "50";
    }

    if (filters.type === "movie") {
      if (filters.year) params.primary_release_year = filters.year;
      if (filters.studio) params.with_companies = filters.studio;
      if (filters.service) params.with_networks = filters.service;
      const data = await this.tmdb<{ results: any[] }>("/discover/movie", params);
      return (data.results || []).map(m => mapTmdbItem(m, "movie"));
    } else {
      if (filters.year) params.first_air_date_year = filters.year;
      if (filters.service) params.with_networks = filters.service;
      if (filters.studio) params.with_companies = filters.studio;
      const data = await this.tmdb<{ results: any[] }>("/discover/tv", params);
      return (data.results || []).map(t => mapTmdbItem(t, "tv"));
    }
  },

  async getUpcomingReleases(): Promise<{ movies: MediaItem[]; tvs: MediaItem[] }> {
    const [m, t] = await Promise.all([
      this.tmdb<{ results: any[] }>("/movie/upcoming"),
      this.tmdb<{ results: any[] }>("/tv/on_the_air")
    ]);
    return {
      movies: (m.results || []).map(item => mapTmdbItem(item, "movie")),
      tvs: (t.results || []).map(item => mapTmdbItem(item, "tv"))
    };
  }
};
