import type { UsersConfig, UsersConfigInsert, UserConfigMap } from "@/lib/db/schema";

export type UserConfig = UsersConfig;

export type UserConfigCreate = Omit<UsersConfigInsert, "id" | "createdAt" | "updatedAt">;

export type UserConfigUpdate = Partial<UserConfigMap>;
