import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

declare global {
  interface Window {
    __pwaInstallPrompt?: BeforeInstallPromptEvent;
  }
}

// Exported so other UI (menus, settings page) can trigger install from anywhere
export function usePWAInstall() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const isInstalled = window.matchMedia("(display-mode: standalone)").matches;

  useEffect(() => {
    if (window.__pwaInstallPrompt) {
      setPrompt(window.__pwaInstallPrompt);
      return;
    }
    const handler = () => {
      if (window.__pwaInstallPrompt) setPrompt(window.__pwaInstallPrompt);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("pwaInstallReady", handler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("pwaInstallReady", handler);
    };
  }, []);

  const install = async () => {
    if (!prompt) return false;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") {
      setPrompt(null);
      window.__pwaInstallPrompt = undefined;
    }
    return outcome === "accepted";
  };

  return { canInstall: !!prompt && !isInstalled, isInstalled, install };
}

export function InstallPWA() {
  const { canInstall, install } = usePWAInstall();
  const [showBanner, setShowBanner] = useState(false);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const alreadyInstalled = window.matchMedia("(display-mode: standalone)").matches;
    if (!dismissed && !alreadyInstalled) setShowBanner(true);
  }, []);

  const handleInstall = async () => {
    if (canInstall) {
      await install();
      setShowBanner(false);
    } else {
      // beforeinstallprompt didn't fire — show manual instructions
      setShowManual(true);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!showBanner) return null;

  return (
    <>
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

      {showManual && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-[#231f20] border border-yellow-500/30 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Smartphone className="h-6 w-6 text-[#f0c419]" />
              <h3 className="text-white font-semibold">Como instalar no Android</h3>
            </div>
            <ol className="text-sm text-gray-300 space-y-2 list-decimal list-inside">
              <li>Toque nos três pontos <span className="text-[#f0c419]">⋮</span> no canto superior do Chrome</li>
              <li>Selecione <span className="text-white font-medium">"Adicionar à tela inicial"</span></li>
              <li>Confirme tocando em <span className="text-white font-medium">"Adicionar"</span></li>
            </ol>
            <Button
              className="w-full bg-[#f0c419] text-black hover:bg-[#f0c419]/90"
              onClick={() => { setShowManual(false); setShowBanner(false); localStorage.setItem("pwa-install-dismissed", "true"); }}
            >
              Ok, entendi
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
