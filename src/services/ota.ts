// Over-The-Air (OTA) Update Service
// Checks for web asset updates and native APK releases

export interface UpdateInfo {
  hasUpdate: boolean;
  version: string;
  changelog?: string;
  apkUrl?: string;
}

export const CURRENT_VERSION = "1.0.0";

export const OtaService = {
  async checkForUpdates(): Promise<UpdateInfo | null> {
    try {
      // 1. Check version.json with cache buster
      const res = await fetch(`/version.json?t=${Date.now()}`);
      if (!res.ok) return null;
      const data = await res.json();

      if (data.version && data.version !== CURRENT_VERSION) {
        return {
          hasUpdate: true,
          version: data.version,
          changelog: data.changelog,
          apkUrl: data.apkUrl
        };
      }

      // 2. Check if a new Service Worker is waiting
      if ("serviceWorker" in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg?.waiting) {
          return {
            hasUpdate: true,
            version: "latest",
            changelog: "New hotfix available"
          };
        }
      }

      return { hasUpdate: false, version: CURRENT_VERSION };
    } catch (err) {
      console.warn("OTA update check skipped:", err);
      return null;
    }
  },

  async applyWebUpdate(): Promise<void> {
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg?.waiting) {
        reg.waiting.postMessage({ type: "SKIP_WAITING" });
      }
      // Clear caches
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    }
    // Hard reload
    window.location.reload();
  }
};
