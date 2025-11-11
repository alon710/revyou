"use client";

import { useState } from "react";
import { Review, ReplyStatus } from "@/lib/types";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { rejectReply, postReplyToGoogle, regenerateReply } from "@/lib/reviews/actions";
import { useAuth } from "@/contexts/AuthContext";
import { ReplyEditor } from "@/components/dashboard/reviews/ReplyEditor";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ReviewCardProps {
  review: Review;
  accountId: string;
  userId: string;
  businessId: string;
  onUpdate?: () => void;
  onClick?: () => void;
}

export function ReviewCard({ review, accountId, userId, businessId, onUpdate, onClick }: ReviewCardProps) {
  const t = useTranslations("dashboard.reviews.card");
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusBadge = (status: ReplyStatus) => {
    const statusMap = {
      pending: { label: t("status.pending"), variant: "secondary" as const },
      posted: { label: t("status.posted"), variant: "default" as const },
      rejected: { label: t("status.rejected"), variant: "secondary" as const },
      failed: { label: t("status.failed"), variant: "secondary" as const },
      quota_exceeded: { label: t("status.quotaExceeded"), variant: "destructive" as const },
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const handleReject = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsLoading(true);
      await rejectReply(userId, accountId, businessId, review.id);
      onUpdate?.();
    } catch (error) {
      console.error("Error rejecting reply:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishConfirm = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      await postReplyToGoogle(userId, accountId, businessId, review.id, token);
      onUpdate?.();
    } catch (error) {
      console.error("Error publishing reply:", error);
      throw error;
    }
  };

  const handleRegenerate = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    try {
      setIsLoading(true);
      const token = await user.getIdToken();
      await regenerateReply(userId, accountId, businessId, review.id, token);
      onUpdate?.();
    } catch (error) {
      console.error("Error regenerating reply:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <DashboardCard className={cn("w-full", onClick && "cursor-pointer")} onClick={onClick}>
        <DashboardCardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <Avatar className="h-10 w-10 shrink-0">
                <AvatarImage src={review.photoUrl || undefined} alt={`${review.name} profile`} />
                <AvatarFallback className="bg-muted">
                  {review.photoUrl ? (
                    <User className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <span className="text-sm font-medium text-muted-foreground">{getInitials(review.name)}</span>
                  )}
                </AvatarFallback>
              </Avatar>
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
                  {t("reviewLabel")}
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
                  {t("aiReplyLabel")}
                </span>
              </div>
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm leading-relaxed">{review.aiReply}</p>
              </div>
            </DashboardCardSection>
          )}
        </DashboardCardContent>

        {(review.replyStatus === "pending" || review.replyStatus === "failed") && (
          <DashboardCardFooter>
            <Button type="button" onClick={handleReject} disabled={isLoading} variant="outline" size="sm">
              {t("actions.reject")}
            </Button>
            <Button type="button" onClick={handleRegenerate} disabled={isLoading} size="sm" variant="outline">
              {t("actions.regenerate")}
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowEditor(true);
              }}
              disabled={isLoading}
              size="sm"
              variant="outline"
            >
              {t("actions.edit")}
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPublishDialog(true);
              }}
              disabled={isLoading}
              size="sm"
              variant="default"
            >
              {t("actions.publish")}
            </Button>
          </DashboardCardFooter>
        )}
      </DashboardCard>

      <ReplyEditor
        review={review}
        accountId={accountId}
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
        title={t("publishDialog.title")}
        description={
          <div className="space-y-3">
            <p>{t("publishDialog.description")}</p>
            <div className="rounded-md bg-muted p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{t("publishDialog.reviewer")}</span>
                <span>{review.name}</span>
                <span>•</span>
                <StarRating rating={review.rating} size={14} />
              </div>
              <div className="text-sm">
                {review.text && <p className="mt-1 text-muted-foreground">{review.text}</p>}
              </div>
            </div>
            <div className="rounded-md border border-accent bg-accent/10 p-3">
              <p className="text-sm font-medium mb-1">{t("publishDialog.replyPreview")}</p>
              <p className="text-sm text-foreground">{review.aiReply}</p>
            </div>
          </div>
        }
        confirmText={t("publishDialog.confirm")}
        cancelText={t("publishDialog.cancel")}
        onConfirm={handlePublishConfirm}
        variant="default"
        loadingText={t("publishDialog.loading")}
      />
    </>
  );
}
