const DEFAULT_SITE_URL = "https://itasafety.lovable.app";

function readPublicEnv(name: string) {
  const viteEnv = import.meta.env as Record<string, string | undefined>;
  const processEnv =
    typeof process !== "undefined" ? (process.env as Record<string, string | undefined>) : {};

  return viteEnv[`VITE_${name}`] || processEnv[name] || processEnv[`VITE_${name}`];
}

function normalizeSiteUrl(url: string) {
  return url.replace(/\/+$/, "");
}

export const SITE_URL = normalizeSiteUrl(readPublicEnv("SITE_URL") || DEFAULT_SITE_URL);

export function abs(path: string) {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article" | "product";
  noindex?: boolean;
}) {
  const url = abs(opts.path);
  return {
    meta: [
      { title: opts.title },
      { name: "description", content: opts.description },
      ...(opts.noindex ? [{ name: "robots", content: "noindex, nofollow" }] : []),
      { property: "og:title", content: opts.title },
      { property: "og:description", content: opts.description },
      { property: "og:url", content: url },
      { property: "og:type", content: opts.type ?? "website" },
      ...(opts.image
        ? [
            { property: "og:image", content: opts.image },
            { name: "twitter:image", content: opts.image },
          ]
        : []),
      { name: "twitter:title", content: opts.title },
      { name: "twitter:description", content: opts.description },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
