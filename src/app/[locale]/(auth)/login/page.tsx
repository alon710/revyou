"use client";

import { Suspense, useEffect, useState } from "react";
import { signInWithGoogle } from "@/lib/auth/auth";
import {
  DashboardCard,
  DashboardCardContent,
  DashboardCardDescription,
  DashboardCardHeader,
  DashboardCardTitle,
} from "@/components/ui/dashboard-card";
import { Logo } from "@/components/ui/Logo";
import { GoogleSsoButton } from "@/components/ui/google-sso-button";
import { Loading } from "@/components/ui/loading";
import { Link } from "@/i18n/routing";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export const dynamic = "force-dynamic";

function LoginForm() {
  const t = useTranslations("auth.loginPage");
  const tAuth = useTranslations();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      toast.error(tAuth(error));
    }
  }, [error, tAuth]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    const { error } = await signInWithGoogle();

    if (error) {
      setError(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-background to-muted p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Logo className="justify-center mb-4" href={"/"} size="xl" />
          <p className="text-muted-foreground">{t("tagline")}</p>
        </div>

        <DashboardCard>
          <DashboardCardHeader className="text-center">
            <DashboardCardTitle className="justify-center">{t("title")}</DashboardCardTitle>
            <DashboardCardDescription>{t("description")}</DashboardCardDescription>
          </DashboardCardHeader>
          <DashboardCardContent className="space-y-4">
            <GoogleSsoButton
              onClick={handleGoogleSignIn}
              isLoading={isLoading}
              label={t("googleButton")}
              labelLoading={t("googleButtonLoading")}
            />
          </DashboardCardContent>
        </DashboardCard>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {t("termsPrefix")}{" "}
          <Link href="/terms" className="text-primary hover:underline transition-all">
            {t("termsLink")}
          </Link>{" "}
          {t("termsMiddle")}{" "}
          <Link href="/privacy" className="text-primary hover:underline transition-all">
            {t("privacyLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading fullScreen />}>
      <LoginForm />
    </Suspense>
  );
}
