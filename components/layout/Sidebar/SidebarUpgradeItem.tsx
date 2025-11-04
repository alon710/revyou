"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function SidebarUpgradeItem() {
  const router = useRouter();

  const handleUpgrade = () => {
    router.push("/#pricing");
  };

  return (
    <button
      onClick={handleUpgrade}
      className={cn(
        "flex items-center justify-between w-full rounded-lg transition-colors",
        "px-4 py-2.5 hover:bg-primary/10",
        "text-primary hover:text-primary font-medium",
        "border border-primary/20 hover:border-primary/30"
      )}
    >
      <span className="text-sm text-right">שדרג תוכנית</span>
      <Sparkles className="h-5 w-5 shrink-0" />
    </button>
  );
}
