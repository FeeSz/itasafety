import type { DetailedHTMLProps, HTMLAttributes } from "react";

type ModelViewerAttributes = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  alt?: string;
  "auto-rotate"?: string;
  "auto-rotate-delay"?: string;
  "camera-controls"?: string;
  "camera-orbit"?: string;
  "disable-zoom"?: string;
  "environment-image"?: string;
  exposure?: string;
  "interaction-prompt"?: "auto" | "none";
  loading?: "auto" | "eager" | "lazy";
  "max-camera-orbit"?: string;
  "min-camera-orbit"?: string;
  poster?: string;
  reveal?: "auto" | "interaction" | "manual";
  "rotation-per-second"?: string;
  scale?: string;
  "shadow-intensity"?: string;
  src?: string;
  "tone-mapping"?: "auto" | "neutral" | "agx" | "commerce" | "legacy";
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": ModelViewerAttributes;
    }
  }
}

export {};
