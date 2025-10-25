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
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
  DashboardCardSection,
} from "@/components/ui/dashboard-card";
import { RotateCcw, Code } from "lucide-react";
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
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle icon={<Code className="h-5 w-5" />}>
          תבנית הנחיה מותאמת אישית
        </DashboardCardTitle>
        <DashboardCardDescription>
          {isEditMode
            ? "עצב את ההנחיה שתשלח ל-AI. השתמש במשתנים כדי להכניס מידע דינמי."
            : "התבנית המשמשת ליצירת תגובות AI"}
        </DashboardCardDescription>
      </DashboardCardHeader>
      <DashboardCardContent className="space-y-4">
        {isEditMode && (
          <DashboardCardSection withBorder={false}>
            <div>
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 block">
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
              <p className="text-xs text-muted-foreground mt-3">
                לחץ על משתנה כדי להוסיף אותו במיקום הסמן
              </p>
            </div>
          </DashboardCardSection>
        )}

        <DashboardCardSection withBorder={isEditMode}>
          {isEditMode && (
            <div className="flex items-center justify-between mb-3">
              <Label
                htmlFor="prompt-template"
                className="text-xs font-medium text-muted-foreground uppercase tracking-wide"
              >
                תבנית ההנחיה
              </Label>
              <span className="text-xs text-muted-foreground font-mono">
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
              className="min-h-[400px] font-mono text-sm resize-none"
              dir="rtl"
              disabled={loading}
            />
          ) : (
            <div className="bg-muted/50 p-4 rounded-md">
              <pre className="text-sm whitespace-pre-wrap font-mono" dir="rtl">
                {segments.length > 0
                  ? segments.map((segment, index) => {
                      if (segment.type === "text") {
                        return <span key={index}>{segment.content}</span>;
                      }
                      // Variable rendering with colors
                      const colorClass =
                        segment.variableType === "known"
                          ? "text-primary font-semibold"
                          : "text-accent font-semibold";
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
            <p className="text-xs text-muted-foreground mt-3">
              המערכת תחליף את המשתנים במידע האמיתי בעת יצירת התגובה
            </p>
          )}
        </DashboardCardSection>

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
      </DashboardCardContent>
    </DashboardCard>
  );
}
