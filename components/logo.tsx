import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
};

function LogoImage({ href, className }: { href: string; className: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 1465 310"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Unclaimed"
      preserveAspectRatio="xMinYMid meet"
    >
      <image
        href={href}
        x="0"
        y="0"
        width="1465"
        height="310"
        preserveAspectRatio="none"
      />
    </svg>
  );
}

export default function Logo({
  className = "h-8 w-auto",
}: LogoProps) {
  return (
    <Link href="/">
      <LogoImage href="/logo.png" className={cn("h-8 w-auto dark:hidden", className)} />
      <LogoImage href="/logo-dark.png" className={cn("hidden h-8 w-auto dark:block", className)} />
    </Link>
  );
}
