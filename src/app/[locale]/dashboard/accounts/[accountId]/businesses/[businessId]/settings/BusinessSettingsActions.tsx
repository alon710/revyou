"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import type { Business } from "@/lib/types";
import BusinessDetailsCard from "@/components/dashboard/businesses/BusinessDetailsCard";
import { DeleteConfirmation } from "@/components/ui/delete-confirmation";
import { deleteBusiness } from "@/lib/actions/businesses.actions";

interface BusinessSettingsActionsProps {
  business: Business;
  accountId: string;
  userId: string;
  translations: {
    deleteBusiness: string;
    deleteConfirmation: string;
    deleteConfirmationLabel: string;
    deleteConfirmationPlaceholder: string;
    deleteButton: string;
    cancel: string;
    dangerZone: string;
    irreversibleActions: string;
    textMismatch: string;
    deleting: string;
  };
}

export function BusinessSettingsActions({ business, accountId, userId, translations }: BusinessSettingsActionsProps) {
  const router = useRouter();
  const [loading, _setLoading] = useState(false);

  const handleUpdate = async () => {
    router.refresh();
  };

  const handleDelete = async () => {
    try {
      await deleteBusiness(userId, accountId, business.id);
      router.push("/dashboard/home");
    } catch (error) {
      console.error("Error deleting business:", error);
    }
  };

  return (
    <>
      <BusinessDetailsCard
        business={business}
        accountId={accountId}
        userId={userId}
        loading={loading}
        onUpdate={handleUpdate}
      />

      <DeleteConfirmation
        title={translations.deleteBusiness}
        description={translations.deleteConfirmation}
        confirmationText={business.name}
        confirmationLabel={translations.deleteConfirmationLabel}
        confirmationPlaceholder={translations.deleteConfirmationPlaceholder}
        onDelete={handleDelete}
        deleteButtonText={translations.deleteButton}
        cancelLabel={translations.cancel}
        dangerZoneLabel={translations.dangerZone}
        irreversibleActionsLabel={translations.irreversibleActions}
        textMismatchMessage={translations.textMismatch}
        deletingLabel={translations.deleting}
      />
    </>
  );
}
