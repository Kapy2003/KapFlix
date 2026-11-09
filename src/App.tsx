import React, { useState, useEffect } from "react";
import { MediaItem } from "./types";
import { ApiService } from "./services/api";
import { StorageService } from "./services/storage";
import { Navbar } from "./components/Navbar";
import { HeroBanner } from "./components/HeroBanner";
import { MediaShelf } from "./components/MediaShelf";
import { EpisodeDrawer } from "./components/EpisodeDrawer";
import { CinemaPlayer } from "./components/CinemaPlayer";
import { SearchModal } from "./components/SearchModal";

interface ShelfData {
  id: string;
  title: string;
  subtitle?: string;
  items: MediaItem[];
}

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [heroItem, setHeroItem] = useState<MediaItem | null>(null);
  const [shelves, setShelves] = useState<ShelfData[]>([]);
  const [activeModalItem, setActiveModalItem] = useState<MediaItem | null>(null);
  const [activePlayer, setActivePlayer] = useState<{ item: MediaItem; season: number; episode: number } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [watchlist, setWatchlist] = useState<MediaItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const refreshWatchlist = () => {
    setWatchlist(StorageService.getWatchlist());
  };

  useEffect(() => {
    refreshWatchlist();
  }, []);

  // Keyboard shortcut for search & escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((document.activeElement as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsSearchOpen(true);
      } else if (e.key === "Escape") {
        setIsSearchOpen(false);
        setActiveModalItem(null);
        setActivePlayer(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Load catalog data based on active tab
  useEffect(() => {
    let isCancelled = false;

    const loadData = async () => {
      setShelves([]);

      if (currentTab === "all") {
        // Continue watching
        const history = StorageService.getHistory();
        const continueItems: MediaItem[] = history.map(h => ({
          id: h.id,
          type: h.type,
          title: h.title,
          overview: "",
          poster_path: h.poster_path,
          backdrop_path: h.backdrop_path,
          vote_average: 0,
          release_date: "",
          season: h.season,
          episode: h.episode
        }));

        try {
          const [movies, tvs, anime, top] = await Promise.all([
            ApiService.getTrendingMovies(),
            ApiService.getPopularTv(),
            ApiService.getTrendingAnime(),
            ApiService.getTopRatedMovies()
          ]);

          if (isCancelled) return;

          if (movies.length > 0) setHeroItem(movies[0]);

          const newShelves: ShelfData[] = [];
          if (continueItems.length > 0) {
            newShelves.push({
              id: "continue",
              title: "Continue Watching",
              subtitle: "Pick up right where you left off",
              items: continueItems
            });
          }
          newShelves.push(
            { id: "trending-movies", title: "Trending Movies", subtitle: "Top cinema worldwide", items: movies.slice(1, 15) },
            { id: "popular-tv", title: "Binge-Worthy TV Series", subtitle: "Global popular television", items: tvs.slice(0, 14) },
            { id: "trending-anime", title: "Trending Anime", subtitle: "Latest releases & seasonal hits", items: anime.slice(0, 14) },
            { id: "top-rated", title: "Critically Acclaimed Masterpieces", subtitle: "All-time highest rated films", items: top.slice(0, 14) }
          );
          setShelves(newShelves);
        } catch (err) {
          console.error("Failed to load home catalog", err);
        }
      } else if (currentTab === "movie") {
        const [movies, top] = await Promise.all([
          ApiService.getTrendingMovies(),
          ApiService.getTopRatedMovies()
        ]);
        if (isCancelled) return;
        if (movies.length > 0) setHeroItem(movies[0]);
        setShelves([
          { id: "m-trend", title: "Popular Cinema Today", items: movies.slice(1, 15) },
          { id: "m-top", title: "Top Rated Films", items: top.slice(0, 14) }
        ]);
      } else if (currentTab === "tv") {
        const tvs = await ApiService.getPopularTv();
        if (isCancelled) return;
        if (tvs.length > 0) setHeroItem(tvs[0]);
        setShelves([
          { id: "tv-trend", title: "Trending Television", items: tvs.slice(1, 15) }
        ]);
      } else if (currentTab === "anime") {
        const anime = await ApiService.getTrendingAnime();
        if (isCancelled) return;
        if (anime.length > 0) setHeroItem(anime[0]);
        setShelves([
          { id: "anime-trend", title: "Trending Anime Series", items: anime.slice(1, 15) }
        ]);
      } else if (currentTab === "watchlist") {
        const list = StorageService.getWatchlist();
        setShelves([
          {
            id: "watchlist-shelf",
            title: "My Watchlist",
            subtitle: `${list.length} saved titles`,
            items: list
          }
        ]);
      }
    };

    loadData();
    return () => { isCancelled = true; };
  }, [currentTab]);

  const handleToggleWatchlist = (item: MediaItem) => {
    const added = StorageService.toggleWatchlist(item);
    refreshWatchlist();
    showToast(added ? "Added to My List" : "Removed from My List");
  };

  const handlePlay = (item: MediaItem, season = 1, episode = 1) => {
    setActiveModalItem(null);
    setActivePlayer({ item, season, episode });
    StorageService.saveHistory({
      id: item.id,
      type: item.type,
      title: item.title,
      season,
      episode,
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path
    });
  };

  return (
    <div className="min-h-screen bg-obsidian text-white relative">
      {/* Dynamic Atmospheric Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-40 overflow-hidden">
        <div className="absolute -top-1/4 left-1/4 w-[75vw] h-[60vh] bg-blue-900/20 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content */}
      <main className="relative z-10 pt-[70px] pb-20">
        {currentTab !== "watchlist" && heroItem && (
          <HeroBanner
            item={heroItem}
            onPlay={(item) => handlePlay(item, 1, 1)}
            onDetails={(item) => setActiveModalItem(item)}
            onToggleWatchlist={handleToggleWatchlist}
            isInWatchlist={StorageService.inWatchlist(heroItem.id, heroItem.type)}
          />
        )}

        {shelves.length === 0 && currentTab === "watchlist" ? (
          <div className="text-center py-28 text-white/40">
            <div className="text-4xl mb-3">📁</div>
            <h3 className="text-lg font-bold text-white mb-1">Your Watchlist is Empty</h3>
            <p className="text-sm">Save movies, series, and anime to watch anytime.</p>
          </div>
        ) : (
          shelves.map(shelf => (
            <MediaShelf
              key={shelf.id}
              title={shelf.title}
              subtitle={shelf.subtitle}
              items={shelf.items}
              onSelect={(item) => {
                if (item.season && item.episode) {
                  handlePlay(item, item.season, item.episode);
                } else {
                  setActiveModalItem(item);
                }
              }}
            />
          ))
        )}
      </main>

      {/* Modals & Player */}
      <EpisodeDrawer
        item={activeModalItem}
        onClose={() => setActiveModalItem(null)}
        onPlayEpisode={(item, s, e) => handlePlay(item, s, e)}
        onToggleWatchlist={handleToggleWatchlist}
        isInWatchlist={activeModalItem ? StorageService.inWatchlist(activeModalItem.id, activeModalItem.type) : false}
      />

      {activePlayer && (
        <CinemaPlayer
          item={activePlayer.item}
          season={activePlayer.season}
          episode={activePlayer.episode}
          totalEpisodes={activePlayer.item.totalEpisodes}
          onClose={() => setActivePlayer(null)}
          onNavigateEpisode={(delta) => {
            const nextEp = activePlayer.episode + delta;
            if (nextEp >= 1) {
              handlePlay(activePlayer.item, activePlayer.season, nextEp);
            }
          }}
        />
      )}

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={(item) => setActiveModalItem(item)}
      />

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-obsidian-surface3 border border-white/10 text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-2xl animate-fade-in">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
