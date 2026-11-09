import { MediaItem, WatchHistoryItem, MediaType } from "../types";

const WATCHLIST_KEY = "kapflix_watchlist";
const HISTORY_KEY = "kapflix_history";

export const StorageService = {
  getWatchlist(): MediaItem[] {
    try {
      return JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]");
    } catch {
      return [];
    }
  },

  toggleWatchlist(item: MediaItem): boolean {
    const list = this.getWatchlist();
    const idx = list.findIndex(x => x.id === item.id && x.type === item.type);
    let added = false;
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.unshift({ ...item });
      added = true;
    }
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
    return added;
  },

  inWatchlist(id: number, type: MediaType): boolean {
    return this.getWatchlist().some(x => x.id === id && x.type === type);
  },

  getHistory(): WatchHistoryItem[] {
    try {
      return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
    } catch {
      return [];
    }
  },

  saveHistory(item: Omit<WatchHistoryItem, "updatedAt">): void {
    const list = this.getHistory().filter(x => !(x.id === item.id && x.type === item.type));
    list.unshift({
      ...item,
      updatedAt: Date.now()
    });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 30)));
  }
};
