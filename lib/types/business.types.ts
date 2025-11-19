import type { Business as DrizzleBusiness, BusinessInsert } from "@/lib/db/schema";

export interface StarConfig {
  customInstructions: string;
  autoReply: boolean;
}

export type Business = DrizzleBusiness;

export type BusinessCreate = Omit<BusinessInsert, "id" | "connected" | "connectedAt" | "createdAt" | "updatedAt">;

export type BusinessUpdate = Partial<
  Omit<BusinessInsert, "id" | "accountId" | "googleBusinessId" | "connectedAt" | "createdAt">
>;

export type ToneOfVoice = "friendly" | "formal" | "humorous" | "professional";
export type LanguageMode = "hebrew" | "english" | "auto-detect";

export interface GoogleBusinessProfileBusiness {
  accountId: string;
  id: string;
  name: string;
  address: string;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  phoneNumber: string | null;
  websiteUrl: string | null;
  mapsUrl: string | null;
  reviewUrl: string | null;
  description: string | null;
  photoUrl: string | null;
}
