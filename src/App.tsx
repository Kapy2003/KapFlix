import React, { useState, useEffect } from "react";
import { MediaItem, VideoTrailer } from "./types";
import { ApiService } from "./services/api";
import { StorageService } from "./services/storage";
import { Navbar } from "./components/Navbar";
import { HeroBanner } from "./components/HeroBanner";
import { MediaShelf } from "./components/MediaShelf";
import { EpisodeDrawer } from "./components/EpisodeDrawer";
import { CinemaPlayer } from "./components/CinemaPlayer";
import { SearchModal } from "./components/SearchModal";
import { SplashScreen } from "./components/SplashScreen";
import { TrailerModal } from "./components/TrailerModal";
import { BrowseView } from "./components/BrowseView";
import { ReleaseCalendar } from "./components/ReleaseCalendar";
import { DPadService } from "./services/dpad";
import { OtaService, UpdateInfo } from "./services/ota";

interface ShelfData {
  id: string;
  title: string;
  subtitle?: string;
  items: MediaItem[];
  showRank?: boolean;
}

export const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [heroItems, setHeroItems] = useState<MediaItem[]>([]);
  const [shelves, setShelves] = useState<ShelfData[]>([]);
  const [activeModalItem, setActiveModalItem] = useState<MediaItem | null>(null);
  const [activePlayer, setActivePlayer] = useState<{ item: MediaItem; season: number; episode: number } | null>(null);
  const [activeTrailer, setActiveTrailer] = useState<{ trailer: VideoTrailer; title: string } | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [watchlist, setWatchlist] = useState<MediaItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [otaUpdate, setOtaUpdate] = useState<UpdateInfo | null>(null);

  // State refs for D-Pad TV navigation callbacks
  const activePlayerRef = React.useRef(activePlayer);
  const activeTrailerRef = React.useRef(activeTrailer);
  const activeModalItemRef = React.useRef(activeModalItem);
  const isSearchOpenRef = React.useRef(isSearchOpen);
  const currentTabRef = React.useRef(currentTab);
  activePlayerRef.current = activePlayer;
  activeTrailerRef.current = activeTrailer;
  activeModalItemRef.current = activeModalItem;
  isSearchOpenRef.current = isSearchOpen;
  currentTabRef.current = currentTab;

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

  // Initialize Android TV D-Pad & Remote navigation and OTA update checker
  useEffect(() => {
    DPadService.init({
      onBack: () => {
        if (activePlayerRef.current) {
          setActivePlayer(null);
          return true;
        }
        if (activeTrailerRef.current) {
          setActiveTrailer(null);
          return true;
        }
        if (activeModalItemRef.current) {
          setActiveModalItem(null);
          return true;
        }
        if (isSearchOpenRef.current) {
          setIsSearchOpen(false);
          return true;
        }
        if (currentTabRef.current !== "all") {
          setCurrentTab("all");
          return true;
        }
        return false;
      }
    });

    // Check for Over-The-Air updates
    OtaService.checkForUpdates().then(info => {
      if (info?.hasUpdate) {
        setOtaUpdate(info);
      }
    });

    return () => DPadService.destroy();
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
        setActiveTrailer(null);
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
          const [spotlight, movies, tvs, octane, mind, top] = await Promise.all([
            ApiService.getSpotlightMovies(),
            ApiService.getTrendingMovies(),
            ApiService.getPopularTv(),
            ApiService.getHighOctane(),
            ApiService.getMindBending(),
            ApiService.getTopRatedMovies()
          ]);

          if (isCancelled) return;

          setHeroItems(spotlight.length > 0 ? spotlight : movies.slice(0, 5));

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
            { id: "top-10", title: "🔥 Top 10 in Cinema Today", subtitle: "Most streamed movies worldwide", items: movies.slice(0, 10), showRank: true },
            { id: "popular-tv", title: "🍿 Binge-Worthy TV Series", subtitle: "Global popular television", items: tvs.slice(0, 14) },
            { id: "high-octane", title: "⚡ High-Octane Action & Thrillers", subtitle: "Adrenaline-fueled blockbusters", items: octane.slice(0, 14) },
            { id: "mind-bending", title: "🧠 Mind-Bending Sci-Fi & Mysteries", subtitle: "Reality-bending plots and enigmas", items: mind.slice(0, 14) },
            { id: "top-rated", title: "🏆 Critically Acclaimed Masterpieces", subtitle: "All-time highest rated films", items: top.slice(0, 14) }
          );
          setShelves(newShelves);
        } catch (err) {
          console.error("Failed to load catalog", err);
        } finally {
          if (!isCancelled) setIsLoading(false);
        }
      } else if (currentTab === "movie") {
        try {
          const [movies, octane, mind, top] = await Promise.all([
            ApiService.getTrendingMovies(),
            ApiService.getHighOctane(),
            ApiService.getMindBending(),
            ApiService.getTopRatedMovies()
          ]);
          if (isCancelled) return;
          setHeroItems(movies.slice(0, 5));
          setShelves([
            { id: "m-top-10", title: "🔥 Top 10 Movies Today", subtitle: "Box office & global trending", items: movies.slice(0, 10), showRank: true },
            { id: "m-action", title: "⚡ Action & Thrillers", items: octane.slice(0, 14) },
            { id: "m-scifi", title: "🧠 Sci-Fi & Psychological", items: mind.slice(0, 14) },
            { id: "m-top", title: "🏆 Highest Rated of All Time", items: top.slice(0, 14) }
          ]);
        } finally {
          if (!isCancelled) setIsLoading(false);
        }
      } else if (currentTab === "tv") {
        try {
          const tvs = await ApiService.getPopularTv();
          if (isCancelled) return;
          setHeroItems(tvs.slice(0, 5));
          setShelves([
            { id: "tv-top-10", title: "🔥 Top 10 TV Shows Today", subtitle: "Most watched television worldwide", items: tvs.slice(0, 10), showRank: true },
            { id: "tv-popular", title: "🍿 Global Favorites", subtitle: "Binge-worthy drama and comedies", items: tvs.slice(10, 24) }
          ]);
        } finally {
          if (!isCancelled) setIsLoading(false);
        }
      } else if (currentTab === "watchlist") {
        setHeroItems([]);
        const list = StorageService.getWatchlist();
        setShelves([
          {
            id: "watchlist-shelf",
            title: "My Watchlist",
            subtitle: `${list.length} saved titles`,
            items: list
          }
        ]);
        setIsLoading(false);
      } else {
        setIsLoading(false);
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

  const handleHeroTrailer = async (item: MediaItem) => {
    const trailers = await ApiService.getTrailers(item.id, item.type);
    if (trailers.length > 0) {
      setActiveTrailer({ trailer: trailers[0], title: item.title });
    } else {
      showToast("No official trailer found.");
    }
  };

  const handleSurpriseMe = async () => {
    try {
      showToast("🎲 Shuffling cinema vault...");
      const gem = await ApiService.getRandomGem();
      setActiveModalItem(gem);
      showToast(`🎲 Unlocked: ${gem.title}`);
    } catch {
      showToast("Failed to pick a random title.");
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-white relative font-sans">
      {/* Splash Screen */}
      <SplashScreen isLoading={isLoading} />

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
        onSurpriseMe={handleSurpriseMe}
      />

      {/* Main Content */}
      <main className="relative z-10 pb-28">
        {currentTab === "browse" ? (
          <BrowseView onSelect={(item) => setActiveModalItem(item)} />
        ) : currentTab === "calendar" ? (
          <ReleaseCalendar onSelect={(item) => setActiveModalItem(item)} />
        ) : (
          <>
            {currentTab !== "watchlist" && heroItems.length > 0 && (
              <HeroBanner
                items={heroItems}
                onPlay={(item) => handlePlay(item, 1, 1)}
                onDetails={(item) => setActiveModalItem(item)}
                onWatchTrailer={handleHeroTrailer}
                onToggleWatchlist={handleToggleWatchlist}
                isInWatchlist={(item) => StorageService.inWatchlist(item.id, item.type)}
              />
            )}

            {currentTab === "watchlist" ? (
              shelves[0]?.items.length === 0 ? (
                <div className="text-center pt-36 pb-28 text-white/40 animate-fade-in">
                  <div className="text-5xl mb-3 opacity-60">🔖</div>
                  <h3 className="text-lg font-bold text-white mb-1">Your Watchlist is Empty</h3>
                  <p className="text-sm">Save cinema masterpieces and series to watch anytime.</p>
                </div>
              ) : (
                <div className="pt-20 sm:pt-24">
                  {shelves.map(shelf => (
                    <MediaShelf
                      key={shelf.id}
                      title={shelf.title}
                      subtitle={shelf.subtitle}
                      items={shelf.items}
                      showRank={shelf.showRank}
                      onSelect={(item) => setActiveModalItem(item)}
                    />
                  ))}
                </div>
              )
            ) : (
              shelves.map(shelf => (
                <MediaShelf
                  key={shelf.id}
                  title={shelf.title}
                  subtitle={shelf.subtitle}
                  items={shelf.items}
                  showRank={shelf.showRank}
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
          </>
        )}
      </main>

      {/* Details & Episodes Modal */}
      <EpisodeDrawer
        item={activeModalItem}
        onClose={() => setActiveModalItem(null)}
        onPlayEpisode={(item, s, e) => handlePlay(item, s, e)}
        onToggleWatchlist={handleToggleWatchlist}
        isInWatchlist={activeModalItem ? StorageService.inWatchlist(activeModalItem.id, activeModalItem.type) : false}
        onOpenTrailer={(trailer, title) => setActiveTrailer({ trailer, title })}
        onSelectRecommendation={(rec) => setActiveModalItem(rec)}
      />

      {/* Video Player */}
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

      {/* Trailer Modal */}
      {activeTrailer && (
        <TrailerModal
          trailer={activeTrailer.trailer}
          title={activeTrailer.title}
          onClose={() => setActiveTrailer(null)}
        />
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelect={(item) => setActiveModalItem(item)}
      />

      {/* OTA Update Available Floating Pill */}
      {otaUpdate && (
        <div className="fixed top-20 right-4 sm:right-10 z-50 viv-glass-pill p-3 sm:px-4 sm:py-2.5 rounded-2xl flex items-center gap-3 shadow-2xl border border-white/20 animate-fade-in max-w-sm">
          <span className="text-xl">🚀</span>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white">Update v{otaUpdate.version} Ready</span>
            <span className="text-[11px] text-white/60 truncate">{otaUpdate.changelog || "New improvements available"}</span>
          </div>
          <button
            onClick={() => OtaService.applyWebUpdate()}
            className="px-3 py-1 rounded-full bg-white text-obsidian text-xs font-bold hover:scale-105 transition cursor-pointer flex-none shadow-md"
          >
            Update
          </button>
          <button
            onClick={() => setOtaUpdate(null)}
            className="text-white/40 hover:text-white text-xs px-1 cursor-pointer"
            title="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-obsidian-surface3 border border-white/10 text-white px-4 py-2.5 rounded-full text-sm font-semibold shadow-2xl animate-fade-in backdrop-blur-md">
          {toastMessage}
        </div>
      )}
    </div>
  );
};
