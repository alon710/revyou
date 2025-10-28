import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const DISMISS_DURATION = 24 * 60 * 60 * 1000;

interface UIState {
  upgradeBannerDismissedAt: number | null;
  dismissUpgradeBanner: () => void;
  shouldShowUpgradeBanner: () => boolean;
  selectedLocationId: string | null;
  setSelectedLocationId: (id: string | null) => void;
  clearSelectedLocationId: () => void;
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

      selectedLocationId: null,

      setSelectedLocationId: (id: string | null) => {
        set({ selectedLocationId: id });
      },

      clearSelectedLocationId: () => {
        set({ selectedLocationId: null });
      },
    }),
    {
      name: "RevUStore",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
