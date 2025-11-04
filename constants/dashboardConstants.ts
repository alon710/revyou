import { ReplyStatus } from "@/types/database";

export const STATUS_LABELS: Record<ReplyStatus, string> = {
  pending: "ממתין",
  posted: "פורסם",
  rejected: "נדחה",
  failed: "נכשל",
};

export const STAR_LABELS: Record<number, string> = {
  1: "★",
  2: "★★",
  3: "★★★",
  4: "★★★★",
  5: "★★★★★",
};
