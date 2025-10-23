"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { AlertTriangle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/firebase/auth";

interface DangerZoneProps {
  userEmail: string;
  onDeleteAccount: () => Promise<void>;
}

export function DangerZone({ userEmail, onDeleteAccount }: DangerZoneProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [confirmEmail, setConfirmEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirmEmail !== userEmail) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDeleteAccount();

      // Sign out and redirect
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error deleting account:", error);
      setIsDeleting(false);
    }
  };

  const isConfirmValid = confirmEmail === userEmail;

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
            <h4 className="font-semibold text-destructive mb-2">מחק חשבון לצמיתות</h4>
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              אישור מחיקת חשבון
            </DialogTitle>
            <DialogDescription className="space-y-2">
              <p className="font-semibold">פעולה זו תמחק את החשבון שלך לצמיתות!</p>
              <p>כל הנתונים, העסקים, הביקורות וההגדרות יימחקו ולא ניתן יהיה לשחזר אותם.</p>
              <p className="text-destructive font-semibold">פעולה זו אינה ניתנת לביטול.</p>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="confirm-email" className="text-sm font-medium">
                כדי לאשר, הקלד את כתובת האימייל שלך:
              </Label>
              <p className="text-sm text-muted-foreground mb-2">{userEmail}</p>
              <Input
                id="confirm-email"
                type="email"
                value={confirmEmail}
                onChange={(e) => setConfirmEmail(e.target.value)}
                placeholder="הקלד את האימייל שלך"
                className="mt-2"
                disabled={isDeleting}
                dir="ltr"
              />
            </div>

            {confirmEmail && !isConfirmValid && (
              <p className="text-sm text-destructive">
                כתובת האימייל אינה תואמת
              </p>
            )}
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowDialog(false);
                setConfirmEmail("");
              }}
              disabled={isDeleting}
            >
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={!isConfirmValid || isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <>מוחק...</>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  מחק חשבון לצמיתות
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
