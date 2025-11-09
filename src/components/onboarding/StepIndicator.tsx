import { Progress } from "@/components/ui/progress";

interface StepIndicatorProps {
  currentStep: 1 | 2;
  stepName: string;
}

export function StepIndicator({ currentStep, stepName }: StepIndicatorProps) {
  const progress = (currentStep / 2) * 100;

  return (
    <div className="flex flex-col items-center gap-3 mb-8" dir="rtl">
      <span className="text-lg text-muted-foreground font-semibold py-2">{stepName}</span>
      <div className="w-full max-w-md">
        <Progress value={progress} className="h-2 [&>div]:origin-right scale-x-[-1]" />
      </div>
      <span className="text-sm text-muted-foreground">שלב {currentStep} מתוך 2</span>
    </div>
  );
}
