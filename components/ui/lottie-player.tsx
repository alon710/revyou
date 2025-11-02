"use client";

import Lottie from "lottie-react";
import { cn } from "@/lib/utils";

interface LottiePlayerProps {
  animationData: object;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  ariaLabel?: string;
}

export function LottiePlayer({
  animationData,
  className,
  loop = true,
  autoplay = true,
  ariaLabel = "Lottie animation",
}: LottiePlayerProps) {
  return (
    <div
      className={cn(
        "relative w-full h-full flex items-center justify-center",
        className
      )}
      aria-label={ariaLabel}
    >
      <Lottie
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
