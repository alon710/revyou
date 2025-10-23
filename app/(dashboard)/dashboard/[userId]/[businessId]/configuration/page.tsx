"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { updateBusinessConfig } from "@/lib/firebase/businesses";
import { BusinessConfig } from "@/types/database";
import { Settings, Building2 } from "lucide-react";
import BusinessConfigForm from "@/components/dashboard/BusinessConfigForm";
import { useToast } from "@/hooks/use-toast";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";

/**
 * Business Configuration Page
 * Edit all business-specific settings including prompt templates and variables
 */
export default function BusinessConfigurationPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const {
    currentBusiness,
    loading: businessLoading,
    refreshBusinesses,
  } = useBusiness();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  // Verify params match context
  useEffect(() => {
    if (!user || businessLoading) return;

    // Verify userId matches
    if (params.userId !== user.uid) {
      router.push("/businesses");
      return;
    }

    // If no business selected or wrong business, redirect
    if (!currentBusiness) {
      router.push("/businesses");
      return;
    }

    if (params.businessId !== currentBusiness.id) {
      router.push(`/dashboard/${user.uid}/${currentBusiness.id}/configuration`);
      return;
    }
  }, [user, currentBusiness, businessLoading, params, router]);

  // Handle save
  const handleSave = async (config: BusinessConfig) => {
    if (!currentBusiness) return;

    try {
      setSaving(true);
      await updateBusinessConfig(currentBusiness.id, config);

      toast({
        title: "נשמר בהצלחה",
        description: "הגדרות העסק עודכנו",
      });

      // Refresh business data in context
      await refreshBusinesses();
    } catch (error) {
      console.error("Error saving config:", error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לשמור את ההגדרות",
        variant: "destructive",
      });
      throw error; // Re-throw so form can handle it
    } finally {
      setSaving(false);
    }
  };

  if (businessLoading || !currentBusiness) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <Loading size="md" text="טוען עסק..." />
        </div>
      </div>
    );
  }

  return (
    <PageContainer maxWidth="4xl">
      <PageHeader
        title="תצורת עסק"
        description={currentBusiness.name}
        icon={
          <div className="p-2 bg-primary/10 rounded-lg">
            <Settings className="h-6 w-6 text-primary" />
          </div>
        }
      />

      {/* Configuration Form */}
      <BusinessConfigForm
        initialConfig={currentBusiness.config}
        onSave={handleSave}
        loading={saving}
      />
    </PageContainer>
  );
}
