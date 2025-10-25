"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import {
  deleteBusiness,
  updateBusinessConfig,
} from "@/lib/firebase/businesses";
import { getUserSubscriptionTier } from "@/lib/firebase/users";
import {
  SubscriptionTier,
  SUBSCRIPTION_LIMITS,
  BusinessConfig,
} from "@/types/database";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
import BusinessDetailsCard from "@/components/dashboard/BusinessDetailsCard";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";

export default function BusinessesPage() {
  const { user, loading: authLoading } = useAuth();
  const {
    currentBusiness,
    businesses,
    loading: businessLoading,
    refreshBusinesses,
  } = useBusiness();
  const [subscriptionTier, setSubscriptionTier] =
    useState<SubscriptionTier>("free");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);

  // Debug: Log editMode changes
  useEffect(() => {
    console.log("🔍 EditMode changed:", editMode);
  }, [editMode]);

  useEffect(() => {
    if (!user || authLoading) return;

    const loadSubscription = async () => {
      try {
        const tier = await getUserSubscriptionTier(user.uid);
        setSubscriptionTier(tier);
      } catch (error) {
        console.error("Error loading subscription:", error);
      }
    };

    loadSubscription();
  }, [user, authLoading]);

  const handleDelete = async () => {
    if (!currentBusiness) return;

    try {
      await deleteBusiness(currentBusiness.id);
      toast.success("העסק נמחק בהצלחה");
      await refreshBusinesses();
      setEditMode(false);
    } catch (error) {
      console.error("Error deleting business:", error);
      toast.error("לא ניתן למחוק את העסק");
    }
  };

  const handleSave = async (config: BusinessConfig) => {
    console.log("💾 handleSave called");
    if (!currentBusiness) return;

    try {
      await updateBusinessConfig(currentBusiness.id, config);
      toast.success("ההגדרות נשמרו בהצלחה");
      await refreshBusinesses();
      setEditMode(false);
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("לא ניתן לשמור את ההגדרות");
      throw error;
    }
  };

  const handleCancelEdit = () => {
    console.log("❌ Cancel edit clicked");
    setEditMode(false);
  };

  const maxBusinesses = SUBSCRIPTION_LIMITS[subscriptionTier].businesses;
  const canAddMore =
    maxBusinesses === Infinity || businesses.length < maxBusinesses;

  if (authLoading || businessLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="md" />
      </div>
    );
  }

  // Show empty state if no businesses
  if (businesses.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="העסקים שלי"
          description="נהל את חשבונות Google Business Profile המחוברים שלך"
        />
        <EmptyState />
      </PageContainer>
    );
  }

  // No business selected - just show empty content
  if (!currentBusiness) {
    return (
      <PageContainer>
        <PageHeader
          title="העסקים שלי"
          description="נהל את חשבונות Google Business Profile המחוברים שלך"
        />
        <div className="text-center text-muted-foreground py-12">
          בחר עסק מהתפריט למעלה כדי לראות את הפרטים
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title={editMode ? "עריכת הגדרות" : currentBusiness.name}
        description={editMode ? currentBusiness.name : currentBusiness.address}
        icon={
          !editMode &&
          !currentBusiness.connected && <Badge variant="secondary">מנותק</Badge>
        }
      />

      <BusinessDetailsCard
        variant={editMode ? "edit" : "display"}
        business={currentBusiness}
        onSave={editMode ? handleSave : undefined}
        onCancel={handleCancelEdit}
        loading={businessLoading}
        onSavingChange={setSaving}
        saving={saving}
      />

      {!editMode && (
        <div className="flex items-center justify-end gap-2 mt-6">
          <DeleteConfirmation
            title="מחיקת עסק"
            description={`פעולה זו תמחק את העסק "${currentBusiness.name}" לצמיתות!`}
            items={[
              "כל הביקורות והתגובות המקושרות",
              "הגדרות ותצורות AI",
              "היסטוריית פעילות",
              "חיבור ל-Google Business Profile",
            ]}
            confirmationText={currentBusiness.name}
            confirmationLabel="כדי לאשר, הקלד את שם העסק:"
            confirmationPlaceholder="שם העסק"
            onDelete={handleDelete}
            deleteButtonText="מחק עסק"
            variant="inline"
          />
          <Button
            type="button"
            onClick={() => {
              console.log("🖱️ Edit button clicked");
              setEditMode(true);
            }}
            size="default"
          >
            <Settings className="ml-2 h-5 w-5" />
            עריכה
          </Button>
          <Button asChild disabled={!canAddMore} size="default">
            <Link href="/businesses/connect">
              <Plus className="ml-2 h-5 w-5" />
              חבר עסק
            </Link>
          </Button>
        </div>
      )}
    </PageContainer>
  );
}
