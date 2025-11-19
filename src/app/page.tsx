import { redirect } from "@/i18n/routing";
import { getLocaleFromCookie } from "@/lib/locale-detection";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const locale = await getLocaleFromCookie();
  redirect({ href: "/", locale });
}
