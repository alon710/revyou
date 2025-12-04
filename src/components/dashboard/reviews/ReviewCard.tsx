"use client";

import { useState } from "react";
import { ReplyStatus } from "@/lib/types";
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
import { TooltipIcon } from "@/components/ui/tooltip";
import { postReviewReply, generateReviewReply } from "@/lib/actions/reviews.actions";
import { useAuth } from "@/contexts/AuthContext";
import { ReplyEditor } from "@/components/dashboard/reviews/ReplyEditor";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { User, Bot, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations, useFormatter } from "next-intl";
import { useRouter } from "@/i18n/routing";
import type { ReviewWithLatestGeneration } from "@/lib/db/repositories";

interface ReviewCardProps {
  review: ReviewWithLatestGeneration;
  accountId: string;
  userId: string;
  businessId: string;
  onUpdate?: () => void;
  onClick?: () => void;
}

export function ReviewCard({ review, accountId, userId, businessId, onUpdate, onClick }: ReviewCardProps) {
  const t = useTranslations("dashboard.reviews.card");
  const tCommon = useTranslations("common");
  const format = useFormatter();
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

  const getStatusBadge = (review: ReviewWithLatestGeneration) => {
    if (!review.consumesQuota) {
      return <Badge variant="secondary">{t("imported")}</Badge>;
    }

    const status = review.replyStatus as ReplyStatus;
    const statusMap = {
      pending: { label: t("status.pending"), variant: "secondary" as const },
      posted: { label: t("status.posted"), variant: "default" as const },
      rejected: { label: t("status.rejected"), variant: "secondary" as const },
      failed: { label: t("status.failed"), variant: "secondary" as const },
      quota_exceeded: { label: t("status.quotaExceeded"), variant: "destructive" as const },
    };

    const statusInfo = statusMap[status] || statusMap.pending;

    if (status === "posted") {
      const Icon = review.latestAiReplyPostedBy ? User : Bot;
      return (
        <Badge variant={statusInfo.variant} className="gap-1">
          <Icon className="h-3 w-3" />
          {statusInfo.label}
        </Badge>
      );
    }

    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const handlePublishConfirm = async () => {
    if (!user) return;

    try {
      await postReviewReply({ accountId, businessId, reviewId: review.id });
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
      await generateReviewReply({ accountId, businessId, reviewId: review.id });
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
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{review.name}</h3>
                <div className="flex items-center gap-1">
                  <p className="text-xs text-muted-foreground">
                    {format.dateTime(new Date(review.date), {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                  <TooltipIcon
                    text={t("dateTooltip")}
                    additionalInfoLabel={t("reviewDateLabel")}
                    closeLabel={tCommon("close")}
                  />
                </div>
              </div>
            </div>
            <StarRating rating={review.rating} size={18} />
            {getStatusBadge(review)}
            {onClick && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
              >
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            )}
          </div>
        </DashboardCardHeader>

        <DashboardCardContent className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                {t("reviewLabel")}
              </span>
            </div>
            <div className="rounded-md bg-muted/50 p-3">
              <p className={cn("text-sm leading-relaxed", !review.text && "italic text-muted-foreground")}>
                {review.text || t("noText")}
              </p>
            </div>
          </div>

          {review.latestAiReply && (
            <DashboardCardSection withBorder={!!review.text}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {review.latestAiReplyType === "imported" ? t("externalReplyLabel") : t("aiReplyLabel")}
                  </span>
                </div>
                {review.replyStatus === "posted" && review.latestAiReplyPostedAt && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">
                      {format.dateTime(new Date(review.latestAiReplyPostedAt), {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <TooltipIcon
                      text={t("replyDateTooltip")}
                      additionalInfoLabel={t("replyDateLabel")}
                      closeLabel={tCommon("close")}
                    />
                  </div>
                )}
              </div>
              <div className="rounded-md border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm leading-relaxed">{review.latestAiReply}</p>
              </div>
            </DashboardCardSection>
          )}
        </DashboardCardContent>

        <DashboardCardFooter>
          {(review.replyStatus === "pending" || review.replyStatus === "failed") && (
            <>
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
            </>
          )}
        </DashboardCardFooter>
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
              <p className="text-sm text-foreground">{review.latestAiReply}</p>
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

interface ReviewCardWithRefreshProps {
  review: ReviewWithLatestGeneration;
  accountId: string;
  userId: string;
  businessId: string;
}

export function ReviewCardWithRefresh({ review, accountId, userId, businessId }: ReviewCardWithRefreshProps) {
  const router = useRouter();

  return (
    <ReviewCard
      review={review}
      accountId={accountId}
      userId={userId}
      businessId={businessId}
      onUpdate={() => router.refresh()}
    />
  );
}
