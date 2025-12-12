import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../api";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Scan, QrCode, Save, ArrowLeft, Camera, CameraOff } from "lucide-react";
import AlertMessage from "../components/AlertMessage";
import { getTodayLocal, toInputDateFormat } from "../utils/dateUtils";

const EditRepuestoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [mostrarInputCategoria, setMostrarInputCategoria] = useState(false);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "", show: false });

  // Refs para el escáner
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const codeReader = useRef(null);

  const [form, setForm] = useState({
    nombre: "",
    referencia: "",
    categoria: "",
    marca: "",
    proveedor: "",
    precio_unitario_costo: "",
    precio_unitario_venta: "",
    codigo_barras: "",
    fecha: getTodayLocal(),
    nueva_cantidad: "",
  });

  // Inicializar el lector ZXing UNA SOLA VEZ
  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();

    return () => {
      codeReader.current?.reset();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Cargar categorías
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await api.get("/repuestos/categorias/lista", config);
        setCategorias(res.data);
      } catch (err) {
        console.error("Error cargando categorías:", err);
      }
    };
    fetchCategorias();
  }, [token]);

  // Cargar datos del repuesto existente
  useEffect(() => {
    if (!id) return;

    const fetchRepuesto = async () => {
      setLoading(true);
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await api.get(`/repuestos/${id}`, config);
        setForm({
          nombre: res.data.nombre || "",
          referencia: res.data.referencia || "",
          categoria: res.data.categoria || "",
          marca: res.data.marca || "",
          proveedor: res.data.proveedor || "",
          precio_unitario_costo: res.data.precio_unitario_costo || "",
          precio_unitario_venta: res.data.precio_unitario_venta || "",
          codigo_barras: res.data.codigo_barras || "",
          fecha: res.data.fecha
            ? toInputDateFormat(res.data.fecha)
            : getTodayLocal(),
          nueva_cantidad: res.data.stock || "",
        });
      } catch (err) {
        console.error("Error cargando repuesto:", err);
        setError("Error al cargar el repuesto");
      } finally {
        setLoading(false);
      }
    };

    fetchRepuesto();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Manejar cambio de categoría
  const handleCategoriaChange = (e) => {
    const valor = e.target.value;
    if (valor === "__agregar_otra__") {
      setMostrarInputCategoria(true);
      setForm((prev) => ({ ...prev, categoria: "" }));
    } else {
      setMostrarInputCategoria(false);
      setForm((prev) => ({ ...prev, categoria: valor }));
    }
  };

  // Agregar nueva categoría a la lista
  const agregarNuevaCategoria = () => {
    if (nuevaCategoria.trim() && !categorias.includes(nuevaCategoria.trim())) {
      const nuevaCategoriaFormateada = nuevaCategoria.trim();
      setCategorias([...categorias, nuevaCategoriaFormateada]);
      setForm((prev) => ({ ...prev, categoria: nuevaCategoriaFormateada }));
      setNuevaCategoria("");
      setMostrarInputCategoria(false);
    }
  };

  // ESCÁNER: Iniciar
  const startScanning = async () => {
    if (scanning) return;

    try {
      setError("");
      setScanning(true);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      const video = videoRef.current;
      if (!video) return;

      video.srcObject = stream;
      streamRef.current = stream;
      await video.play();

      // Usar el reader creado una sola vez
      codeReader.current.decodeFromVideoDevice(null, video, (result, err) => {
        if (result) {
          const codigo = result.getText().trim();
          setForm((prev) => ({ ...prev, codigo_barras: codigo }));
          stopScanning();
          alert(`¡Código escaneado!\n${codigo}`);
        }
        if (err && !(err instanceof Error)) {
          // Ignorar NotFoundException (es normal mientras busca)
        }
      });
    } catch (err) {
      setScanning(false);
      setError(
        err.name === "NotAllowedError"
          ? "Permiso denegado a la cámara. Recarga y permite el acceso."
          : "Error al abrir la cámara: " + err.message
      );
    }
  };

  // ESCÁNER: Detener
  const stopScanning = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    codeReader.current?.reset();
    setScanning(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!form.nombre.trim()) {
      setError("El nombre es obligatorio");
      setLoading(false);
      return;
    }

    if (!form.categoria.trim()) {
      setError("La categoría es obligatoria");
      setLoading(false);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      // Preparar datos asegurando valores numéricos válidos
      const dataToSend = {
        ...form,
        precio_unitario_costo: form.precio_unitario_costo
          ? parseFloat(form.precio_unitario_costo)
          : 0,
        precio_unitario_venta: form.precio_unitario_venta
          ? parseFloat(form.precio_unitario_venta)
          : 0,
        nueva_cantidad: form.nueva_cantidad
          ? parseInt(form.nueva_cantidad)
          : undefined,
      };

      await api.put(`/repuestos/${id}`, dataToSend, config);

      setAlert({
        type: "success",
        message: "Repuesto actualizado exitosamente",
        show: true,
      });

      setTimeout(() => {
        navigate("/inventario");
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.error || "Error al actualizar";
      const errorMessage =
        msg.includes("Duplicate") ||
        msg.includes("único") ||
        msg.includes("duplicate")
          ? "Ya existe un repuesto con ese código de barras"
          : msg;
      setError(errorMessage);
      setAlert({
        type: "error",
        message: errorMessage,
        show: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <main className="p-6 max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              Editar Repuesto
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <ArrowLeft size={20} />
              Regresar
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg p-8"
          >
            {/* ESCÁNER */}
            <div className="bg-linear-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <QrCode size={24} />
                  Escanear Código de Barras
                </h2>
                <button
                  type="button"
                  onClick={scanning ? stopScanning : startScanning}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    scanning
                      ? "bg-red-500 hover:bg-red-600 focus:ring-red-500"
                      : "bg-green-500 hover:bg-green-600 focus:ring-green-500"
                  }`}
                >
                  {scanning ? <CameraOff size={20} /> : <Camera size={20} />}
                  {scanning ? "Detener" : "Activar Cámara"}
                </button>
              </div>

              <div className="flex justify-center">
                {scanning ? (
                  <video
                    ref={videoRef}
                    className="w-full max-w-2xl rounded-lg shadow-lg border-2 border-blue-500"
                    playsInline
                  />
                ) : form.codigo_barras ? (
                  <div className="text-center p-8 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-2xl font-mono font-bold text-green-800">
                      {form.codigo_barras}
                    </p>
                    <p className="text-green-600 mt-2 text-sm">
                      Código detectado
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 p-8">
                    <Scan size={64} className="mx-auto mb-3 opacity-30" />
                    <p className="text-base">
                      Haz clic en "Activar Cámara" para escanear
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Campo manual */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Código de Barras (manual)
              </label>
              <input
                type="text"
                name="codigo_barras"
                value={form.codigo_barras}
                onChange={handleChange}
                placeholder="1234567890123"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm font-mono focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              />
            </div>

            {/* Campo Fecha */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha *
              </label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
              />
            </div>

            {/* Formulario principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Nombre */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Repuesto *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                />
              </div>

              {/* Referencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referencia
                </label>
                <input
                  type="text"
                  name="referencia"
                  value={form.referencia}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                />
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                {mostrarInputCategoria ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={nuevaCategoria}
                      onChange={(e) => setNuevaCategoria(e.target.value)}
                      placeholder="Nueva categoría..."
                      className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          agregarNuevaCategoria();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={agregarNuevaCategoria}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMostrarInputCategoria(false);
                        setNuevaCategoria("");
                      }}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <select
                    name="categoria"
                    value={form.categoria}
                    onChange={handleCategoriaChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  >
                    <option value="">Seleccionar...</option>
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                    <option value="__agregar_otra__">
                      ➕ Agregar nueva categoría
                    </option>
                  </select>
                )}
              </div>

              {/* Marca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  name="marca"
                  value={form.marca}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                />
              </div>

              {/* Proveedor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proveedor
                </label>
                <input
                  type="text"
                  name="proveedor"
                  value={form.proveedor}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                />
              </div>

              {/* Precio costo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Costo *
                </label>
                <input
                  type="number"
                  name="precio_unitario_costo"
                  value={form.precio_unitario_costo}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                />
              </div>

              {/* Precio venta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio Venta *
                </label>
                <input
                  type="number"
                  name="precio_unitario_venta"
                  value={form.precio_unitario_venta}
                  onChange={handleChange}
                  required
                  step="0.01"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                />
              </div>

              {/* Cantidad en Stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad en Stock *
                </label>
                <input
                  type="number"
                  name="nueva_cantidad"
                  value={form.nueva_cantidad}
                  onChange={handleChange}
                  required
                  step="1"
                  min="0"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Los cambios se registrarán automáticamente como "Ajuste
                  posterior"
                </p>
              </div>
            </div>

            {/* Botón Guardar */}
            <div className="flex justify-end mt-6 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <Save size={20} />
                {loading ? "Guardando..." : "Actualizar Repuesto"}
              </button>
            </div>
          </form>
        </main>
      </div>
      {alert.show && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}
    </div>
  );
};

export default EditRepuestoPage;
