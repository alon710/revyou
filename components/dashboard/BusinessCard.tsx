"use client";

import { useState } from "react";
import { Business } from "@/types/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Settings,
  Trash2,
  Link as LinkIcon,
  Power,
  Bell,
  BellOff,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { he } from "date-fns/locale";
import { enableNotificationsForBusiness } from "@/lib/reviews/actions";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface BusinessCardProps {
  business: Business;
  onDelete?: (businessId: string) => void;
  onDisconnect?: (businessId: string) => void;
  onUpdate?: () => void;
  showActions?: boolean;
}

/**
 * Business Card Component
 * Displays business information with actions
 */
export default function BusinessCard({
  business,
  onDelete,
  onDisconnect,
  onUpdate,
  showActions = true,
}: BusinessCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEnablingNotifications, setIsEnablingNotifications] = useState(false);

  const connectedDate = business.connectedAt
    ? format(business.connectedAt.toDate(), "d MMMM yyyy", { locale: he })
    : "";

  const handleEnableNotifications = async () => {
    if (!user) return;

    try {
      setIsEnablingNotifications(true);
      const token = await user.getIdToken();
      await enableNotificationsForBusiness(business.id, token);
      toast({
        title: "התראות הופעלו",
        description: "ביקורות חדשות יופיעו אוטומטית במערכת",
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: "שגיאה",
        description:
          error instanceof Error ? error.message : "לא ניתן להפעיל התראות",
        variant: "destructive",
      });
    } finally {
      setIsEnablingNotifications(false);
    }
  };

  return (
    <Card className={!business.connected ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">{business.name}</CardTitle>
              {!business.connected && <Badge variant="secondary">מנותק</Badge>}
              {business.notificationsEnabled ? (
                <Badge variant="outline" className="gap-1">
                  <Bell className="h-3 w-3" />
                  התראות פעילות
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <BellOff className="h-3 w-3" />
                  התראות כבויות
                </Badge>
              )}
            </div>
            <CardDescription className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {business.address}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Business Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">סגנון תשובה</p>
              <p className="font-medium">
                {getToneLabel(business.config.toneOfVoice)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">שפה</p>
              <p className="font-medium">
                {getLanguageLabel(business.config.languageMode)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">תאריך חיבור</p>
              <p className="font-medium">{connectedDate}</p>
            </div>
          </div>

          {/* Enable Notifications */}
          {business.connected && !business.notificationsEnabled && (
            <div className="rounded-md bg-accent/10 p-3 border border-accent">
              <p className="text-sm text-accent-foreground mb-2">
                <strong>הפעל התראות</strong> כדי לקבל ביקורות חדשות אוטומטית
              </p>
              <Button
                onClick={handleEnableNotifications}
                disabled={isEnablingNotifications}
                size="sm"
                variant="default"
              >
                <Bell className="ml-2 h-4 w-4" />
                {isEnablingNotifications ? "מפעיל..." : "הפעל התראות"}
              </Button>
            </div>
          )}

          {/* Actions */}
          {showActions && (
            <div className="flex gap-2 pt-4 border-t">
              <Button asChild variant="default" size="sm" className="flex-1">
                <Link href={`/businesses/${business.id}`}>
                  <LinkIcon className="ml-2 h-4 w-4" />
                  צפה
                </Link>
              </Button>

              <Button asChild variant="outline" size="sm">
                <Link href={`/businesses/${business.id}/edit`}>
                  <Settings className="ml-2 h-4 w-4" />
                  הגדרות
                </Link>
              </Button>

              {onDisconnect && business.connected && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDisconnect(business.id)}
                >
                  <Power className="ml-2 h-4 w-4" />
                  נתק
                </Button>
              )}

              {onDelete && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(business.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Helper functions for labels
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
