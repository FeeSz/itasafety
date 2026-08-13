export const IS_VISUAL_MODE = import.meta.env.MODE === "ui";

const VISUAL_FETCH_GUARD_KEY = "__itasafetyVisualFetchGuardInstalled";

type VisualModeWindow = Window &
  typeof globalThis & {
    [VISUAL_FETCH_GUARD_KEY]?: boolean;
  };

function describeRequest(input: RequestInfo | URL, init?: RequestInit) {
  const method = init?.method ?? (input instanceof Request ? input.method : "GET");
  const rawUrl = input instanceof Request ? input.url : String(input);

  try {
    return {
      method: method.toUpperCase(),
      url: new URL(rawUrl, window.location.href).toString(),
    };
  } catch {
    return { method: method.toUpperCase(), url: rawUrl };
  }
}

export function installVisualModeNetworkGuard() {
  if (!IS_VISUAL_MODE || typeof window === "undefined") return;

  const scope = window as VisualModeWindow;
  if (scope[VISUAL_FETCH_GUARD_KEY]) return;

  scope.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = describeRequest(input, init);
    const message = `Modo visual: chamada ${request.method} bloqueada antes de acessar ${request.url}`;
    console.info(`[visual-mode] ${message}`);
    throw new Error(message);
  };
  scope[VISUAL_FETCH_GUARD_KEY] = true;

  console.info("[visual-mode] Isolamento ativo: chamadas fetch estão bloqueadas.");
}

export function visualModeActionMessage(action: string) {
  return `${action} simulada. Nenhuma chamada ao backend foi realizada.`;
}
