import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  href: string;
  label?: string;
  className?: string;
}

export function BackButton({
  href,
  label = "חזור",
  className,
}: BackButtonProps) {
  return (
    <Button variant="ghost" size="sm" asChild className={cn(className)}>
      <Link href={href}>
        <ArrowRight className="ml-2 h-4 w-4" />
        {label}
      </Link>
    </Button>
  );
}
