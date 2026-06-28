import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { APP_CONFIG } from '@config/app.config.ts'
import { bootstrapApp } from './infrastructure/errors/error.bootstrap.ts'

bootstrapApp(APP_CONFIG.debugMode)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
