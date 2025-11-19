import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getTranslations } from "next-intl/server";
import { getUserSettings } from "@/lib/actions/users.actions";
import { SettingsForm } from "@/components/dashboard/settings/SettingsForm";
import { TeamManagement } from "@/components/dashboard/settings/TeamManagement";
import { getTeamMembers } from "@/lib/actions/team.actions";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { db } from "@/lib/db/client";
import { userAccounts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.accountSettings" });

  const settings = await getUserSettings();
  const { userId } = await getAuthenticatedUserId();

  const userAccountsData = await db.query.userAccounts.findMany({
    where: eq(userAccounts.userId, userId),
    with: {
      account: true,
    },
  });

  const accountsWithTeams = await Promise.all(
    userAccountsData.map(async (ua) => {
      const teamMembers = await getTeamMembers(ua.accountId);
      return {
        accountId: ua.accountId,
        accountName: ua.account.accountName || ua.account.email,
        teamMembers,
        currentUserRole: ua.role as "owner" | "member",
      };
    })
  );

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="space-y-6 max-w-2xl">
        <SettingsForm initialSettings={settings} />

        {accountsWithTeams.map((account) => (
          <TeamManagement
            key={account.accountId}
            accountId={account.accountId}
            accountName={account.accountName}
            teamMembers={account.teamMembers}
            currentUserId={userId}
            currentUserRole={account.currentUserRole}
          />
        ))}
      </div>
    </PageContainer>
  );
}
