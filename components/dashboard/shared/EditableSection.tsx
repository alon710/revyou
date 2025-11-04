"use client";

import { ReactNode, useState } from "react";
import {
  DashboardCard,
  DashboardCardHeader,
  DashboardCardTitle,
  DashboardCardDescription,
  DashboardCardContent,
} from "@/components/ui/dashboard-card";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { EditableFormModal } from "./EditableFormModal";

interface EditableSectionProps<T> {
  title: string;
  description: string;
  icon: ReactNode;
  loading?: boolean;
  modalTitle: string;
  modalDescription: string;
  data: T;
  onSave: (data: T) => Promise<void>;
  renderDisplay: () => ReactNode;
  renderForm: (props: FormRenderProps<T>) => ReactNode;
}

export interface FormRenderProps<T> {
  data: T;
  isLoading: boolean;
  onChange: <K extends keyof T>(field: K, value: T[K]) => void;
}

export default function EditableSection<T>({
  title,
  description,
  icon,
  loading,
  modalTitle,
  modalDescription,
  data,
  onSave,
  renderDisplay,
  renderForm,
}: EditableSectionProps<T>) {
  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <>
      <DashboardCard>
        <DashboardCardHeader>
          <div className="flex items-center justify-between">
            <div>
              <DashboardCardTitle icon={icon}>{title}</DashboardCardTitle>
              <DashboardCardDescription>{description}</DashboardCardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditModal(true)}
              disabled={loading}
            >
              <Settings className="ml-2 h-4 w-4" />
              עריכה
            </Button>
          </div>
        </DashboardCardHeader>
        <DashboardCardContent className="space-y-6">
          {renderDisplay()}
        </DashboardCardContent>
      </DashboardCard>

      <EditableFormModal
        icon={icon}
        title={modalTitle}
        description={modalDescription}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        data={data}
        onSave={onSave}
        renderForm={renderForm}
      />
    </>
  );
}
