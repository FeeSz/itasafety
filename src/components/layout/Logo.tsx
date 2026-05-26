type LogoProps = { className?: string };

export default function Logo({ className = "" }: LogoProps) {
  return (
    <a
      href="/"
      aria-label="ItaSafety — Página inicial"
      className={`group flex items-center gap-2 ${className}`}
    >
      <span className="relative grid size-9 place-items-center bg-brand-red transition-transform group-hover:scale-105">
        <span className="absolute left-0 top-0 size-3 bg-brand-navy-deep" />
        <span className="absolute bottom-0 right-0 size-3 bg-white/90" />
      </span>
      <span className="font-display text-xl font-black uppercase tracking-tighter text-white">
        Ita<span className="text-brand-red">Safety</span>
      </span>
    </a>
  );
}
