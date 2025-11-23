import { startOfMonth, addMonths, format } from "date-fns";
import { he, enUS } from "date-fns/locale";
import type { Locale } from "@/lib/locale";

export function getCurrentBillingPeriod(): {
  start: Date;
  end: Date;
  resetDate: Date;
} {
  const now = new Date();
  const start = startOfMonth(now);
  const end = startOfMonth(addMonths(now, 1));
  const resetDate = end;

  return { start, end, resetDate };
}

const dateLocales = {
  he: he,
  en: enUS,
} as const;

const dateFormats = {
  he: "d 'ב'MMMM yyyy",
  en: "MMMM d, yyyy",
} as const;

export function formatDate(date: Date, locale: Locale): string {
  return format(date, dateFormats[locale], { locale: dateLocales[locale] });
}
