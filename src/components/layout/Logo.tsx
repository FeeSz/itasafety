import logoSrc from "@/assets/itasafety-logo.jpg";

type LogoProps = {
  className?: string;
  onDark?: boolean;
};

export default function Logo({ className = "", onDark = false }: LogoProps) {
  return (
    <a
      href="/"
      aria-label="ItaSafety — Página inicial"
      className={`group flex items-center ${className}`}
    >
      <img
        src={logoSrc}
        alt="ItaSafety"
        width={160}
        height={44}
        className={`h-10 w-auto md:h-11 ${onDark ? "" : ""} transition-transform duration-300 group-hover:scale-[1.02]`}
        style={{ objectFit: "contain" }}
      />
    </a>
  );
}
