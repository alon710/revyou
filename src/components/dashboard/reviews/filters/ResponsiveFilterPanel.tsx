"use client";

import { useState } from "react";
import { useMediaQuery } from "react-responsive";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

interface ResponsiveFilterPanelProps {
  children: React.ReactNode;
  activeCount: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ResponsiveFilterPanel({ children, activeCount, open, onOpenChange }: ResponsiveFilterPanelProps) {
  const t = useTranslations("dashboard.reviews.filters");
  const [hasMounted, setHasMounted] = useState(false);
  const isDesktop = useMediaQuery({ query: "(min-width: 768px)" });

  if (typeof window !== "undefined" && !hasMounted) {
    setHasMounted(true);
  }

  const Trigger = (
    <Button variant="outline" className="gap-2">
      <Filter className="h-4 w-4" />
      {t("filter")}
      {activeCount > 0 && (
        <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 flex items-center justify-center">
          {activeCount}
        </Badge>
      )}
    </Button>
  );

  if (!hasMounted) {
    return Trigger;
  }

  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>{Trigger}</PopoverTrigger>
        <PopoverContent className="w-[350px] p-4" align="start">
          {children}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerTrigger asChild>{Trigger}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{t("filters")}</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 pb-8">{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
