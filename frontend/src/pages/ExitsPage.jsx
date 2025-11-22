import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Camera, CameraOff, QrCode } from "lucide-react";

const ExitsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scanning, setScanning] = useState(false);

  const [form, setForm] = useState({
    repuesto_id: "",
    nombre: "",
    referencia: "",
    tipo_salida: "",
    cantidad: "",
    destino: "",
    factura: "",
    observacion: "",
    fecha: new Date().toISOString().split("T")[0],
  });

  // Refs críticos – SOLUCIÓN AL PROBLEMA
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const codeReader = useRef(null); // ← Este es el que arregla todo

  // Inicializar el lector UNA SOLA VEZ (evita StrictMode bug)
  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();

    return () => {
      codeReader.current?.reset();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Cargar repuesto si viene por ID
  useEffect(() => {
    if (!id || !token) return;

    const fetchRepuesto = async () => {
      try {
        const res = await api.get(`/repuestos/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const r = res.data;
        setForm((prev) => ({
          ...prev,
          repuesto_id: r.repuesto_id,
          nombre: r.nombre,
          referencia: r.referencia || "",
        }));
        toast.success(`Repuesto cargado: ${r.nombre}`);
      } catch (err) {
        toast.error("Error al cargar el repuesto");
      }
    };
    fetchRepuesto();
  }, [id, token]);

  // BUSCAR POR CÓDIGO DE BARRAS
  const fetchRepuestoByBarcode = async (barcode) => {
    if (!barcode.trim()) return;

    try {
      const res = await api.get(`/barcode/${barcode.trim()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const repuesto = res.data;
      setForm((prev) => ({
        ...prev,
        repuesto_id: repuesto.repuesto_id,
        nombre: repuesto.nombre,
        referencia: repuesto.referencia || "",
      }));

      toast.success(`Encontrado: ${repuesto.nombre}`, {
        position: "top-center",
        autoClose: 3000,
      });
    } catch (err) {
      console.error(err);
      toast.error("Repuesto no encontrado con ese código", {
        position: "top-center",
        autoClose: 4000,
      });
    }
  };

  // INICIAR ESCÁNER
  const startScanning = async () => {
    if (scanning) return;

    try {
      setScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      streamRef.current = stream;
      await video.play();

      codeReader.current.decodeFromVideoDevice(null, video, (result, err) => {
        if (result) {
          const codigo = result.getText().trim();
          toast.success(`Escaneado: ${codigo}`, { autoClose: 2000 });
          stopScanning();
          fetchRepuestoByBarcode(codigo);
        }
        if (err && !(err instanceof Error)) {
          // Ignorar errores normales de "no encontrado"
        }
      });

      toast.info("Apunta al código de barras", { autoClose: 3000 });
    } catch (err) {
      setScanning(false);
      if (err.name === "NotAllowedError") {
        toast.error("Permiso denegado a la cámara. Recarga y permite el acceso.", { autoClose: 8000 });
      } else {
        toast.error("Error al abrir cámara: " + err.message);
      }
    }
  };

  // DETENER ESCÁNER
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    codeReader.current?.reset();
    setScanning(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.repuesto_id) {
      toast.error("Debe escanear o seleccionar un repuesto");
      return;
    }
    if (!form.cantidad || form.cantidad < 1) {
      toast.error("Ingresa una cantidad válida");
      return;
    }

    try {
      await api.post("/salidas", form, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Salida registrada correctamente");
      setTimeout(() => navigate("/inventario/movimientos"), 1500);
    } catch (err) {
      toast.error("Error al registrar la salida");
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"} md:ml-64`}>
        <TopNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-6 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Registrar Salida</h2>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-5 py-3 rounded-lg transition"
            >
              Regresar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8">

            {/* ESCÁNER DE CÓDIGO DE BARRAS */}
            <div className="mb-10 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border-2 border-dashed border-indigo-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <QrCode size={32} />
                  Escanear Repuesto
                </h3>
                <button
                  type="button"
                  onClick={scanning ? stopScanning : startScanning}
                  className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform hover:scale-105 ${
                    scanning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {scanning ? <CameraOff size={26} /> : <Camera size={26} />}
                  {scanning ? "Detener" : "Escanear con Cámara"}
                </button>
              </div>

              <div className="flex justify-center">
                {scanning ? (
                  <div className="relative max-w-lg">
                    <video
                      ref={videoRef}
                      className="w-full rounded-xl shadow-2xl border-4 border-green-500"
                      playsInline
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-80 h-48 border-4 border-red-500 border-dashed rounded-lg"></div>
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-80 text-white px-6 py-3 rounded-full text-lg font-medium">
                      Escaneando...
                    </div>
                  </div>
                ) : form.nombre ? (
                  <div className="text-center p-10 bg-green-100 rounded-2xl border-4 border-green-500">
                    <p className="text-2xl font-bold text-green-800">{form.nombre}</p>
                    <p className="text-green-600 mt-2">Listo para salida</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 p-10">
                    <QrCode size={80} className="mx-auto mb-4 opacity-40" />
                    <p className="text-xl">Escanea un código para comenzar</p>
                  </div>
                )}
              </div>
            </div>

            {/* Formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-medium mb-2">Repuesto</label>
                <input
                  type="text"
                  value={form.nombre}
                  readOnly
                  placeholder="Escanea un código de barras"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 bg-gray-50 font-medium"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Referencia</label>
                <input
                  type="text"
                  value={form.referencia}
                  readOnly
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Cantidad *</label>
                <input
                  type="number"
                  name="cantidad"
                  value={form.cantidad}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Tipo de salida *</label>
                <select
                  name="tipo_salida"
                  value={form.tipo_salida}
                  onChange={handleChange}
                  required
                  className="w-full border-2 rounded-lg px-4 py-3"
                >
                  <option value="">Seleccionar</option>
                  <option value="venta">Venta</option>
                  <option value="devolucion">Devolución</option>
                  <option value="ajuste">Ajuste</option>
                  <option value="prestamo">Préstamo</option>
                  <option value="otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Destino / Cliente</label>
                <input
                  type="text"
                  name="destino"
                  value={form.destino}
                  onChange={handleChange}
                  placeholder="Ej. Taller Pérez"
                  className="w-full border-2 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Factura / Guía</label>
                <input
                  type="text"
                  name="factura"
                  value={form.factura}
                  onChange={handleChange}
                  className="w-full border-2 rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Fecha</label>
                <input
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  required
                  className="w-full border-2 rounded-lg px-4 py-3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-medium mb-2">Observación</label>
                <textarea
                  name="observacion"
                  value={form.observacion}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Notas..."
                  className="w-full border-2 rounded-lg px-4 py-3"
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold text-xl px-12 py-5 rounded-xl shadow-2xl transition transform hover:scale-105"
                >
                  Registrar Salida
                </button>
              </div>
            </div>
          </form>
        </main>
      </div>

      <ToastContainer position="top-center" />
    </div>
  );
};

export default ExitsPage;