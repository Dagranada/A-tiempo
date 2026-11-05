import React from 'react';
import { RotateCcw, TriangleAlert } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Si algo falla al dibujar una pantalla, React deja la página en blanco. Esto
 * muestra un aviso con "Volver a abrir la app" en su lugar. Los datos no se
 * pierden: están en el teléfono y en la nube.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('La app falló al dibujar una pantalla:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div
        role="alert"
        className="min-h-screen bg-[#f8f9fa] w-full flex flex-col items-center justify-center text-center p-6 space-y-4"
      >
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
          <TriangleAlert className="w-8 h-8" aria-hidden="true" />
        </div>
        <div>
          <p className="text-lg font-bold text-gray-900 font-heading">Algo salió mal</p>
          <p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
            Tus planes están a salvo. Vuelve a abrir la app para seguir.
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="w-full max-w-xs bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 px-5 rounded-full text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Volver a abrir la app</span>
        </button>
      </div>
    );
  }
}
