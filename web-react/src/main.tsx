import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { APP_SETTINGS } from '@config/appSettings.ts'

if (APP_SETTINGS.debugPanel) {
  console.log('DEBUG MODE')
} else {
  console.log('PRODUCTION MODE')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
