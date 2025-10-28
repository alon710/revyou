"use client";

import { useState } from "react";
import { Review } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { editReply } from "@/lib/reviews/actions";
import { Edit } from "lucide-react";

interface ReplyEditorProps {
  review: Review;
  userId: string;
  locationId: string;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  variant?: "default" | "destructive";
  loadingText?: string;
}

export function ReplyEditor({
  review,
  userId,
  locationId,
  open,
  onClose,
  onSave,
  variant = "default",
  loadingText = "שומר...",
}: ReplyEditorProps) {
  const [replyText, setReplyText] = useState(
    review.editedReply || review.aiReply || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await editReply(userId, locationId, review.id, replyText);
      onSave();
    } catch (error) {
      console.error("Error saving reply:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setReplyText(review.editedReply || review.aiReply || "");
    onClose();
  };

  const charCount = replyText.length;
  const maxChars = 1000;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            עריכת תגובה
          </DialogTitle>
          <DialogDescription className="text-right">
            ערוך את התגובה האוטומטית לפני פרסום לגוגל
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Review Info */}
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm font-medium mb-1 text-right">
              הביקורת המקורית:
            </p>
            <p className="text-sm text-muted-foreground text-right">
              {review.reviewText || "(אין טקסט)"}
            </p>
          </div>

          {/* Reply Textarea */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-right block">
              התגובה:
            </label>
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="הזן את התגובה..."
              className="min-h-[150px] resize-y text-right"
              maxLength={maxChars}
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {charCount} / {maxChars} תווים
              </span>
              {review.wasEdited && (
                <span className="text-accent">נערך בעבר</span>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            ביטול
          </Button>
          <Button
            variant={variant}
            onClick={handleSave}
            disabled={isLoading || !replyText.trim()}
            className="gap-2"
          >
            {isLoading ? <>{loadingText}</> : "שמור"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
