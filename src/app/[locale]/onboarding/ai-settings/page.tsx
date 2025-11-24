import { redirect } from "next/navigation";
import { AISettingsWrapper } from "@/components/onboarding/AISettingsWrapper";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { SubscriptionsController } from "@/lib/controllers/subscriptions.controller";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AISettingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const accountId = params.accountId as string | undefined;
  const businessId = params.businessId as string | undefined;

  if (!accountId || !businessId) {
    redirect("/onboarding/choose-business");
  }

  const { userId } = await getAuthenticatedUserId();
  const limits = await new SubscriptionsController().getUserPlanLimits(userId);

  return <AISettingsWrapper accountId={accountId} businessId={businessId} limits={limits} />;
}
