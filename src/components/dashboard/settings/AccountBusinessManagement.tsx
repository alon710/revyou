"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useAccount } from "@/contexts/AccountContext";
import { useBusiness } from "@/contexts/BusinessContext";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";
import { Button } from "@/components/ui/button";
import { ConfirmationDialog } from "@/components/ui/confirmation-dialog";
import { OAuthPrompt } from "@/components/dashboard/businesses/OAuthPrompt";
import { Loading } from "@/components/ui/loading";
import {
  deleteBusiness,
  getAccountBusinesses,
  createBusiness,
} from "@/lib/firebase/business";
import { checkBusinessLimit } from "@/lib/firebase/business-limits";
import { Building2, Trash2, AlertTriangle, MapPin } from "lucide-react";
import { toast } from "sonner";
import type {
  Account,
  Business,
  GoogleBusinessProfileBusiness,
} from "@/types/database";

interface AccountWithBusinesses extends Account {
  businesses: Business[];
}

export function AccountBusinessManagement() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { accounts, refreshAccounts, currentAccount } = useAccount();
  const { refreshBusinesses } = useBusiness();

  const [accountsWithBusinesses, setAccountsWithBusinesses] = useState<
    AccountWithBusinesses[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [loadingOAuth, setLoadingOAuth] = useState(false);

  const [showBusinessSelector, setShowBusinessSelector] = useState(false);
  const [availableBusinesses, setAvailableBusinesses] = useState<
    GoogleBusinessProfileBusiness[]
  >([]);
  const [loadingAvailableBusinesses, setLoadingAvailableBusinesses] =
    useState(false);
  const [connectingBusiness, setConnectingBusiness] = useState(false);
  const [accountIdForNewBusiness, setAccountIdForNewBusiness] = useState<
    string | null
  >(null);

  const hasLoadedBusinesses = useRef(false);

  const [confirmAccountDelete, setConfirmAccountDelete] = useState(false);
  const [confirmBusinessDelete, setConfirmBusinessDelete] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<{
    account: Account;
    business: Business;
  } | null>(null);

  const loadAccountsWithBusinesses = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const promises = accounts.map(async (account) => {
        try {
          const businesses = await getAccountBusinesses(user.uid, account.id);
          return { ...account, businesses };
        } catch (error) {
          console.error(
            `Error loading businesses for account ${account.id}:`,
            error
          );
          return { ...account, businesses: [] };
        }
      });
      const results = await Promise.all(promises);
      setAccountsWithBusinesses(results);
    } catch (error) {
      console.error("Error loading accounts with businesses:", error);
      toast.error("שגיאה בטעינת החשבונות והעסקים");
    } finally {
      setLoading(false);
    }
  }, [user, accounts]);

  const loadAvailableBusinesses = useCallback(async () => {
    try {
      setLoadingAvailableBusinesses(true);

      const response = await fetch("/api/google/businesses");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "לא ניתן לטעון עסקים");
      }

      setAvailableBusinesses(data.businesses);

      if (data.businesses.length === 0) {
        setShowBusinessSelector(true);
      }
    } catch (err) {
      console.error("Error loading available businesses:", err);
      const errorMessage =
        err instanceof Error ? err.message : "לא ניתן לטעון עסקים";
      toast.error(errorMessage);
      setShowBusinessSelector(false);
      hasLoadedBusinesses.current = false;
    } finally {
      setLoadingAvailableBusinesses(false);
    }
  }, []);

  useEffect(() => {
    loadAccountsWithBusinesses();
  }, [loadAccountsWithBusinesses]);

  useEffect(() => {
    const successParam = searchParams.get("success");
    const errorParam = searchParams.get("error");
    const accountIdParam = searchParams.get("accountId");

    if (successParam === "true" && !hasLoadedBusinesses.current) {
      hasLoadedBusinesses.current = true;
      setShowBusinessSelector(true);
      setAccountIdForNewBusiness(accountIdParam);
      loadAvailableBusinesses();

      router.replace("/dashboard/settings", { scroll: false });
    }

    if (errorParam) {
      toast.error(errorParam);

      router.replace("/dashboard/settings", { scroll: false });
    }
  }, [searchParams, loadAvailableBusinesses, router]);

  const handleStartOAuth = async () => {
    if (!user) return;

    try {
      setLoadingOAuth(true);

      const canAdd = await checkBusinessLimit(user.uid);
      if (!canAdd) {
        toast.error(
          "הגעת למגבלת העסקים בחבילת המינוי שלך. שדרג כדי להוסיף עסקים נוספים."
        );
        return;
      }

      window.location.href = "/api/google/auth";
    } catch (err) {
      console.error("Error starting OAuth:", err);
      toast.error("לא ניתן להתחיל את תהליך ההזדהות");
    } finally {
      setLoadingOAuth(false);
    }
  };

  const handleConnectBusiness = async (
    business: GoogleBusinessProfileBusiness
  ) => {
    if (!user) return;

    try {
      setConnectingBusiness(true);

      const accountId = accountIdForNewBusiness || currentAccount?.id;
      if (!accountId) {
        toast.error("לא נמצא חשבון פעיל. אנא התחבר מחדש.");
        return;
      }

      const canAdd = await checkBusinessLimit(user.uid);
      if (!canAdd) {
        toast.error("הגעת למגבלת העסקים בחבילת המינוי שלך");
        return;
      }

      await createBusiness({
        userId: user.uid,
        accountId,
        googleBusinessId: business.id,
        name: business.name,
        address: business.address,
        phoneNumber: business.phoneNumber,
        websiteUrl: business.websiteUrl,
        mapsUrl: business.mapsUrl,
        description: business.description,
      });

      toast.success("העסק חובר בהצלחה");
      setShowBusinessSelector(false);
      setAccountIdForNewBusiness(null);
      hasLoadedBusinesses.current = false;
      await loadAccountsWithBusinesses();
      await refreshBusinesses();
    } catch (err) {
      console.error("Error connecting business:", err);
      const errorMessage =
        err instanceof Error ? err.message : "לא ניתן לחבר את העסק";
      toast.error(errorMessage);
    } finally {
      setConnectingBusiness(false);
    }
  };

  const handleDisconnectAccountClick = (account: Account) => {
    setSelectedAccount(account);
    setConfirmAccountDelete(true);
  };

  const handleConfirmDisconnectAccount = async () => {
    if (!user || !selectedAccount) return;

    try {
      const response = await fetch(`/api/accounts/${selectedAccount.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }

      toast.success("החשבון נמחק בהצלחה");
      await refreshAccounts();
      await refreshBusinesses();
      setSelectedAccount(null);
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("שגיאה במחיקת החשבון");
    }
  };

  const handleDisconnectBusinessClick = (
    account: Account,
    business: Business
  ) => {
    setSelectedBusiness({ account, business });
    setConfirmBusinessDelete(true);
  };

  const handleConfirmDisconnectBusiness = async () => {
    if (!user || !selectedBusiness) return;

    try {
      await deleteBusiness(
        user.uid,
        selectedBusiness.account.id,
        selectedBusiness.business.id
      );
      toast.success("העסק נמחק בהצלחה");
      await loadAccountsWithBusinesses();
      await refreshBusinesses();
      setSelectedBusiness(null);
    } catch (error) {
      console.error("Error deleting business:", error);
      toast.error("שגיאה במחיקת העסק");
    }
  };

  const totalBusinesses = accountsWithBusinesses.reduce(
    (sum, account) => sum + account.businesses.length,
    0
  );

  if (loading) {
    return (
      <DashboardCard>
        <DashboardCardContent className="flex items-center justify-center min-h-[200px]">
          <Loading size="md" />
        </DashboardCardContent>
      </DashboardCard>
    );
  }

  if (showBusinessSelector) {
    return (
      <DashboardCard>
        <DashboardCardHeader>
          <DashboardCardTitle icon={<Building2 className="h-5 w-5" />}>
            בחר עסק לחיבור
          </DashboardCardTitle>
          <DashboardCardDescription>
            בחר את העסק שברצונך לחבר מרשימת העסקים שלך ב-Google Business Profile
          </DashboardCardDescription>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-3">
          {loadingAvailableBusinesses ? (
            <div className="flex items-center justify-center min-h-[200px]">
              <Loading size="md" />
            </div>
          ) : availableBusinesses.length === 0 ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">לא נמצאו עסקים</p>
                <p className="text-sm text-muted-foreground mt-1">
                  החשבון שלך ב-Google Business Profile לא מכיל עסקים רשומים
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowBusinessSelector(false);
                  hasLoadedBusinesses.current = false;
                }}
                className="mt-4"
              >
                חזור להגדרות
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {availableBusinesses.map((business) => (
                  <div
                    key={business.id}
                    className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 text-right">
                        <h4 className="font-semibold">{business.name}</h4>
                        <div className="flex justify-end items-center text-sm text-muted-foreground mt-1 flex-row-reverse">
                          <span>{business.address}</span>
                          <MapPin className="h-3 w-3 shrink-0" />
                        </div>
                      </div>
                      <Button
                        onClick={() => handleConnectBusiness(business)}
                        disabled={connectingBusiness}
                        size="default"
                      >
                        {connectingBusiness ? "מחבר..." : "חבר עסק"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setShowBusinessSelector(false);
                  setAccountIdForNewBusiness(null);
                  hasLoadedBusinesses.current = false;
                }}
                className="w-full mt-4"
              >
                ביטול
              </Button>
            </>
          )}
        </DashboardCardContent>
      </DashboardCard>
    );
  }

  if (totalBusinesses === 0) {
    return (
      <>
        <OAuthPrompt onConnect={handleStartOAuth} loading={loadingOAuth} />
      </>
    );
  }

  return (
    <>
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <DashboardCardTitle icon={<Building2 className="h-5 w-5" />}>
                חשבונות ועסקים מחוברים
              </DashboardCardTitle>
              <DashboardCardDescription>
                נהל את החשבונות והעסקים המחוברים לפלטפורמה
              </DashboardCardDescription>
            </div>
            <Button
              onClick={handleStartOAuth}
              disabled={loadingOAuth}
              variant="outline"
              size="sm"
            >
              הוסף עסק
            </Button>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-6">
          {accountsWithBusinesses.map((account) => (
            <div key={account.id} className="space-y-3">
              {/* Account Header */}
              <div className="border rounded-lg p-4 bg-muted/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-right">
                      {account.accountName}
                    </h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDisconnectAccountClick(account)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Businesses under this account */}
                {account.businesses.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {account.businesses.map((business) => (
                      <div
                        key={business.id}
                        className="flex items-start justify-between gap-3 p-3 bg-background rounded-md border"
                      >
                        <div className="flex-1 min-w-0 text-right">
                          <p className="font-medium truncate">
                            {business.name}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {business.address}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleDisconnectBusinessClick(account, business)
                          }
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </DashboardCardContent>
      </DashboardCard>

      {/* Confirmation Dialog for Account Deletion */}
      <ConfirmationDialog
        open={confirmAccountDelete}
        onOpenChange={setConfirmAccountDelete}
        title="מחיקת חשבון Google"
        description={
          <>
            <p>
              האם אתה בטוח שברצונך למחוק את החשבון{" "}
              <strong>{selectedAccount?.accountName}</strong>?
            </p>
            <p className="mt-2">
              פעולה זו תמחק לצמיתות את כל העסקים והביקורות המקושרים לחשבון זה.
            </p>
            <p className="mt-2 text-destructive font-medium">
              פעולה זו בלתי הפיכה!
            </p>
          </>
        }
        confirmText="מחק חשבון"
        cancelText="ביטול"
        variant="destructive"
        icon={<AlertTriangle className="h-5 w-5" />}
        onConfirm={handleConfirmDisconnectAccount}
      />

      {/* Confirmation Dialog for Business Deletion */}
      <ConfirmationDialog
        open={confirmBusinessDelete}
        onOpenChange={setConfirmBusinessDelete}
        title="מחיקת עסק"
        description={
          <>
            <p>
              האם אתה בטוח שברצונך למחוק את העסק{" "}
              <strong>{selectedBusiness?.business.name}</strong>?
            </p>
            <p className="mt-2">
              פעולה זו תמחק לצמיתות את כל הביקורות והתגובות המקושרות לעסק זה.
            </p>
            <p className="mt-2 text-destructive font-medium">
              פעולה זו בלתי הפיכה!
            </p>
          </>
        }
        confirmText="מחק עסק"
        cancelText="ביטול"
        variant="destructive"
        icon={<AlertTriangle className="h-5 w-5" />}
        onConfirm={handleConfirmDisconnectBusiness}
      />
    </>
  );
}
