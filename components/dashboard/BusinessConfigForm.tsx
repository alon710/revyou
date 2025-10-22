"use client";

import { useState } from "react";
import { BusinessConfig, ToneOfVoice, LanguageMode, StarConfig } from "@/types/database";
import { Button } from "@/components/ui/button";
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save } from "lucide-react";
import StarConfigAccordion from "./StarConfigAccordion";

interface BusinessConfigFormProps {
  initialConfig: BusinessConfig;
  onSave: (config: BusinessConfig) => Promise<void>;
  loading?: boolean;
}

/**
 * Business Configuration Form
 * Complete form for editing business AI configuration
 */
export default function BusinessConfigForm({
  initialConfig,
  onSave,
  loading = false,
}: BusinessConfigFormProps) {
  const [config, setConfig] = useState<BusinessConfig>(initialConfig);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);
      await onSave(config);
    } finally {
      setSaving(false);
    }
  };

  const updateStarConfig = (rating: 1 | 2 | 3 | 4 | 5, starConfig: StarConfig) => {
    setConfig((prev) => ({
      ...prev,
      starConfigs: {
        ...prev.starConfigs,
        [rating]: starConfig,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>הגדרות כלליות</CardTitle>
          <CardDescription>
            הגדר את תיאור העסק וסגנון התשובות האוטומטיות
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Business Description */}
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

          {/* Tone of Voice */}
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

          {/* Use Emojis */}
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

          {/* Language Mode */}
          <div className="space-y-2">
            <Label htmlFor="languageMode">שפת תשובה</Label>
            <Select
              value={config.languageMode}
              onValueChange={(value: LanguageMode) =>
                setConfig({ ...config, languageMode: value })
              }
              disabled={loading}
            >
              <SelectTrigger id="languageMode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hebrew">עברית</SelectItem>
                <SelectItem value="english">אנגלית</SelectItem>
                <SelectItem value="auto-detect">זיהוי אוטומטי</SelectItem>
                <SelectItem value="match-reviewer">התאם למבקר</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {getLanguageHelp(config.languageMode)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Automation Settings */}
      <Card>
        <CardHeader>
          <CardTitle>הגדרות אוטומציה</CardTitle>
          <CardDescription>
            קבע כיצד התשובות האוטומטיות יטופלו ויפורסמו
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Post */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoPost">פרסום אוטומטי</Label>
              <p className="text-xs text-muted-foreground">
                פרסם תשובות אוטומטית ללא צורך באישור ידני
              </p>
            </div>
            <Switch
              id="autoPost"
              checked={config.autoPost}
              onCheckedChange={(checked) =>
                setConfig({ ...config, autoPost: checked })
              }
              disabled={loading}
            />
          </div>

          {/* Require Approval */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="requireApproval">דרוש אישור</Label>
              <p className="text-xs text-muted-foreground">
                בקש אישור ידני לפני פרסום תשובות (עוקף פרסום אוטומטי)
              </p>
            </div>
            <Switch
              id="requireApproval"
              checked={config.requireApproval}
              onCheckedChange={(checked) =>
                setConfig({ ...config, requireApproval: checked })
              }
              disabled={loading}
            />
          </div>

          {config.autoPost && !config.requireApproval && (
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>אזהרה:</strong> עם פרסום אוטומטי ללא אישור, תשובות יפורסמו מיד לאחר יצירתן.
                וודא שההגדרות שלך מדוי קות.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Star-Specific Configuration */}
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

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={saving || loading} size="lg">
          {saving && <Loader2 className="ml-2 h-5 w-5 animate-spin" />}
          <Save className="ml-2 h-5 w-5" />
          שמור שינויים
        </Button>
      </div>
    </form>
  );
}

function getLanguageHelp(mode: LanguageMode): string {
  const help: Record<LanguageMode, string> = {
    hebrew: "כל התשובות יהיו בעברית",
    english: "כל התשובות יהיו באנגלית",
    "auto-detect": "זהה את שפת הביקורת אוטומטית והשב באותה שפה",
    "match-reviewer": "התאם את שפת התשובה לשפה שבה כתב המבקר",
  };
  return help[mode];
}
