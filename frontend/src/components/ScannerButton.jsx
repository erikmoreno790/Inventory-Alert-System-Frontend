// src/components/ScannerButton.jsx
import { Camera, CameraOff } from "lucide-react";

export default function ScannerButton({ scanning, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-4 px-10 py-6 rounded-2xl font-bold text-xl text-white shadow-xl transition-all transform hover:scale-105 ${
        scanning
          ? "bg-red-600 hover:bg-red-700"
          : "bg-gradient-to-r from-green-600 to-emerald-600"
      }`}
    >
      {scanning ? <CameraOff size={36} /> : <Camera size={36} />}
      {scanning ? "Detener Escáner" : "Activar Cámara y Escanear"}
    </button>
  );
}
