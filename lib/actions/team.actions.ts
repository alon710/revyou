"use server";

import { getAuthenticatedUserId } from "@/lib/api/auth";
import { db } from "@/lib/db/client";
import { userAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { createAdminClient } from "@/lib/supabase/admin";

export interface TeamMember {
  userId: string;
  email: string;
  displayName: string | null;
  role: "owner" | "member";
  addedAt: Date;
}

export async function getTeamMembers(accountId: string): Promise<TeamMember[]> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  const userAccess = await db.query.userAccounts.findFirst({
    where: and(eq(userAccounts.userId, authenticatedUserId), eq(userAccounts.accountId, accountId)),
  });

  if (!userAccess) {
    throw new Error("Forbidden: You don't have access to this account");
  }

  const allUserAccounts = await db.query.userAccounts.findMany({
    where: eq(userAccounts.accountId, accountId),
  });

  const supabase = createAdminClient();
  const teamMembers: TeamMember[] = [];

  for (const ua of allUserAccounts) {
    const { data: userData } = await supabase.auth.admin.getUserById(ua.userId);

    if (userData.user) {
      teamMembers.push({
        userId: ua.userId,
        email: userData.user.email || "",
        displayName: userData.user.user_metadata?.display_name || null,
        role: ua.role,
        addedAt: ua.addedAt,
      });
    }
  }

  return teamMembers.sort((a, b) => a.addedAt.getTime() - b.addedAt.getTime());
}

export async function removeTeamMember(accountId: string, userIdToRemove: string): Promise<void> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  const userAccess = await db.query.userAccounts.findFirst({
    where: and(eq(userAccounts.userId, authenticatedUserId), eq(userAccounts.accountId, accountId)),
  });

  if (!userAccess || userAccess.role !== "owner") {
    throw new Error("Forbidden: Only owners can remove team members");
  }

  const allOwners = await db.query.userAccounts.findMany({
    where: and(eq(userAccounts.accountId, accountId), eq(userAccounts.role, "owner")),
  });

  if (allOwners.length === 1 && allOwners[0].userId === userIdToRemove) {
    throw new Error("Cannot remove the last owner from the account");
  }

  await db
    .delete(userAccounts)
    .where(and(eq(userAccounts.userId, userIdToRemove), eq(userAccounts.accountId, accountId)));
}

export async function changeTeamMemberRole(
  accountId: string,
  userIdToChange: string,
  newRole: "owner" | "member"
): Promise<void> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  const userAccess = await db.query.userAccounts.findFirst({
    where: and(eq(userAccounts.userId, authenticatedUserId), eq(userAccounts.accountId, accountId)),
  });

  if (!userAccess || userAccess.role !== "owner") {
    throw new Error("Forbidden: Only owners can change team member roles");
  }

  if (newRole === "member" && userIdToChange === authenticatedUserId) {
    const allOwners = await db.query.userAccounts.findMany({
      where: and(eq(userAccounts.accountId, accountId), eq(userAccounts.role, "owner")),
    });

    if (allOwners.length === 1) {
      throw new Error("Cannot demote the last owner");
    }
  }

  await db
    .update(userAccounts)
    .set({ role: newRole })
    .where(and(eq(userAccounts.userId, userIdToChange), eq(userAccounts.accountId, accountId)));
}

export async function leaveAccount(accountId: string): Promise<void> {
  const { userId: authenticatedUserId } = await getAuthenticatedUserId();

  const userAccess = await db.query.userAccounts.findFirst({
    where: and(eq(userAccounts.userId, authenticatedUserId), eq(userAccounts.accountId, accountId)),
  });

  if (!userAccess) {
    throw new Error("You are not a member of this account");
  }

  if (userAccess.role === "owner") {
    const allOwners = await db.query.userAccounts.findMany({
      where: and(eq(userAccounts.accountId, accountId), eq(userAccounts.role, "owner")),
    });

    if (allOwners.length === 1) {
      throw new Error("Cannot leave account as the last owner. Transfer ownership first or delete the account.");
    }
  }

  await db
    .delete(userAccounts)
    .where(and(eq(userAccounts.userId, authenticatedUserId), eq(userAccounts.accountId, accountId)));
}
