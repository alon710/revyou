"use client";

import { useAccount } from "@/contexts/AccountContext";
import { useBusiness } from "@/contexts/BusinessContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IconButton } from "@/components/ui/icon-button";
import { Briefcase, Check } from "lucide-react";

export function AccountBusinessSwitcher() {
  const {
    accounts,
    currentAccount,
    selectAccount,
    loading: accountsLoading,
  } = useAccount();
  const {
    businesses,
    selectedBusinessId,
    selectBusiness,
    loading: businessesLoading,
  } = useBusiness();

  const handleAccountClick = (accountId: string) => {
    // Switch to this account (will automatically load its businesses)
    selectAccount(accountId);
  };

  const handleBusinessClick = (
    businessId: string,
    businessAccountId: string
  ) => {
    // If business belongs to a different account, switch account first
    if (currentAccount?.id !== businessAccountId) {
      selectAccount(businessAccountId);
    }
    // Then select the business
    selectBusiness(businessId);
  };

  // Get businesses for a specific account
  const getAccountBusinesses = (accountId: string) => {
    // Note: businesses array only contains businesses from currentAccount
    // So we only show businesses when viewing that account
    if (currentAccount?.id === accountId) {
      return businesses;
    }
    return [];
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
          const accountBusinesses = getAccountBusinesses(account.id);
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

              {/* Businesses under this account (only shown for current account) */}
              {isCurrentAccount && accountBusinesses.length > 0 && (
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
