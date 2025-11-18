import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { AccountBusinessesList } from "@/components/dashboard/home/AccountBusinessesList";
import { getTranslations } from "next-intl/server";
import { getAccountsWithBusinesses } from "@/lib/actions/accounts.actions";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const t = await getTranslations("dashboard.home");
  const accountsWithBusinesses = await getAccountsWithBusinesses();

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />
      <AccountBusinessesList accounts={accountsWithBusinesses} />
    </PageContainer>
  );
}
