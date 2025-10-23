"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useBusiness } from "@/contexts/BusinessContext";
import { updateBusinessConfig } from "@/lib/firebase/businesses";
import { BusinessConfig } from "@/types/database";
import { BackButton } from "@/components/ui/back-button";
import BusinessConfigForm from "@/components/dashboard/BusinessConfigForm";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";

/**
 * Business Edit Page
 * Edit business configuration and AI settings for selected business
 */
export default function BusinessEditPage() {
  const router = useRouter();
  const { currentBusiness, loading, refreshBusinesses } = useBusiness();

  // Redirect if no business selected
  useEffect(() => {
    if (!loading && !currentBusiness) {
      toast.error("אנא בחר עסק לעריכה");
      router.push("/businesses");
    }
  }, [currentBusiness, loading, router]);

  // Handle save
  const handleSave = async (config: BusinessConfig) => {
    if (!currentBusiness) return;

    try {
      await updateBusinessConfig(currentBusiness.id, config);
      toast.success("ההגדרות נשמרו בהצלחה");

      // Refresh businesses to get updated data
      await refreshBusinesses();

      // Navigate back to business details
      router.push("/businesses");
    } catch (error) {
      console.error("Error saving config:", error);
      toast.error("לא ניתן לשמור את ההגדרות");
      throw error; // Re-throw so form can handle it
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loading size="md" />
      </div>
    );
  }

  if (!currentBusiness) {
    return null;
  }

  return (
    <PageContainer maxWidth="4xl">
      <div className="flex items-center gap-4 mb-6">
        <BackButton href="/businesses" />
      </div>

      <PageHeader title="עריכת הגדרות" description={currentBusiness.name} />

      {/* Configuration Form */}
      <BusinessConfigForm
        initialConfig={currentBusiness.config}
        onSave={handleSave}
        loading={loading}
      />
    </PageContainer>
  );
}
