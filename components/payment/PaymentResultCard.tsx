import { Card } from "@/components/ui/card";
import { Check, X, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type PaymentResultCardProps = {
  variant: "success" | "cancel";
  title: string;
  description: string | React.ReactNode;
  icon?: LucideIcon;
  metadata?: string;
  footer?: string | React.ReactNode;
  children?: React.ReactNode;
  className?: string;
};

export function PaymentResultCard({
  variant,
  title,
  description,
  icon: CustomIcon,
  metadata,
  footer,
  children,
  className,
}: PaymentResultCardProps) {
  const Icon = CustomIcon || (variant === "success" ? Check : X);

  const iconBgStyles = {
    success: "bg-green-100 dark:bg-green-900/20",
    cancel: "bg-orange-100 dark:bg-orange-900/20",
  };

  const iconColorStyles = {
    success: "text-green-600 dark:text-green-400",
    cancel: "text-orange-600 dark:text-orange-400",
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className={cn("max-w-md w-full p-8 text-center", className)}>
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div
            className={cn(
              "w-16 h-16 rounded-full flex items-center justify-center",
              iconBgStyles[variant]
            )}
          >
            <Icon className={cn("w-8 h-8", iconColorStyles[variant])} />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground mb-3">{title}</h1>

        {/* Description */}
        <div className="text-muted-foreground mb-6">{description}</div>

        {/* Metadata */}
        {metadata && (
          <p className="text-xs text-muted-foreground mb-6">{metadata}</p>
        )}

        {/* Actions (children) */}
        {children && <div className="space-y-3">{children}</div>}

        {/* Footer */}
        {footer && (
          <div className="text-sm text-muted-foreground mt-6">{footer}</div>
        )}
      </Card>
    </div>
  );
}
