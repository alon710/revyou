import { redirect } from "@/i18n/routing";
import { resolveLocale } from "@/lib/locale-detection";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const locale = await resolveLocale();
  redirect({ href: "/", locale });
}
