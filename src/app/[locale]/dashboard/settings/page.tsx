import { PageContainer } from "@/components/layout/PageContainer";
import { PageHeader } from "@/components/layout/PageHeader";
import { getTranslations } from "next-intl/server";
import { getUserSettings } from "@/lib/actions/users.actions";
import { SettingsForm } from "@/components/dashboard/settings/SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "dashboard.accountSettings" });

  const settings = await getUserSettings();

  return (
    <PageContainer>
      <PageHeader title={t("title")} description={t("description")} />

      <div className="space-y-6 max-w-2xl">
        <SettingsForm initialSettings={settings} />
      </div>
    </PageContainer>
  );
}
