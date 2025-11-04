"use client";

import { useState } from "react";
import { Review, ReplyStatus } from "@/types/database";
import { StarRating } from "@/components/ui/StarRating";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardContent,
  DashboardCardSection,
  DashboardCardFooter,
} from "@/components/ui/dashboard-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  rejectReply,
  postReplyToGoogle,
  regenerateReply,
} from "@/lib/reviews/actions";
import { useAuth } from "@/contexts/AuthContext";
import { useBusiness } from "@/contexts/BusinessContext";
import { ReplyEditor } from "@/components/dashboard/reviews/ReplyEditor";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { User } from "lucide-react";

interface ReviewCardProps {
  review: Review;
  userId: string;
  businessId: string;
  onUpdate?: () => void;
}

export function ReviewCard({
  review,
  userId,
  businessId,
  onUpdate,
}: ReviewCardProps) {
  const { user } = useAuth();
  const { currentAccount } = useBusiness();
  const [isLoading, setIsLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const getStatusBadge = (status: ReplyStatus) => {
    const statusMap = {
      pending: { label: "ממתין לאישור", variant: "secondary" as const },
      posted: { label: "פורסם", variant: "default" as const },
      rejected: { label: "נדחה", variant: "secondary" as const },
      failed: { label: "נכשל", variant: "secondary" as const },
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentAccount) {
      console.error("No current account");
      return;
    }

    try {
      setIsLoading(true);
      await rejectReply(userId, currentAccount.id, businessId, review.id);
      onUpdate?.();
    } catch (error) {
      console.error("Error rejecting reply:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishConfirm = async () => {
    if (!user || !currentAccount) return;

    try {
      const token = await user.getIdToken();
      await postReplyToGoogle(
        userId,
        currentAccount.id,
        businessId,
        review.id,
        token
      );
      onUpdate?.();
    } catch (error) {
      console.error("Error publishing reply:", error);
      throw error; // Re-throw to let dialog handle loading state
    }
  };

  const handleRegenerate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || !currentAccount) return;

    try {
      setIsLoading(true);
      const token = await user.getIdToken();
      await regenerateReply(
        userId,
        currentAccount.id,
        businessId,
        review.id,
        token
      );
      onUpdate?.();
    } catch (error) {
      console.error("Error regenerating reply:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DashboardCard className="w-full">
        <DashboardCardHeader className="pb-3">
          {/* Header: Name and Status Badge */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <h3 className="font-semibold truncate">{review.name}</h3>
            </div>
            <StarRating rating={review.rating} size={18} />
            {getStatusBadge(review.replyStatus)}
          </div>
        </DashboardCardHeader>

        <DashboardCardContent className="space-y-4">
          {review.text && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  ביקורת
                </span>
              </div>
              <div className="rounded-md bg-muted/50 p-3">
                <p className="text-sm leading-relaxed">{review.text}</p>
              </div>
            </div>
          )}

          {review.aiReply && (
            <DashboardCardSection withBorder={!!review.text}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  תגובת בינה מלאכותית
                </span>
              </div>
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm leading-relaxed">{review.aiReply}</p>
              </div>
            </DashboardCardSection>
          )}
        </DashboardCardContent>

        {(review.replyStatus === "pending" ||
          review.replyStatus === "failed") && (
          <DashboardCardFooter>
            <Button
              onClick={handleReject}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              דחה
            </Button>
            <Button
              onClick={handleRegenerate}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              צור מחדש
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setShowEditor(true);
              }}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              ערוך
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setShowPublishDialog(true);
              }}
              disabled={isLoading}
              size="sm"
              variant="default"
            >
              פרסם
            </Button>
          </DashboardCardFooter>
        )}
      </DashboardCard>

      <ReplyEditor
        review={review}
        userId={userId}
        businessId={businessId}
        open={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={() => {
          setShowEditor(false);
          onUpdate?.();
        }}
      />

      <ConfirmationDialog
        open={showPublishDialog}
        onOpenChange={setShowPublishDialog}
        title="פרסום תגובה לגוגל"
        description={
          <div className="space-y-3">
            <p>האם אתה בטוח שברצונך לפרסם את התגובה הזו לגוגל?</p>
            <div className="rounded-md bg-muted p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">למבקר:</span>
                <span>{review.name}</span>
                <span>•</span>
                <StarRating rating={review.rating} size={14} />
              </div>
              <div className="text-sm">
                {review.text && (
                  <p className="mt-1 text-muted-foreground">{review.text}</p>
                )}
              </div>
            </div>
            <div className="rounded-md border border-accent bg-accent/10 p-3">
              <p className="text-sm font-medium mb-1">התגובה שתפורסם:</p>
              <p className="text-sm text-foreground">{review.aiReply}</p>
            </div>
          </div>
        }
        confirmText="פרסם לגוגל"
        cancelText="ביטול"
        onConfirm={handlePublishConfirm}
        variant="default"
        loadingText="מפרסם..."
      />
    </>
  );
}
