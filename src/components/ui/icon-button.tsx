"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

const iconButtonVariants = cva(
  "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        destructive: "text-destructive hover:bg-destructive/10",
      },
      size: {
        sm: "h-8 w-8",
        default: "h-9 w-9",
        lg: "h-10 w-10",
      },
      hoverEffect: {
        scale: "hover:scale-110 active:scale-95",
        none: "",
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "default",
      hoverEffect: "scale",
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  icon: LucideIcon;
  asChild?: boolean;
  iconClassName?: string;
  "aria-label": string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, hoverEffect, icon: Icon, asChild = false, iconClassName, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    const iconSize = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-5 w-5" : "h-4 w-4";

    return (
      <Comp className={cn(iconButtonVariants({ variant, size, hoverEffect, className }))} ref={ref} {...props}>
        {asChild ? children : <Icon className={cn(iconSize, iconClassName)} />}
      </Comp>
    );
  }
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
