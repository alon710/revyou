import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { authUsers, subscriptions, businesses, userAccounts, reviews } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { generateWeeklySummary } from "@/lib/ai/summaries";
import { WeeklySummariesRepository } from "@/lib/db/repositories/weekly-summaries.repository";
import { Resend } from "resend";
import WeeklySummaryEmail from "@/lib/emails/weekly-summary";
import { UsersConfigsRepository } from "@/lib/db/repositories/users-configs.repository";
import { getTranslations } from "next-intl/server";
import { resolveLocale } from "@/lib/locale-detection";
import { Locale } from "@/lib/locale";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const weeklySummariesRepo = new WeeklySummariesRepository();
const usersConfigsRepo = new UsersConfigsRepository();

export const maxDuration = 300;

export async function GET(req: NextRequest) {
  if (!process.env.CRON_SECRET) {
    console.error("CRON_SECRET is not set - endpoint is misconfigured");
    return new NextResponse("Internal Server Error", { status: 500 });
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const today = new Date();
    const lastSaturday = new Date(today);
    lastSaturday.setDate(today.getDate() - 1);
    lastSaturday.setHours(23, 59, 59, 999);

    const lastSunday = new Date(lastSaturday);
    lastSunday.setDate(lastSaturday.getDate() - 6);
    lastSunday.setHours(0, 0, 0, 0);

    console.log(`Running Weekly Summary Cron for period: ${lastSunday.toISOString()} to ${lastSaturday.toISOString()}`);

    const proSubscriptions = await db
      .select({
        userId: subscriptions.userId,
      })
      .from(subscriptions)
      .where(and(eq(subscriptions.status, "active"), eq(subscriptions.planTier, "pro")));

    const proUserIds = proSubscriptions.map((sub) => sub.userId);

    if (proUserIds.length === 0) {
      return NextResponse.json({ message: "No pro users found" });
    }

    let emailsSent = 0;
    let summariesGenerated = 0;
    const errors: { userId: string; error: string }[] = [];

    for (const userId of proUserIds) {
      try {
        const userConfig = await usersConfigsRepo.get(userId);
        const isEnabled = userConfig?.configs?.WEEKLY_SUMMARY_ENABLED ?? true;

        if (!isEnabled) {
          continue;
        }

        const locale = await resolveLocale({ userId, userConfig: userConfig ?? undefined });
        const t = await getTranslations({ locale, namespace: "emails.weeklySummary" });

        const [user] = await db.select().from(authUsers).where(eq(authUsers.id, userId));
        if (!user || !user.email) continue;

        const userBusinesses = await db
          .select({
            business: businesses,
          })
          .from(businesses)
          .innerJoin(userAccounts, eq(userAccounts.accountId, businesses.accountId))
          .where(and(eq(userAccounts.userId, userId), eq(businesses.connected, true)));

        for (const { business } of userBusinesses) {
          const businessReviews = await db
            .select()
            .from(reviews)
            .where(
              and(eq(reviews.businessId, business.id), gte(reviews.date, lastSunday), lte(reviews.date, lastSaturday))
            );

          if (businessReviews.length === 0) {
            continue;
          }

          const summaryData = await generateWeeklySummary(business.name, businessReviews, locale as "en" | "he");

          const { created } = await weeklySummariesRepo.upsert({
            businessId: business.id,
            weekStartDate: lastSunday.toISOString().split("T")[0],
            weekEndDate: lastSaturday.toISOString().split("T")[0],
            totalReviews: businessReviews.length,
            averageRating: businessReviews.reduce((acc, r) => acc + r.rating, 0) / businessReviews.length,
            positiveThemes: summaryData.positiveThemes,
            negativeThemes: summaryData.negativeThemes,
            recommendations: summaryData.recommendations,
          });

          if (!created) {
            continue;
          }

          summariesGenerated++;

          if (resend) {
            const dateRangeStr = `${lastSunday.toLocaleDateString(locale, { day: "numeric", month: "short" })} - ${lastSaturday.toLocaleDateString(locale, { day: "numeric", month: "short" })}`;

            const subject = t("subject", { businessName: business.name });

            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL!,
              to: user.email,
              subject: subject,
              react: WeeklySummaryEmail({
                title: t("title"),
                dateRange: dateRangeStr,
                businessName: business.name,
                statsTitle: t("statsTitle"),
                totalReviewsLabel: t("totalReviewsLabel"),
                averageRatingLabel: t("averageRatingLabel"),
                totalReviews: businessReviews.length,
                averageRating: (businessReviews.reduce((acc, r) => acc + r.rating, 0) / businessReviews.length).toFixed(
                  1
                ),
                positiveThemesTitle: t("positiveThemesTitle"),
                positiveThemes: summaryData.positiveThemes,
                negativeThemesTitle: t("negativeThemesTitle"),
                negativeThemes: summaryData.negativeThemes,
                recommendationsTitle: t("recommendationsTitle"),
                recommendations: summaryData.recommendations,
                viewDashboardButton: t("viewDashboardButton"),
                dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/dashboard/home`,
                footer: t("footer"),
                locale: locale as Locale,
              }),
            });
            emailsSent++;
          }
        }
      } catch (err) {
        console.error(`Error processing user ${userId}:`, err);
        errors.push({ userId, error: String(err) });
      }
    }

    return NextResponse.json({
      success: true,
      emailsSent,
      summariesGenerated,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Cron Job Failed:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
