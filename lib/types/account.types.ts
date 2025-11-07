import { Timestamp } from "firebase/firestore";
import { Business } from "./business.types";

export interface AccountCreate {
  userId: string; // Parent reference
  email: string;
  accountName: string;
  googleRefreshToken: string;
  googleAccountName?: string;
}

export interface Account extends AccountCreate {
  id: string;
  connectedAt: Timestamp;
  lastSynced?: Timestamp;
}

export interface AccountUpdate {
  googleRefreshToken?: string;
  lastSynced?: Timestamp;
  googleAccountName?: string;
}

// Extended type with nested businesses (for frontend display)
export interface AccountWithBusinesses extends Account {
  businesses: Business[];
}
