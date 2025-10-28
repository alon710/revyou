"use client";

import type { Route } from "next";
import Link from "next/link";

import { cn } from "@/lib/utils";

interface SiteLogoProps {
  href: Route;
  color?: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizePx = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 52,
};

export function Logo({ href, className, size = "lg" }: SiteLogoProps) {
  const height = sizePx[size];

  const width = Math.round(height * (122.03 / 45.69));

  const fontSizeClasses = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
    xl: "text-4xl",
  };

  return (
    <Link href={href} className={cn("flex items-center", className)}>
      <div
        className={cn("relative content-center")}
        style={{
          height,
          width,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "font-nunito font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
              fontSizeClasses[size]
            )}
          >
            RevYou
          </span>
        </div>
      </div>
    </Link>
  );
}
