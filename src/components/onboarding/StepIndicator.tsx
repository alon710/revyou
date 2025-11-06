import { Progress } from "@/components/ui/progress";

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const progress = (currentStep / 3) * 100;

  return (
    <div className="flex flex-col items-center gap-3 mb-8" dir="rtl">
      <div className="w-full max-w-md">
        <Progress
          value={progress}
          className="h-2 [&>div]:origin-right scale-x-[-1]"
        />
      </div>
      <span className="text-sm text-muted-foreground">
        שלב {currentStep} מתוך 3
      </span>
    </div>
  );
}
