"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  getBusiness,
  deleteBusiness,
  disconnectBusiness,
} from "@/lib/firebase/businesses";
import { Business } from "@/types/database";
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
import { BackButton } from "@/components/ui/back-button";
import {
  MapPin,
  Settings,
  Trash2,
  Power,
  Loader2,
  Globe,
  MessageSquare,
  Smile,
  Languages,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { toast } from "sonner";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";

/**
 * Business Details Page
 * Shows complete business information and configuration
 */
export default function BusinessDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const businessId = params.id as string;

  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

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

  // Handle delete
  const handleDelete = async () => {
    if (
      !confirm("האם אתה בטוח שברצונך למחוק עסק זה? פעולה זו לא ניתנת לביטול.")
    ) {
      return;
    }

    try {
      setDeleting(true);
      await deleteBusiness(businessId);
      toast.success("העסק נמחק בהצלחה");
      router.push("/businesses");
    } catch (error) {
      console.error("Error deleting business:", error);
      toast.error("לא ניתן למחוק את העסק");
      setDeleting(false);
    }
  };

  // Handle disconnect
  const handleDisconnect = async () => {
    if (!confirm("האם אתה בטוח שברצונך לנתק עסק זה?")) {
      return;
    }

    try {
      await disconnectBusiness(businessId);
      setBusiness((prev) => (prev ? { ...prev, connected: false } : null));
      toast.success("העסק נותק בהצלחה");
    } catch (error) {
      console.error("Error disconnecting business:", error);
      toast.error("לא ניתן לנתק את העסק");
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

  const connectedDate = business.connectedAt
    ? format(business.connectedAt.toDate(), "d MMMM yyyy בשעה HH:mm", {
        locale: he,
      })
    : "";

  return (
    <PageContainer>
      <div className="flex items-center gap-4 mb-6">
        <BackButton href="/businesses" />
      </div>

      <PageHeader
        title={business.name}
        description={
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {business.address}
          </span>
        }
        icon={
          <div className="flex items-center gap-2">
            {!business.connected && <Badge variant="secondary">מנותק</Badge>}
            {business.connected && business.config.autoPost && (
              <Badge variant="default">פרסום אוטומטי</Badge>
            )}
          </div>
        }
        actions={
          <Button asChild>
            <Link href={`/businesses/${businessId}/edit`}>
              <Settings className="ml-2 h-5 w-5" />
              עריכה
            </Link>
          </Button>
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
                {business.connected ? "מחובר ופעיל" : "מנותק"}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">תאריך חיבור</p>
              <p className="font-medium">{connectedDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">מזהה Google</p>
              <p className="font-mono text-sm">{business.googleLocationId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">חשבון Google</p>
              <p className="font-mono text-sm">{business.googleAccountId}</p>
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
          {business.config.businessDescription && (
            <div>
              <p className="text-sm font-medium mb-2">תיאור העסק</p>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {business.config.businessDescription}
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
                  {getToneLabel(business.config.toneOfVoice)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Smile className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">אימוג&apos;י</p>
                <p className="text-sm text-muted-foreground">
                  {business.config.useEmojis ? "כן" : "לא"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Languages className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">שפה</p>
                <p className="text-sm text-muted-foreground">
                  {getLanguageLabel(business.config.languageMode)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium">פרסום אוטומטי</p>
                <p className="text-sm text-muted-foreground">
                  {business.config.autoPost ? "מופעל" : "כבוי"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              {business.config.requireApproval ? (
                <Check className="h-5 w-5 text-primary mt-0.5" />
              ) : (
                <X className="h-5 w-5 text-muted-foreground mt-0.5" />
              )}
              <div>
                <p className="font-medium">דרוש אישור</p>
                <p className="text-sm text-muted-foreground">
                  {business.config.requireApproval ? "כן" : "לא"}
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
                const config = business.config.starConfigs[rating];
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
        <CardContent className="space-y-3">
          {business.connected && (
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="w-full justify-start"
            >
              <Power className="ml-2 h-5 w-5" />
              נתק עסק זה
            </Button>
          )}

          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleting}
            className="w-full justify-start"
          >
            {deleting && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
            {!deleting && <Trash2 className="ml-2 h-5 w-5" />}
            מחק עסק
          </Button>
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
