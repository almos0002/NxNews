export type ToastType = "success" | "error" | "info";

export interface ToastPayload {
  id: string;
  message: string;
  type: ToastType;
}

export function toast(message: string, type: ToastType = "info") {
  if (typeof window === "undefined") return;
  const id = Math.random().toString(36).slice(2);
  window.dispatchEvent(
    new CustomEvent("kh:toast", { detail: { id, message, type } as ToastPayload })
  );
}
