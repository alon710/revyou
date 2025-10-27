"use client";

import { useState } from "react";
import { Business } from "@/types/database";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
  DashboardCardField,
} from "@/components/ui/dashboard-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Settings } from "lucide-react";
import { NotificationPreferencesEditModal } from "@/components/dashboard/settings/NotificationPreferencesEditModal";

interface NotificationPreferencesSectionProps {
  business: Business;
  loading?: boolean;
  onSave: (data: { emailOnNewReview: boolean }) => Promise<void>;
}

export default function NotificationPreferencesSection({
  business,
  loading,
  onSave,
}: NotificationPreferencesSectionProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <DashboardCardTitle icon={<Bell className="h-5 w-5" />}>
                התראות אימייל
              </DashboardCardTitle>
              <DashboardCardDescription>
                בחר אילו התראות תרצה לקבל באימייל עבור עסק זה
              </DashboardCardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
              disabled={loading}
            >
              <Settings className="ml-2 h-4 w-4" />
              עריכה
            </Button>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent>
          <DashboardCardField label="">
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-foreground">
                קבל התראה באימייל כאשר מתקבלת ביקורת חדשה
              </p>
              <Badge variant={business.emailOnNewReview ? "default" : "secondary"}>
                {business.emailOnNewReview ? "מופעל" : "כבוי"}
              </Badge>
            </div>
          </DashboardCardField>
        </DashboardCardContent>
      </DashboardCard>

      <NotificationPreferencesEditModal
        emailOnNewReview={business.emailOnNewReview}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={onSave}
      />
    </>
  );
}
