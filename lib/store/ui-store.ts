import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const DISMISS_DURATION = 24 * 60 * 60 * 1000; // 24 hours
const STORE_NAME = "RevYouStore";

interface UIState {
  upgradeBannerDismissedAt: number | null;
  dismissUpgradeBanner: () => void;
  shouldShowUpgradeBanner: () => boolean;
  lastSelectedBusinessId: string | null;
  setLastSelectedBusinessId: (id: string | null) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      upgradeBannerDismissedAt: null,
      lastSelectedBusinessId: null,

      dismissUpgradeBanner: () => {
        set({ upgradeBannerDismissedAt: Date.now() });
      },

      shouldShowUpgradeBanner: () => {
        const dismissedAt = get().upgradeBannerDismissedAt;
        if (!dismissedAt) return true;

        const now = Date.now();
        return now - dismissedAt >= DISMISS_DURATION;
      },

      setLastSelectedBusinessId: (id: string | null) => {
        set({ lastSelectedBusinessId: id });
      },
    }),
    {
      name: STORE_NAME,
      storage: createJSONStorage(() => localStorage),
    }
  )
);
