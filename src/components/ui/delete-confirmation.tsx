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
  confirmationText: string;
  confirmationLabel: string;
  confirmationPlaceholder?: string;
  onDelete: () => Promise<void>;
  deleteButtonText: string;
  dangerZoneLabel: string;
  irreversibleActionsLabel: string;
  cancelLabel: string;
  textMismatchMessage: string;
  deletingLabel: string;
  className?: string;
}

export function DeleteConfirmation({
  title,
  description,
  warningText,
  confirmationText,
  confirmationLabel,
  confirmationPlaceholder,
  onDelete,
  deleteButtonText,
  dangerZoneLabel,
  irreversibleActionsLabel,
  cancelLabel,
  textMismatchMessage,
  deletingLabel,
  className = "",
}: DeleteConfirmationProps) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <Card className={`border-destructive/20 bg-destructive/10 ${className}`}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive font-semibold">{dangerZoneLabel}</CardTitle>
          </div>
          <CardDescription>
            <span className="text-destructive">{irreversibleActionsLabel}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-destructive/10 p-4 ">
            <h4 className="font-semibold text-destructive mb-2">{title}</h4>
            <p className="text-sm text-destructive mb-4">{description}</p>
            {warningText && <p className="text-sm font-semibold text-destructive mb-4">{warningText}</p>}
            <Button variant="destructive" onClick={() => setShowDialog(true)} className="gap-2">
              {deleteButtonText}
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title={title.toLowerCase()}
        description={description}
        confirmText={deleteButtonText}
        cancelText={cancelLabel}
        onConfirm={onDelete}
        variant="destructive"
        requiresTextConfirmation
        confirmationText={confirmationText}
        confirmationLabel={confirmationLabel}
        confirmationPlaceholder={confirmationPlaceholder}
        textMismatchMessage={textMismatchMessage}
        loadingText={deletingLabel}
      />
    </>
  );
}
