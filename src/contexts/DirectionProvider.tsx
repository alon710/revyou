"use client";

import * as React from "react";
import { DirectionProvider as RadixDirectionProvider } from "@radix-ui/react-direction";

type Direction = "ltr" | "rtl";

interface DirectionContextValue {
  dir: Direction;
  isRTL: boolean;
}

const DirectionContext = React.createContext<DirectionContextValue | undefined>(undefined);

export function useDirection() {
  const context = React.useContext(DirectionContext);
  if (!context) {
    throw new Error("useDirection must be used within DirectionProvider");
  }
  return context;
}

interface DirectionProviderProps {
  children: React.ReactNode;
}

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

  const value = React.useMemo(() => ({ dir, isRTL: dir === "rtl" }), [dir]);

  return (
    <DirectionContext.Provider value={value}>
      <RadixDirectionProvider dir={dir}>{children}</RadixDirectionProvider>
    </DirectionContext.Provider>
  );
}
