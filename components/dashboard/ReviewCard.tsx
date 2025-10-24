"use client";

import { useState } from "react";
import { Review, ReplyStatus } from "@/types/database";
import { StarRating } from "@/components/ui/StarRating";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  rejectReply,
  postReplyToGoogle,
  regenerateReply,
} from "@/lib/reviews/actions";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { ReplyEditor } from "./ReplyEditor";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";

interface ReviewCardProps {
  review: Review;
  onUpdate?: () => void;
}

/**
 * Review Card Component
 * Displays a single review with AI reply and actions
 */
export function ReviewCard({ review, onUpdate }: ReviewCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  const getStatusBadge = (status: ReplyStatus) => {
    const statusMap = {
      pending: { label: "ממתין לאישור", variant: "secondary" as const },
      approved: { label: "מאושר", variant: "default" as const },
      posted: { label: "פורסם", variant: "default" as const },
      rejected: { label: "נדחה", variant: "destructive" as const },
      failed: { label: "נכשל", variant: "destructive" as const },
    };

    const statusInfo = statusMap[status] || statusMap.pending;
    return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>;
  };

  const handleReject = async () => {
    try {
      setIsLoading(true);
      await rejectReply(review.id);
      toast({
        title: "התגובה נדחתה",
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: "שגיאה",
        description:
          error instanceof Error ? error.message : "לא ניתן לדחות את התגובה",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublishConfirm = async () => {
    if (!user) return;

    try {
      const token = await user.getIdToken();
      await postReplyToGoogle(review.id, token);
      toast({
        title: "התגובה פורסמה",
        description: "התגובה פורסמה בהצלחה לגוגל",
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: "שגיאה בפרסום",
        description:
          error instanceof Error ? error.message : "לא ניתן לפרסם את התגובה",
        variant: "destructive",
      });
      throw error; // Re-throw to let dialog handle loading state
    }
  };

  const handleRegenerate = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const token = await user.getIdToken();
      await regenerateReply(review.id, token);
      toast({
        title: "תגובה חדשה נוצרה",
        description: "התגובה האוטומטית עודכנה",
      });
      onUpdate?.();
    } catch (error) {
      toast({
        title: "שגיאה",
        description:
          error instanceof Error ? error.message : "לא ניתן ליצור תגובה מחדש",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="w-full">
        <CardContent className="p-4 space-y-3">
          {/* Header: Name, Status, Stars */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <h3 className="font-semibold truncate">{review.reviewerName}</h3>
              {getStatusBadge(review.replyStatus)}
            </div>
            <StarRating rating={review.rating} size={16} />
          </div>

          {/* Review Text */}
          {review.reviewText && (
            <div className="rounded-md bg-muted p-2">
              <p className="text-sm">{review.reviewText}</p>
            </div>
          )}

          {/* AI Reply */}
          {(review.aiReply || review.editedReply) && (
            <div className="rounded-md border border-accent bg-accent/10 p-2">
              <p className="text-sm">
                {review.editedReply || review.aiReply}
              </p>
            </div>
          )}

          {/* Action Buttons - For Pending and Failed */}
          {(review.replyStatus === "pending" || review.replyStatus === "failed") && (
            <div className="flex flex-wrap gap-2 pt-1">
              <Button
                onClick={() => setShowEditor(true)}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                ערוך
              </Button>
              <Button
                onClick={() => setShowPublishDialog(true)}
                disabled={isLoading}
                size="sm"
                variant="default"
              >
                פרסם
              </Button>
              <Button
                onClick={handleReject}
                disabled={isLoading}
                size="sm"
                variant="destructive"
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reply Editor Modal */}
      <ReplyEditor
        review={review}
        open={showEditor}
        onClose={() => setShowEditor(false)}
        onSave={() => {
          setShowEditor(false);
          onUpdate?.();
        }}
      />

      {/* Publish Confirmation Dialog */}
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
                <span>{review.reviewerName}</span>
                <span>•</span>
                <StarRating rating={review.rating} size={14} />
              </div>
              <div className="text-sm">
                <span className="font-medium">הביקורת:</span>
                <p className="mt-1 text-muted-foreground">
                  {review.reviewText || "(אין טקסט)"}
                </p>
              </div>
            </div>
            <div className="rounded-md border border-accent bg-accent/10 p-3">
              <p className="text-sm font-medium mb-1">התגובה שתפורסם:</p>
              <p className="text-sm text-foreground">
                {review.editedReply || review.aiReply}
              </p>
            </div>
            <p className="text-sm text-secondary font-medium">
              ⚠️ לאחר הפרסום, לא ניתן לבטל את הפעולה
            </p>
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
