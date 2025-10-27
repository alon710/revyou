import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Simple empty state component shown when no businesses are connected
 */
export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">עדיין לא חיברת עסקים</h3>
      <p className="text-muted-foreground max-w-sm mb-4">
        חבר את חשבון Google Location Profile שלך כדי להתחיל לקבל תשובות AI
        אוטומטיות לביקורות הלקוחות שלך
      </p>
      <Button asChild>
        <Link href="/locations/connect">חבר עסק ראשון</Link>
      </Button>
    </div>
  );
}
