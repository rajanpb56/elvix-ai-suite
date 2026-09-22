/** Register the ELVIX PWA service worker (production-safe, dev-friendly). */
export function registerServiceWorker(): void {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (location.protocol !== "https:" && location.hostname !== "localhost") return;

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((err) => {
      console.warn("[ELVIX] Service worker registration failed:", err);
    });
  });
}
