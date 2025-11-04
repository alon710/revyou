"use client";

import { useEffect, useState } from "react";
import { useAccount } from "@/contexts/AccountContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { useAuth } from "@/contexts/AuthContext";
import { getAccountBusinesses } from "@/lib/firebase/business";
import type { Business } from "@/types/database";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { Briefcase, Check, Loader2 } from "lucide-react";

export function AccountBusinessSwitcher() {
  const { user } = useAuth();
  const {
    accounts,
    currentAccount,
    selectAccount,
    loading: accountsLoading,
  } = useAccount();
  const { selectedBusinessId, selectBusiness } = useBusiness();

  // Store businesses for each account
  const [accountBusinessesMap, setAccountBusinessesMap] = useState<
    Record<string, Business[]>
  >({});
  const [loadingAccountIds, setLoadingAccountIds] = useState<Set<string>>(
    new Set()
  );

  // Load businesses for all accounts
  useEffect(() => {
    const loadAllAccountBusinesses = async () => {
      if (!user || accounts.length === 0) return;

      const newLoadingIds = new Set<string>();
      accounts.forEach((account) => newLoadingIds.add(account.id));
      setLoadingAccountIds(newLoadingIds);

      // Fetch businesses for all accounts in parallel
      const businessPromises = accounts.map(async (account) => {
        try {
          const businesses = await getAccountBusinesses(user.uid, account.id);
          return { accountId: account.id, businesses };
        } catch (error) {
          console.error(
            `Failed to load businesses for account ${account.id}:`,
            error
          );
          return { accountId: account.id, businesses: [] };
        }
      });

      const results = await Promise.all(businessPromises);

      // Build the businesses map
      const businessesMap: Record<string, Business[]> = {};
      results.forEach(({ accountId, businesses }) => {
        businessesMap[accountId] = businesses;
      });

      setAccountBusinessesMap(businessesMap);
      setLoadingAccountIds(new Set());
    };

    loadAllAccountBusinesses();
  }, [user, accounts]);

  const handleAccountClick = (accountId: string) => {
    selectAccount(accountId);
  };

  const handleBusinessClick = (
    businessId: string,
    businessAccountId: string
  ) => {
    if (currentAccount?.id !== businessAccountId) {
      selectAccount(businessAccountId);
    }

    selectBusiness(businessId);
  };

  if (accountsLoading || accounts.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <IconButton
          icon={Briefcase}
          aria-label="Switch account or business"
          variant="ghost"
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px] [direction:rtl]">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal text-right">
          חשבונות ועסקים
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {accounts.map((account, index) => {
          const accountBusinesses = accountBusinessesMap[account.id] || [];
          const isLoadingBusinesses = loadingAccountIds.has(account.id);
          const isCurrentAccount = currentAccount?.id === account.id;

          return (
            <div key={account.id}>
              {/* Account Header */}
              <DropdownMenuItem
                onClick={() => handleAccountClick(account.id)}
                className="cursor-pointer flex-col items-start py-3"
              >
                <div className="flex items-center gap-2 w-full flex-row-reverse">
                  <div className="flex flex-col flex-1 min-w-0 items-end">
                    <span className="font-medium truncate text-right w-full">
                      {account.accountName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate text-right w-full">
                      {account.email}
                    </span>
                  </div>
                  {isCurrentAccount && (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </div>
              </DropdownMenuItem>

              {/* Businesses under this account (always shown) */}
              {isLoadingBusinesses ? (
                <div className="pl-6 pb-2 flex items-center gap-2 text-sm text-muted-foreground flex-row-reverse justify-end py-2">
                  <span>טוען עסקים...</span>
                  <Loader2 className="h-3 w-3 animate-spin" />
                </div>
              ) : accountBusinesses.length > 0 ? (
                <div className="pl-6 pb-2">
                  {accountBusinesses.map((business) => (
                    <DropdownMenuItem
                      key={business.id}
                      onClick={() =>
                        handleBusinessClick(business.id, account.id)
                      }
                      className="cursor-pointer text-sm"
                    >
                      <div className="flex items-center gap-2 w-full flex-row-reverse">
                        <span className="truncate text-right flex-1">
                          {business.name}
                        </span>
                        {selectedBusinessId === business.id && (
                          <Check className="h-3 w-3 shrink-0 text-primary" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </div>
              ) : (
                <div className="pl-6 pb-2 text-xs text-muted-foreground text-right py-2">
                  אין עסקים מחוברים
                </div>
              )}

              {/* Separator between accounts (except last one) */}
              {index < accounts.length - 1 && <DropdownMenuSeparator />}
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
