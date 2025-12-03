"use client";

import type { Route } from "next";
import { Link } from "@/i18n/routing";

import { cn } from "@/lib/utils";

import Image from "next/image";

interface SiteLogoProps {
  href: Route;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "icon" | "full";
}

const sizePx = {
  sm: 24,
  md: 32,
  lg: 40,
  xl: 52,
};

export function Logo({ href, className, size = "xl", variant = "icon" }: SiteLogoProps) {
  const height = sizePx[size];

  const imageSrc = variant === "icon" ? "/images/logo-icon.png" : "/images/logo-full.svg";

  return (
    <Link href={href} className={cn("flex items-center", className)}>
      <div style={{ height }} className="relative aspect-auto">
        <Image
          src={imageSrc}
          alt="Bottie Logo"
          height={height}
          width={variant === "icon" ? height : height * 3}
          className="h-full w-auto object-contain"
          priority
        />
      </div>
    </Link>
  );
}
