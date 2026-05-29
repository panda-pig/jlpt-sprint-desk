import { useCallback } from "react";

let toastContainer: HTMLDivElement | null = null;

function getToastContainer(): HTMLDivElement {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toastRegion";
    toastContainer.className = "toast-region";
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

export function toast(message: string) {
  const region = getToastContainer();
  const item = document.createElement("div");
  item.className = "toast";
  item.textContent = message;
  region.appendChild(item);
  window.setTimeout(() => item.remove(), 2800);
}

export function useToast() {
  return useCallback((message: string) => {
    toast(message);
  }, []);
}
