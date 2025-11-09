"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DeleteConfirmationProps {
  title: string;
  description: string;
  warningText?: string;
  items?: string[];

  confirmationText: string;
  confirmationLabel: string;
  confirmationPlaceholder?: string;

  onDelete: () => Promise<void>;
  deleteButtonText: string;

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
  className = "",
}: DeleteConfirmationProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Card className={`border-destructive/20 bg-destructive/10 ${className}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive font-semibold">אזור מסוכן</CardTitle>
          </div>
          <CardDescription>
            <span className="text-destructive">פעולות בלתי הפיכות שישפיעו על החשבון שלך</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-destructive/10 p-4 ">
            <h4 className="font-semibold text-destructive mb-2">{title}</h4>
            <p className="text-sm text-destructive mb-4">{description}</p>

            {items && items.length > 0 && (
              <ul className="text-sm text-muted-foreground space-y-1 mb-4 list-disc list-inside">
                {items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            )}

            <p className="text-sm font-semibold text-destructive mb-4">{warningText}</p>

            <Button variant="destructive" onClick={() => setShowDialog(true)} className="gap-2">
              <Trash2 className="h-4 w-4" />
              {deleteButtonText}
            </Button>
          </div>
        </CardContent>
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
