"use client";

import type { Account } from "@/lib/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AccountAvatarDropdownProps {
  account: Account;
}

export function AccountAvatarDropdown({ account }: AccountAvatarDropdownProps) {
  const getInitials = () => {
    if (account.accountName) {
      return account.accountName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (account.email) {
      return account.email[0].toUpperCase();
    }
    return "A";
  };

  return (
    <Avatar className="h-10 w-10">
      <AvatarFallback className="bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
    </Avatar>
  );
}
