import { startOfMonth, addMonths, format } from "date-fns";
import { he } from "date-fns/locale";

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

export function formatHebrewDate(date: Date): string {
  return format(date, "d 'ב'MMMM yyyy", { locale: he });
}
