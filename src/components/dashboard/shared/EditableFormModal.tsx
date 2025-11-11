"use client";

import { ReactNode, useState, useEffect, useRef } from "react";
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
import { toast } from "sonner";
import { useLocale } from "next-intl";

interface EditableFormModalProps<T> {
  icon: ReactNode;
  title: string;
  description: string;
  open: boolean;
  onClose: () => void;
  data: T;
  onSave: (data: T) => Promise<void>;
  renderForm: (props: FormRenderProps<T>) => ReactNode;
  successMessage: string;
  errorMessage: string;
  cancelLabel: string;
  saveLabel: string;
  savingLabel: string;
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
  successMessage,
  errorMessage,
  cancelLabel,
  saveLabel,
  savingLabel,
}: EditableFormModalProps<T>) {
  const locale = useLocale();
  const [formData, setFormData] = useState<T>(data);
  const [isLoading, setIsLoading] = useState(false);
  const prevOpenRef = useRef(open);
  const dir = locale === "he" ? "rtl" : "ltr";

  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setFormData(data);
    } else if (!open) {
      setFormData(data);
    }
    prevOpenRef.current = open;
  }, [open, data]);

  const handleChange = <K extends keyof T>(field: K, value: T[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await onSave(formData);
      toast.success(successMessage);
      onClose();
    } catch (error) {
      const specificErrorMessage = error instanceof Error ? error.message : errorMessage;
      console.error("Error saving:", error);
      toast.error(specificErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(data);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleCancel()}>
      <DialogContent className="sm:max-w-[600px]" dir={dir}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription className={dir === "rtl" ? "text-end" : "text-start"}>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">{renderForm({ data: formData, isLoading, onChange: handleChange })}</div>

        <DialogFooter className="flex justify-between gap-2">
          <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant="default" onClick={handleSave} disabled={isLoading} className="gap-2">
            {isLoading ? savingLabel : saveLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
