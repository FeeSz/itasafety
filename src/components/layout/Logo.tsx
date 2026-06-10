import logoAsset from "@/assets/itasafety-logo-dark.png.asset.json";

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
      <img
        src={logoAsset.url}
        alt="ItaSafety"
        width={480}
        height={156}
        className={
          onDark
            ? "h-14 w-auto sm:h-16 md:h-20 lg:h-24 transition-transform duration-300 group-hover:scale-[1.02]"
            : "h-12 w-auto sm:h-14 md:h-20 lg:h-24 transition-transform duration-300 group-hover:scale-[1.02]"
        }
        style={{ objectFit: "contain" }}
      />
    </a>
  );
}
