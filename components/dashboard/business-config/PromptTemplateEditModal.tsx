"use client";

import { useState, useRef } from "react";
import { DEFAULT_PROMPT_TEMPLATE } from "@/types/database";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loading } from "@/components/ui/loading";
import { Code, Save, X, RotateCcw } from "lucide-react";
import { AVAILABLE_VARIABLES } from "./types";

interface PromptTemplateEditModalProps {
  promptTemplate: string;
  open: boolean;
  onClose: () => void;
  onSave: (promptTemplate: string) => Promise<void>;
}

export function PromptTemplateEditModal({
  promptTemplate,
  open,
  onClose,
  onSave,
}: PromptTemplateEditModalProps) {
  const [localPromptTemplate, setLocalPromptTemplate] =
    useState(promptTemplate);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertVariable = (variable: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.substring(0, start) + variable + text.substring(end);
    setLocalPromptTemplate(newText);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + variable.length;
      textarea.focus();
    }, 0);
  };

  const handleReset = () => {
    if (confirm("האם אתה בטוח שברצונך לאפס את התבנית לברירת המחדל?")) {
      setLocalPromptTemplate(DEFAULT_PROMPT_TEMPLATE);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave(localPromptTemplate);
      onClose();
    } catch (error) {
      console.error("Error saving prompt template:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset to original value
    setLocalPromptTemplate(promptTemplate);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            עריכת תבנית הנחיה מותאמת אישית
          </DialogTitle>
          <DialogDescription className="text-right">
            עצב את ההנחיה שתשלח ל-AI. השתמש במשתנים כדי להכניס מידע דינמי.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4 overflow-y-auto max-h-[60vh]">
          {/* Available Variables */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block">
              משתנים זמינים (לחץ להוספה)
            </Label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_VARIABLES.map((variable) => (
                <Badge
                  key={variable.name}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors font-mono text-xs"
                  onClick={() => insertVariable(variable.name)}
                  title={variable.description}
                >
                  {variable.name}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              לחץ על משתנה כדי להוסיף אותו במיקום הסמן
            </p>
          </div>

          {/* Template Textarea */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="prompt-template"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                תבנית ההנחיה
              </Label>
              <span className="text-xs text-muted-foreground font-mono">
                {(localPromptTemplate?.length || 0).toLocaleString("he-IL")}{" "}
                תווים
              </span>
            </div>
            <Textarea
              ref={textareaRef}
              id="prompt-template"
              value={localPromptTemplate}
              onChange={(e) => setLocalPromptTemplate(e.target.value)}
              className="min-h-[400px] font-mono text-sm resize-none"
              dir="rtl"
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              המערכת תחליף את המשתנים במידע האמיתי בעת יצירת התגובה
            </p>
          </div>

          {/* Reset Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isLoading}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            אפס לברירת מחדל
          </Button>
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
