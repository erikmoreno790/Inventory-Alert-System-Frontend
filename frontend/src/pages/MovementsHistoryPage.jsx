// src/pages/MovementsHistory.jsx
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const MovementsHistory = () => {
  const token = localStorage.getItem("token");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [movements, setMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);

  // Filtros
  const [filters, setFilters] = useState({
    producto: "",
    tipo: "",
    motivo: "",
    factura: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 🔹 Cargar historial de movimientos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await api.get("/repuestos/movimientos", config);

        // Normalizamos los datos para la tabla
        const mapped = res.data.map((m) => ({
          id: `${m.tipo_movimiento}-${m.movimiento_id}`,
          fecha: m.fecha,
          producto: m.repuesto || "Desconocido",
          tipo: m.tipo_movimiento,
          motivo: m.subtipo,
          cantidad: m.cantidad,
          destino: m.contraparte || "-",
          factura: m.factura || "",
          nombre_usuario: m.usuario || "Desconocido",
        }));

        setMovements(mapped);
        setFilteredMovements(mapped);
      } catch (err) {
        console.error("Error cargando movimientos:", err);
      }
    };

    fetchData();
  }, [token]);

  // 🔹 Manejo de cambios en filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Aplicar filtros
  useEffect(() => {
    let result = movements;

    if (filters.producto) {
      result = result.filter((m) =>
        m.producto.toLowerCase().includes(filters.producto.toLowerCase())
      );
    }
    if (filters.tipo) {
      result = result.filter((m) => m.tipo === filters.tipo);
    }
    if (filters.motivo) {
      result = result.filter((m) =>
        m.motivo?.toLowerCase().includes(filters.motivo.toLowerCase())
      );
    }
    if (filters.factura) {
      result = result.filter((m) =>
        m.factura?.toLowerCase().includes(filters.factura.toLowerCase())
      );
    }
    if (filters.fechaInicio) {
      result = result.filter(
        (m) => new Date(m.fecha) >= new Date(filters.fechaInicio)
      );
    }
    if (filters.fechaFin) {
      result = result.filter(
        (m) => new Date(m.fecha) <= new Date(filters.fechaFin)
      );
    }

    setFilteredMovements(result);
  }, [filters, movements]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : ""
        } transition-all duration-300`}
      >
        <TopNavbar onToggleSidebar={toggleSidebar} />

        <main className="p-6 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">
            Historial de Movimientos
          </h2>

          {/* 🔹 Filtros */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <input
              type="text"
              name="producto"
              placeholder="Buscar por producto"
              value={filters.producto}
              onChange={handleFilterChange}
              className="border rounded-lg px-3 py-2"
            />
            <select
              name="tipo"
              value={filters.tipo}
              onChange={handleFilterChange}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="Entrada">Entrada</option>
              <option value="Salida">Salida</option>
            </select>
            <input
              type="text"
              name="motivo"
              placeholder="Buscar por motivo"
              value={filters.motivo}
              onChange={handleFilterChange}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              name="factura"
              placeholder="Buscar por factura"
              value={filters.factura}
              onChange={handleFilterChange}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="date"
              name="fechaInicio"
              value={filters.fechaInicio}
              onChange={handleFilterChange}
              className="border rounded-lg px-3 py-2"
            />
            <input
              type="date"
              name="fechaFin"
              value={filters.fechaFin}
              onChange={handleFilterChange}
              className="border rounded-lg px-3 py-2"
            />
          </div>

          {/* 🔹 Tabla */}
          <div className="bg-white rounded-xl shadow-md overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="px-4 py-2 text-left">Fecha</th>
                  <th className="px-4 py-2 text-left">Producto</th>
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-left">Motivo</th>
                  <th className="px-4 py-2 text-left">Cantidad</th>
                  <th className="px-4 py-2 text-left">Destino/Proveedor</th>
                  <th className="px-4 py-2 text-left">Usuario</th>
                </tr>
              </thead>
              <tbody>
                {filteredMovements.length > 0 ? (
                  filteredMovements.map((m) => (
                    <tr key={m.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">
                        {new Date(m.fecha).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">{m.producto}</td>
                      <td
                        className={`px-4 py-2 font-semibold ${
                          m.tipo === "Entrada"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {m.tipo}
                      </td>
                      <td className="px-4 py-2">{m.motivo}</td>
                      <td className="px-4 py-2">{m.cantidad}</td>
                      <td className="px-4 py-2">{m.destino}</td>
                      <td className="px-4 py-2">{m.nombre_usuario}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-6">
                      No se encontraron movimientos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MovementsHistory;
