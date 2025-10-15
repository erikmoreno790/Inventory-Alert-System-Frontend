import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EntryFormPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [repuestos, setRepuestos] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchRef, setSearchRef] = useState("");

  const [form, setForm] = useState({
    repuesto_id: "",
    referencia: "",
    tipo_entrada: "",
    cantidad: "",
    proveedor: "",
    factura: "",
    observacion: "",
    fecha: "",
  });

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // 🔹 Cargar repuestos
  useEffect(() => {
    const fetchRepuestos = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await api.get("/repuestos", config);
        setRepuestos(res.data);
      } catch (err) {
        console.error("Error cargando repuestos:", err);
      }
    };
    fetchRepuestos();
  }, [token]);

  // 🔹 Filtrar repuestos según el texto
  const filteredRepuestos = repuestos.filter((r) =>
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      setTimeout(() => navigate("/historial-repuestos/entradas-salidas"), 1500);
    } catch (err) {
      console.error("Error registrando entrada:", err.response?.data || err.message);
      toast.error("❌ Error al registrar la entrada", {
        position: "top-right",
        autoClose: 4000,
        theme: "colored",
      });
    }
  };

  // 🔹 Buscar por referencia
  const handleSearchByReference = () => {
    const found = repuestos.find(
      (r) => r.codigo.toLowerCase() === searchRef.toLowerCase()
    );

    if (found) {
      setForm((prev) => ({
        ...prev,
        repuesto_id: found.repuesto_id,
        referencia: found.codigo,
      }));
      toast.success(`🔍 Repuesto encontrado: ${found.nombre}`, {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });
      setShowModal(false);
    } else {
      toast.error("❌ No se encontró ningún repuesto con esa referencia", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className={`flex-1 ${sidebarOpen ? "ml-64" : ""} transition-all duration-300`}
      >
        <TopNavbar onToggleSidebar={toggleSidebar} />
        <main className="p-6 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">Registrar Entrada</h2>
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
              />
            </div>

            {/* Repuesto con búsqueda dinámica */}
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2 font-medium">
                Buscar repuesto por nombre
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  placeholder="Escriba el nombre del repuesto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Buscar por referencia
                </button>
              </div>

              <select
                name="repuesto_id"
                value={form.repuesto_id}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione un repuesto</option>
                {filteredRepuestos.length > 0 ? (
                  filteredRepuestos.map((r) => (
                    <option key={r.repuesto_id} value={r.repuesto_id}>
                      {r.nombre} ({r.codigo})
                    </option>
                  ))
                ) : (
                  <option disabled>No se encontraron repuestos</option>
                )}
              </select>
            </div>

            {/* Cantidad */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">Cantidad *</label>
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
              <label className="block text-gray-700 mb-2 font-medium">Proveedor</label>
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
              <label className="block text-gray-700 mb-2 font-medium">Observación</label>
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

      {/* 🔹 Modal Buscar por referencia */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Buscar repuesto por referencia
            </h3>
            <input
              type="text"
              placeholder="Ingrese la referencia exacta..."
              value={searchRef}
              onChange={(e) => setSearchRef(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleSearchByReference}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
              >
                Buscar
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default EntryFormPage;
