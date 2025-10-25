"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteConfirmationProps {
  // Display
  title: string;
  description: string;
  warningText?: string;
  items?: string[];

  // Confirmation
  confirmationText: string;
  confirmationLabel: string;
  confirmationPlaceholder?: string;

  // Actions
  onDelete: () => Promise<void>;
  deleteButtonText: string;

  // Styling
  variant?: "card" | "inline";
  className?: string;
}

export function DeleteConfirmation({
  title,
  description,
  warningText = "פעולה זו אינה ניתנת לביטול!",
  items,
  confirmationText,
  confirmationLabel,
  confirmationPlaceholder,
  onDelete,
  deleteButtonText,
  variant = "card",
  className = "",
}: DeleteConfirmationProps) {
  const [showDialog, setShowDialog] = useState(false);

  const content = (
    <div
      className={
        variant === "inline"
          ? ""
          : "rounded-lg bg-destructive/10 p-4 border border-destructive/20"
      }
    >
      {variant === "card" && (
        <>
          <h4 className="font-semibold text-destructive mb-2">{title}</h4>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        </>
      )}

      {items && items.length > 0 && (
        <ul className="text-sm text-muted-foreground space-y-1 mb-4 list-disc list-inside">
          {items.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )}

      <p className="text-sm font-semibold text-destructive mb-4">
        {warningText}
      </p>

      <Button
        variant="destructive"
        onClick={() => setShowDialog(true)}
        className="gap-2"
      >
        <Trash2 className="h-4 w-4" />
        {deleteButtonText}
      </Button>
    </div>
  );

  if (variant === "card") {
    return (
      <>
        <Card className={`border-destructive ${className}`}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-destructive">אזור מסוכן</CardTitle>
            </div>
            <CardDescription>
              פעולות בלתי הפיכות שישפיעו על החשבון שלך
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">{content}</CardContent>
        </Card>

        <ConfirmationDialog
          open={showDialog}
          onOpenChange={setShowDialog}
          title={`אישור ${title.toLowerCase()}`}
          description={
            <>
              <p className="font-semibold">{description}</p>
            </>
          }
          confirmText={
            <>
              <Trash2 className="h-4 w-4" />
              {deleteButtonText}
            </>
          }
          cancelText="ביטול"
          onConfirm={onDelete}
          variant="destructive"
          requiresTextConfirmation
          confirmationText={confirmationText}
          confirmationLabel={confirmationLabel}
          confirmationPlaceholder={confirmationPlaceholder}
          loadingText="מוחק..."
        />
      </>
    );
  }

  // Inline variant - just button and dialog
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDialog(true)}
        className={`gap-2 text-destructive hover:text-destructive border-destructive/30 hover:border-destructive hover:bg-destructive/10 ${className}`}
      >
        <Trash2 className="h-4 w-4" />
        {deleteButtonText}
      </Button>

      <ConfirmationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title={`אישור ${title.toLowerCase()}`}
        description={
          <>
            <p className="font-semibold mb-3">{description}</p>
            {items && items.length > 0 && (
              <>
                <p className="text-sm mb-2">פעולה זו תמחק:</p>
                <ul className="text-sm space-y-1 mb-3 list-disc list-inside">
                  {items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </>
            )}
            <p className="text-sm font-semibold text-destructive">
              {warningText}
            </p>
          </>
        }
        confirmText={
          <>
            <Trash2 className="h-4 w-4" />
            {deleteButtonText}
          </>
        }
        cancelText="ביטול"
        onConfirm={onDelete}
        variant="destructive"
        requiresTextConfirmation
        confirmationText={confirmationText}
        confirmationLabel={confirmationLabel}
        confirmationPlaceholder={confirmationPlaceholder}
        loadingText="מוחק..."
      />
    </>
  );
}
