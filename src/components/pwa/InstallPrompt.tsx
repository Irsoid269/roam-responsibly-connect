import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, Download, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed recently (within 24 hours)
    const dismissedAt = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const now = Date.now();
      const hoursSinceDismissed = (now - dismissedTime) / (1000 * 60 * 60);
      if (hoursSinceDismissed < 24) {
        return;
      }
    }

    // Detect iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    if (isIOSDevice) {
      // Show iOS install instructions after a delay
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      return () => clearTimeout(timer);
    }

    // For Android/Chrome, listen for beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (isInstalled || !showPrompt) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      >
        <div className="max-w-lg mx-auto bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary to-accent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary-foreground">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Installer Comworkation</h3>
                  <p className="text-sm opacity-90">Accédez rapidement depuis votre écran d'accueil</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-primary-foreground" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {isIOS ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Pour installer l'application sur votre iPhone/iPad :
                </p>
                <ol className="text-sm space-y-2 text-foreground">
                  <li className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">1</span>
                    Appuyez sur le bouton <strong>Partager</strong> (icône en bas)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">2</span>
                    Faites défiler et appuyez sur <strong>"Sur l'écran d'accueil"</strong>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">3</span>
                    Appuyez sur <strong>Ajouter</strong>
                  </li>
                </ol>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="w-full"
                >
                  J'ai compris
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="flex-1"
                >
                  Plus tard
                </Button>
                <Button
                  onClick={handleInstall}
                  className="flex-1 gap-2"
                >
                  <Download className="w-4 h-4" />
                  Installer
                </Button>
              </div>
            )}

            <p className="text-xs text-center text-muted-foreground">
              ✓ Fonctionne hors-ligne • ✓ Chargement rapide • ✓ Aucun téléchargement requis
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default InstallPrompt;
