import safetyVisorPoster from "@/assets/ppe-visor-poster.png";

type SafetyVisorPosterProps = {
  hidden?: boolean;
};

export default function SafetyVisorPoster({ hidden = false }: SafetyVisorPosterProps) {
  return (
    <img
      className="safety-visor__poster"
      src={safetyVisorPoster}
      width={1120}
      height={700}
      alt="Viseira de proteção facial com visor transparente e faixa azul, apresentada como objeto isolado."
      loading="eager"
      decoding="async"
      fetchPriority="high"
      aria-hidden={hidden || undefined}
      data-hidden={hidden ? "true" : "false"}
    />
  );
}
