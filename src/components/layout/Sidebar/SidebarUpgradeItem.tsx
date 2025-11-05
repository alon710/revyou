"use client";

import { useRouter } from "next/navigation";
import { Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/lib/hooks/useSubscription";

const PLAN_DISPLAY_NAMES = {
  free: "חינם",
  basic: "בסיסית",
  pro: "Pro",
} as const;

export function SidebarUpgradeItem() {
  const router = useRouter();
  const { planType, loading } = useSubscription();

  if (loading) {
    return null;
  }

  const handleUpgrade = () => {
    router.push("/#pricing");
  };

  const planName = PLAN_DISPLAY_NAMES[planType] || PLAN_DISPLAY_NAMES.free;

  if (planType === "free") {
    return (
      <button
        onClick={handleUpgrade}
        className={cn(
          "flex items-center justify-between w-full rounded-lg transition-colors",
          "px-4 py-2.5 hover:bg-primary/10",
          "text-primary hover:text-primary font-medium",
          "border border-primary/20 hover:border-primary/30 cursor-pointer"
        )}
      >
        <span className="text-sm text-right">שדרג תוכנית</span>
        <Sparkles className="h-5 w-5 shrink-0" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-between w-full rounded-lg",
        "px-4 py-2.5 bg-primary/5",
        "text-primary font-medium",
        "border border-primary/20"
      )}
    >
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-sm">חבילה {planName}</span>
      </div>
      <Crown className="h-5 w-5 shrink-0" />
    </div>
  );
}
