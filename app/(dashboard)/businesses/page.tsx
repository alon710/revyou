"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserBusinesses, deleteBusiness, disconnectBusiness } from "@/lib/firebase/businesses";
import { getUserSubscriptionTier } from "@/lib/firebase/users";
import { Business, SubscriptionTier, SUBSCRIPTION_LIMITS } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import BusinessCard from "@/components/dashboard/BusinessCard";
import EmptyBusinessState from "@/components/dashboard/EmptyBusinessState";
import BusinessLimitBanner from "@/components/dashboard/BusinessLimitBanner";
import { toast } from "sonner";

/**
 * Business Management Page
 * Lists all connected businesses and allows management
 */
export default function BusinessesPage() {
  const { user, loading: authLoading } = useAuth();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>("free");

  // Load businesses and subscription info
  useEffect(() => {
    if (!user || authLoading) return;

    const loadData = async () => {
      try {
        setLoading(true);
        const [businessesData, tier] = await Promise.all([
          getUserBusinesses(user.uid),
          getUserSubscriptionTier(user.uid),
        ]);

        setBusinesses(businessesData);
        setSubscriptionTier(tier);
      } catch (error) {
        console.error("Error loading businesses:", error);
        toast.error("לא ניתן לטעון את העסקים");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, authLoading]);

  // Handle business deletion
  const handleDelete = async (businessId: string) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק עסק זה?")) {
      return;
    }

    try {
      await deleteBusiness(businessId);
      setBusinesses((prev) => prev.filter((b) => b.id !== businessId));
      toast.success("העסק נמחק בהצלחה");
    } catch (error) {
      console.error("Error deleting business:", error);
      toast.error("לא ניתן למחוק את העסק");
    }
  };

  // Handle business disconnection
  const handleDisconnect = async (businessId: string) => {
    if (!confirm("האם אתה בטוח שברצונך לנתק עסק זה?")) {
      return;
    }

    try {
      await disconnectBusiness(businessId);
      setBusinesses((prev) =>
        prev.map((b) => (b.id === businessId ? { ...b, connected: false } : b))
      );
      toast.success("העסק נותק בהצלחה");
    } catch (error) {
      console.error("Error disconnecting business:", error);
      toast.error("לא ניתן לנתק את העסק");
    }
  };

  const maxBusinesses = SUBSCRIPTION_LIMITS[subscriptionTier].businesses;
  const canAddMore = maxBusinesses === Infinity || businesses.length < maxBusinesses;

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">העסקים שלי</h1>
          <p className="text-muted-foreground">
            נהל את חשבונות Google Business Profile המחוברים שלך
          </p>
        </div>

        {businesses.length > 0 && (
          <Button asChild disabled={!canAddMore}>
            <Link href="/businesses/connect">
              <Plus className="ml-2 h-5 w-5" />
              חבר עסק
            </Link>
          </Button>
        )}
      </div>

      {/* Subscription Limit Banner */}
      {businesses.length > 0 && maxBusinesses !== Infinity && (
        <BusinessLimitBanner
          currentTier={subscriptionTier}
          currentCount={businesses.length}
          maxAllowed={maxBusinesses}
        />
      )}

      {/* Empty State */}
      {businesses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <EmptyBusinessState />
          </CardContent>
        </Card>
      ) : (
        /* Business List */
        <div className="grid gap-6 md:grid-cols-2">
          {businesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              onDelete={handleDelete}
              onDisconnect={handleDisconnect}
              showActions
            />
          ))}
        </div>
      )}

      {/* Stats Card */}
      {businesses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>סטטיסטיקות</CardTitle>
            <CardDescription>מידע על העסקים המחוברים שלך</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{businesses.length}</div>
                <div className="text-sm text-muted-foreground">עסקים מחוברים</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {businesses.filter((b) => b.connected).length}
                </div>
                <div className="text-sm text-muted-foreground">פעילים</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {businesses.filter((b) => b.config.autoPost).length}
                </div>
                <div className="text-sm text-muted-foreground">פרסום אוטומטי</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
