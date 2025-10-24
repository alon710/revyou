"use client";

import { useState } from "react";
import { Review, ReplyStatus } from "@/types/database";
import { StarRating } from "@/components/ui/StarRating";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  CheckCircle,
  XCircle,
  Edit,
  Send,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { he } from "date-fns/locale";
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
      posted: { label: "פורסם", variant: "outline" as const },
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

  const reviewDate = review.reviewDate?.toDate?.() || new Date();
  const postedDate = review.postedAt?.toDate?.();

  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarImage src={review.reviewerPhotoUrl} />
              <AvatarFallback>{review.reviewerName[0]}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{review.reviewerName}</h3>
                {getStatusBadge(review.replyStatus)}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <StarRating rating={review.rating} size={16} />
                <span>•</span>
                <Calendar className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(reviewDate, {
                    addSuffix: true,
                    locale: he,
                  })}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Review Text */}
          {review.reviewText && (
            <div className="rounded-md bg-gray-50 p-3">
              <p className="text-sm">{review.reviewText}</p>
            </div>
          )}

          {/* AI Reply */}
          {(review.aiReply || review.editedReply) && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">תגובה אוטומטית:</h4>
                {review.wasEdited && (
                  <Badge variant="outline" className="text-xs">
                    נערך
                  </Badge>
                )}
              </div>
              <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm">
                  {review.editedReply || review.aiReply}
                </p>
              </div>
            </div>
          )}

          {/* Posted Reply */}
          {review.replyStatus === "posted" && review.postedAt && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>
                פורסם{" "}
                {postedDate &&
                  formatDistanceToNow(postedDate, {
                    addSuffix: true,
                    locale: he,
                  })}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {review.replyStatus === "pending" && (
              <>
                <Button
                  onClick={() => setShowPublishDialog(true)}
                  disabled={isLoading}
                  size="sm"
                  variant="default"
                >
                  <Send className="ml-2 h-4 w-4" />
                  פרסם תגובה
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isLoading}
                  size="sm"
                  variant="secondary"
                >
                  <XCircle className="ml-2 h-4 w-4" />
                  דחה
                </Button>
                <Button
                  onClick={() => setShowEditor(true)}
                  disabled={isLoading}
                  size="sm"
                  variant="secondary"
                >
                  <Edit className="ml-2 h-4 w-4" />
                  ערוך
                </Button>
                <Button
                  onClick={handleRegenerate}
                  disabled={isLoading}
                  size="sm"
                  variant="secondary"
                >
                  <RefreshCw className="ml-2 h-4 w-4" />
                  צור מחדש
                </Button>
              </>
            )}
          </div>
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
            <div className="rounded-md bg-gray-50 p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">למבקר:</span>
                <span>{review.reviewerName}</span>
                <span>•</span>
                <StarRating rating={review.rating} size={14} />
              </div>
              <div className="text-sm">
                <span className="font-medium">הביקורת:</span>
                <p className="mt-1 text-gray-600">
                  {review.reviewText || "(אין טקסט)"}
                </p>
              </div>
            </div>
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm font-medium mb-1">התגובה שתפורסם:</p>
              <p className="text-sm text-gray-700">
                {review.editedReply || review.aiReply}
              </p>
            </div>
            <p className="text-sm text-amber-700 font-medium">
              ⚠️ לאחר הפרסום, לא ניתן לבטל את הפעולה
            </p>
          </div>
        }
        confirmText={
          <span className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            פרסם לגוגל
          </span>
        }
        cancelText="ביטול"
        onConfirm={handlePublishConfirm}
        variant="default"
        loadingText="מפרסם..."
      />
    </>
  );
}
