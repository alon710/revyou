"use client";

import { useMemo } from "react";
import { Review } from "@/types/database";
import { useBusiness } from "@/contexts/BusinessContext";
import { buildReplyPrompt } from "@/lib/ai/prompts";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FileText } from "lucide-react";

interface AIPromptModalProps {
  review: Review;
  open: boolean;
  onClose: () => void;
}

export function AIPromptModal({ review, open, onClose }: AIPromptModalProps) {
  const { currentBusiness } = useBusiness();

  const renderedPrompt = useMemo(() => {
    if (!currentBusiness) return "";

    try {
      return buildReplyPrompt(
        currentBusiness.config,
        {
          rating: review.rating,
          reviewerName: review.reviewerName,
          reviewText: review.reviewText,
        },
        currentBusiness.name,
        currentBusiness.config.businessPhone
      );
    } catch (error) {
      console.error("Error building prompt:", error);
      return "שגיאה ביצירת ההנחיה";
    }
  }, [currentBusiness, review]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            הנחיה ל-AI
          </DialogTitle>
          <DialogDescription className="text-right">
            ההנחיה ששלחנו ל-AI כדי ליצור את התגובה
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 overflow-y-auto max-h-[60vh]">
          <div className="rounded-md border bg-muted/30 p-4">
            <pre
              className="text-sm leading-relaxed whitespace-pre-wrap font-sans"
              dir="rtl"
            >
              {renderedPrompt}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
