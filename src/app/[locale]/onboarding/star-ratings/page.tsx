import { redirect } from "next/navigation";
import { StarRatingsWrapper } from "@/components/onboarding/StarRatingsWrapper";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function StarRatingsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const accountId = params.accountId as string | undefined;
  const businessId = params.businessId as string | undefined;

  if (!accountId || !businessId) {
    redirect("/onboarding/choose-business");
  }

  return <StarRatingsWrapper accountId={accountId} businessId={businessId} />;
}
