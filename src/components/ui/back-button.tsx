"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  label?: string;
  className?: string;
}

export function BackButton({ label = "חזור", className }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button variant="ghost" size="sm" onClick={() => router.back()} className={cn(className)}>
      <ArrowRight className="ml-2 h-4 w-4" />
      {label}
    </Button>
  );
}
