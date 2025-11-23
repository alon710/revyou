import { redirect } from "@/i18n/routing";
import { resolveLocale } from "@/lib/locale-detection";
import { getUserIdFromHeaders } from "@/lib/user-context";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const userId = await getUserIdFromHeaders();
  const locale = await resolveLocale({ userId });
  redirect({ href: "/", locale });
}
