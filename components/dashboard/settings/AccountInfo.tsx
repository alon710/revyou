"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface AccountInfoProps {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  uid: string;
}

export function AccountInfo({
  displayName,
  email,
  photoURL,
  uid,
}: AccountInfoProps) {
  // Get initials for avatar fallback
  const getInitials = () => {
    if (displayName) {
      return displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <User className="h-5 w-5" />
          <CardTitle>פרטי חשבון</CardTitle>
        </div>
        <CardDescription>המידע שלך במערכת</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-4">
          {/* User Details */}
          <div className="flex-1 space-y-3">
            {/* Name */}
            {displayName && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">שם</p>
                <p className="text-sm font-medium">{displayName}</p>
              </div>
            )}

            {/* Email */}
            {email && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">
                  כתובת אימייל
                </p>
                <p className="text-sm font-medium">{email}</p>
              </div>
            )}

            {/* User ID */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">מזהה משתמש</p>
              <p className="text-sm font-mono text-muted-foreground break-all">
                {uid}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
