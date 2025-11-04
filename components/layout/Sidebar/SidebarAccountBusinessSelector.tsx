"use client";

import { useState, useEffect, useCallback } from "react";
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
import { Check, ChevronDown, Plus, Loader2, Building2 } from "lucide-react";
import { getAccountBusinesses } from "@/lib/firebase/business";
import { AddAccountDialog } from "@/components/dashboard/accounts/AddAccountDialog";
import { AddBusinessDialog } from "@/components/dashboard/businesses/AddBusinessDialog";
import type { AccountWithBusinesses } from "@/types/database";

export function SidebarAccountBusinessSelector() {
  const { user } = useAuth();
  const { accounts, currentAccount, selectAccount } = useAccount();
  const { currentBusiness, selectBusiness } = useBusiness();
  const [accountsWithBusinesses, setAccountsWithBusinesses] = useState<
    AccountWithBusinesses[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [addAccountDialogOpen, setAddAccountDialogOpen] = useState(false);
  const [addBusinessDialogOpen, setAddBusinessDialogOpen] = useState(false);

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
          console.error(`Error loading businesses for account ${account.id}:`, error);
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

  const handleBusinessSelect = async (accountId: string, businessId: string) => {
    // Switch account if different
    if (currentAccount?.id !== accountId) {
      await selectAccount(accountId);
    }
    // Then switch business
    await selectBusiness(businessId);
  };

  if (loading) {
    return (
      <Button variant="outline" className="w-full justify-center" disabled>
        <Loader2 className="h-4 w-4 animate-spin ml-2" />
        <span>טוען...</span>
      </Button>
    );
  }

  if (accounts.length === 0) {
    return (
      <Button
        variant="outline"
        className="w-full justify-center text-muted-foreground cursor-default"
        disabled
      >
        <Building2 className="h-4 w-4 ml-2" />
        <span>אין חשבונות מחוברים</span>
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between text-right [direction:rtl]"
          >
            <div className="flex flex-col items-end flex-1 min-w-0">
              <span className="font-medium truncate text-sm">
                {currentAccount?.accountName || "בחר חשבון"} /{" "}
                {currentBusiness?.name || "בחר עסק"}
              </span>
            </div>
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

              {/* Account Header (non-clickable label) */}
              <DropdownMenuLabel className="text-right font-semibold text-foreground">
                {account.accountName}
              </DropdownMenuLabel>

              {/* Businesses under this account */}
              {account.businesses.length > 0 ? (
                account.businesses.map((business) => {
                  const isSelected =
                    currentAccount?.id === account.id &&
                    currentBusiness?.id === business.id;

                  return (
                    <DropdownMenuItem
                      key={business.id}
                      onClick={() => handleBusinessSelect(account.id, business.id)}
                      className="cursor-pointer pr-8"
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
                <div className="px-2 py-1.5 text-sm text-muted-foreground text-right pr-8">
                  אין עסקים מחוברים
                </div>
              )}
            </div>
          ))}

          <DropdownMenuSeparator />

          {/* Add Business */}
          <DropdownMenuItem
            onClick={() => setAddBusinessDialogOpen(true)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2 w-full flex-row-reverse text-primary">
              <span className="font-medium">הוסף עסק</span>
              <Plus className="h-4 w-4" />
            </div>
          </DropdownMenuItem>

          {/* Add Account */}
          <DropdownMenuItem
            onClick={() => setAddAccountDialogOpen(true)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2 w-full flex-row-reverse text-primary">
              <span className="font-medium">הוסף חשבון</span>
              <Plus className="h-4 w-4" />
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AddAccountDialog
        open={addAccountDialogOpen}
        onOpenChange={setAddAccountDialogOpen}
      />

      <AddBusinessDialog
        open={addBusinessDialogOpen}
        onOpenChange={setAddBusinessDialogOpen}
      />
    </>
  );
}
