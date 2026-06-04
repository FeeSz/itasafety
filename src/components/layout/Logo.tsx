import logoSrc from "@/assets/itasafety-logo.png";

type LogoProps = {
  className?: string;
  onDark?: boolean;
};

export default function Logo({ className = "" }: LogoProps) {
  return (
    <a
      href="/"
      aria-label="ItaSafety — Página inicial"
      className={`group flex items-center ${className}`}
    >
      <img
        src={logoSrc}
        alt="ItaSafety"
        width={320}
        height={104}
        className="h-12 w-auto sm:h-14 md:h-20 lg:h-24 transition-transform duration-300 group-hover:scale-[1.02]"
        style={{ objectFit: "contain" }}
      />
    </a>
  );
}
