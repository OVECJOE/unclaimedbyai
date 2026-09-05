import Link from "next/link";

type LogoProps = {
  className?: string;
};

export default function Logo({
  className = "h-8 w-auto",
}: LogoProps) {
  return (
    <Link href="/">
      <svg
        className={className}
        viewBox="0 0 1465 310"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="Unclaimed"
        preserveAspectRatio="xMinYMid meet"
      >
        <image
          href="/logo.png"
          x="0"
          y="0"
          width="1465"
          height="310"
          preserveAspectRatio="none"
        />
      </svg>
    </Link>
  );
}
