import logo from "@/assets/itasafety-logo.png";

type LogoProps = {
  className?: string;
  onDark?: boolean;
};

/**
 * Logo responsivo — escala de forma fluida usando CSS clamp().
 * Sem breakpoints fixos: a logo cresce proporcionalmente com a viewport.
 *   mobile pequeno (~375px)  →  ~52px
 *   mobile grande (~768px)   →  ~80px
 *   desktop (≥1280px)        →  120px
 */
export default function Logo({ className = "", onDark = false }: LogoProps) {
  return (
    <a
      href="/"
      aria-label="ItaSafety — Página inicial"
      className={`group inline-flex items-center ${className}`}
    >
      <img
        src={logo}
        alt="ItaSafety"
        width={480}
        height={156}
        className="w-auto transition-transform duration-300 group-hover:scale-[1.02]"
        style={{
          objectFit: "contain",
          /* Escala fluida: mín 52px → 8vw → máx 120px */
          height: "clamp(52px, 8vw, 120px)",
        }}
      />
    </a>
  );
}
