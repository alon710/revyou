"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Location } from "@/types/database";
import { getLocation, getUserLocations } from "@/lib/firebase/locations";
import { useAuth } from "@/contexts/AuthContext";
import { useUIStore } from "@/lib/store/ui-store";

interface LocationContextType {
  currentLocation: Location | null;
  locations: Location[];
  selectedLocationId: string | null;
  selectLocation: (locationId: string) => void;
  clearLocation: () => void;
  loading: boolean;
  refreshLocations: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(
  undefined
);

export function LocationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { selectedLocationId, setSelectedLocationId, clearSelectedLocationId } =
    useUIStore();
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);

  const selectLocation = useCallback(
    (locationId: string) => {
      setSelectedLocationId(locationId);
    },
    [setSelectedLocationId]
  );

  const loadLocations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const fetchedLocations = await getUserLocations(user.uid);
      const connected = fetchedLocations.filter((l) => l.connected);
      setLocations(connected);

      if (!selectedLocationId && connected.length > 0) {
        selectLocation(connected[0].id);
      } else if (selectedLocationId) {
        const stillExists = connected.find((l) => l.id === selectedLocationId);
        if (!stillExists && connected.length > 0) {
          selectLocation(connected[0].id);
        } else if (!stillExists) {
          clearSelectedLocationId();
          setCurrentLocation(null);
        }
      }
    } catch (_error) {
      console.error("Failed to load locations:", _error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [user, selectedLocationId, selectLocation, clearSelectedLocationId]);

  const loadCurrentLocation = useCallback(
    async (locationId: string) => {
      if (!user) return;
      try {
        const location = await getLocation(user.uid, locationId);
        setCurrentLocation(location);
      } catch (_error) {
        console.error("Failed to load current location:", _error);
        setCurrentLocation(null);
      }
    },
    [user]
  );

  const clearLocation = useCallback(() => {
    clearSelectedLocationId();
    setCurrentLocation(null);
  }, [clearSelectedLocationId]);

  useEffect(() => {
    if (user) {
      loadLocations();
    } else {
      setLocations([]);
      setCurrentLocation(null);
      clearSelectedLocationId();
      setLoading(false);
    }
  }, [user, loadLocations, clearSelectedLocationId]);

  useEffect(() => {
    if (selectedLocationId && user) {
      loadCurrentLocation(selectedLocationId);
    } else {
      setCurrentLocation(null);
    }
  }, [selectedLocationId, user, loadCurrentLocation]);

  const refreshLocations = useCallback(async () => {
    await loadLocations();
    if (selectedLocationId) {
      await loadCurrentLocation(selectedLocationId);
    }
  }, [loadLocations, selectedLocationId, loadCurrentLocation]);

  return (
    <LocationContext.Provider
      value={{
        currentLocation,
        locations,
        selectedLocationId,
        selectLocation,
        clearLocation,
        loading,
        refreshLocations,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error("useLocation must be used within a LocationProvider");
  }
  return context;
}
