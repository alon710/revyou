import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
interface LogoProps {
  href?: string;
  className?: string;
}

export function Logo({ href = "/", className }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn("flex items-center space-x-2 space-x-reverse", className)}
    >
      <Image src="/logo-512x512.png" alt="Logo" width={40} height={40} />
    </Link>
  );
}
