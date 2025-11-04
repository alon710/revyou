"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Business, Account } from "@/types/database";
import { getBusiness, getAccountBusinesses } from "@/lib/firebase/business";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from "@/contexts/AccountContext";

interface BusinessContextType {
  currentAccount: Account | null;
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

const STORAGE_KEY = "selectedBusinessId";

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { currentAccount } = useAccount();
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem(STORAGE_KEY);
      }
      return null;
    }
  );
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);

  // Persist selectedBusinessId to localStorage
  useEffect(() => {
    if (selectedBusinessId) {
      localStorage.setItem(STORAGE_KEY, selectedBusinessId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedBusinessId]);

  const selectBusiness = useCallback((businessId: string) => {
    setSelectedBusinessId(businessId);
  }, []);

  const clearSelectedBusinessId = useCallback(() => {
    setSelectedBusinessId(null);
  }, []);

  const loadBusinesses = useCallback(async () => {
    if (!user || !currentAccount) {
      setBusinesses([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fetchedBusinesses = await getAccountBusinesses(
        user.uid,
        currentAccount.id
      );
      const connected = fetchedBusinesses.filter((l) => l.connected);
      setBusinesses(connected);

      if (!selectedBusinessId && connected.length > 0) {
        selectBusiness(connected[0].id);
      } else if (selectedBusinessId) {
        const stillExists = connected.find((l) => l.id === selectedBusinessId);
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
  }, [
    user,
    currentAccount,
    selectedBusinessId,
    selectBusiness,
    clearSelectedBusinessId,
  ]);

  const loadCurrentBusiness = useCallback(
    async (businessId: string) => {
      if (!user || !currentAccount) return;
      try {
        const business = await getBusiness(
          user.uid,
          currentAccount.id,
          businessId
        );
        setCurrentBusiness(business);
      } catch (_error) {
        console.error("Failed to load current business:", _error);
        setCurrentBusiness(null);
      }
    },
    [user, currentAccount]
  );

  const clearBusiness = useCallback(() => {
    clearSelectedBusinessId();
    setCurrentBusiness(null);
  }, [clearSelectedBusinessId]);

  useEffect(() => {
    if (user && currentAccount) {
      loadBusinesses();
    } else {
      setBusinesses([]);
      setCurrentBusiness(null);
      if (!user) {
        clearSelectedBusinessId();
      }
      setLoading(false);
    }
  }, [user, currentAccount, loadBusinesses, clearSelectedBusinessId]);

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
        currentAccount,
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
