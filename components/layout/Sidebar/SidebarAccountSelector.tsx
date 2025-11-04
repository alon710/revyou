"use client";

import { useAccount } from "@/contexts/AccountContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarAccountSelector() {
  const { accounts, currentAccount, selectAccount, loading } = useAccount();

  if (loading || accounts.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-between text-right [direction:rtl]"
        >
          <div className="flex flex-col items-end flex-1 min-w-0">
            <span className="font-medium truncate text-sm">
              {currentAccount?.accountName || "בחר חשבון"}
            </span>
            {currentAccount?.email && (
              <span className="text-xs text-muted-foreground truncate">
                {currentAccount.email}
              </span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50 mr-2" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-[240px] [direction:rtl]"
        sideOffset={5}
      >
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal text-right">
          החשבונות שלי
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {accounts.map((account) => {
          const isSelected = currentAccount?.id === account.id;

          return (
            <DropdownMenuItem
              key={account.id}
              onClick={() => selectAccount(account.id)}
              className={cn(
                "cursor-pointer flex-col items-start py-3",
                isSelected && "bg-accent"
              )}
            >
              <div className="flex items-center gap-2 w-full flex-row-reverse">
                <div className="flex flex-col flex-1 min-w-0 items-end">
                  <span className="font-medium truncate text-right w-full">
                    {account.accountName}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span className="truncate">{account.email}</span>
                    <Mail className="h-3 w-3 shrink-0" />
                  </div>
                </div>
                {isSelected && (
                  <Check className="h-4 w-4 shrink-0 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
