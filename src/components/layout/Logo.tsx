import logo from "@/assets/itasafety-header-logo-384.png";
import { Link } from "@tanstack/react-router";

type LogoProps = {
  className?: string;
  imageClassName?: string;
  onDark?: boolean;
};

export default function Logo({
  className = "",
  imageClassName = "h-10",
  onDark = false,
}: LogoProps) {
  return (
    <Link
      to="/"
      aria-label="ItaSafety — Página inicial"
      className={`focus-ring group inline-flex items-center rounded-sm ${className}`}
    >
      <img
        src={logo}
        alt="ItaSafety — Equipamentos de Proteção Individual"
        width={384}
        height={256}
        className={`${imageClassName} w-auto object-contain ${onDark ? "rounded-sm bg-surface px-1" : ""}`}
      />
    </Link>
  );
}
