import { Location, LocationConfig } from "@/types/database";
import {
  TONE_LABELS,
  LANGUAGE_LABELS,
} from "@/components/dashboard/business-config/types";

export type VariableType = "known" | "unknown";

export interface TemplateSegment {
  type: "text" | "variable";
  content: string;
  variableType?: VariableType;
  originalVariable?: string;
}

type VariableResolver = (location: Location, config: LocationConfig) => string;

const VARIABLE_RESOLVERS: Record<string, VariableResolver> = {
  BUSINESS_NAME: (l, c) => c.businessName || l.name,
  BUSINESS_DESCRIPTION: (l, c) => c.businessDescription || "",
  BUSINESS_PHONE: (l, c) => c.businessPhone || "",
  TONE: (b, c) => TONE_LABELS[c.toneOfVoice] || c.toneOfVoice,
  LANGUAGE: (b, c) => LANGUAGE_LABELS[c.languageMode] || c.languageMode,
  MAX_SENTENCES: (b, c) => (c.maxSentences || 2).toString(),
  SIGNATURE: (b, c) => c.signature || "",
  ALLOWED_EMOJIS: (b, c) => (c.allowedEmojis || []).join(" "),
  CUSTOM_INSTRUCTIONS_1: (b, c) => c.starConfigs[1]?.customInstructions || "",
  CUSTOM_INSTRUCTIONS_2: (b, c) => c.starConfigs[2]?.customInstructions || "",
  CUSTOM_INSTRUCTIONS_3: (b, c) => c.starConfigs[3]?.customInstructions || "",
  CUSTOM_INSTRUCTIONS_4: (b, c) => c.starConfigs[4]?.customInstructions || "",
  CUSTOM_INSTRUCTIONS_5: (b, c) => c.starConfigs[5]?.customInstructions || "",
};

const UNKNOWN_VARIABLES = new Set(["REVIEWER_NAME", "RATING", "REVIEW_TEXT"]);

export function getVariableValue(
  variable: string,
  location: Location,
  config: LocationConfig
): { value: string; type: VariableType } {
  const varName = variable.replace(/[{}]/g, "");

  if (varName in VARIABLE_RESOLVERS) {
    return {
      value: VARIABLE_RESOLVERS[varName](location, config),
      type: "known",
    };
  }

  if (UNKNOWN_VARIABLES.has(varName)) {
    return { value: variable, type: "unknown" };
  }

  return { value: variable, type: "unknown" };
}

export function parseTemplate(
  template: string,
  location: Location,
  config: LocationConfig
): TemplateSegment[] {
  const segments: TemplateSegment[] = [];
  const regex = /(\{\{[A-Z_0-9]+\}\})/g;

  let lastIndex = 0;
  let match;

  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: "text",
        content: template.substring(lastIndex, match.index),
      });
    }

    const variable = match[1];
    const { value, type } = getVariableValue(variable, location, config);

    segments.push({
      type: "variable",
      content: value,
      variableType: type,
      originalVariable: variable,
    });

    lastIndex = match.index + match[1].length;
  }

  if (lastIndex < template.length) {
    segments.push({
      type: "text",
      content: template.substring(lastIndex),
    });
  }

  return segments;
}

export function replaceTemplateVariables(
  template: string,
  location: Location,
  config: LocationConfig
): string {
  const segments = parseTemplate(template, location, config);
  return segments.map((seg) => seg.content).join("");
}
