import React, { useEffect, useRef } from 'react';
import { Trash2 } from 'lucide-react';

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Confirmación de una acción destructiva. El foco arranca en "Cancelar" (lo
 * seguro) y Escape o tocar fuera cancelan.
 */
export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}) => {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // El foco va a "Cancelar" solo al abrir, no en cada redibujo.
  useEffect(() => {
    cancelRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-50 left-1/2 -translate-x-1/2 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl bg-black/60 backdrop-blur-sm flex items-center justify-center p-5"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-desc"
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 border border-[#E2E8F0] shadow-sm text-center space-y-5 w-full"
      >
        <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto">
          <Trash2 className="w-6 h-6" />
        </div>
        <div>
          <h2 id="confirm-title" className="text-xl font-bold text-gray-900 font-heading">
            {title}
          </h2>
          <p id="confirm-desc" className="text-sm text-gray-500 mt-2 leading-relaxed">
            {message}
          </p>
        </div>
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={onConfirm}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-5 rounded-full text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
          >
            <Trash2 className="w-5 h-5" />
            <span>{confirmLabel}</span>
          </button>
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 px-5 rounded-full text-sm transition-all active:scale-[0.98] flex items-center justify-center space-x-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0ee5ba]"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
