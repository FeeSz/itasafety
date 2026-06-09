import logoSrc from "@/assets/itasafety-logo.png";

type LogoProps = {
  className?: string;
  onDark?: boolean;
};

export default function Logo({ className = "", onDark = false }: LogoProps) {
  return (
    <a
      href="/"
      aria-label="ItaSafety — Página inicial"
      className={`group inline-flex items-center ${className}`}
    >
      <span
        className={
          onDark
            ? "inline-flex items-center rounded-md bg-white/95 px-3 py-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition-transform duration-300 group-hover:scale-[1.02]"
            : "inline-flex items-center transition-transform duration-300 group-hover:scale-[1.02]"
        }
      >
        <img
          src={logoSrc}
          alt="ItaSafety"
          width={320}
          height={104}
          className={
            onDark
              ? "h-9 w-auto sm:h-10 md:h-12"
              : "h-12 w-auto sm:h-14 md:h-20 lg:h-24"
          }
          style={{ objectFit: "contain" }}
        />
      </span>
    </a>
  );
}
