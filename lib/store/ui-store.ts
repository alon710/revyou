import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const DISMISS_DURATION = 24 * 60 * 60 * 1000;

interface UIState {
  upgradeBannerDismissedAt: number | null;
  dismissUpgradeBanner: () => void;
  shouldShowUpgradeBanner: () => boolean;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      upgradeBannerDismissedAt: null,

      dismissUpgradeBanner: () => {
        set({ upgradeBannerDismissedAt: Date.now() });
      },

      shouldShowUpgradeBanner: () => {
        const dismissedAt = get().upgradeBannerDismissedAt;
        if (!dismissedAt) return true;

        const now = Date.now();
        return now - dismissedAt >= DISMISS_DURATION;
      },
    }),
    {
      name: "RevUStore",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
