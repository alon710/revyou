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
import { Loading } from "@/components/ui/loading";
import { editReply } from "@/lib/reviews/actions";
import { useToast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";

interface ReplyEditorProps {
  review: Review;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  variant?: "default" | "destructive";
  loadingText?: string;
}

/**
 * Reply Editor Component
 * Modal dialog for editing AI-generated replies
 * Follows the ConfirmationDialog pattern for consistency
 */
export function ReplyEditor({
  review,
  open,
  onClose,
  onSave,
  variant = "default",
  loadingText = "שומר...",
}: ReplyEditorProps) {
  const { toast } = useToast();
  const [replyText, setReplyText] = useState(
    review.editedReply || review.aiReply || ""
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!replyText.trim()) {
      toast({
        title: "שגיאה",
        description: "נא להזין טקסט תגובה",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      await editReply(review.id, replyText);
      toast({
        title: "התגובה נשמרה",
        description: "התגובה המערוכת נשמרה בהצלחה",
      });
      onSave();
    } catch (error) {
      toast({
        title: "שגיאה",
        description:
          error instanceof Error ? error.message : "לא ניתן לשמור את התגובה",
        variant: "destructive",
      });
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
          <div className="rounded-md bg-gray-50 p-3">
            <p className="text-sm font-medium mb-1 text-right">
              הביקורת המקורית:
            </p>
            <p className="text-sm text-gray-600 text-right">
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
                <span className="text-blue-600">נערך בעבר</span>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3">
            <p className="text-xs text-blue-800 text-right">
              <strong>טיפים:</strong> שמור על טון אדיב, ענה בקצרה, וודא שהתגובה
              רלוונטית לביקורת.
            </p>
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
            {isLoading ? (
              <>
                <Loading size="sm" />
                {loadingText}
              </>
            ) : (
              "שמור"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
