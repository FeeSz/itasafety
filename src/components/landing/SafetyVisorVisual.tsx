import { useEffect, useRef, useState } from "react";
import SafetyVisorPoster from "@/components/landing/SafetyVisorPoster";

const MODEL_VIEWER_MODULE_URL =
  "https://unpkg.com/@google/model-viewer@3.5.0/dist/model-viewer.min.js";
const MODEL_URL = "/models/ppe-visor.glb";
const SMALL_SCREEN_QUERY = "(max-width: 479px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const LOAD_TIMEOUT_MS = 20_000;

type ViewerStatus = "idle" | "loading" | "ready" | "error" | "static";

let modelViewerModulePromise: Promise<unknown> | undefined;

function loadModelViewerModule() {
  modelViewerModulePromise ??= import(/* @vite-ignore */ MODEL_VIEWER_MODULE_URL).catch(
    (error) => {
      modelViewerModulePromise = undefined;
      throw error;
    },
  );

  return modelViewerModulePromise;
}

function scheduleIdle(callback: () => void) {
  const idleWindow = window as Window & {
    requestIdleCallback?: (callback: () => void, options: { timeout: number }) => number;
    cancelIdleCallback?: (id: number) => void;
  };

  if (idleWindow.requestIdleCallback && idleWindow.cancelIdleCallback) {
    const id = idleWindow.requestIdleCallback(callback, { timeout: 1_800 });
    return () => idleWindow.cancelIdleCallback?.(id);
  }

  const id = globalThis.setTimeout(callback, 480);
  return () => globalThis.clearTimeout(id);
}

export default function SafetyVisorVisual() {
  const rootRef = useRef<HTMLElement>(null);
  const modelViewerRef = useRef<HTMLElement>(null);
  const [status, setStatus] = useState<ViewerStatus>("idle");
  const [autoRotate, setAutoRotate] = useState(false);

  useEffect(() => {
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const updateMotionPreference = () => setAutoRotate(!motionQuery.matches);

    updateMotionPreference();
    motionQuery.addEventListener("change", updateMotionPreference);

    return () => motionQuery.removeEventListener("change", updateMotionPreference);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let disposed = false;
    let cancelIdle: () => void = () => undefined;
    let loadTimeout = 0;
    let modelViewer: HTMLElement | null = null;

    const handleLoad = () => {
      window.clearTimeout(loadTimeout);
      if (!disposed) setStatus("ready");
    };

    const handleError = () => {
      window.clearTimeout(loadTimeout);
      if (!disposed) setStatus("error");
    };

    const startViewer = () => {
      if (window.matchMedia(SMALL_SCREEN_QUERY).matches) {
        setStatus("static");
        return;
      }

      cancelIdle = scheduleIdle(() => {
        if (disposed || !modelViewerRef.current) return;

        setStatus("loading");
        loadTimeout = window.setTimeout(handleError, LOAD_TIMEOUT_MS);

        void loadModelViewerModule()
          .then(() => customElements.whenDefined("model-viewer"))
          .then(() => {
            if (disposed || !modelViewerRef.current) return;

            modelViewer = modelViewerRef.current;
            modelViewer.addEventListener("load", handleLoad, { once: true });
            modelViewer.addEventListener("error", handleError, { once: true });
            modelViewer.setAttribute("src", MODEL_URL);
          })
          .catch(handleError);
      });
    };

    const loadObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        loadObserver.disconnect();
        startViewer();
      },
      { rootMargin: "240px 0px" },
    );

    loadObserver.observe(root);

    return () => {
      disposed = true;
      loadObserver.disconnect();
      cancelIdle();
      window.clearTimeout(loadTimeout);
      modelViewer?.removeEventListener("load", handleLoad);
      modelViewer?.removeEventListener("error", handleError);
    };
  }, []);

  const isReady = status === "ready";
  const hasFailed = status === "error";
  const isStatic = status === "static";

  return (
    <figure
      ref={rootRef}
      className="safety-visor"
      aria-label="Viseira de proteção facial em visualização de produto"
      data-ready={isReady ? "true" : "false"}
    >
      <div className="safety-visor__stage">
        <div className="safety-visor__product">
          <SafetyVisorPoster hidden={isReady} />

          <model-viewer
            ref={modelViewerRef}
            className="safety-visor__viewer"
            alt="Viseira de proteção facial EPI"
            title="Modelo 3D interativo — viseira de proteção facial"
            aria-label="Modelo 3D interativo — viseira de proteção facial"
            aria-describedby="safety-visor-description"
            tabIndex={isReady ? 0 : -1}
            camera-controls=""
            interaction-prompt="none"
            disable-zoom=""
            camera-orbit="25deg 76deg 2.64m"
            min-camera-orbit="auto auto 2.64m"
            max-camera-orbit="auto auto 2.64m"
            scale="0.003 0.003 0.003"
            shadow-intensity="0.5"
            exposure="0.52"
            environment-image="neutral"
            tone-mapping="commerce"
            loading="lazy"
            reveal="auto"
            auto-rotate={autoRotate ? "" : undefined}
            auto-rotate-delay="2600"
            rotation-per-second="2deg"
            data-ready={isReady ? "true" : "false"}
          />
        </div>

        <p id="safety-visor-description" className="sr-only">
          Gire o modelo com arraste, toque ou teclado. A interação é opcional e a
          imagem estática apresenta o mesmo produto.
        </p>

        <div className="sr-only" aria-live="polite">
          {status === "loading" ? "Preparando visualização 3D." : null}
          {hasFailed ? "Visualização 3D indisponível. Exibindo imagem do produto." : null}
          {isStatic ? "Imagem estática otimizada para esta tela." : null}
        </div>
      </div>
    </figure>
  );
}
