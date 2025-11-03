"use client";

import { ReactNode, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormRenderProps } from "./EditableSection";

interface EditableFormModalProps<T = any> {
  icon: ReactNode;
  title: string;
  description: string;
  open: boolean;
  onClose: () => void;
  data: T;
  onSave: (data: any) => Promise<void>;
  renderForm: (props: FormRenderProps<T>) => ReactNode;
}

export function EditableFormModal<T>({
  icon,
  title,
  description,
  open,
  onClose,
  data,
  onSave,
  renderForm,
}: EditableFormModalProps<T>) {
  const [formData, setFormData] = useState<T>(data);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form data when modal opens or data changes
  useEffect(() => {
    if (open) {
      setFormData(data);
    }
  }, [open, data]);

  const handleChange = <K extends keyof T>(field: K, value: T[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription className="text-right">
            {description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {renderForm({ data: formData, isLoading, onChange: handleChange })}
        </div>

        <DialogFooter className="flex justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            ביטול
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? <>שומר...</> : <>שמירה</>}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
