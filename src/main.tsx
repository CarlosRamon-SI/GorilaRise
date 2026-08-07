import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App.tsx'
import './index.css'

if ('serviceWorker' in navigator) {
  // autoUpdate já faz o novo SW assumir sozinho (skipWaiting + clientsClaim) — sem isso, a aba
  // continua rodando o bundle antigo em memória até o usuário fechar e reabrir o app manualmente.
  registerSW({ immediate: true })
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload()
  })
}

createRoot(document.getElementById("root")!).render(<App />);
