import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  fullScreen?: boolean;
  title?: string;
  description?: string;
  text?: string;
}

const sizeMap = {
  sm: "h-4 w-4",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

export function Loading({
  className,
  size = "md",
  fullScreen = false,
  title,
  description,
  text,
}: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center gap-4">
      <Loader2
        className={cn("animate-spin text-primary", sizeMap[size], className)}
      />
      {title && <h2 className="text-2xl font-semibold">{title}</h2>}
      {description && <p className="text-muted-foreground">{description}</p>}
      {text && <p className="text-sm text-muted-foreground">{text}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
        {content}
      </div>
    );
  }

  return content;
}
