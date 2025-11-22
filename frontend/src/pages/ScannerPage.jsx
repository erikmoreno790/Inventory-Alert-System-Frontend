// src/pages/ScannerPage.jsx
import { useState, useCallback } from "react";
import { AlertCircle, QrCode } from "lucide-react";
import api from "../api";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import ScannerButton from "../components/ScannerButton";
import ScannerViewport from "../components/ScannerViewport";
import RepuestoCard from "../components/RepuestoCard";
import useBarcodeScanner from "../hooks/useBarcodeScanner";
import { toast, ToastContainer } from "react-toastify";

const ScannerPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [repuesto, setRepuesto] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Lógica cuando detecta un código
  const onDetected = useCallback(async (codigo) => {
    toast.success(`Escaneado: ${codigo}`);

    setLoading(true);
    setRepuesto(null);

    try {
      const res = await api.get(`/repuestos/barcode/${codigo}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRepuesto(res.data);
      toast.success("Repuesto encontrado");
    } catch {
      toast.error("Repuesto no encontrado");
    } finally {
      setLoading(false);
    }
  }, []);

  const { videoRef, isScanning, start, stop } = useBarcodeScanner(onDetected);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"} md:ml-64`}>
        <TopNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-6 max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-5xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-4">
              <QrCode size={60} className="text-indigo-600" />
              Escáner Central
            </h1>
            <p className="text-xl text-gray-600">
              Escanea cualquier código de barras para gestionar el repuesto al instante
            </p>
          </div>

          {/* Botón */}
          <div className="flex justify-center mb-8">
            <ScannerButton scanning={isScanning} onClick={isScanning ? stop : start} />
          </div>

          {/* Vista del escáner */}
          <div className="flex justify-center mb-10">
            <ScannerViewport scanning={isScanning} videoRef={videoRef} />
          </div>

          {/* Cargando */}
          {loading && (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
              <p className="text-xl mt-6 text-gray-600">Buscando repuesto...</p>
            </div>
          )}

          {/* Resultado */}
          {!loading && repuesto && <RepuestoCard repuesto={repuesto} />}

          {/* Estado vacío */}
          {!isScanning && !loading && !repuesto && (
            <div className="text-center py-20 text-gray-400">
              <AlertCircle size={100} className="mx-auto mb-6 opacity-30" />
              <p className="text-3xl">Escanea un código para comenzar</p>
            </div>
          )}
        </main>
      </div>

      <ToastContainer position="top-center" theme="colored" />
    </div>
  );
};

export default ScannerPage;
