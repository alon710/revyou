import { redirect } from "@/i18n/routing";
import { detectLocale } from "@/lib/locale-detection";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const locale = await detectLocale();
  redirect({ href: "/dashboard/home", locale });
}
