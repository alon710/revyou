import { useState, useEffect, useCallback } from "react";
import { Account } from "@/types/database";
import { getUserAccounts } from "@/lib/firebase/accounts";
import { useAuth } from "@/contexts/AuthContext";

export function useAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAccounts = useCallback(async () => {
    if (!user) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const fetchedAccounts = await getUserAccounts(user.uid);
      setAccounts(fetchedAccounts);
    } catch (error) {
      console.error("Failed to load accounts:", error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  const refreshAccounts = useCallback(async () => {
    await loadAccounts();
  }, [loadAccounts]);

  return {
    accounts,
    loading,
    refreshAccounts,
  };
}
