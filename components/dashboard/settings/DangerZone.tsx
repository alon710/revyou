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
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/firebase/auth";

interface DangerZoneProps {
  userEmail: string;
  onDeleteAccount: () => Promise<void>;
}

export function DangerZone({ userEmail, onDeleteAccount }: DangerZoneProps) {
  const [showDialog, setShowDialog] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    await onDeleteAccount();

    await signOut();
    router.push("/");
  };

  return (
    <>
      <Card className="border-destructive">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">אזור מסוכן</CardTitle>
          </div>
          <CardDescription>
            פעולות בלתי הפיכות שישפיעו על החשבון שלך
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-destructive/10 p-4 border border-destructive/20">
            <h4 className="font-semibold text-destructive mb-2">
              מחק חשבון לצמיתות
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              פעולה זו תמחק את כל הנתונים שלך כולל:
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4 list-disc list-inside">
              <li>כל העסקים המחוברים</li>
              <li>כל הביקורות והתגובות</li>
              <li>הגדרות ותצורות</li>
              <li>מנויים ונתוני תשלום</li>
            </ul>
            <p className="text-sm font-semibold text-destructive mb-4">
              פעולה זו אינה ניתנת לביטול!
            </p>
            <Button
              variant="destructive"
              onClick={() => setShowDialog(true)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              מחק חשבון לצמיתות
            </Button>
          </div>
        </CardContent>
      </Card>

      <ConfirmationDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        title="אישור מחיקת חשבון"
        description={
          <>
            <p className="font-semibold">
              פעולה זו תמחק את החשבון שלך לצמיתות!
            </p>
          </>
        }
        confirmText={
          <>
            <Trash2 className="h-4 w-4" />
            מחק חשבון לצמיתות
          </>
        }
        cancelText="ביטול"
        onConfirm={handleDelete}
        variant="destructive"
        requiresTextConfirmation
        confirmationText={userEmail}
        confirmationLabel="כדי לאשר, הקלד את כתובת האימייל שלך:"
        confirmationPlaceholder="הקלד את האימייל שלך"
        loadingText="מוחק..."
      />
    </>
  );
}
