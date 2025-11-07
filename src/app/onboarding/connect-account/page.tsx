"use client";

import { useState } from "react";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { Building2 } from "lucide-react";

export default function OnboardingStep2() {
  const [connecting, setConnecting] = useState(false);

  const handleConnect = () => {
    setConnecting(true);
    window.location.href = "/api/google/auth?onboarding=true";
  };

  return (
    <div>
      <StepIndicator currentStep={1} stepName="התחברות לחשבון Google" />

      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle>התחבר לחשבון Google שלך</DashboardCardTitle>
          <DashboardCardDescription>
            התחל בחיבור חשבון Google Business Profile כדי לנהל תשובות לביקורות
            באמצעות AI
          </DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg" dir="rtl">
            <h4 className="font-semibold mb-2">מה נבקש גישה אליו:</h4>
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

          <Button
            onClick={handleConnect}
            disabled={connecting}
            className="w-full"
          >
            {connecting ? "מתחבר..." : "התחבר עם Google"}
          </Button>
        </DashboardCardContent>
      </DashboardCard>
    </div>
  );
}
