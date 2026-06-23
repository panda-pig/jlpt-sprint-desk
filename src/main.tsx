import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// animal-island-ui styles + bundled fonts (Nunito / Noto Sans SC). Must load
// BEFORE component usage so the design tokens / pill shapes / 3D shadows resolve.
import 'animal-island-ui/style';
import './index.css'
import App from './App.tsx'
import { runMigrations } from './lib/migrations'

// Apply any pending schema migrations before React reads localStorage.
runMigrations()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
