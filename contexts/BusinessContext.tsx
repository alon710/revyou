"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Business } from "@/types/database";
import { getBusiness, getUserBusinesses } from "@/lib/firebase/businesses";
import { useAuth } from "@/contexts/AuthContext";
import { useUIStore } from "@/lib/store/ui-store";

interface BusinessContextType {
  currentBusiness: Business | null;
  businesses: Business[];
  selectedBusinessId: string | null;
  selectBusiness: (businessId: string) => void;
  clearBusiness: () => void;
  loading: boolean;
  refreshBusinesses: () => Promise<void>;
}

const BusinessContext = createContext<BusinessContextType | undefined>(
  undefined
);

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { selectedBusinessId, setSelectedBusinessId, clearSelectedBusinessId } =
    useUIStore();
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  const selectBusiness = useCallback(
    (businessId: string) => {
      setSelectedBusinessId(businessId);
    },
    [setSelectedBusinessId]
  );

  const loadBusinesses = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const fetchedBusinesses = await getUserBusinesses(user.uid);
      const connected = fetchedBusinesses.filter((b) => b.connected);
      setBusinesses(connected);

      if (!selectedBusinessId && connected.length > 0) {
        selectBusiness(connected[0].id);
      } else if (selectedBusinessId) {
        const stillExists = connected.find((b) => b.id === selectedBusinessId);
        if (!stillExists && connected.length > 0) {
          selectBusiness(connected[0].id);
        } else if (!stillExists) {
          clearSelectedBusinessId();
          setCurrentBusiness(null);
        }
      }
    } catch (_error) {
      console.error("Failed to load businesses:", _error);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, [user, selectedBusinessId, selectBusiness, clearSelectedBusinessId]);

  const loadCurrentBusiness = useCallback(
    async (businessId: string) => {
      if (!user) return;
      try {
        const business = await getBusiness(user.uid, businessId);
        setCurrentBusiness(business);
      } catch (_error) {
        console.error("Failed to load current business:", _error);
        setCurrentBusiness(null);
      }
    },
    [user]
  );

  const clearBusiness = useCallback(() => {
    clearSelectedBusinessId();
    setCurrentBusiness(null);
  }, [clearSelectedBusinessId]);

  useEffect(() => {
    if (user) {
      loadBusinesses();
    } else {
      setBusinesses([]);
      setCurrentBusiness(null);
      clearSelectedBusinessId();
      setLoading(false);
    }
  }, [user, loadBusinesses, clearSelectedBusinessId]);

  useEffect(() => {
    if (selectedBusinessId && user) {
      loadCurrentBusiness(selectedBusinessId);
    } else {
      setCurrentBusiness(null);
    }
  }, [selectedBusinessId, user, loadCurrentBusiness]);

  const refreshBusinesses = useCallback(async () => {
    await loadBusinesses();
    if (selectedBusinessId) {
      await loadCurrentBusiness(selectedBusinessId);
    }
  }, [loadBusinesses, selectedBusinessId, loadCurrentBusiness]);

  return (
    <BusinessContext.Provider
      value={{
        currentBusiness,
        businesses,
        selectedBusinessId,
        selectBusiness,
        clearBusiness,
        loading,
        refreshBusinesses,
      }}
    >
      {children}
    </BusinessContext.Provider>
  );
}

export function useBusiness() {
  const context = useContext(BusinessContext);
  if (context === undefined) {
    throw new Error("useBusiness must be used within a BusinessProvider");
  }
  return context;
}
