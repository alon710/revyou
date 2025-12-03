import type { Metadata } from "next";
import { Rubik, Nunito } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AuthProvider } from "@/contexts/AuthContext";
import { DirectionProvider } from "@/contexts/DirectionProvider";
import { Toaster } from "@/components/ui/sonner";
import { locales, getLocaleDir, type Locale } from "@/lib/locale";
import "../globals.css";
import Script from "next/script";

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "800", "900"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    title: t("title"),
    description: t("description"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });
  const dir = getLocaleDir(locale as Locale);

  return (
    <html lang={locale} dir={dir} className={`${rubik.variable} ${nunito.variable}`} suppressHydrationWarning={true}>
      <body className="font-sans antialiased" suppressHydrationWarning={true}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <DirectionProvider>
            <AuthProvider>
              {children}
              <Toaster dir={dir} richColors />
            </AuthProvider>
          </DirectionProvider>
          <Script src="https://app.rybbit.io/api/script.js" data-site-id="91604d9cddac" strategy="afterInteractive" />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
