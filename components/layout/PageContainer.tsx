import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full space-y-6",
        "max-w-full lg:max-w-7xl",
        className
      )}
    >
      {children}
    </div>
  );
}
