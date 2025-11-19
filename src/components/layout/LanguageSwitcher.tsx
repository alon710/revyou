"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Sheet, SheetTrigger, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Globe } from "lucide-react";
import { locales, localeConfig, type Locale } from "@/i18n/config";
import React from "react";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("common");

  const handleLocaleChange = (newLocale: Locale) => {
    if (newLocale === locale) return;

    router.replace(pathname, { locale: newLocale });
  };

  const triggerButton = (
    <Button variant="ghost" className="flex items-center gap-2" aria-label={t("selectLanguage")}>
      <Globe className="h-5 w-5" />
    </Button>
  );

  const languageOptions = (
    <div className="grid gap-1">
      {locales.map((loc) => (
        <Button key={loc} variant="ghost" className="justify-start" onClick={() => handleLocaleChange(loc)}>
          <span className="flex items-center justify-between w-full">
            {localeConfig[loc].label}
            {locale === loc && <span className="text-xs">✓</span>}
          </span>
        </Button>
      ))}
    </div>
  );

  return (
    <React.Fragment>
      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>{triggerButton}</SheetTrigger>
          <SheetContent side="bottom">
            <SheetTitle className="sr-only">{t("selectLanguage")}</SheetTitle>
            <SheetDescription className="sr-only">{t("selectLanguageDescription")}</SheetDescription>
            <div className="grid gap-4 p-4">{languageOptions}</div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden sm:block">
        <Popover>
          <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
          <PopoverContent className="w-56 p-2">{languageOptions}</PopoverContent>
        </Popover>
      </div>
    </React.Fragment>
  );
}
