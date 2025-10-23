/**
 * ConfirmationDialog Usage Examples
 *
 * A reusable RTL-ready confirmation dialog component with various configuration options.
 */

import { useState } from "react";
import { ConfirmationDialog } from "./confirmation-dialog";
import { Trash2, AlertTriangle } from "lucide-react";
import { Button } from "./button";

// Example 1: Simple confirmation dialog
export function SimpleConfirmExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>פתח דיאלוג פשוט</Button>

      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="אישור פעולה"
        description="האם אתה בטוח שברצונך לבצע פעולה זו?"
        confirmText="אישור"
        cancelText="ביטול"
        onConfirm={async () => {
          console.log("Confirmed!");
        }}
      />
    </>
  );
}

// Example 2: Destructive action with text confirmation
export function DestructiveWithTextExample() {
  const [open, setOpen] = useState(false);
  const email = "user@example.com";

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        מחק חשבון
      </Button>

      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="מחיקת חשבון"
        description={
          <>
            <p className="font-semibold">פעולה זו תמחק את החשבון לצמיתות!</p>
            <p>כל הנתונים יימחקו ולא ניתן יהיה לשחזר אותם.</p>
          </>
        }
        confirmText={
          <>
            <Trash2 className="h-4 w-4" />
            מחק חשבון
          </>
        }
        cancelText="ביטול"
        onConfirm={async () => {
          // Delete account logic
          await new Promise(resolve => setTimeout(resolve, 2000));
        }}
        variant="destructive"
        requiresTextConfirmation
        confirmationText={email}
        confirmationLabel="כדי לאשר, הקלד את כתובת האימייל שלך:"
        confirmationPlaceholder="הקלד את האימייל שלך"
        loadingText="מוחק..."
      />
    </>
  );
}

// Example 3: Custom icon and loading state
export function CustomIconExample() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>פעולה מסוכנת</Button>

      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="אזהרה"
        description="פעולה זו עלולה להשפיע על הנתונים שלך"
        confirmText="המשך בכל זאת"
        cancelText="ביטול"
        onConfirm={async () => {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }}
        variant="destructive"
        icon={<AlertTriangle className="h-5 w-5" />}
        loadingText="מעבד..."
      />
    </>
  );
}

// Example 4: External loading state control
export function ExternalLoadingExample() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)}>פעולה עם טעינה חיצונית</Button>

      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="שמור שינויים"
        description="האם ברצונך לשמור את השינויים?"
        confirmText="שמור"
        cancelText="ביטול"
        onConfirm={handleConfirm}
        isLoading={isLoading}
        loadingText="שומר..."
      />
    </>
  );
}

// Example 5: Delete business with text confirmation
export function DeleteBusinessExample() {
  const [open, setOpen] = useState(false);
  const businessName = "המסעדה שלי";
  const confirmText = "DELETE";

  return (
    <>
      <Button variant="destructive" onClick={() => setOpen(true)}>
        מחק עסק
      </Button>

      <ConfirmationDialog
        open={open}
        onOpenChange={setOpen}
        title="מחיקת עסק"
        description={
          <>
            <p className="font-semibold">האם אתה בטוח שברצונך למחוק את &quot;{businessName}&quot;?</p>
            <p>כל הביקורות, התגובות וההגדרות של העסק יימחקו.</p>
            <p className="text-destructive font-semibold">פעולה זו אינה ניתנת לביטול!</p>
          </>
        }
        confirmText={
          <>
            <Trash2 className="h-4 w-4" />
            מחק עסק
          </>
        }
        cancelText="ביטול"
        onConfirm={async () => {
          // Delete business logic
          console.log("Deleting business...");
          await new Promise(resolve => setTimeout(resolve, 2000));
        }}
        variant="destructive"
        requiresTextConfirmation
        confirmationText={confirmText}
        confirmationLabel={`כדי לאשר, הקלד "${confirmText}":`}
        confirmationPlaceholder={`הקלד ${confirmText}`}
        loadingText="מוחק..."
      />
    </>
  );
}
