"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { Account } from "@/types/database";
import { getUserAccounts } from "@/lib/firebase/accounts";
import { useAuth } from "@/contexts/AuthContext";

interface AccountContextType {
  currentAccount: Account | null;
  accounts: Account[];
  selectedAccountId: string | null;
  loading: boolean;
  selectAccount: (accountId: string) => void;
  refreshAccounts: () => Promise<void>;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

const STORAGE_KEY = "selectedAccountId";

export function AccountProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    () => {
      if (typeof window !== "undefined") {
        return localStorage.getItem(STORAGE_KEY);
      }
      return null;
    }
  );
  const [currentAccount, setCurrentAccount] = useState<Account | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Persist selectedAccountId to localStorage
  useEffect(() => {
    if (selectedAccountId) {
      localStorage.setItem(STORAGE_KEY, selectedAccountId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedAccountId]);

  const selectAccount = useCallback((accountId: string) => {
    setSelectedAccountId(accountId);
  }, []);

  const clearSelectedAccountId = useCallback(() => {
    setSelectedAccountId(null);
  }, []);

  const loadAccounts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const fetchedAccounts = await getUserAccounts(user.uid);
      setAccounts(fetchedAccounts);

      // Auto-select first account if none selected
      if (!selectedAccountId && fetchedAccounts.length > 0) {
        selectAccount(fetchedAccounts[0].id);
      } else if (selectedAccountId) {
        // Check if selected account still exists
        const stillExists = fetchedAccounts.find(
          (acc) => acc.id === selectedAccountId
        );
        if (!stillExists && fetchedAccounts.length > 0) {
          // Selected account no longer exists, select first one
          selectAccount(fetchedAccounts[0].id);
        } else if (!stillExists) {
          // No accounts at all
          clearSelectedAccountId();
          setCurrentAccount(null);
        }
      }
    } catch (error) {
      console.error("Failed to load accounts:", error);
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  }, [user, selectedAccountId, selectAccount, clearSelectedAccountId]);

  // Load current account when selection changes
  useEffect(() => {
    if (selectedAccountId && accounts.length > 0) {
      const account = accounts.find((acc) => acc.id === selectedAccountId);
      setCurrentAccount(account || null);
    } else {
      setCurrentAccount(null);
    }
  }, [selectedAccountId, accounts]);

  // Load accounts when user changes
  useEffect(() => {
    if (user) {
      loadAccounts();
    } else {
      setAccounts([]);
      setCurrentAccount(null);
      setSelectedAccountId(null);
      setLoading(false);
    }
  }, [user, loadAccounts]);

  const refreshAccounts = useCallback(async () => {
    await loadAccounts();
  }, [loadAccounts]);

  const value: AccountContextType = {
    currentAccount,
    accounts,
    selectedAccountId,
    loading,
    selectAccount,
    refreshAccounts,
  };

  return (
    <AccountContext.Provider value={value}>{children}</AccountContext.Provider>
  );
}

export function useAccount() {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccount must be used within an AccountProvider");
  }
  return context;
}
