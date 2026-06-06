import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { isChunkLoadError, recoverFromStaleChunk } from './components/RouteErrorBoundary'

// Backstops for stale lazy-chunk fetches after a redeploy (common when an iOS
// Safari tab is reopened from the background and then navigates). Vite fires
// `vite:preloadError`; dynamic-import failures also surface as unhandled
// rejections. In both cases, reload once to pull the fresh build.
window.addEventListener('vite:preloadError', (e) => {
  e.preventDefault();
  recoverFromStaleChunk();
});
window.addEventListener('unhandledrejection', (e) => {
  if (isChunkLoadError(e.reason)) recoverFromStaleChunk();
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
