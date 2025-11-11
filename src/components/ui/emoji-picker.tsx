"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Smile } from "lucide-react";

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
          <div className="absolute top-full start-0 mt-2 z-50 rounded-lg border bg-popover shadow-md">
            <div ref={pickerRef} />
          </div>
        </>
      )}
    </div>
  );
}
