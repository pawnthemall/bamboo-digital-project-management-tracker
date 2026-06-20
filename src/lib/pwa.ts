"use client";

export function registerServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("[PWA] Service Worker registered:", registration.scope);

        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              // New service worker waiting — trigger update toast
              console.log("[PWA] New content available — refresh to update.");
              window.dispatchEvent(new CustomEvent("sw-update-available"));
            }
          });
        });
      })
      .catch((error) => {
        console.error("[PWA] Service Worker registration failed:", error);
      });
  });
}

export function unregisterServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.ready.then((registration) => {
    registration.unregister().then(() => {
      console.log("[PWA] Service Worker unregistered.");
    });
  });
}

export function updateServiceWorker() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;

  navigator.serviceWorker.ready.then((registration) => {
    registration.update();
  });
}

// Listen for beforeinstallprompt to show custom install UI
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

export function listenForInstallPrompt(callback: (prompt: BeforeInstallPromptEvent) => void) {
  if (typeof window === "undefined") return;

  const handler = (e: Event) => {
    e.preventDefault();
    const promptEvent = e as BeforeInstallPromptEvent;
    deferredPrompt = promptEvent;
    callback(promptEvent);
  };

  window.addEventListener("beforeinstallprompt", handler);

  return () => {
    window.removeEventListener("beforeinstallprompt", handler);
  };
}

export async function triggerInstall() {
  if (!deferredPrompt) return false;

  deferredPrompt.prompt();

  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;

  return outcome === "accepted";
}
