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
        .trim()
        .split(" ")
        .filter((segment) => segment.length > 0)
        .map((segment) => segment[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (account.email) {
      const trimmedEmail = account.email.trim();
      if (trimmedEmail.length > 0) {
        return trimmedEmail[0].toUpperCase();
      }
    }
    return "AB";
  };

  return (
    <Avatar className="h-10 w-10">
      <AvatarFallback className="bg-primary text-primary-foreground">{getInitials()}</AvatarFallback>
    </Avatar>
  );
}
