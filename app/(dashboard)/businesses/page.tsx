"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { deleteBusiness, updateBusinessConfig } from "@/lib/firebase/businesses";
import { getUserSubscriptionTier } from "@/lib/firebase/users";
import { SubscriptionTier, SUBSCRIPTION_LIMITS, BusinessConfig } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Settings, X, Save } from "lucide-react";
import Link from "next/link";
import EmptyBusinessState from "@/components/dashboard/EmptyBusinessState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
import BusinessDetailsCard from "@/components/dashboard/BusinessDetailsCard";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";

/**
 * Business Management Page
 * Shows selected business details and allows management
 */
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

  // Empty State - No businesses connected
  if (businesses.length === 0) {
    return (
      <PageContainer>
        <PageHeader
          title="העסקים שלי"
          description="נהל את חשבונות Google Business Profile המחוברים שלך"
        />
        <Card>
          <CardContent className="pt-6">
            <EmptyBusinessState />
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // No business selected - Show selection prompt
  if (!currentBusiness) {
    return (
      <PageContainer>
        <PageHeader
          title="העסקים שלי"
          description="נהל את חשבונות Google Business Profile המחוברים שלך"
          actions={
            <Button asChild disabled={!canAddMore}>
              <Link href="/businesses/connect">
                <Plus className="ml-2 h-5 w-5" />
                חבר עסק
              </Link>
            </Button>
          }
        />

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              בחר עסק מהתפריט למעלה כדי לראות את הפרטים
            </p>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  // Show selected business details
  return (
    <PageContainer>
      <PageHeader
        title={editMode ? "עריכת הגדרות" : currentBusiness.name}
        description={editMode ? currentBusiness.name : currentBusiness.address}
        icon={
          !editMode && !currentBusiness.connected && (
            <Badge variant="secondary">מנותק</Badge>
          )
        }
        actions={
          <div className="flex gap-2">
            {editMode ? (
              <>
                <Button
                  type="submit"
                  form="business-config-form"
                  disabled={saving || businessLoading}
                  size="default"
                >
                  <Save className="ml-2 h-5 w-5" />
                  שמור שינויים
                </Button>
                <Button variant="outline" onClick={handleCancelEdit}>
                  <X className="ml-2 h-5 w-5" />
                  ביטול
                </Button>
              </>
            ) : (
              <>
                <Button asChild disabled={!canAddMore}>
                  <Link href="/businesses/connect">
                    <Plus className="ml-2 h-5 w-5" />
                    חבר עסק
                  </Link>
                </Button>
                <Button onClick={() => setEditMode(true)}>
                  <Settings className="ml-2 h-5 w-5" />
                  עריכה
                </Button>
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
              </>
            )}
          </div>
        }
      />

      <BusinessDetailsCard
        variant={editMode ? "edit" : "display"}
        business={currentBusiness}
        onSave={editMode ? handleSave : undefined}
        loading={businessLoading}
        onSavingChange={setSaving}
      />
    </PageContainer>
  );
}
