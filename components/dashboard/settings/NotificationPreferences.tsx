"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
  DashboardCardField,
} from "@/components/ui/dashboard-card";
import { Bell, Settings } from "lucide-react";
import { NotificationPreferencesEditModal } from "./NotificationPreferencesEditModal";

interface NotificationPreferencesProps {
  emailOnNewReview: boolean;
  loading?: boolean;
  onUpdate: (preferences: {
    emailOnNewReview: boolean;
  }) => Promise<void>;
}

export function NotificationPreferences({
  emailOnNewReview,
  loading,
  onUpdate,
}: NotificationPreferencesProps) {
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
                בחר אילו התראות תרצה לקבל באימייל
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
          {/* Email on New Review */}
          <DashboardCardField label="">
            <div className="flex items-center justify-between w-full">
              <p className="text-sm text-foreground">
                קבל התראה באימייל כאשר מתקבלת ביקורת חדשה
              </p>
              <Badge variant={emailOnNewReview ? "default" : "secondary"}>
                {emailOnNewReview ? "מופעל" : "כבוי"}
              </Badge>
            </div>
          </DashboardCardField>
        </DashboardCardContent>
      </DashboardCard>

      <NotificationPreferencesEditModal
        emailOnNewReview={emailOnNewReview}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={onUpdate}
      />
    </>
  );
}
