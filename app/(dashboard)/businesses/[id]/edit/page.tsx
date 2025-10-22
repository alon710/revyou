"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getBusiness, updateBusinessConfig } from "@/lib/firebase/businesses";
import { Business, BusinessConfig } from "@/types/database";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import BusinessConfigForm from "@/components/dashboard/BusinessConfigForm";
import { toast } from "sonner";

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!business) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/businesses/${businessId}`}>
            <ArrowLeft className="ml-2 h-4 w-4" />
            חזור
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">עריכת הגדרות</h1>
          <p className="text-muted-foreground">{business.name}</p>
        </div>
      </div>

      {/* Configuration Form */}
      <BusinessConfigForm
        initialConfig={business.config}
        onSave={handleSave}
        loading={loading}
      />
    </div>
  );
}
