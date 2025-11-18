import { redirect } from "next/navigation";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { getBusiness } from "@/lib/actions/businesses.actions";
import { BusinessDetailsWrapper } from "@/components/onboarding/BusinessDetailsWrapper";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BusinessDetailsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const accountId = params.accountId as string | undefined;
  const businessId = params.businessId as string | undefined;

  if (!accountId || !businessId) {
    redirect("/onboarding/choose-business");
  }

  const { userId } = await getAuthenticatedUserId();
  const business = await getBusiness(userId, accountId, businessId);

  return <BusinessDetailsWrapper accountId={accountId} businessId={businessId} business={business} />;
}
