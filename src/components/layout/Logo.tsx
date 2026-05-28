type LogoProps = {
  className?: string;
  onDark?: boolean;
};

export default function Logo({ className = "", onDark = false }: LogoProps) {
  return (
    <a
      href="/"
      aria-label="ItaSafety — Página inicial"
      className={`group flex items-center gap-2.5 ${className}`}
    >
      <span className="relative grid size-9 place-items-center overflow-hidden rounded-sm bg-brand-red transition-transform duration-300 group-hover:scale-105">
        <span className="absolute left-0 top-0 size-3 bg-brand-navy-deep" />
        <span className="absolute bottom-0 right-0 size-3 bg-white" />
        <span className="relative font-display text-sm font-black uppercase text-white">
          IS
        </span>
      </span>
      <span
        className={`font-display text-xl font-black uppercase leading-none tracking-tight ${
          onDark ? "text-white" : "text-brand-navy-deep"
        }`}
      >
        Ita<span className="text-brand-red">Safety</span>
      </span>
    </a>
  );
}
