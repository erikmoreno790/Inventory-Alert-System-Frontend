import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";
import { BrowserMultiFormatReader } from "@zxing/library";
import { Scan, QrCode, Save, ArrowLeft, Camera, CameraOff } from "lucide-react";

const InventoryFormPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);
  const [showNewCategory, setShowNewCategory] = useState(false);

  // Refs críticos
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const codeReader = useRef(null); // <-- Este es el que soluciona todo

  const [form, setForm] = useState({
    nombre: "",
    referencia: "",
    categoria: "",
    marca: "",
    compatibilidad: "",
    proveedor: "",
    stock: 0,
    stock_minimo: 0,
    precio_unitario_costo: "",
    precio_unitario_venta: "",
    unidad_medida: "unidad",
    estado: "disponible",
    ubicacion: "",
    codigo_barras: "",
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

  // Cargar repuesto si es edición
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
          compatibilidad: res.data.compatibilidad || "",
          proveedor: res.data.proveedor || "",
          stock: res.data.stock || 0,
          stock_minimo: res.data.stock_minimo || 0,
          precio_unitario_costo: res.data.precio_unitario_costo || "",
          precio_unitario_venta: res.data.precio_unitario_venta || "",
          unidad_medida: res.data.unidad_medida || "unidad",
          estado: res.data.estado || "disponible",
          ubicacion: res.data.ubicacion || "",
          codigo_barras: res.data.codigo_barras || "",
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

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      if (id) {
        await api.put(`/repuestos/${id}`, form, config);
      } else {
        await api.post("/repuestos", form, config);
      }

      navigate("/inventario", {
        state: { message: "Repuesto guardado con éxito" },
      });
    } catch (err) {
      const msg = err.response?.data?.error || "Error al guardar";
      setError(
        msg.includes("Duplicate") || msg.includes("único")
          ? "Ya existe un repuesto con ese código de barras"
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        } md:ml-64`}
      >
        <TopNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="p-6 max-w-7xl mx-auto">
          <div className="mb-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              {id ? "Editar Repuesto" : "Nuevo Repuesto"}
            </h1>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-5 py-3 rounded-lg"
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
            className="bg-white rounded-2xl shadow-xl p-8 grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {/* ESCÁNER */}
            <div className="lg:col-span-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border-2 border-dashed border-blue-300">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <QrCode size={32} />
                  Escanear Código de Barras
                </h3>
                <button
                  type="button"
                  onClick={scanning ? stopScanning : startScanning}
                  className={`flex items-center gap-3 px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                    scanning
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {scanning ? <CameraOff size={24} /> : <Camera size={24} />}
                  {scanning ? "Detener Escáner" : "Activar Cámara"}
                </button>
              </div>

              <div className="flex justify-center">
                {scanning ? (
                  <video
                    ref={videoRef}
                    className="w-full max-w-2xl rounded-xl shadow-2xl border-4 border-blue-600"
                    playsInline
                  />
                ) : form.codigo_barras ? (
                  <div className="text-center p-10 bg-green-100 rounded-xl">
                    <p className="text-3xl font-mono font-bold text-green-800">
                      {form.codigo_barras}
                    </p>
                    <p className="text-green-600 mt-2">Código detectado</p>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 p-10">
                    <Scan size={80} className="mx-auto mb-4 opacity-30" />
                    <p className="text-xl">
                      Haz clic en "Activar Cámara" para escanear
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Campo manual */}
            <div className="lg:col-span-3">
              <label className="block text-gray-700 font-semibold mb-2">
                Código de Barras (o ingresa manualmente)
              </label>
              <input
                type="text"
                name="codigo_barras"
                value={form.codigo_barras}
                onChange={handleChange}
                placeholder="1234567890123"
                className="w-full border-2 border-gray-300 rounded-xl px-5 py-4 text-lg font-mono focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Resto del formulario */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:col-span-3">
              {/* Nombre */}
              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  Nombre *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Referencia
                </label>
                <input
                  type="text"
                  name="referencia"
                  value={form.referencia}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Categoría *
                </label>
                <select
                  name="categoria"
                  value={form.categoria}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "__new__") {
                      setForm((prev) => ({ ...prev, categoria: "" }));
                      setShowNewCategory(true);
                    } else {
                      setShowNewCategory(false);
                      handleChange(e);
                    }
                  }}
                  required
                  className="w-full border rounded-lg px-4 py-3"
                >
                  <option value="">Seleccionar...</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__new__">➕ Agregar nueva categoría</option>
                </select>
              </div>

              {showNewCategory && (
                <div className="mt-3">
                  <label className="block text-gray-700 font-semibold mb-2">
                    Nueva categoría
                  </label>
                  <input
                    type="text"
                    placeholder="Escribe la nueva categoría"
                    className="w-full border rounded-lg px-4 py-3"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const nueva = e.target.value.trim();
                        if (!nueva) return;

                        // Agregar a la lista local
                        setCategorias((prev) => [...prev, nueva]);

                        // Seleccionar automáticamente
                        setForm((prev) => ({ ...prev, categoria: nueva }));

                        // Ocultar el input
                        setShowNewCategory(false);
                      }
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Presiona Enter para agregarla
                  </p>
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  name="marca"
                  value={form.marca}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-gray-700 font-semibold mb-2">
                  Compatibilidad
                </label>
                <input
                  type="text"
                  name="compatibilidad"
                  value={form.compatibilidad}
                  onChange={handleChange}
                  placeholder="Ej: Toyota Hilux 2015-2022"
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Proveedor
                </label>
                <input
                  type="text"
                  name="proveedor"
                  value={form.proveedor}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  name="ubicacion"
                  value={form.ubicacion}
                  onChange={handleChange}
                  placeholder="Estante A-12"
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Stock actual *
                </label>
                <input
                  type="number"
                  name="stock"
                  value={form.stock}
                  onChange={handleChange}
                  required
                  min="0"
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Stock mínimo
                </label>
                <input
                  type="number"
                  name="stock_minimo"
                  value={form.stock_minimo}
                  onChange={handleChange}
                  min="0"
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Precio costo *
                </label>
                <input
                  type="number"
                  name="precio_unitario_costo"
                  value={form.precio_unitario_costo}
                  onChange={handleChange}
                  required
                  step="0.01"
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Precio venta *
                </label>
                <input
                  type="number"
                  name="precio_unitario_venta"
                  value={form.precio_unitario_venta}
                  onChange={handleChange}
                  required
                  step="0.01"
                  className="w-full border rounded-lg px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Unidad de medida
                </label>
                <select
                  name="unidad_medida"
                  value={form.unidad_medida}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                >
                  <option value="unidad">Unidad</option>
                  <option value="par">Par</option>
                  <option value="juego">Juego</option>
                  <option value="kit">Kit</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Estado
                </label>
                <select
                  name="estado"
                  value={form.estado}
                  onChange={handleChange}
                  className="w-full border rounded-lg px-4 py-3"
                >
                  <option value="disponible">Disponible</option>
                  <option value="agotado">Agotado</option>
                  <option value="descontinuado">Descontinuado</option>
                </select>
              </div>
            </div>

            {/* Botón Guardar */}
            <div className="lg:col-span-3 flex justify-end mt-8">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-bold text-xl px-12 py-5 rounded-xl shadow-2xl disabled:opacity-70 transition-all transform hover:scale-105"
              >
                <Save size={28} />
                {loading
                  ? "Guardando..."
                  : id
                  ? "Actualizar Repuesto"
                  : "Guardar Repuesto"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default InventoryFormPage;
