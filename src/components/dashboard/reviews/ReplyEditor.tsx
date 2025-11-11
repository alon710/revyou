"use client";

import { useState } from "react";
import { Review } from "@/lib/types";
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
import { useTranslations } from "next-intl";

interface ReplyEditorProps {
  review: Review;
  accountId: string;
  userId: string;
  businessId: string;
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  variant?: "default" | "destructive";
  loadingText?: string;
}

export function ReplyEditor({
  review,
  accountId,
  userId,
  businessId,
  open,
  onClose,
  onSave,
  variant = "default",
  loadingText,
}: ReplyEditorProps) {
  const t = useTranslations("dashboard.reviews.editor");
  const [replyText, setReplyText] = useState(review.aiReply || "");
  const [isLoading, setIsLoading] = useState(false);
  const defaultLoadingText = loadingText || t("saving");

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await editReply(userId, accountId, businessId, review.id, replyText);
      onSave();
    } catch (error) {
      console.error("Error saving reply:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setReplyText(review.aiReply || "");
    onClose();
  };

  const charCount = replyText.length;
  const maxChars = 1000;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            {t("title")}
          </DialogTitle>
          <DialogDescription className="text-end">{t("description")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-md bg-muted p-3">
            <p className="text-sm font-medium mb-1 text-end">{t("originalReview")}</p>
            <p className="text-sm text-muted-foreground text-end">{review.text || t("noText")}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-end block">{t("replyLabel")}</label>
            <Textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={t("placeholder")}
              className="min-h-[150px] resize-y text-end"
              maxLength={maxChars}
              disabled={isLoading}
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>
                {charCount} / {maxChars} {t("characters")}
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-2">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
            {t("cancel")}
          </Button>
          <Button variant={variant} onClick={handleSave} disabled={isLoading || !replyText.trim()} className="gap-2">
            {isLoading ? <>{defaultLoadingText}</> : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
