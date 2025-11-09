import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  size?: number;
  className?: string;
  showNumber?: boolean;
}

export function StarRating({ rating, size = 20, className = "", showNumber = false }: StarRatingProps) {
  return (
    <div className={`flex items-center gap-1 ${className}`} dir="ltr">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          className={star <= rating ? "fill-primary text-primary" : "fill-secondary text-primary/50"}
        />
      ))}
      {showNumber && <span className="mr-1 text-sm font-medium text-muted-foreground">{rating.toFixed(1)}</span>}
    </div>
  );
}
