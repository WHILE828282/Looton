import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { AppProvider } from './lib/AppContext'
import { App } from './App'
import './index.css'

// URL манифеста для TON Connect
const manifestUrl = 'https://raw.githubusercontent.com';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <AppProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AppProvider>
    </TonConnectUIProvider>
  </React.StrictMode>
)
