import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EntriesPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // 🔹 ID recibido desde la ruta
  const token = localStorage.getItem("token");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [form, setForm] = useState({
    repuesto_id: "",
    nombre: "",
    referencia: "",
    tipo_entrada: "",
    cantidad: "",
    proveedor: "",
    factura: "",
    observacion: "",
    fecha: "",
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // 🔹 Si se envía un ID desde el detalle, obtener datos del repuesto
  useEffect(() => {
    const fetchRepuestoById = async () => {
      if (!id) return;
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await api.get(`/repuestos/${id}`, config);
        const repuesto = res.data;

        setForm((prev) => ({
          ...prev,
          repuesto_id: repuesto.repuesto_id,
          nombre: repuesto.nombre,
          referencia: repuesto.referencia,
        }));
      } catch (err) {
        console.error("Error cargando repuesto por id:", err);
      }
    };
    fetchRepuestoById();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    try {
      await api.post("/entradas", form, config);
      toast.success("✅ Entrada registrada exitosamente", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      setTimeout(() => navigate("/inventario/movimientos"), 1500);
    } catch (err) {
      console.error(
        "Error registrando entrada:",
        err.response?.data || err.message
      );
      toast.error("❌ Error al registrar la entrada", {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className={`flex-1 transition-all duration-300 
    ${sidebarOpen ? "ml-64" : "ml-0"} md:ml-64`}
      >
        <TopNavbar onToggleSidebar={toggleSidebar} />

        <main className="p-6 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Registrar Entrada
            </h2>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Regresar
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Fecha */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Fecha de entrada
              </label>
              <input
                type="date"
                name="fecha"
                value={form.fecha}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Nombre del repuesto*/}
            <div className="relative md:col-span-2">
              <label className="block text-gray-700 mb-2 font-medium">
                Nombre del repuesto
              </label>
              <input
                type="text"
                value={form.nombre}
                readOnly
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Referencia seleccionada */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Referencia seleccionada
              </label>
              <input
                type="text"
                name="referencia"
                value={form.referencia}
                readOnly
                className="w-full border rounded-lg px-4 py-2 bg-gray-100"
              />
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Cantidad *
              </label>
              <input
                type="number"
                name="cantidad"
                value={form.cantidad}
                onChange={handleChange}
                required
                min={1}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Tipo de entrada */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Tipo de entrada
              </label>
              <select
                name="tipo_entrada"
                value={form.tipo_entrada}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un tipo</option>
                <option value="compra">Compra</option>
                <option value="devolucion">Devolución</option>
                <option value="ajuste">Ajuste</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Proveedor */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Proveedor
              </label>
              <input
                type="text"
                name="proveedor"
                value={form.proveedor}
                onChange={handleChange}
                placeholder="Opcional si es distinto al registrado"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Factura */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Factura / Documento
              </label>
              <input
                type="text"
                name="factura"
                value={form.factura}
                onChange={handleChange}
                placeholder="Número de factura o guía"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Observación */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2 font-medium">
                Observación
              </label>
              <textarea
                name="observacion"
                value={form.observacion}
                onChange={handleChange}
                rows={3}
                placeholder="Detalles de la entrada (ej. lote, vencimiento, condiciones)"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Botón */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg shadow hover:bg-green-700 transition"
              >
                Registrar Entrada
              </button>
            </div>
          </form>
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default EntriesPage;
