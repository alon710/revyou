"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getBusiness, updateBusinessConfig } from "@/lib/firebase/businesses";
import { Business, BusinessConfig } from "@/types/database";
import { BackButton } from "@/components/ui/back-button";
import BusinessConfigForm from "@/components/dashboard/BusinessConfigForm";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { Loading } from "@/components/ui/loading";

/**
 * Business Edit Page
 * Edit business configuration and AI settings
 */
export default function BusinessEditPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);

  // Load business data
  useEffect(() => {
    const loadBusiness = async () => {
      try {
        setLoading(true);
        const data = await getBusiness(businessId);

        if (!data) {
          toast.error("העסק לא נמצא");
          router.push("/businesses");
          return;
        }

        setBusiness(data);
      } catch (error) {
        console.error("Error loading business:", error);
        toast.error("לא ניתן לטעון את פרטי העסק");
      } finally {
        setLoading(false);
      }
    };

    loadBusiness();
  }, [businessId, router]);

  // Handle save
  const handleSave = async (config: BusinessConfig) => {
    try {
      await updateBusinessConfig(businessId, config);
      toast.success("ההגדרות נשמרו בהצלחה");

      // Update local state
      if (business) {
        setBusiness({ ...business, config });
      }

      // Navigate back to business details
      router.push(`/businesses/${businessId}`);
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

  if (!business) {
    return null;
  }

  return (
    <PageContainer maxWidth="4xl">
      <div className="flex items-center gap-4 mb-6">
        <BackButton href={`/businesses/${businessId}`} />
      </div>

      <PageHeader title="עריכת הגדרות" description={business.name} />

      {/* Configuration Form */}
      <BusinessConfigForm
        initialConfig={business.config}
        onSave={handleSave}
        loading={loading}
      />
    </PageContainer>
  );
}
