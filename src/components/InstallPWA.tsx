import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = localStorage.getItem("pwa-install-dismissed");
      if (!dismissed) setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-sm">
      <div className="flex items-center gap-3 rounded-xl border border-yellow-500/30 bg-[#231f20] p-4 shadow-xl">
        <img
          src="/icons/icon-96x96.png"
          alt="Gorila Rise"
          className="h-12 w-12 rounded-lg flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white">Instalar Gorila Rise</p>
          <p className="text-xs text-gray-400 truncate">Acesso rápido pelo seu celular</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button
            size="sm"
            onClick={handleInstall}
            className="h-8 bg-[#f0c419] text-black hover:bg-[#f0c419]/90 text-xs px-3"
          >
            <Download className="h-3 w-3 mr-1" />
            Instalar
          </Button>
          <button
            onClick={handleDismiss}
            className="p-1 text-gray-400 hover:text-white transition-colors"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
