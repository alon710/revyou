"use client";

import { useRef } from "react";
import {
  DEFAULT_PROMPT_TEMPLATE,
  Business,
  BusinessConfig,
} from "@/types/database";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RotateCcw } from "lucide-react";
import { SectionBaseProps, AVAILABLE_VARIABLES } from "./types";
import { parseTemplate } from "@/lib/utils/template-variables";

interface PromptTemplateSectionProps extends SectionBaseProps {
  promptTemplate: string;
  onChange: (template: string) => void;
  onReset: () => void;
  business?: Business;
  config?: BusinessConfig;
}

export default function PromptTemplateSection({
  variant,
  promptTemplate,
  loading,
  onChange,
  onReset,
  business,
  config,
}: PromptTemplateSectionProps) {
  const isEditMode = variant === "edit";
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Parse template for display mode with colored variables
  const segments =
    !isEditMode && business && config
      ? parseTemplate(promptTemplate, business, config)
      : [];

  const insertVariable = (variable: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.substring(0, start) + variable + text.substring(end);
    onChange(newText);

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + variable.length;
      textarea.focus();
    }, 0);
  };

  const handleResetTemplate = () => {
    if (confirm("האם אתה בטוח שברצונך לאפס את התבנית לברירת המחדל?")) {
      onReset();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>תבנית הנחיה מותאמת אישית</CardTitle>
        <CardDescription>
          {isEditMode
            ? "עצב את ההנחיה שתשלח ל-AI. השתמש במשתנים כדי להכניס מידע דינמי."
            : "התבנית המשמשת ליצירת תגובות AI"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditMode && (
          <>
            <div>
              <Label className="text-sm font-medium mb-2">
                משתנים זמינים (לחץ להוספה)
              </Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {AVAILABLE_VARIABLES.map((variable) => (
                  <Badge
                    key={variable.name}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    onClick={() => insertVariable(variable.name)}
                    title={variable.description}
                  >
                    {variable.name}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                לחץ על משתנה כדי להוסיף אותו במיקום הסמן
              </p>
            </div>
            <Separator />
          </>
        )}

        <div>
          {isEditMode && (
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="prompt-template">תבנית ההנחיה</Label>
              <span className="text-xs text-muted-foreground">
                {(promptTemplate?.length || 0).toLocaleString("he-IL")} תווים
              </span>
            </div>
          )}
          {isEditMode ? (
            <Textarea
              ref={textareaRef}
              id="prompt-template"
              value={promptTemplate}
              onChange={(e) => onChange(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              dir="rtl"
              disabled={loading}
            />
          ) : (
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap font-mono" dir="rtl">
                {segments.length > 0
                  ? segments.map((segment, index) => {
                      if (segment.type === "text") {
                        return <span key={index}>{segment.content}</span>;
                      }
                      // Variable rendering with colors
                      const colorClass =
                        segment.variableType === "known"
                          ? "text-blue-600 dark:text-blue-400 font-semibold"
                          : "text-purple-600 dark:text-purple-400 font-semibold";
                      return (
                        <span
                          key={index}
                          className={colorClass}
                          title={segment.originalVariable}
                        >
                          {segment.content}
                        </span>
                      );
                    })
                  : promptTemplate || DEFAULT_PROMPT_TEMPLATE}
              </pre>
            </div>
          )}
          {isEditMode && (
            <p className="text-xs text-muted-foreground mt-2">
              המערכת תחליף את המשתנים במידע האמיתי בעת יצירת התגובה
            </p>
          )}
        </div>

        {isEditMode && (
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetTemplate}
              disabled={loading}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              אפס לברירת מחדל
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
