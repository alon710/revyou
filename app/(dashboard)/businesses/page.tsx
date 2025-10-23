"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { deleteBusiness } from "@/lib/firebase/businesses";
import { getUserSubscriptionTier } from "@/lib/firebase/users";
import {
  SubscriptionTier,
  SUBSCRIPTION_LIMITS,
} from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Settings,
  Globe,
  MessageSquare,
  Smile,
  Languages,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import EmptyBusinessState from "@/components/dashboard/EmptyBusinessState";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { Loading } from "@/components/ui/loading";
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
    } catch (error) {
      console.error("Error deleting business:", error);
      toast.error("לא ניתן למחוק את העסק");
    }
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
  const connectedDate = currentBusiness.connectedAt
    ? format(currentBusiness.connectedAt.toDate(), "d MMMM yyyy בשעה HH:mm", {
        locale: he,
      })
    : "";

  return (
    <PageContainer>
      <PageHeader
        title={currentBusiness.name}
        description={currentBusiness.address}
        icon={
          <div className="flex items-center gap-2">
            {!currentBusiness.connected && (
              <Badge variant="secondary">מנותק</Badge>
            )}
            {currentBusiness.connected && currentBusiness.config.autoPost && (
              <Badge variant="default">פרסום אוטומטי</Badge>
            )}
          </div>
        }
        actions={
          <div className="flex gap-2">
            <Button asChild disabled={!canAddMore}>
              <Link href="/businesses/connect">
                <Plus className="ml-2 h-5 w-5" />
                חבר עסק
              </Link>
            </Button>
            <Button asChild>
              <Link href="/businesses/edit">
                <Settings className="ml-2 h-5 w-5" />
                עריכה
              </Link>
            </Button>
          </div>
        }
      />

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>מידע כללי</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-muted-foreground mb-1">סטטוס</p>
              <p className="font-medium">
                {currentBusiness.connected ? "מחובר ופעיל" : "מנותק"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">תאריך חיבור</p>
              <p className="font-medium">{connectedDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">מזהה Google</p>
              <p className="font-mono text-sm">
                {currentBusiness.googleLocationId}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">חשבון Google</p>
              <p className="font-mono text-sm">
                {currentBusiness.googleAccountId}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>הגדרות AI</CardTitle>
          <CardDescription>כך ה-AI יגיב לביקורות על העסק שלך</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Business Description */}
          {currentBusiness.config.businessDescription && (
            <div>
              <p className="text-sm font-medium mb-2">תיאור העסק</p>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {currentBusiness.config.businessDescription}
              </p>
            </div>
          )}

          <Separator />

          {/* Settings Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">סגנון תשובה</p>
                <p className="text-sm text-muted-foreground">
                  {getToneLabel(currentBusiness.config.toneOfVoice)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Smile className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">אימוג&apos;י</p>
                <p className="text-sm text-muted-foreground">
                  {currentBusiness.config.useEmojis ? "כן" : "לא"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Languages className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">שפה</p>
                <p className="text-sm text-muted-foreground">
                  {getLanguageLabel(currentBusiness.config.languageMode)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">פרסום אוטומטי</p>
                <p className="text-sm text-muted-foreground">
                  {currentBusiness.config.autoPost
                    ? "מופעל - תשובות יפורסמו אוטומטית"
                    : "כבוי - נדרש אישור ידני"}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Star Configurations */}
          <div>
            <p className="text-sm font-medium mb-3">התאמה אישית לפי דירוג</p>
            <div className="space-y-2">
              {([5, 4, 3, 2, 1] as const).map((rating) => {
                const config = currentBusiness.config.starConfigs[rating];
                return (
                  <div
                    key={rating}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{rating} כוכבים</span>
                      {!config.enabled && (
                        <Badge variant="secondary">מושבת</Badge>
                      )}
                      {config.customInstructions && (
                        <Badge variant="outline">מותאם אישית</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>פעולות</CardTitle>
          <CardDescription>נהל את חיבור העסק</CardDescription>
        </CardHeader>
        <CardContent>
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
            deleteButtonText="מחק עסק לצמיתות"
            variant="inline"
            className="w-full justify-start"
          />
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function getToneLabel(tone: string): string {
  const labels: Record<string, string> = {
    friendly: "ידידותי",
    formal: "פורמלי",
    humorous: "הומוריסטי",
    professional: "מקצועי",
  };
  return labels[tone] || tone;
}

function getLanguageLabel(mode: string): string {
  const labels: Record<string, string> = {
    hebrew: "עברית",
    english: "אנגלית",
    "auto-detect": "זיהוי אוטומטי",
    "match-reviewer": "התאם למבקר",
  };
  return labels[mode] || mode;
}
