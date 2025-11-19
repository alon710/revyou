import { redirect } from "@/i18n/routing";
import { getAuthenticatedUserId } from "@/lib/api/auth";
import { getBusiness } from "@/lib/actions/businesses.actions";
import { BusinessDetailsWrapper } from "@/components/onboarding/BusinessDetailsWrapper";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function BusinessDetailsPage({
  params: paramsPromise,
  searchParams: searchParamsPromise,
}: PageProps) {
  const { locale } = await paramsPromise;
  const sp = await searchParamsPromise;
  const accountId = sp.accountId as string | undefined;
  const businessId = sp.businessId as string | undefined;

  if (!accountId || !businessId) {
    redirect({ href: "/onboarding/choose-business", locale });
  }

  const { userId } = await getAuthenticatedUserId();
  const business = await getBusiness(userId!, accountId!, businessId!);

  return <BusinessDetailsWrapper accountId={accountId!} businessId={businessId!} business={business} />;
}
