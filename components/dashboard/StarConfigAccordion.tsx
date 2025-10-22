"use client";

import { StarConfig } from "@/types/database";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Star } from "lucide-react";

interface StarConfigAccordionProps {
  starConfigs: {
    1: StarConfig;
    2: StarConfig;
    3: StarConfig;
    4: StarConfig;
    5: StarConfig;
  };
  onChange: (rating: 1 | 2 | 3 | 4 | 5, config: StarConfig) => void;
  disabled?: boolean;
}

/**
 * Star Config Accordion Component
 * Allows customization of AI responses per star rating
 */
export default function StarConfigAccordion({
  starConfigs,
  onChange,
  disabled = false,
}: StarConfigAccordionProps) {
  const starRatings: Array<{ value: 1 | 2 | 3 | 4 | 5; label: string; color: string }> = [
    { value: 5, label: "5 כוכבים - מצוין", color: "text-green-500" },
    { value: 4, label: "4 כוכבים - טוב", color: "text-lime-500" },
    { value: 3, label: "3 כוכבים - בינוני", color: "text-yellow-500" },
    { value: 2, label: "2 כוכבים - גרוע", color: "text-orange-500" },
    { value: 1, label: "כוכב אחד - גרוע מאוד", color: "text-red-500" },
  ];

  const renderStars = (count: number, color: string) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: count }).map((_, i) => (
          <Star key={i} className={`h-4 w-4 fill-current ${color}`} />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-2">
      <div className="mb-4">
        <h4 className="text-sm font-semibold mb-1">התאמה אישית לפי דירוג</h4>
        <p className="text-sm text-muted-foreground">
          הגדר הוראות מיוחדות לכל רמת דירוג (1-5 כוכבים)
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {starRatings.map(({ value, label, color }) => {
          const config = starConfigs[value];

          return (
            <AccordionItem key={value} value={`star-${value}`}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  {renderStars(value, color)}
                  <span className="font-medium">{label}</span>
                  {!config.enabled && (
                    <span className="text-sm text-muted-foreground">(מושבת)</span>
                  )}
                  {config.customInstructions && config.enabled && (
                    <span className="text-sm text-muted-foreground">(מותאם אישית)</span>
                  )}
                </div>
              </AccordionTrigger>

              <AccordionContent className="space-y-4 pt-4">
                {/* Enable/Disable Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor={`star-${value}-enabled`}>
                    אפשר תשובות אוטומטיות לדירוג זה
                  </Label>
                  <Switch
                    id={`star-${value}-enabled`}
                    checked={config.enabled}
                    onCheckedChange={(checked) =>
                      onChange(value, { ...config, enabled: checked })
                    }
                    disabled={disabled}
                  />
                </div>

                {/* Custom Instructions */}
                <div className="space-y-2">
                  <Label htmlFor={`star-${value}-instructions`}>
                    הוראות מיוחדות (אופציונלי)
                  </Label>
                  <Textarea
                    id={`star-${value}-instructions`}
                    value={config.customInstructions}
                    onChange={(e) =>
                      onChange(value, {
                        ...config,
                        customInstructions: e.target.value,
                      })
                    }
                    placeholder={getPlaceholderText(value)}
                    disabled={disabled || !config.enabled}
                    rows={4}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {getHelpText(value)}
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

function getPlaceholderText(rating: number): string {
  const placeholders: Record<number, string> = {
    5: "לדוגמה: הדגש את השמחה שלנו, הזמן את הלקוח לבקר שוב, הצע הטבה לביקור הבא",
    4: "לדוגמה: הודה על המשוב החיובי, שאל מה ניתן לשפר כדי להגיע ל-5 כוכבים",
    3: "לדוגמה: התנצל על חוסר השביעות רצון, הבטח לשפר, הציע פגישה לדיון",
    2: "לדוגמה: התנצל בכנות, הצע פתרון מיידי, בקש פרטי קשר לטיפול אישי",
    1: "לדוגמה: התנצלות עמוקה, הצע פיצוי, בקש הזדמנות לתקן את המצב",
  };
  return placeholders[rating] || "";
}

function getHelpText(rating: number): string {
  const helpTexts: Record<number, string> = {
    5: "הוראות אלו יתווספו לתשובות עבור ביקורות מצוינות (5 כוכבים)",
    4: "הוראות אלו יתווספו לתשובות עבור ביקורות טובות (4 כוכבים)",
    3: "הוראות אלו יתווספו לתשובות עבור ביקורות בינוניות (3 כוכבים)",
    2: "הוראות אלו יתווספו לתשובות עבור ביקורות גרועות (2 כוכבים)",
    1: "הוראות אלו יתווספו לתשובות עבור ביקורות גרועות מאוד (כוכב אחד)",
  };
  return helpTexts[rating] || "";
}
