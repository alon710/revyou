"use client";

import { useRouter } from "next/navigation";
import { signOut } from "@/lib/firebase/auth";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";

interface DangerZoneProps {
  userEmail: string;
  onDeleteAccount: () => Promise<void>;
}

export function DangerZone({ userEmail, onDeleteAccount }: DangerZoneProps) {
  const router = useRouter();

  const handleDelete = async () => {
    await onDeleteAccount();
    await signOut();
    router.push("/");
  };

  return (
    <DeleteConfirmation
      title="מחק חשבון לצמיתות"
      description="פעולה זו תמחק את כל הנתונים שלך כולל:"
      items={[
        "כל העסקים המחוברים",
        "כל הביקורות והתגובות",
        "הגדרות ותצורות",
        "מנויים ונתוני תשלום",
      ]}
      confirmationText={userEmail}
      confirmationLabel="כדי לאשר, הקלד את כתובת האימייל שלך:"
      confirmationPlaceholder="הקלד את האימייל שלך"
      onDelete={handleDelete}
      deleteButtonText="מחק חשבון לצמיתות"
      variant="card"
    />
  );
}
