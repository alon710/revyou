import { redirect } from "next/navigation";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { getGoogleBusinesses } from "@/lib/actions/google.actions";
import { ChooseBusinessForm } from "@/components/onboarding/ChooseBusinessForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ChooseBusinessPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const accountId = params.accountId as string | undefined;

  if (!accountId) {
    redirect("/onboarding/connect-account");
  }

  const { userId } = await getAuthenticatedUserId();
  const availableBusinesses = await getGoogleBusinesses(userId, accountId);

  return <ChooseBusinessForm accountId={accountId} availableBusinesses={availableBusinesses} />;
}
