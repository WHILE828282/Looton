import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import App from './App'
import { AppProvider } from './lib/AppContext'
import './styles.css'

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        ready: () => void
        expand: () => void
      }
    }
  }
}

window.Telegram?.WebApp?.ready()
window.Telegram?.WebApp?.expand()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl="https://example.com/tonconnect-manifest.json">
      <AppProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppProvider>
    </TonConnectUIProvider>
  </React.StrictMode>
)
