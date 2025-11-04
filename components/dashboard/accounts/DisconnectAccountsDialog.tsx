"use client";

import { useState } from "react";
import { useAccount } from "@/contexts/AccountContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { deleteAccount } from "@/lib/firebase/accounts";
import { Mail, Calendar, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import type { Account } from "@/types/database";

interface DisconnectAccountsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DisconnectAccountsDialog({
  open,
  onOpenChange,
}: DisconnectAccountsDialogProps) {
  const { user } = useAuth();
  const { accounts, refreshAccounts } = useAccount();
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleDisconnectClick = (account: Account) => {
    setSelectedAccount(account);
    setConfirmOpen(true);
  };

  const handleConfirmDisconnect = async () => {
    if (!user || !selectedAccount) return;

    try {
      await deleteAccount(user.uid, selectedAccount.id);
      toast.success("החשבון נותק בהצלחה");
      await refreshAccounts();
      setSelectedAccount(null);
    } catch (error) {
      console.error("Error disconnecting account:", error);
      toast.error("שגיאה בניתוק החשבון");
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("he-IL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent dir="rtl" className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-right">
              ניהול חשבונות מחוברים
            </DialogTitle>
            <DialogDescription className="text-right">
              כאן תוכל לנתק חשבונות Google המחוברים לפלטפורמה. ניתוק חשבון ימחק
              את כל העסקים והביקורות המקושרות אליו.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-4">
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                אין חשבונות מחוברים
              </div>
            ) : (
              accounts.map((account) => (
                <div
                  key={account.id}
                  className="border rounded-lg p-4 space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-right truncate">
                        {account.accountName}
                      </h4>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 flex-row-reverse">
                        <span className="truncate">{account.email}</span>
                        <Mail className="h-3 w-3 shrink-0" />
                      </div>

                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1 flex-row-reverse">
                        <span>
                          מחובר מאז {formatDate(account.connectedAt.toDate())}
                        </span>
                        <Calendar className="h-3 w-3 shrink-0" />
                      </div>
                    </div>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDisconnectClick(account)}
                    >
                      נתק
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="ניתוק חשבון Google"
        description={
          <>
            <p>
              האם אתה בטוח שברצונך לנתק את החשבון{" "}
              <strong>{selectedAccount?.email}</strong>?
            </p>
            <p className="mt-2">
              פעולה זו תמחק את כל העסקים והביקורות המקושרים לחשבון זה.
            </p>
            <p className="mt-2 text-destructive font-medium">
              פעולה זו בלתי הפיכה!
            </p>
          </>
        }
        confirmText="נתק חשבון"
        cancelText="ביטול"
        variant="destructive"
        icon={<AlertTriangle className="h-5 w-5" />}
        onConfirm={handleConfirmDisconnect}
      />
    </>
  );
}
