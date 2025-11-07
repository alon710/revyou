"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string | React.ReactNode;
  cancelText?: string | React.ReactNode;
  onConfirm: () => Promise<void> | void;
  variant?: "default" | "destructive";
  requiresTextConfirmation?: boolean;
  confirmationText?: string;
  confirmationLabel?: string;
  confirmationPlaceholder?: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string | React.ReactNode;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "אישור",
  cancelText = "ביטול",
  onConfirm,
  variant = "default",
  requiresTextConfirmation = false,
  confirmationText = "",
  confirmationLabel,
  confirmationPlaceholder,
  icon,
  isLoading = false,
  loadingText = "מעבד...",
}: ConfirmationDialogProps) {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (requiresTextConfirmation && inputValue !== confirmationText) {
      return;
    }

    setLoading(true);
    try {
      await onConfirm();
      setInputValue("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error in confirmation action:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setInputValue("");
    onOpenChange(false);
  };

  const isConfirmValid =
    !requiresTextConfirmation || inputValue === confirmationText;
  const showLoading = loading || isLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dir="rtl">
        <DialogHeader>
          <DialogTitle
            className={`flex items-center gap-2 ${
              variant === "destructive" ? "text-destructive" : ""
            }`}
          >
            {icon ||
              (variant === "destructive" && (
                <AlertTriangle className="h-5 w-5" />
              ))}
            {title}
          </DialogTitle>
          <DialogDescription asChild className="space-y-2 text-right">
            <div>
              {typeof description === "string" ? (
                <p
                  className={
                    variant === "destructive" ? "text-destructive" : ""
                  }
                >
                  {description}
                </p>
              ) : (
                description
              )}
            </div>
          </DialogDescription>
        </DialogHeader>

        {requiresTextConfirmation && (
          <div className="space-y-4 py-4">
            <div>
              {confirmationLabel && (
                <Label
                  htmlFor="confirm-input"
                  className={cn("text-sm text-primary font-medium text-right")}
                >
                  {confirmationLabel}
                </Label>
              )}

              <Input
                id="confirm-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  confirmationText ? confirmationText : confirmationPlaceholder
                }
                className="mt-2 text-right"
                disabled={showLoading}
              />
            </div>

            {inputValue && !isConfirmValid && (
              <p className="text-sm text-destructive text-right">
                הטקסט אינו תואם:{" "}
                <span className="italic font-semibold">{confirmationText}</span>
              </p>
            )}
          </div>
        )}

        <DialogFooter className="flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={showLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={handleConfirm}
            disabled={!isConfirmValid || showLoading}
            className="gap-2"
          >
            {showLoading ? <>{loadingText}</> : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
