import * as React from "react";
import { cn } from "@/lib/utils";

const DashboardCard = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex flex-col rounded-2xl border border-border/40 bg-card text-card-foreground shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] group overflow-hidden",
        className
      )}
      {...props}
    />
  )
);
DashboardCard.displayName = "DashboardCard";

const DashboardCardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-3 p-8 pb-4", className)} {...props} />
  )
);
DashboardCardHeader.displayName = "DashboardCardHeader";

const DashboardCardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { icon?: React.ReactNode }
>(({ className, icon, children, ...props }, ref) => (
  <div ref={ref} className={cn("flex items-center gap-3", className)} {...props}>
    {icon && <span className="text-muted-foreground">{icon}</span>}
    <h3 className="text-xl font-semibold leading-none tracking-tight">{children}</h3>
  </div>
));
DashboardCardTitle.displayName = "DashboardCardTitle";

const DashboardCardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
);
DashboardCardDescription.displayName = "DashboardCardDescription";

const DashboardCardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("flex-1 p-8 pt-4", className)} {...props} />
);
DashboardCardContent.displayName = "DashboardCardContent";

const DashboardCardSection = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { withBorder?: boolean }
>(({ className, withBorder = true, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("space-y-4", withBorder && "border-t border-border/40 pt-4 mt-4", className)}
    {...props}
  />
));
DashboardCardSection.displayName = "DashboardCardSection";

const DashboardCardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-end gap-2 p-6 pt-4 border-t border-border/40", className)}
      {...props}
    />
  )
);
DashboardCardFooter.displayName = "DashboardCardFooter";

const DashboardCardField = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    label: string;
    value?: React.ReactNode;
  }
>(({ className, label, value, children, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props}>
    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
    {value ? <div className="text-sm font-medium leading-relaxed">{value}</div> : children}
  </div>
));
DashboardCardField.displayName = "DashboardCardField";

export {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
  DashboardCardSection,
  DashboardCardFooter,
  DashboardCardField,
};
