import type { Account as DrizzleAccount, AccountInsert } from "@/lib/db/schema";
import { Business } from "./business.types";

export type Account = DrizzleAccount;
export type AccountCreate = Omit<AccountInsert, "id" | "connectedAt" | "lastSynced">;
export type AccountUpdate = Partial<Pick<AccountInsert, "googleRefreshToken" | "lastSynced" | "googleAccountName">>;

export interface AccountWithBusinesses extends Account {
  businesses: Business[];
}
