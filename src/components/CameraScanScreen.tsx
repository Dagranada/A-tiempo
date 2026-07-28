import React, { useRef, useEffect, useState } from 'react';
import { ArrowLeft, Camera, Edit3 } from 'lucide-react';
import { SCAN_PRESETS } from '../data/mockData';
import { MedicationPlan } from '../types';

interface CameraScanScreenProps {
  onTakePhoto: (extractedPlanData?: Omit<MedicationPlan, 'id' | 'createdAt'>) => void;
  onSkipToManualForm: () => void;
  onBack: () => void;
}

export const CameraScanScreen: React.FC<CameraScanScreenProps> = ({
  onTakePhoto,
  onSkipToManualForm,
  onBack,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [hasCameraAccess, setHasCameraAccess] = useState<boolean | null>(null);

  // Attempt live camera stream
  useEffect(() => {
    let stream: MediaStream | null = null;
    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setHasCameraAccess(true);
          }
        } else {
          setHasCameraAccess(false);
        }
      } catch (err) {
        console.warn('Camera access error or unsupported in environment:', err);
        setHasCameraAccess(false);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleTriggerTakePhoto = () => {
    onTakePhoto(SCAN_PRESETS[0]?.extractedPlan);
  };

  return (
    <div className="fixed inset-0 bg-black text-white z-50 flex flex-col w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto">
      {/* Top Bar */}
      <div className="p-4 flex items-center justify-between bg-black/80 backdrop-blur-md border-b border-white/10 shrink-0">
        <button
          onClick={onBack}
          className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-base font-bold font-heading">Escanear Medicamento</h2>
        </div>
        <div className="w-9" /> {/* Spacer */}
      </div>

      {/* Main Camera Viewport */}
      <div className="flex-1 relative bg-gray-900 flex items-center justify-center overflow-hidden">
        {/* Live Video Feed or Fallback Simulated Viewfinder */}
        {hasCameraAccess ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900 via-slate-900 to-black flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-[#0ee5ba]/10 text-[#0ee5ba] flex items-center justify-center mb-3">
                <Camera className="w-8 h-8 animate-pulse" />
              </div>
              <p className="text-base font-bold text-gray-100">
                Escanea la caja o receta
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Apunta al nombre y dosis de la etiqueta
              </p>
            </div>
          </div>
        )}

        {/* Framing Corner Target Box Overlay */}
        <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-[280px] aspect-[4/3] border-2 border-[#0ee5ba] rounded-2xl relative shadow-[0_0_20px_rgba(14,229,186,0.3)]">
            {/* Target Corners */}
            <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#0ee5ba] rounded-tl-xl" />
            <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#0ee5ba] rounded-tr-xl" />
            <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#0ee5ba] rounded-bl-xl" />
            <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#0ee5ba] rounded-br-xl" />

            {/* Scanning Laser Animation */}
            <div className="w-full h-0.5 bg-[#0ee5ba] absolute top-1/2 left-0 animate-ping opacity-75" />
          </div>
        </div>
      </div>

      {/* Main Bottom CTAs */}
      <div className="bg-black p-5 border-t border-white/10 space-y-3 shrink-0">
        {/* Tomar Foto Button */}
        <button
          onClick={handleTriggerTakePhoto}
          className="w-full bg-[#0ee5ba] hover:bg-[#0bc4a0] text-gray-900 font-bold py-2.5 rounded-full transition-all text-sm shadow-sm active:scale-[0.98] flex items-center justify-center space-x-2"
        >
          <Camera className="w-4 h-4" />
          <span>Tomar foto</span>
        </button>

        {/* Omitir y Llenar a Mano Button */}
        <button
          onClick={onSkipToManualForm}
          className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-full transition-all text-sm flex items-center justify-center space-x-2 border border-white/10 active:scale-[0.98]"
        >
          <Edit3 className="w-4 h-4 text-gray-300" />
          <span>Omitir y llenar a mano</span>
        </button>
      </div>
    </div>
  );
};
