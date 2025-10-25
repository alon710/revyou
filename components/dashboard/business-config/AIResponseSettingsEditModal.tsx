"use client";

import { useState } from "react";
import { BusinessConfig, ToneOfVoice, LanguageMode } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/loading";
import { Sparkles, Save, X } from "lucide-react";

interface AIResponseSettingsEditModalProps {
  config: BusinessConfig;
  open: boolean;
  onClose: () => void;
  onSave: (config: Partial<BusinessConfig>) => Promise<void>;
}

export function AIResponseSettingsEditModal({
  config,
  open,
  onClose,
  onSave,
}: AIResponseSettingsEditModalProps) {
  const [toneOfVoice, setToneOfVoice] = useState<ToneOfVoice>(
    config.toneOfVoice
  );
  const [languageMode, setLanguageMode] = useState<LanguageMode>(
    config.languageMode || "auto-detect"
  );
  const [allowedEmojis, setAllowedEmojis] = useState<string[]>(
    config.allowedEmojis || []
  );
  const [maxSentences, setMaxSentences] = useState<number>(
    config.maxSentences || 2
  );
  const [signature, setSignature] = useState<string>(config.signature || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave({
        toneOfVoice,
        languageMode,
        allowedEmojis,
        maxSentences,
        signature,
      });
      onClose();
    } catch (error) {
      console.error("Error saving AI response settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setToneOfVoice(config.toneOfVoice);
    setLanguageMode(config.languageMode || "auto-detect");
    setAllowedEmojis(config.allowedEmojis || []);
    setMaxSentences(config.maxSentences || 2);
    setSignature(config.signature || "");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            עריכת הגדרות תגובה AI
          </DialogTitle>
          <DialogDescription className="text-right">
            הגדר את אופן יצירת התגובות האוטומטיות
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Tone of Voice */}
          <div className="space-y-2">
            <Label htmlFor="toneOfVoice" className="text-right block">
              סגנון תשובה
            </Label>
            <Select
              value={toneOfVoice}
              onValueChange={(value: ToneOfVoice) => setToneOfVoice(value)}
              disabled={isLoading}
            >
              <SelectTrigger id="toneOfVoice">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">מקצועי</SelectItem>
                <SelectItem value="friendly">ידידותי</SelectItem>
                <SelectItem value="formal">פורמלי</SelectItem>
                <SelectItem value="humorous">הומוריסטי</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Language Mode */}
          <div className="space-y-2">
            <Label htmlFor="languageMode" className="text-right block">
              שפת תגובה
            </Label>
            <Select
              value={languageMode}
              onValueChange={(value: LanguageMode) => setLanguageMode(value)}
              disabled={isLoading}
            >
              <SelectTrigger id="languageMode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto-detect">זיהוי אוטומטי</SelectItem>
                <SelectItem value="hebrew">עברית</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="match-reviewer">התאמה למבקר</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Allowed Emojis */}
          <div className="space-y-2">
            <Label htmlFor="allowedEmojis" className="text-right block">
              אימוג&apos;ים מותרים
            </Label>
            <Input
              id="allowedEmojis"
              type="text"
              value={allowedEmojis.join(" ")}
              onChange={(e) =>
                setAllowedEmojis(
                  e.target.value.split(" ").filter((e) => e.trim())
                )
              }
              placeholder="🥂 ✨ 🙏 💐 (או השאר ריק לאי שימוש באימוג'ים)"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-right">
              הפרד באמצעות רווחים. השאר ריק אם אינך רוצה שימוש באימוג&apos;ים
            </p>
          </div>

          {/* Max Sentences */}
          <div className="space-y-2">
            <Label htmlFor="maxSentences" className="text-right block">
              מספר משפטים מקסימלי
            </Label>
            <Select
              value={maxSentences.toString()}
              onValueChange={(value) => setMaxSentences(parseInt(value))}
              disabled={isLoading}
            >
              <SelectTrigger id="maxSentences">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">משפט אחד</SelectItem>
                <SelectItem value="2">שני משפטים (מומלץ)</SelectItem>
                <SelectItem value="3">שלושה משפטים</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Signature */}
          <div className="space-y-2">
            <Label htmlFor="signature" className="text-right block">
              חתימה
            </Label>
            <Input
              id="signature"
              type="text"
              value={signature}
              onChange={(e) => setSignature(e.target.value)}
              placeholder="צוות העסק"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground text-right">
              החתימה שתופיע בסוף כל תגובה
            </p>
          </div>
        </div>

        <DialogFooter className="flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            <X className="ml-2 h-5 w-5" />
            ביטול
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loading size="sm" />
                שומר...
              </>
            ) : (
              <>
                <Save className="ml-2 h-5 w-5" />
                שמור שינויים
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
