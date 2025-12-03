"use client";

import { useState } from "react";
import type { AccountWithBusinesses } from "@/lib/types";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";
import { Badge } from "@/components/ui/badge";
import { MapPin } from "lucide-react";
import Image from "next/image";
import { EmptyState } from "@/components/ui/empty-state";
import { AccountAvatarDropdown } from "./AccountAvatarDropdown";
import { motion } from "framer-motion";

interface AccountBusinessesListProps {
  accounts: AccountWithBusinesses[];
}

export function AccountBusinessesList({ accounts }: AccountBusinessesListProps) {
  const router = useRouter();
  const t = useTranslations("dashboard.home.accountBusinessesList");
  const [loadingState, setLoadingState] = useState<{ businessId: string; action: "reviews" | "settings" } | null>(null);

  const handleViewReviews = (accountId: string, businessId: string) => {
    setLoadingState({ businessId, action: "reviews" });
    router.push(`/dashboard/accounts/${accountId}/businesses/${businessId}/reviews`);
  };

  const handleEditDetails = (accountId: string, businessId: string) => {
    setLoadingState({ businessId, action: "settings" });
    router.push(`/dashboard/accounts/${accountId}/businesses/${businessId}/settings`);
  };

  const handleAddBusiness = () => {
    router.push("/onboarding/connect-account");
  };

  if (accounts.length === 0) {
    return (
      <EmptyState
        title={t("noConnectedAccounts")}
        description={t("noConnectedAccountsDescription")}
        actionLabel={t("connectAccount")}
        onAction={handleAddBusiness}
      />
    );
  }

  return (
    <div className="space-y-8">
      {accounts.map((account) => (
        <div key={account.id} className="space-y-4">
          <div className="flex items-center gap-3">
            <AccountAvatarDropdown account={account} />
            <div>
              <h2 className="text-2xl font-bold">{account.accountName}</h2>
              <p className="text-sm text-muted-foreground">{account.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {account.businesses.map((business, index) => (
              <motion.div
                key={business.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: index * 0.05,
                  ease: "easeOut",
                }}
              >
                <DashboardCard>
                  <DashboardCardHeader>
                    {business.photoUrl && (
                      <Image
                        src={business.photoUrl}
                        alt={business.name}
                        className="w-full h-32 object-cover rounded-t-2xl -mt-8 -mx-8 mb-4"
                        width={400}
                        height={128}
                      />
                    )}
                    <DashboardCardTitle>
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="truncate">{business.name}</span>
                        {!business.connected && <Badge variant="secondary">{t("disconnected")}</Badge>}
                      </div>
                    </DashboardCardTitle>
                  </DashboardCardHeader>
                  <DashboardCardContent className="space-y-4 flex flex-col">
                    {business.address && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                        <span className="truncate">{business.address}</span>
                      </div>
                    )}
                    {business.description && (
                      <div className="bg-pastel-lavender/20 p-4 rounded-xl leading-relaxed text-sm text-muted-foreground line-clamp-3">
                        {business.description}
                      </div>
                    )}
                    <div className="flex gap-3 pt-2 mt-auto">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1 shadow-primary hover:shadow-xl transition-all duration-300"
                        onClick={() => handleViewReviews(account.id, business.id)}
                        disabled={loadingState?.businessId === business.id && loadingState?.action === "reviews"}
                      >
                        {loadingState?.businessId === business.id && loadingState?.action === "reviews"
                          ? t("navigating")
                          : t("viewReviews")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 hover:bg-pastel-lavender/10 transition-all duration-300"
                        onClick={() => handleEditDetails(account.id, business.id)}
                        disabled={loadingState?.businessId === business.id && loadingState?.action === "settings"}
                      >
                        {loadingState?.businessId === business.id && loadingState?.action === "settings"
                          ? t("navigating")
                          : t("editDetails")}
                      </Button>
                    </div>
                  </DashboardCardContent>
                </DashboardCard>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
