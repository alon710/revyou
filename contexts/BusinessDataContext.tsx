"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getBusiness } from "@/lib/firebase/business";
import { Business } from "@/types/database";

interface BusinessDataContextType {
  business: Business;
  refreshBusiness: () => Promise<void>;
}

const BusinessDataContext = createContext<BusinessDataContextType | undefined>(
  undefined
);

export function useBusinessData() {
  const context = useContext(BusinessDataContext);
  if (context === undefined) {
    throw new Error(
      "useBusinessData must be used within a BusinessDataProvider"
    );
  }
  return context;
}

interface BusinessDataProviderProps {
  children: ReactNode;
  businessId: string;
}

export function BusinessDataProvider({
  children,
  businessId,
}: BusinessDataProviderProps) {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBusiness = useCallback(async () => {
    if (!user || !businessId) return;

    try {
      setLoading(true);
      setError(null);
      const businessData = await getBusiness(user.uid, businessId);
      setBusiness(businessData);
    } catch (err) {
      console.error("Failed to load business:", err);
      setError("העסק לא נמצא");
      setBusiness(null);
    } finally {
      setLoading(false);
    }
  }, [user, businessId]);

  useEffect(() => {
    if (user && businessId) {
      loadBusiness();
    }
  }, [user, businessId, loadBusiness]);

  const refreshBusiness = async () => {
    await loadBusiness();
  };

  if (loading) {
    return null;
  }

  if (error || !business) {
    return null;
  }

  return (
    <BusinessDataContext.Provider value={{ business, refreshBusiness }}>
      {children}
    </BusinessDataContext.Provider>
  );
}
