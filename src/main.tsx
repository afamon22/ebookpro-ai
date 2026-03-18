import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { Toaster } from 'react-hot-toast'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster position="top-right" toastOptions={{
      style: {
        background: '#121212',
        color: '#fff',
        border: '1px solid #2a2a2a',
      }
    }} />
  </StrictMode>,
)
