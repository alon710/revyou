import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const DISMISS_DURATION = 24 * 60 * 60 * 1000;

interface UIState {
  upgradeBannerDismissedAt: number | null;
  dismissUpgradeBanner: () => void;
  shouldShowUpgradeBanner: () => boolean;
  selectedBusinessId: string | null;
  setSelectedBusinessId: (id: string | null) => void;
  clearSelectedBusinessId: () => void;
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

      selectedBusinessId: null,

      setSelectedBusinessId: (id: string | null) => {
        set({ selectedBusinessId: id });
      },

      clearSelectedBusinessId: () => {
        set({ selectedBusinessId: null });
      },
    }),
    {
      name: "RevUStore",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
