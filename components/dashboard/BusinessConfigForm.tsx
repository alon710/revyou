"use client";

import { useState, useRef } from "react";
import {
  BusinessConfig,
  ToneOfVoice,
  StarConfig,
  DEFAULT_PROMPT_TEMPLATE,
} from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Save, RotateCcw } from "lucide-react";
import StarConfigAccordion from "./StarConfigAccordion";

const AVAILABLE_VARIABLES = [
  { name: "{{BUSINESS_NAME}}", description: "שם העסק" },
  { name: "{{BUSINESS_DESCRIPTION}}", description: "תיאור העסק" },
  { name: "{{BUSINESS_PHONE}}", description: "טלפון העסק" },
  { name: "{{REVIEWER_NAME}}", description: "שם המבקר" },
  { name: "{{RATING}}", description: "דירוג (1-5)" },
  { name: "{{REVIEW_TEXT}}", description: "טקסט הביקורת" },
  { name: "{{TONE}}", description: "טון התגובה" },
  { name: "{{LANGUAGE_INSTRUCTION}}", description: "הנחיות שפה" },
  { name: "{{MAX_SENTENCES}}", description: "מספר משפטים מקסימלי" },
  { name: "{{SIGNATURE}}", description: "חתימה" },
  { name: "{{EMOJI_INSTRUCTIONS}}", description: "הנחיות אימוג'ים" },
  { name: "{{CUSTOM_INSTRUCTIONS}}", description: "הנחיות ספציפיות לדירוג" },
];

interface BusinessConfigFormProps {
  initialConfig: BusinessConfig;
  onSave: (config: BusinessConfig) => Promise<void>;
  loading?: boolean;
}

