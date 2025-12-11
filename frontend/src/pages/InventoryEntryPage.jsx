import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../api";
import {
  ArrowLeft,
  Save,
  Package2,
  TrendingUp,
  FileText,
  User,
  Calendar,
  Hash,
} from "lucide-react";
import AlertMessage from "../components/AlertMessage";

const InventoryEntryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "", show: false });

  const [form, setForm] = useState({
    cantidad: "",
    motivo: "compra",
    fecha: new Date().toISOString().split("T")[0],
    proveedor: "",
    factura: "",
    observacion: "",
  });

  const motivosEntrada = [
    { value: "compra", label: "Compra" },
    { value: "devolucion", label: "Devolución" },
    { value: "ajuste", label: "Ajuste" },
    { value: "otro", label: "Otro" },
  ];

  // Cargar datos del repuesto
  useEffect(() => {
    const fetchRepuesto = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await api.get(`/repuestos/${id}`, config);
        setProducto(res.data);
      } catch (error) {
        console.error("Error cargando repuesto:", error);
        setAlert({
          type: "error",
          message: "Error al cargar el repuesto",
          show: true,
        });
        setTimeout(() => navigate("/inventario"), 2000);
      } finally {
        setLoading(false);
      }
    };
    fetchRepuesto();
  }, [id, token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    if (!form.cantidad || parseInt(form.cantidad) <= 0) {
      setAlert({
        type: "error",
        message: "La cantidad debe ser mayor a 0",
        show: true,
      });
      setSaving(false);
      return;
    }

    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // Crear el movimiento de entrada
      const movimientoData = {
        repuesto_id: id,
        tipo: "Entrada",
        motivo: form.motivo,
        cantidad: parseInt(form.cantidad),
        fecha: new Date(form.fecha),
        proveedor: form.proveedor || null,
        factura: form.factura || null,
        observacion: form.observacion || null,
      };

      await api.post("/repuestos/movimientos", movimientoData, config);

      setAlert({
        type: "success",
        message: "Entrada registrada exitosamente",
        show: true,
      });

      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("Error registrando entrada:", error);
      setAlert({
        type: "error",
        message: error.response?.data?.error || "Error al registrar la entrada",
        show: true,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 md:ml-64">
          <main className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Cargando...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 md:ml-64">
          <main className="p-6 max-w-7xl mx-auto">
            <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto">
              <p className="text-lg font-semibold text-gray-800">
                Repuesto no encontrado
              </p>
              <button
                onClick={() => navigate("/inventario")}
                className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Volver a Inventario
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <main className="p-6 max-w-4xl mx-auto">
          {/* Header */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition text-sm font-medium mb-6"
          >
            <ArrowLeft size={16} />
            Volver
          </button>

          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
            {/* Título */}
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
              <div className="bg-green-100 text-green-700 p-3 rounded-xl">
                <TrendingUp size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  Registrar Entrada
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Agregar unidades al inventario
                </p>
              </div>
            </div>

            {/* Información del Repuesto */}
            <div className="bg-blue-50 rounded-lg p-5 mb-6 border border-blue-200">
              <h2 className="text-lg font-semibold text-blue-800 mb-3 flex items-center gap-2">
                <Package2 size={20} />
                Información del Repuesto
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Nombre</p>
                    <p className="font-semibold text-gray-800">
                      {producto.nombre}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Hash size={16} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Referencia</p>
                    <p className="font-semibold font-mono text-gray-800">
                      {producto.referencia}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Package2 size={16} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Stock Actual</p>
                    <p className="font-semibold text-green-700">
                      {producto.stock} unidades
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <div>
                    <p className="text-xs text-gray-600">Categoría</p>
                    <p className="font-semibold text-gray-800">
                      {producto.categoria}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cantidad */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad a Ingresar *
                </label>
                <input
                  type="number"
                  name="cantidad"
                  value={form.cantidad}
                  onChange={handleChange}
                  required
                  min="1"
                  step="1"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg font-semibold focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                  placeholder="Ej: 10"
                />
              </div>

              {/* Motivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motivo de Entrada *
                </label>
                <select
                  name="motivo"
                  value={form.motivo}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                >
                  {motivosEntrada.map((motivo) => (
                    <option key={motivo.value} value={motivo.value}>
                      {motivo.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha *
                </label>
                <input
                  type="date"
                  name="fecha"
                  value={form.fecha}
                  onChange={handleChange}
                  required
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
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
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                  placeholder="Nombre del proveedor (opcional)"
                />
              </div>

              {/* Factura */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Factura
                </label>
                <input
                  type="text"
                  name="factura"
                  value={form.factura}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors"
                  placeholder="Ej: FAC-12345 (opcional)"
                />
              </div>

              {/* Observación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones
                </label>
                <textarea
                  name="observacion"
                  value={form.observacion}
                  onChange={handleChange}
                  rows="4"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-colors resize-none"
                  placeholder="Notas adicionales sobre esta entrada (opcional)"
                />
              </div>

              {/* Botones */}
              <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-3 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  <Save size={20} />
                  {saving ? "Guardando..." : "Registrar Entrada"}
                </button>
              </div>
            </form>
          </div>
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

export default InventoryEntryPage;
