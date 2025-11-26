"use client";

import * as React from "react";
import { DirectionProvider as RadixDirectionProvider } from "@radix-ui/react-direction";

interface DirectionProviderProps {
  children: React.ReactNode;
}

type Direction = "ltr" | "rtl";

export function DirectionProvider({ children }: DirectionProviderProps) {
  const [dir, setDir] = React.useState<Direction>("ltr");

  React.useEffect(() => {
    const htmlDir = document.documentElement.dir as Direction;
    setDir(htmlDir ?? "ltr");

    const observer = new MutationObserver(() => {
      const newDir = document.documentElement.dir as Direction;
      if (newDir && newDir !== dir) {
        setDir(newDir);
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["dir"],
    });

    return () => observer.disconnect();
  }, [dir]);

  return <RadixDirectionProvider dir={dir}>{children}</RadixDirectionProvider>;
}
