"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/routing";

interface BackButtonProps {
  label: string;
  className?: string;
}

export function BackButton({ label, className }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button variant="ghost" size="sm" onClick={() => router.back()} className={cn(className)}>
      <ArrowRight className="ms-2 h-4 w-4" />
      {label}
    </Button>
  );
}
