"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Business } from "@/types/database";
import { getBusiness, getUserBusinesses } from "@/lib/firebase/businesses";
import { useAuth } from "./AuthContext";

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

const STORAGE_KEY = "selectedBusinessId";

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [currentBusiness, setCurrentBusiness] = useState<Business | null>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSelectedBusinessId(stored);
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadBusinesses();
    } else {
      setBusinesses([]);
      setCurrentBusiness(null);
      setSelectedBusinessId(null);
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedBusinessId && user) {
      loadCurrentBusiness(selectedBusinessId);
    } else {
      setCurrentBusiness(null);
    }
  }, [selectedBusinessId, user]);

  const loadBusinesses = async () => {
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
          clearBusiness();
        }
      }
    } catch (error) {
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentBusiness = async (businessId: string) => {
    try {
      const business = await getBusiness(businessId);
      setCurrentBusiness(business);
    } catch (error) {
      setCurrentBusiness(null);
    }
  };

  const selectBusiness = (businessId: string) => {
    setSelectedBusinessId(businessId);

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, businessId);
    }
  };

  const clearBusiness = () => {
    setSelectedBusinessId(null);
    setCurrentBusiness(null);

    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const refreshBusinesses = async () => {
    await loadBusinesses();
  };

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
