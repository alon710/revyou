"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
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
import { Button } from "@/components/ui/button";
import { Check, ChevronDown } from "lucide-react";
import { getAccountBusinesses } from "@/lib/firebase/business";
import type { AccountWithBusinesses } from "@/types/database";

export function SidebarAccountBusinessSelector() {
  const router = useRouter();
  const { user } = useAuth();
  const { accounts, currentAccount, selectAccount } = useAccount();
  const { currentBusiness, selectBusiness } = useBusiness();
  const [accountsWithBusinesses, setAccountsWithBusinesses] = useState<
    AccountWithBusinesses[]
  >([]);
  const [loading, setLoading] = useState(true);

  const loadBusinessesForAccounts = useCallback(async () => {
    if (!user || accounts.length === 0) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const promises = accounts.map(async (account) => {
        try {
          const businesses = await getAccountBusinesses(user.uid, account.id);
          return { ...account, businesses };
        } catch (error) {
          console.error(
            `Error loading businesses for account ${account.id}:`,
            error
          );
          return { ...account, businesses: [] };
        }
      });
      const results = await Promise.all(promises);
      setAccountsWithBusinesses(results);
    } catch (error) {
      console.error("Error loading businesses for accounts:", error);
    } finally {
      setLoading(false);
    }
  }, [user, accounts]);

  useEffect(() => {
    loadBusinessesForAccounts();
  }, [loadBusinessesForAccounts]);

  const handleBusinessSelect = async (
    accountId: string,
    businessId: string
  ) => {
    if (currentAccount?.id !== accountId) {
      await selectAccount(accountId);
    }
    await selectBusiness(businessId);
  };

  if (loading) {
    return (
      <Button variant="outline" className="w-full justify-start " disabled>
        <span className="px-2">טוען...</span>
      </Button>
    );
  }

  if (accounts.length === 0) {
    return (
      <Button
        variant="outline"
        className="w-full justify-start text-muted-foreground cursor-default"
        disabled
      >
        <span>אין חשבונות מחוברים</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-right [direction:rtl]"
        >
          <span className="font-medium truncate text-sm flex-1 text-right">
            {currentBusiness?.name || "בחר עסק"}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50 mr-2" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[280px] [direction:rtl]"
        sideOffset={5}
      >
        {accountsWithBusinesses.map((account, accountIndex) => (
          <div key={account.id}>
            {accountIndex > 0 && <DropdownMenuSeparator />}

            <DropdownMenuLabel className="text-right font-semibold text-foreground px-2 py-2">
              {account.accountName}
            </DropdownMenuLabel>

            {account.businesses.length > 0 ? (
              account.businesses.map((business) => {
                const isSelected =
                  currentAccount?.id === account.id &&
                  currentBusiness?.id === business.id;

                return (
                  <DropdownMenuItem
                    key={business.id}
                    onClick={() =>
                      handleBusinessSelect(account.id, business.id)
                    }
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2 w-full flex-row-reverse">
                      <span className="truncate text-right flex-1">
                        {business.name}
                      </span>
                      {isSelected && (
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })
            ) : (
              <div className="px-2 py-1.5 text-sm text-muted-foreground text-right">
                אין עסקים מחוברים
              </div>
            )}
          </div>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push("/dashboard/businesses/connect")}
          className="cursor-pointer text-right"
        >
          <span className="font-medium text-primary w-full text-right">
            הוסף עסק
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
