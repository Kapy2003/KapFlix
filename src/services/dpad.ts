// Android TV D-Pad & Remote Control Navigation Engine
// Handles directional navigation, remote key mapping, and spatial auto-scrolling

export interface DPadCallbacks {
  onBack: () => boolean; // Returns true if a modal/player/view was closed
  onPlayPause?: () => void;
}

export const DPadService = {
  active: false,
  callbacks: null as DPadCallbacks | null,

  init(callbacks: DPadCallbacks) {
    this.callbacks = callbacks;
    if (this.active) return;
    this.active = true;

    window.addEventListener("keydown", this.handleKeyDown, true);
  },

  destroy() {
    window.removeEventListener("keydown", this.handleKeyDown, true);
    this.active = false;
    this.callbacks = null;
  },

  handleKeyDown: (e: KeyboardEvent) => {
    // Android TV Remote KeyCodes & standard KeyboardEvent keys
    const isUp = e.key === "ArrowUp" || e.keyCode === 19 || e.keyCode === 38;
    const isDown = e.key === "ArrowDown" || e.keyCode === 20 || e.keyCode === 40;
    const isLeft = e.key === "ArrowLeft" || e.keyCode === 21 || e.keyCode === 37;
    const isRight = e.key === "ArrowRight" || e.keyCode === 22 || e.keyCode === 39;
    const isSelect = e.key === "Enter" || e.keyCode === 23 || e.keyCode === 66 || e.keyCode === 13;
    const isBack = e.key === "Escape" || e.key === "Backspace" || e.keyCode === 4 || e.keyCode === 27;
    const isPlayPause = e.key === "MediaPlayPause" || e.keyCode === 85 || e.keyCode === 126 || e.keyCode === 127;

    // Handle Back Button
    if (isBack) {
      if (DPadService.callbacks?.onBack) {
        const handled = DPadService.callbacks.onBack();
        if (handled) {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
      }
    }

    // Handle Play/Pause
    if (isPlayPause) {
      if (DPadService.callbacks?.onPlayPause) {
        DPadService.callbacks.onPlayPause();
        e.preventDefault();
        return;
      }
    }

    // Don't intercept arrow keys if user is typing in a search text input
    const targetTag = (e.target as HTMLElement)?.tagName;
    if (targetTag === "INPUT" || targetTag === "TEXTAREA") {
      if (isBack) {
        (e.target as HTMLElement).blur();
        e.preventDefault();
      }
      return;
    }

    if (!isUp && !isDown && !isLeft && !isRight && !isSelect) {
      return;
    }

    // Find all focusable elements currently visible in the DOM
    const focusables = Array.from(
      document.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [tabindex="0"]:not([disabled]), a[href], input:not([disabled])'
      )
    ).filter(el => {
      const rect = el.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== "hidden";
    });

    if (focusables.length === 0) return;

    const current = document.activeElement as HTMLElement;

    // If nothing currently focused, focus the first sensible element (e.g., hero button or first card)
    if (!current || !focusables.includes(current)) {
      const primary = focusables.find(el => el.classList.contains("viv-btn-hero")) || focusables[0];
      primary.focus();
      primary.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      e.preventDefault();
      return;
    }

    if (isSelect) {
      current.click();
      e.preventDefault();
      return;
    }

    const currentRect = current.getBoundingClientRect();

    // Check if navigating horizontally inside a shelf row
    const shelfTrack = current.closest<HTMLElement>(".snap-x, .overflow-x-auto, nav");
    if (shelfTrack && (isLeft || isRight)) {
      const siblings = Array.from(shelfTrack.querySelectorAll<HTMLElement>('[tabindex="0"], button'));
      const idx = siblings.indexOf(current);

      if (idx !== -1) {
        const nextIdx = isRight ? idx + 1 : idx - 1;
        if (nextIdx >= 0 && nextIdx < siblings.length) {
          const nextEl = siblings[nextIdx];
          nextEl.focus();
          nextEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
          e.preventDefault();
          return;
        }
      }
    }

    // Spatial Navigation Algorithm based on 2D coordinates
    let bestEl: HTMLElement | null = null;
    let minDistance = Infinity;

    for (const el of focusables) {
      if (el === current) continue;
      const rect = el.getBoundingClientRect();

      let isCandidate = false;
      let dPrimary = 0;
      let dSecondary = 0;

      if (isRight) {
        isCandidate = rect.left >= currentRect.right - 8;
        dPrimary = rect.left - currentRect.right;
        dSecondary = Math.abs((rect.top + rect.bottom) / 2 - (currentRect.top + currentRect.bottom) / 2);
      } else if (isLeft) {
        isCandidate = rect.right <= currentRect.left + 8;
        dPrimary = currentRect.left - rect.right;
        dSecondary = Math.abs((rect.top + rect.bottom) / 2 - (currentRect.top + currentRect.bottom) / 2);
      } else if (isDown) {
        isCandidate = rect.top >= currentRect.bottom - 8;
        dPrimary = rect.top - currentRect.bottom;
        dSecondary = Math.abs((rect.left + rect.right) / 2 - (currentRect.left + currentRect.right) / 2);
      } else if (isUp) {
        isCandidate = rect.bottom <= currentRect.top + 8;
        dPrimary = currentRect.top - rect.bottom;
        dSecondary = Math.abs((rect.left + rect.right) / 2 - (currentRect.left + currentRect.right) / 2);
      }

      if (isCandidate) {
        // Bias towards primary direction with cross-axis weight
        const distance = dPrimary + dSecondary * 1.8;
        if (distance < minDistance) {
          minDistance = distance;
          bestEl = el;
        }
      }
    }

    if (bestEl) {
      bestEl.focus();
      bestEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      e.preventDefault();
    }
  }
};
