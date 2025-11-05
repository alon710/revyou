import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

export function EmptyState({
  title,
  description,
  buttonText,
  buttonLink,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-4">{description}</p>
      <Button asChild>
        <Link href={buttonLink}>{buttonText}</Link>
      </Button>
    </div>
  );
}
