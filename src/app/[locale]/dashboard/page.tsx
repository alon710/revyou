import { redirect } from "@/i18n/routing";
import { resolveLocale } from "@/lib/locale-detection";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const locale = await resolveLocale();
  redirect({ href: "/dashboard/home", locale });
}