export default function BusinessConfigForm({
  initialConfig,
  onSave,
  loading = false,
}: BusinessConfigFormProps) {
  const [config, setConfig] = useState<BusinessConfig>({
    ...initialConfig,
    promptTemplate: initialConfig.promptTemplate || DEFAULT_PROMPT_TEMPLATE,
  });
  const [saving, setSaving] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await onSave(config);
    } finally {
      setSaving(false);
    }
  };

  const updateStarConfig = (
    rating: 1 | 2 | 3 | 4 | 5,
    starConfig: StarConfig
  ) => {
    setConfig((prev) => ({
      ...prev,
      starConfigs: {
        ...prev.starConfigs,
        [rating]: starConfig,
      },
    }));
  };

  const insertVariable = (variable: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.substring(0, start) + variable + text.substring(end);
    setConfig({ ...config, promptTemplate: newText });

    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + variable.length;
      textarea.focus();
    }, 0);
  };

  const handleResetTemplate = () => {
    if (confirm("האם אתה בטוח שברצונך לאפס את התבנית לברירת המחדל?")) {
      setConfig({ ...config, promptTemplate: DEFAULT_PROMPT_TEMPLATE });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>פרטי עסק</CardTitle>
          <CardDescription>
            הגדר את פרטי הזהות של העסק לשימוש בתגובות AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="businessName">שם העסק (עקיפה)</Label>
            <Input
              id="businessName"
              type="text"
              value={config.businessName || ""}
              onChange={(e) =>
                setConfig({ ...config, businessName: e.target.value })
              }
              placeholder="השאר ריק כדי להשתמש בשם מגוגל"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              אופציונלי - שם עסק חלופי לשימוש בתגובות AI במקום שם Google
              Business
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="businessDescription">תיאור העסק</Label>
            <Textarea
              id="businessDescription"
              value={config.businessDescription}
              onChange={(e) =>
                setConfig({ ...config, businessDescription: e.target.value })
              }
              placeholder="תאר את העסק שלך, את השירותים שאתה מספק, ואת הערכים המרכזיים..."
              rows={4}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              תיאור זה יעזור ל-AI ליצור תשובות מותאמות יותר לעסק שלך
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="businessPhone">
              טלפון ליצירת קשר (לביקורות שליליות)
            </Label>
            <Input
              id="businessPhone"
              type="tel"
              value={config.businessPhone || ""}
              onChange={(e) =>
                setConfig({ ...config, businessPhone: e.target.value })
              }
              placeholder="03-123-4567"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              מספר טלפון שיופיע בתגובות לביקורות שליליות (1-2 כוכבים)
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>הגדרות תגובה AI</CardTitle>
          <CardDescription>
            הגדר את אופן יצירת התגובות האוטומטיות
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="toneOfVoice">סגנון תשובה</Label>
            <Select
              value={config.toneOfVoice}
              onValueChange={(value: ToneOfVoice) =>
                setConfig({ ...config, toneOfVoice: value })
              }
              disabled={loading}
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
            <p className="text-xs text-muted-foreground">
              בחר את הטון שמתאים ביותר לאופי העסק שלך
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="languageInstructions">שפת תגובה</Label>
            <Select
              value={config.languageInstructions || "auto-detect"}
              onValueChange={(value) =>
                setConfig({ ...config, languageInstructions: value })
              }
              disabled={loading}
            >
              <SelectTrigger id="languageInstructions">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto-detect">זיהוי אוטומטי</SelectItem>
                <SelectItem value="hebrew">עברית</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="russian">Русский</SelectItem>
                <SelectItem value="arabic">العربية</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              בחר את השפה שבה AI ייצור תגובות. זיהוי אוטומטי מזהה את שפת הביקורת
            </p>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="useEmojis">השתמש באימוג&apos;י</Label>
              <p className="text-xs text-muted-foreground">
                הוסף אימוג&apos;י לתשובות כדי להפוך אותן לידידותיות יותר
              </p>
            </div>
            <Switch
              id="useEmojis"
              checked={config.useEmojis}
              onCheckedChange={(checked) =>
                setConfig({ ...config, useEmojis: checked })
              }
              disabled={loading}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="allowedEmojis">אימוג&apos;ים מותרים</Label>
            <Input
              id="allowedEmojis"
              type="text"
              value={(config.allowedEmojis || []).join(" ")}
              onChange={(e) =>
                setConfig({
                  ...config,
                  allowedEmojis: e.target.value
                    .split(" ")
                    .filter((e) => e.trim()),
                })
              }
              placeholder="🥂 ✨ 🙏 💐"
              disabled={loading || !config.useEmojis}
            />
            <p className="text-xs text-muted-foreground">
              רשימת אימוג&apos;ים שה-AI יכול להשתמש בהם (הפרד ברווחים)
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="maxSentences">מספר משפטים מקסימלי בתגובה</Label>
            <div className="flex items-center gap-4">
              <input
                id="maxSentences"
                type="range"
                min="1"
                max="3"
                step="1"
                value={config.maxSentences || 2}
                onChange={(e) =>
                  setConfig({
                    ...config,
                    maxSentences: parseInt(e.target.value),
                  })
                }
                className="flex-1"
                disabled={loading}
              />
              <span className="text-sm font-medium w-8 text-center">
                {config.maxSentences || 2}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              מגביל את אורך התגובות האוטומטיות (מומלץ: 2)
            </p>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="signature">חתימה</Label>
            <Input
              id="signature"
              type="text"
              value={config.signature || ""}
              onChange={(e) =>
                setConfig({ ...config, signature: e.target.value })
              }
              placeholder="צוות העסק"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              החתימה שתופיע בסוף כל תגובה
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>תבנית הנחיה מותאמת אישית</CardTitle>
          <CardDescription>
            עצב את ההנחיה שתשלח ל-AI. השתמש במשתנים כדי להכניס מידע דינמי.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="prompt-template">תבנית ההנחיה</Label>
              <span className="text-xs text-muted-foreground">
                {(config.promptTemplate?.length || 0).toLocaleString("he-IL")}{" "}
                תווים
              </span>
            </div>
            <Textarea
              ref={textareaRef}
              id="prompt-template"
              value={config.promptTemplate}
              onChange={(e) =>
                setConfig({ ...config, promptTemplate: e.target.value })
              }
              className="min-h-[400px] font-mono text-sm"
              dir="rtl"
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground mt-2">
              המערכת תחליף את המשתנים במידע האמיתי בעת יצירת התגובה
            </p>
          </div>

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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>הגדרות אוטומציה</CardTitle>
          <CardDescription>
            קבע כיצד התשובות האוטומטיות יטופלו ויפורסמו
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoPost">פרסום אוטומטי</Label>
              <p className="text-xs text-muted-foreground">
                פרסם תשובות AI אוטומטית ללא אישור ידני. כשמופעל, תשובות יפורסמו
                מיד. כשכבוי, תדרש לאשר כל תשובה לפני פרסום.
              </p>
            </div>
            <Switch
              id="autoPost"
              checked={config.autoPost}
              onCheckedChange={(checked) =>
                setConfig({
                  ...config,
                  autoPost: checked,
                  requireApproval: !checked,
                })
              }
              disabled={loading}
            />
          </div>

          {config.autoPost && (
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>אזהרה:</strong> תשובות AI יפורסמו אוטומטית ללא אישור
                ידני. וודא שההגדרות שלך מדויקות לפני הפעלה.
              </p>
            </div>
          )}

          {!config.autoPost && (
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                תשובות AI ייווצרו אוטומטית אך תצטרך לאשר כל תשובה לפני פרסומה
                לגוגל.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>התאמה אישית לפי דירוג</CardTitle>
          <CardDescription>
            הגדר התנהגות ייחודית לכל רמת דירוג (1-5 כוכבים)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StarConfigAccordion
            starConfigs={config.starConfigs}
            onChange={updateStarConfig}
            disabled={loading}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={saving || loading} size="lg">
          <Save className="ml-2 h-5 w-5" />
          שמור שינויים
        </Button>
      </div>
    </form>
  );
}
