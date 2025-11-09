import {
  Timestamp,
  WithFieldValue,
  PartialWithFieldValue,
} from "firebase/firestore";
import { BusinessConfig } from "./business-config.types";

export interface BusinessCreate {
  userId: string;
  accountId: string;
  googleBusinessId: string;
  name: string;
  address: string;
  phoneNumber: string | null;
  websiteUrl: string | null;
  mapsUrl: string | null;
  description: string | null;
  photoUrl: string | null;
  emailOnNewReview: boolean;
  config: BusinessConfig;
}

export interface Business extends BusinessCreate {
  id: string;
  connected: boolean;
  connectedAt: Timestamp;
}

export interface BusinessUpdate {
  name?: string;
  phoneNumber?: string | null;
  websiteUrl?: string | null;
  description?: string | null;
  photoUrl?: string | null;
  emailOnNewReview?: boolean;
  config?: Partial<BusinessConfig>;
  connected?: boolean;
}

// Write-time types that accept FieldValue sentinels for timestamp fields
export type BusinessCreateInput = WithFieldValue<BusinessCreate>;
export type BusinessUpdateInput = PartialWithFieldValue<BusinessUpdate>;

export interface GoogleBusinessProfileBusiness {
  accountId: string;
  id: string;
  name: string;
  address: string;
  phoneNumber: string | null;
  websiteUrl: string | null;
  mapsUrl: string | null;
  description: string | null;
  photoUrl: string | null;
}
