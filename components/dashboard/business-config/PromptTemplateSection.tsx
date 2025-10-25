"use client";

import { useState } from "react";
import {
  DEFAULT_PROMPT_TEMPLATE,
  Business,
  BusinessConfig,
} from "@/types/database";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
  DashboardCardSection,
} from "@/components/ui/dashboard-card";
import { Code, Settings } from "lucide-react";
import { parseTemplate } from "@/lib/utils/template-variables";
import { PromptTemplateEditModal } from "./PromptTemplateEditModal";

interface PromptTemplateSectionProps {
  promptTemplate: string;
  business: Business;
  config: BusinessConfig;
  loading?: boolean;
  onSave: (promptTemplate: string) => Promise<void>;
}

export default function PromptTemplateSection({
  promptTemplate,
  business,
  config,
  loading,
  onSave,
}: PromptTemplateSectionProps) {
  const [showEditModal, setShowEditModal] = useState(false);

  // Parse template for display with colored variables
  const segments = parseTemplate(promptTemplate, business, config);

  return (
    <>
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <DashboardCardTitle icon={<Code className="h-5 w-5" />}>
                תבנית הנחיה מותאמת אישית
              </DashboardCardTitle>
              <DashboardCardDescription>
                התבנית המשמשת ליצירת תגובות AI
              </DashboardCardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
              disabled={loading}
            >
              <Settings className="ml-2 h-4 w-4" />
              עריכה
            </Button>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-4">
          <DashboardCardSection withBorder={false}>
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
          </DashboardCardSection>
        </DashboardCardContent>
      </DashboardCard>

      <PromptTemplateEditModal
        promptTemplate={promptTemplate}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSave={onSave}
      />
    </>
  );
}
