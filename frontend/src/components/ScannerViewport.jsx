// src/components/ScannerViewport.jsx
import { QrCode } from "lucide-react";

export default function ScannerViewport({ scanning, videoRef }) {
  if (scanning) {
    return (
      <div className="relative max-w-2xl">
        <video
          ref={videoRef}
          className="w-full rounded-2xl shadow-2xl border-8 border-indigo-600"
          autoPlay
          muted
          playsInline
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-96 h-64 border-4 border-red-500 border-dashed rounded-2xl animate-pulse"></div>
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black bg-opacity-80 text-white px-8 py-4 rounded-full text-2xl font-bold animate-pulse">
          Escaneando...
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-20">
      <QrCode size={120} className="mx-auto text-gray-300 mb-6" />
      <p className="text-2xl text-gray-500">
        Haz clic arriba para activar la cámara
      </p>
    </div>
  );
}
