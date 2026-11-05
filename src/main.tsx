import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import {ErrorBoundary} from './components/ErrorBoundary.tsx';
import {registerNotificationWorker} from './services/notificationService.ts';
import './index.css';

// Chrome de Android solo muestra notificaciones a través de un service worker.
registerNotificationWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* Si una pantalla falla, aviso con "Volver a abrir la app" en vez de página en blanco */}
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
