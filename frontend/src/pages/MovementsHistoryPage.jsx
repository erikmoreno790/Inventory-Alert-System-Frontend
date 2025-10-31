// src/pages/MovementsHistory.jsx
import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const MovementsHistory = () => {
  const token = localStorage.getItem("token");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [movements, setMovements] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);

  // 🔹 Filtros persistentes (se cargan desde sessionStorage)
  const [filters, setFilters] = useState(() => {
    const saved = sessionStorage.getItem("movementsFilters");
    return (
      JSON.parse(saved) || {
        producto: "",
        tipo: "",
        motivo: "",
        categoria: "",
        factura: "",
        fechaInicio: "",
        fechaFin: "",
      }
    );
  });

  // 🔹 Paginación persistente
  const [currentPage, setCurrentPage] = useState(() => {
    const saved = sessionStorage.getItem("movementsPage");
    return saved ? parseInt(saved) : 1;
  });

  const itemsPerPage = 10;

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 🔹 Guardar filtros y página en sessionStorage
  useEffect(() => {
    sessionStorage.setItem("movementsFilters", JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    sessionStorage.setItem("movementsPage", currentPage);
  }, [currentPage]);

  // 🔹 Cargar historial de movimientos
  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const [movimientosRes, categoriasRes] = await Promise.all([
          api.get("/repuestos/movimientos", config),
          api.get("/repuestos/categorias/lista", config),
        ]);
        const res = movimientosRes.data;
        const categorias = categoriasRes.data;

        // 🔹 Normalizar + eliminar duplicados por ID
        const mapped = res.map((m) => ({
          id: `${m.tipo_movimiento}-${m.movimiento_id}`,
          fecha: m.fecha,
          categoria: m.categoria || "Sin categoría",
          producto: m.repuesto || "Desconocido",
          tipo: m.tipo_movimiento,
          motivo: m.subtipo,
          cantidad: m.cantidad,
          referencia: m.referencia || "N/A",
          factura: m.factura || "",
        }));

        const unique = Array.from(
          new Map(mapped.map((m) => [m.id, m])).values()
        );

        setMovements(unique);
        setCategorias(categorias);
        setFilteredMovements(unique);
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
    setCurrentPage(1); // Reiniciar a la primera página al filtrar
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
    //Filtro exacto de categoria
    if (filters.categoria) {
      result = result.filter((m) => m.categoria === filters.categoria);
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

  // 🔹 Paginación
  const totalPages = Math.ceil(filteredMovements.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredMovements.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // 🔹 Paginación truncada (por ejemplo: 1 … 4 5 6 … 10)
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    for (
      let i = Math.max(1, currentPage - delta);
      i <= Math.min(totalPages, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (range[0] > 2) range.unshift("...");
    if (range[0] !== 1) range.unshift(1);
    if (range[range.length - 1] < totalPages - 1) range.push("...");
    if (range[range.length - 1] !== totalPages) range.push(totalPages);

    return range;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className={`flex-1 transition-all duration-300 
    ${sidebarOpen ? "ml-64" : "ml-0"} md:ml-64`}
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
            <select
              name="motivo"
              value={filters.motivo}
              onChange={handleFilterChange}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="compra">Compra</option>
              <option value="venta">Venta</option>
              <option value="devolucion">Devolución</option>
              <option value="ajuste">Ajuste</option>
              <option value="otro">Otro</option>
            </select>

            <select
              name="categoria"
              value={filters.categoria}
              onChange={handleFilterChange}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
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
                  <th className="px-4 py-2 text-left">Categoría</th>
                  <th className="px-4 py-2 text-left">Producto</th>
                  <th className="px-4 py-2 text-left">Tipo</th>
                  <th className="px-4 py-2 text-left">Motivo</th>
                  <th className="px-4 py-2 text-left">Cantidad</th>
                  <th className="px-4 py-2 text-left">Referencia</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.length > 0 ? (
                  paginatedData.map((m) => (
                    <tr key={m.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">
                        {new Date(m.fecha).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">{m.categoria}</td>
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
                      <td className="px-4 py-2">{m.referencia}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-500 py-6">
                      No se encontraron movimientos.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 🔹 Controles de paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
              >
                ◀
              </button>

              {getVisiblePages().map((page, idx) =>
                page === "..." ? (
                  <span key={idx} className="px-2">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-gray-200 rounded-lg disabled:opacity-50"
              >
                ▶
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MovementsHistory;
