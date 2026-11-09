import { MediaItem, Season, Episode } from "../types";

// shortcut: static client demo key, upgrade to server env proxy if rate-limited
const TMDB_KEY = "4e44d9029b1270a757cddc766a1bcb63";
const TMDB_BASE = "https://api.themoviedb.org/3";
export const TMDB_IMG = "https://image.tmdb.org/t/p";
const ANILIST_API = "https://graphql.anilist.co";

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

export const ApiService = {
  async tmdb<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
    const query = new URLSearchParams({ api_key: TMDB_KEY, ...params }).toString();
    const res = await fetch(`${TMDB_BASE}${endpoint}?${query}`);
    if (!res.ok) throw new Error(`TMDB HTTP ${res.status}`);
    return res.json();
  },

  async getTrendingMovies(): Promise<MediaItem[]> {
    const data = await this.tmdb<{ results: any[] }>("/trending/movie/day");
    return (data.results || []).map(m => ({
      id: m.id,
      type: "movie",
      title: m.title || m.original_title,
      overview: m.overview,
      poster_path: m.poster_path,
      backdrop_path: m.backdrop_path,
      vote_average: m.vote_average || 0,
      release_date: m.release_date || "",
      adult: m.adult
    }));
  },

  async getPopularTv(): Promise<MediaItem[]> {
    const data = await this.tmdb<{ results: any[] }>("/trending/tv/day");
    return (data.results || []).map(t => ({
      id: t.id,
      type: "tv",
      title: t.name || t.original_name,
      overview: t.overview,
      poster_path: t.poster_path,
      backdrop_path: t.backdrop_path,
      vote_average: t.vote_average || 0,
      release_date: t.first_air_date || "",
      adult: t.adult
    }));
  },

  async getTopRatedMovies(): Promise<MediaItem[]> {
    const data = await this.tmdb<{ results: any[] }>("/movie/top_rated");
    return (data.results || []).map(m => ({
      id: m.id,
      type: "movie",
      title: m.title,
      overview: m.overview,
      poster_path: m.poster_path,
      backdrop_path: m.backdrop_path,
      vote_average: m.vote_average || 0,
      release_date: m.release_date || "",
      adult: m.adult
    }));
  },

  async getTrendingAnime(): Promise<MediaItem[]> {
    const query = `
      query {
        Page(page: 1, perPage: 16) {
          media(type: ANIME, sort: TRENDING_DESC) {
            id
            idMal
            title { english romaji }
            coverImage { large extraLarge }
            bannerImage
            episodes
            averageScore
            genres
            description
            seasonYear
          }
        }
      }
    `;
    const res = await fetch(ANILIST_API, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify({ query })
    });
    if (!res.ok) throw new Error(`AniList error ${res.status}`);
    const data = await res.json();
    const media = data?.data?.Page?.media || [];

    // shortcut: maps AniList directly for catalog, upgrade to MAL/TMDB cross-reference resolver if an anime lacks VidLink entry
    return media.map((a: any) => ({
      id: a.id,
      idMal: a.idMal,
      type: "anime" as const,
      title: a.title?.english || a.title?.romaji || "Untitled Anime",
      overview: a.description ? a.description.replace(/<[^>]*>/g, "") : "",
      poster_path: a.coverImage?.extraLarge || a.coverImage?.large || null,
      backdrop_path: a.bannerImage || a.coverImage?.extraLarge || null,
      vote_average: a.averageScore ? a.averageScore / 10 : 8.0,
      release_date: a.seasonYear ? `${a.seasonYear}-01-01` : "",
      genres: a.genres || [],
      totalEpisodes: a.episodes
    }));
  },

  async searchMulti(query: string): Promise<MediaItem[]> {
    if (!query.trim()) return [];
    const data = await this.tmdb<{ results: any[] }>("/search/multi", { query: query.trim() });
    return (data.results || [])
      .filter(item => item.media_type === "movie" || item.media_type === "tv")
      .map(item => ({
        id: item.id,
        type: item.media_type,
        title: item.title || item.name,
        overview: item.overview || "",
        poster_path: item.poster_path,
        backdrop_path: item.backdrop_path,
        vote_average: item.vote_average || 0,
        release_date: item.release_date || item.first_air_date || "",
        adult: item.adult
      }));
  },

  async getTvDetails(id: number): Promise<{ seasons: Season[]; genres: any[] }> {
    const data = await this.tmdb<any>(`/tv/${id}`);
    const seasons: Season[] = (data.seasons || [])
      .filter((s: any) => s.season_number > 0)
      .map((s: any) => ({
        id: s.id,
        season_number: s.season_number,
        name: s.name,
        episode_count: s.episode_count
      }));
    return { seasons, genres: data.genres || [] };
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
  }
};
