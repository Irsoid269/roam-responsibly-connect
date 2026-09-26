const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;

export const isPushConfigured = Boolean(vapidPublicKey);

export const isPushSupported =
  typeof window !== "undefined" && "serviceWorker" in navigator && "PushManager" in window;

function urlBase64ToUint8Array(base64url: string): Uint8Array {
  const padding = "=".repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

// Le service worker peut ne jamais s'activer (bloqué, désactivé, environnement
// de dev sans devOptions) — on borne l'attente pour ne pas bloquer l'UI indéfiniment.
function getReadyRegistration(timeoutMs = 8000): Promise<ServiceWorkerRegistration> {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise<ServiceWorkerRegistration>((_, reject) =>
      setTimeout(() => reject(new Error("Le service worker n'a pas répondu à temps")), timeoutMs)
    ),
  ]);
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushConfigured || !isPushSupported) return null;
  const registration = await getReadyRegistration();
  const existing = await registration.pushManager.getSubscription();
  if (existing) return existing;
  return registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey!),
  });
}

export async function unsubscribeFromPush(): Promise<boolean> {
  if (!isPushSupported) return false;
  const registration = await getReadyRegistration();
  const existing = await registration.pushManager.getSubscription();
  if (!existing) return true;
  return existing.unsubscribe();
}

export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushSupported) return null;
  try {
    const registration = await getReadyRegistration();
    return registration.pushManager.getSubscription();
  } catch {
    return null;
  }
}
