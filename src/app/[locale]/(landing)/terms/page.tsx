"use client";

import { useTranslations, useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";

const LAST_UPDATED_DATE = new Date("2025-11-09");

export default function TermsPage() {
  const t = useTranslations("terms");
  const locale = useLocale() as Locale;

  const formattedDate = LAST_UPDATED_DATE.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main className="grow container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-foreground mb-8">{t("title")}</h1>

        <div className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.general.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.general.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.service.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.service.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.permittedUse.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.permittedUse.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.userAccount.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.userAccount.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.paymentRefunds.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.paymentRefunds.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.intellectualProperty.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.intellectualProperty.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.limitationLiability.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.limitationLiability.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.changes.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">{t("sections.changes.content")}</p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">{t("sections.contact.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("sections.contact.content")}{" "}
              <a href={`mailto:${t("sections.contact.email")}`} className="text-primary hover:underline">
                {t("sections.contact.email")}
              </a>
            </p>
          </section>

          <div className="mt-12 pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">{t("lastUpdated", { date: formattedDate })}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
