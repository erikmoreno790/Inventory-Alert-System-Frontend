import { useState, useCallback } from "react";
import { AlertCircle, QrCode } from "lucide-react";
import api from "../api";
import Sidebar from "../components/Sidebar";
import ScannerButton from "../components/ScannerButton";
import ScannerViewport from "../components/ScannerViewport";
import RepuestoCard from "../components/RepuestoCard";
import useBarcodeScanner from "../hooks/useBarcodeScanner";
import { toast, ToastContainer } from "react-toastify";

const ScannerPage = () => {
  const [repuesto, setRepuesto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [codigoManual, setCodigoManual] = useState("");
  const [sidebarOpen] = useState(false);

  const token = localStorage.getItem("token");

  // Lógica cuando detecta un código
  const onDetected = useCallback(
    async (codigo) => {
      vibrate(); // vibración móvil
      pulseBorder(); // animación borde verde

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
    },
    [token]
  );

  const { videoRef, isScanning, start, stop } = useBarcodeScanner(onDetected);

  // Efecto de vibración al escanear
  const vibrate = () => {
    if ("vibrate" in navigator) {
      navigator.vibrate([70]); // pequeña vibración
    }
  };

  const handleBuscarManual = async () => {
    if (!codigoManual.trim()) {
      toast.error("Por favor ingresa un código válido");
      return;
    }
    toast.success(`Buscando: ${codigoManual}`);

    setLoading(true);
    setRepuesto(null);
    const token = localStorage.getItem("token");

    try {
      const res = await api.get(`/repuestos/barcode/${codigoManual}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRepuesto(res.data);
      toast.success("Repuesto encontrado");
    } catch {
      toast.error("Repuesto no encontrado");
    } finally {
      setLoading(false);
    }
  };

  // Anima el borde del scanner
  const pulseBorder = () => {
    const frame = document.getElementById("scanner-frame");
    if (!frame) return;

    frame.classList.remove("border-green-400");
    frame.offsetWidth; // reset trick
    frame.classList.add("border-green-400");

    setTimeout(() => {
      frame.classList.remove("border-green-400");
    }, 500);
  };

  return (
    <div className="flex min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <Sidebar />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        } md:ml-64`}
      >
        <main className="p-6 max-w-4xl mx-auto">
          {/* Título */}
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
              <QrCode size={45} className="text-indigo-600" />
              Escáner Central
            </h1>
            <p className="text-lg text-gray-600">
              Escanea un código para ver la información del repuesto
            </p>
          </div>

          {/* Botón iniciar/detener escaneo (solo visible cuando no hay repuesto) */}
          {!repuesto && (
            <div className="flex justify-center mb-4">
              <ScannerButton
                scanning={isScanning}
                onClick={isScanning ? stop : start}
              />
            </div>
          )}

          {/* Código manual */}
          {!repuesto && (
            <div className="mb-4">
              <label className="block mb-1 font-semibold">Código manual</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="border p-2 rounded w-full"
                  placeholder="Escribe el código..."
                  value={codigoManual}
                  onChange={(e) => setCodigoManual(e.target.value)}
                />
                <button
                  onClick={handleBuscarManual}
                  className="bg-blue-500 text-white px-4 rounded"
                >
                  Buscar
                </button>
              </div>
            </div>
          )}

          {/* Vista del escáner — SE OCULTA cuando hay repuesto */}
          {!repuesto && !loading && (
            <div className="flex justify-center mb-4 transition-all duration-300">
              <div
                id="scanner-frame"
                className="transition-all duration-300 border-4 border-transparent rounded-xl"
              >
                <ScannerViewport scanning={isScanning} videoRef={videoRef} />
              </div>
            </div>
          )}

          {/* Cargando */}
          {loading && (
            <div className="text-center py-10">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
              <p className="text-lg mt-4 text-gray-600">Buscando repuesto...</p>
            </div>
          )}

          {/* Resultado: PANEL + botón Escanear otro */}
          {!loading && repuesto && (
            <div className="mt-6 bg-white shadow-lg rounded-lg p-6 animate-fadeIn border border-gray-200">
              <RepuestoCard repuesto={repuesto} />

              <div className="mt-6 flex justify-center">
                <button
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                  onClick={() => {
                    setRepuesto(null);
                    setCodigoManual("");
                    start(); // vuelve a activar el escáner
                  }}
                >
                  Escanear otro repuesto
                </button>
              </div>
            </div>
          )}

          {/* Estado vacío */}
          {!isScanning && !loading && !repuesto && (
            <div className="text-center py-10 text-gray-400">
              <AlertCircle size={70} className="mx-auto mb-4 opacity-30" />
              <p className="text-2xl">Escanea un código para comenzar</p>
            </div>
          )}
        </main>
      </div>

      <ToastContainer position="top-center" theme="colored" />
    </div>
  );
};

export default ScannerPage;
