"use client";

import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
  DashboardCardField,
} from "@/components/ui/dashboard-card";
import { User } from "lucide-react";

interface AccountInfoProps {
  displayName: string | null;
  email: string | null;
  uid: string;
}

export function AccountInfo({ displayName, email, uid }: AccountInfoProps) {
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle icon={<User className="h-5 w-5" />}>
          פרטי חשבון
        </DashboardCardTitle>
        <DashboardCardDescription>המידע שלך במערכת</DashboardCardDescription>
      </DashboardCardHeader>
      <DashboardCardContent className="space-y-4">
        {/* Name */}
        {displayName && (
          <DashboardCardField label="שם" value={displayName} />
        )}

        {/* Email */}
        {email && <DashboardCardField label="כתובת אימייל" value={email} />}

        {/* User ID */}
        <DashboardCardField label="מזהה משתמש">
          <p className="text-sm font-mono text-muted-foreground/80 break-all bg-muted/50 p-2 rounded-md">
            {uid}
          </p>
        </DashboardCardField>
      </DashboardCardContent>
    </DashboardCard>
  );
}
