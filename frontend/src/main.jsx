import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ArtisanProvider } from './context/ArtisanContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ArtisanProvider>
      <App />
    </ArtisanProvider>
  </StrictMode>,
)
