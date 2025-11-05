import { Progress } from "@/components/ui/progress";

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
}

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  const progress = (currentStep / 3) * 100;

  return (
    <div className="flex flex-col items-center gap-3 mb-8">
      <Progress value={progress} className="w-full max-w-md h-2" />
      <span className="text-sm text-muted-foreground">
        שלב {currentStep} מתוך 3
      </span>
    </div>
  );
}
