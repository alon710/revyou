import { Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/**
 * Empty state component shown when user has no connected businesses
 */
export default function EmptyBusinessState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Building2 className="h-12 w-12 text-muted-foreground" />
      </div>

      <h3 className="text-lg font-semibold mb-2">
        עדיין לא חיברת עסקים
      </h3>

      <p className="text-muted-foreground mb-6 max-w-md">
        חבר את חשבון Google Business Profile שלך כדי להתחיל לקבל תשובות AI אוטומטיות לביקורות הלקוחות שלך
      </p>

      <Button asChild size="lg">
        <Link href="/businesses/connect">
          <Building2 className="ml-2 h-5 w-5" />
          חבר עסק ראשון
        </Link>
      </Button>
    </div>
  );
}
