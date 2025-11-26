"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "@/i18n/routing";
import { useDirection } from "@/contexts/DirectionProvider";

interface BackButtonProps {
  label: string;
  className?: string;
}

export function BackButton({ label, className }: BackButtonProps) {
  const router = useRouter();
  const { isRTL } = useDirection();

  return (
    <Button variant="ghost" size="sm" onClick={() => router.back()} className={cn(className)}>
      {isRTL ? (
        <>
          {label}
          <ArrowRight className="ms-2 h-4 w-4" />
        </>
      ) : (
        <>
          <ArrowLeft className="me-2 h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}
