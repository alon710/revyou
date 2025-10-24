import { Business, BusinessConfig } from "@/types/database";
import {
  TONE_LABELS,
  LANGUAGE_LABELS,
} from "@/components/dashboard/business-config/types";

/**
 * Variable types for styling
 */
export type VariableType = "known" | "unknown";

/**
 * Parsed template segment
 */
export interface TemplateSegment {
  type: "text" | "variable";
  content: string;
  variableType?: VariableType;
  originalVariable?: string;
}

/**
 * Get the actual value for a variable based on business config
 */
export function getVariableValue(
  variable: string,
  business: Business,
  config: BusinessConfig
): { value: string; type: VariableType } {
  const varName = variable.replace(/[{}]/g, "");

  // Known variables (business/config data)
  switch (varName) {
    case "BUSINESS_NAME":
      return { value: config.businessName || business.name, type: "known" };

    case "BUSINESS_DESCRIPTION":
      return { value: config.businessDescription || "", type: "known" };

    case "BUSINESS_PHONE":
      return { value: config.businessPhone || "", type: "known" };

    case "TONE":
      return {
        value: TONE_LABELS[config.toneOfVoice] || config.toneOfVoice,
        type: "known",
      };

    case "LANGUAGE":
      return {
        value: LANGUAGE_LABELS[config.languageMode] || config.languageMode,
        type: "known",
      };

    case "MAX_SENTENCES":
      return { value: (config.maxSentences || 2).toString(), type: "known" };

    case "SIGNATURE":
      return { value: config.signature || "", type: "known" };

    case "ALLOWED_EMOJIS":
      return { value: (config.allowedEmojis || []).join(" "), type: "known" };

    case "CUSTOM_INSTRUCTIONS_1":
      return {
        value: config.starConfigs[1]?.customInstructions || "",
        type: "known",
      };

    case "CUSTOM_INSTRUCTIONS_2":
      return {
        value: config.starConfigs[2]?.customInstructions || "",
        type: "known",
      };

    case "CUSTOM_INSTRUCTIONS_3":
      return {
        value: config.starConfigs[3]?.customInstructions || "",
        type: "known",
      };

    case "CUSTOM_INSTRUCTIONS_4":
      return {
        value: config.starConfigs[4]?.customInstructions || "",
        type: "known",
      };

    case "CUSTOM_INSTRUCTIONS_5":
      return {
        value: config.starConfigs[5]?.customInstructions || "",
        type: "known",
      };

    // Unknown variables (review-specific data)
    case "REVIEWER_NAME":
    case "RATING":
    case "REVIEW_TEXT":
      return { value: variable, type: "unknown" };

    default:
      return { value: variable, type: "unknown" };
  }
}

/**
 * Parse a template string into segments for rendering
 */
export function parseTemplate(
  template: string,
  business: Business,
  config: BusinessConfig
): TemplateSegment[] {
  const segments: TemplateSegment[] = [];
  const regex = /(\{\{[A-Z_0-9]+\}\})/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(template)) !== null) {
    // Add text before the variable
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: template.substring(lastIndex, match.index),
      });
    }

    // Add the variable
    const variable = match[1];
    const { value, type } = getVariableValue(variable, business, config);

    segments.push({
      type: "variable",
      content: value,
      variableType: type,
      originalVariable: variable,
    });

    lastIndex = match.index + match[1].length;
  }

  // Add remaining text
  if (lastIndex < template.length) {
    segments.push({
      type: "text",
      content: template.substring(lastIndex),
    });
  }

  return segments;
}

/**
 * Replace variables in template with actual values (plain text version)
 */
export function replaceTemplateVariables(
  template: string,
  business: Business,
  config: BusinessConfig
): string {
  const segments = parseTemplate(template, business, config);
  return segments.map((seg) => seg.content).join("");
}
