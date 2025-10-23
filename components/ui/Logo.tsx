import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  textClassName?: string;
}

export function Logo({ href = "/", className, textClassName }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("flex items-center space-x-2 space-x-reverse", className)}
    >
      <Image
        src="/logo-512x512.png"
        alt="Logo"
        width={32}
        height={32}
        className="shrink-0"
      />
      <span className={cn("text-xl font-bold text-primary", textClassName)}>
        תשובות AI
      </span>
    </Link>
  );
}
