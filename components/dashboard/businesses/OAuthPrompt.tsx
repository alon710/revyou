"use client";

import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { Building2 } from "lucide-react";

interface OAuthPromptProps {
  onConnect: () => void;
  loading?: boolean;
}

export function OAuthPrompt({ onConnect, loading }: OAuthPromptProps) {
  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>התחבר ל-Google Business Profile</DashboardCardTitle>
        <DashboardCardDescription>
          אנחנו צריכים הרשאה כדי לגשת לחשבון Google Business Profile שלך ולנהל
          תשובות לביקורות
        </DashboardCardDescription>
      </DashboardCardHeader>
      <DashboardCardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg" dir="rtl">
          <h4 className="font-semibold mb-2">נבקש גישה להרשאות הבאות</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>רשימת העסקים שלך ב-Google Business Profile</span>
            </li>
            <li className="flex items-start gap-2">
              <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>קריאת ביקורות לקוחות</span>
            </li>
            <li className="flex items-start gap-2">
              <Building2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>פרסום תשובות לביקורות</span>
            </li>
          </ul>
        </div>

        <Button onClick={onConnect} disabled={loading} className="w-full">
          התחבר עם Google
        </Button>
      </DashboardCardContent>
    </DashboardCard>
  );
}
