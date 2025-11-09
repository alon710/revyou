"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Smile, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerClose, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  disabled?: boolean;
}

interface EmojiClickEvent extends Event {
  detail: {
    unicode: string;
  };
}

export function EmojiPicker({ onEmojiSelect, disabled = false }: EmojiPickerProps) {
  const pickerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!pickerRef.current || !open) return;

    import("emoji-picker-element").then(() => {
      if (!pickerRef.current) return;

      pickerRef.current.innerHTML = "";

      const picker = document.createElement("emoji-picker");
      picker.addEventListener("emoji-click", (event: Event) => {
        const emojiEvent = event as EmojiClickEvent;
        onEmojiSelect(emojiEvent.detail.unicode);
        setOpen(false);
      });

      pickerRef.current.appendChild(picker);
    });
  }, [open, onEmojiSelect]);

  if (isMobile) {
    return (
      <>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() => setOpen(true)}
          className="h-9"
        >
          <Smile className="h-4 w-4" />
        </Button>
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent dir="rtl">
            <DrawerHeader className="relative">
              <DrawerClose asChild>
                <button
                  type="button"
                  className="absolute left-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                >
                  <X className="h-4 w-4" />
                </button>
              </DrawerClose>
              <DrawerTitle className="text-right pl-12">בחר אימוג&apos;י</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <div ref={pickerRef} />
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className="h-9"
      >
        <Smile className="h-4 w-4" />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 z-50 rounded-lg border bg-popover shadow-md">
            <div ref={pickerRef} />
          </div>
        </>
      )}
    </div>
  );
}
