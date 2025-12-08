/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import {
  Search,
  Filter,
  X,
  AlertCircle,
  ArrowUpDown,
  Calendar,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import { useNavigate } from "react-router-dom";

const MovementsHistory = () => {
  const token = localStorage.getItem("token");
  const [movements, setMovements] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // 🔹 Paginación del servidor
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 50;

  const [filters, setFilters] = useState({
    producto: "",
    tipo: "",
    motivo: "",
    categoria: "",
    fechaInicio: "",
    fechaFin: "",
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // 🔹 Cargar categorías al iniciar
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await api.get("/repuestos/categorias/lista", config);
        setCategorias(response.data || []);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      }
    };
    if (token) fetchCategorias();
  }, [token]);

  // 🔹 Función para cargar movimientos con filtros del servidor
  const fetchMovements = async (page = 1, currentFilters = filters) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Construir parámetros con filtros
      const params = {
        page: page,
        limit: itemsPerPage,
      };

      // Agregar filtros solo si tienen valor
      if (currentFilters.producto) params.producto = currentFilters.producto;
      if (currentFilters.tipo) params.tipo = currentFilters.tipo;
      if (currentFilters.motivo) params.motivo = currentFilters.motivo;
      if (currentFilters.categoria) params.categoria = currentFilters.categoria;
      if (currentFilters.fechaInicio)
        params.fechaInicio = currentFilters.fechaInicio;
      if (currentFilters.fechaFin) params.fechaFin = currentFilters.fechaFin;

      const config = { headers: { Authorization: `Bearer ${token}` }, params };
      const response = await api.get("/repuestos/movimientos", config);

      // El backend devuelve { data, pagination }
      const movimientosData = response.data?.data || [];
      const pagination = response.data?.pagination || {};

      const mapped = movimientosData.map((m, index) => ({
        id: m.movimiento_id,
        uniqueKey: `${m.movimiento_id}-${index}`,
        fecha: m.fecha,
        categoria: m.categoria || "Sin categoría",
        producto: m.repuesto || "Desconocido",
        tipo: m.tipo_movimiento,
        motivo: m.subtipo,
        cantidad: m.cantidad,
        referencia: m.referencia || "N/A",
        factura: m.factura || "",
      }));

      setMovements(mapped);
      setTotalPages(pagination.totalPages || 1);
      setTotalItems(pagination.total || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error cargando movimientos:", err);
      const errorMsg =
        err.response?.status === 401
          ? "Sesión expirada. Por favor, inicia sesión nuevamente."
          : "Error cargando movimientos. Por favor, intenta de nuevo.";
      setError(errorMsg);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cargar movimientos cuando cambia la página
  useEffect(() => {
    fetchMovements(currentPage, filters);
  }, [currentPage]);

  // 🔹 Aplicar filtros: resetear a página 1 y recargar con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchMovements(1, filters);
      } else {
        setCurrentPage(1);
      }
    }, 300); // Espera 300ms después de que el usuario deja de escribir

    return () => clearTimeout(timeoutId);
  }, [
    filters.producto,
    filters.tipo,
    filters.motivo,
    filters.categoria,
    filters.fechaInicio,
    filters.fechaFin,
  ]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Verificar si hay filtros activos
  const hasActiveFilters =
    filters.producto ||
    filters.tipo ||
    filters.motivo ||
    filters.categoria ||
    filters.fechaInicio ||
    filters.fechaFin;

  // Función para limpiar filtros
  const clearFilters = () => {
    setFilters({
      producto: "",
      tipo: "",
      motivo: "",
      categoria: "",
      fechaInicio: "",
      fechaFin: "",
    });
    setCurrentPage(1);
  };

  // 🔹 Loading State
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          } md:ml-64`}
        >
          <main className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Cargando movimientos...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 🔹 Error State
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          } md:ml-64`}
        >
          <TopNavbar onToggleSidebar={toggleSidebar} />
          <main className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 🔹 Loading State
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          } md:ml-64`}
        >
          <TopNavbar onToggleSidebar={toggleSidebar} />
          <main className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Cargando movimientos...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // 🔹 Error State
  if (error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          } md:ml-64`}
        >
          <TopNavbar onToggleSidebar={toggleSidebar} />
          <main className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Reintentar
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        } md:ml-64`}
      >
        <main className="p-6 max-w-7xl mx-auto">
          {/* 🔹 Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Historial de Movimientos
            </h1>
            <p className="text-gray-600">
              Mostrando {movements.length} de {totalItems} movimientos
              {hasActiveFilters && " (filtrados)"}
            </p>
          </div>

          {/* 🔹 Filtros - Card moderna */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <Filter size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-800">
                Filtros de Búsqueda
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Search size={14} className="inline mr-1" />
                  Producto
                </label>
                <input
                  type="text"
                  name="producto"
                  placeholder="Buscar producto..."
                  value={filters.producto}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo
                </label>
                <select
                  name="tipo"
                  value={filters.tipo}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Todos</option>
                  <option value="Entrada">Entrada</option>
                  <option value="Salida">Salida</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo
                </label>
                <select
                  name="motivo"
                  value={filters.motivo}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Todos</option>
                  <option value="compra">Compra</option>
                  <option value="venta">Venta</option>
                  <option value="devolucion">Devolución</option>
                  <option value="ajuste">Ajuste</option>
                  <option value="creacion">Creación</option>
                  <option value="uso">Uso</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categoría
                </label>
                <select
                  name="categoria"
                  value={filters.categoria}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Todas</option>
                  {categorias.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar size={14} className="inline mr-1" />
                  Desde
                </label>
                <input
                  type="date"
                  name="fechaInicio"
                  value={filters.fechaInicio}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar size={14} className="inline mr-1" />
                  Hasta
                </label>
                <input
                  type="date"
                  name="fechaFin"
                  value={filters.fechaFin}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={clearFilters}
                disabled={!hasActiveFilters}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition flex items-center gap-2 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X size={16} />
                Limpiar Filtros
              </button>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-md overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-linear-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Referencia
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {movements.length > 0 ? (
                  movements.map((m, index) => (
                    <tr
                      key={m.uniqueKey}
                      className={`transition-colors duration-150 hover:bg-gray-50 ${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                      }`}
                    >
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(m.fecha).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium border border-blue-200">
                          {m.categoria}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {m.producto}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {m.motivo}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {m.cantidad}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-gray-600">
                        {m.referencia}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => {
                              if (!m.id) {
                                console.error("movimiento_id no definido:", m);
                                return;
                              }
                              navigate(
                                `/inventario/movimientos/${m.id}/${m.tipo}`
                              );
                            }}
                            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                          >
                            Ver
                          </button>
                          {/* <button
                            onClick={() =>
                              m.tipo === "Entrada"
                                ? navigate(`/inventario/entradas/${m.id}`)
                                : navigate(`/inventario/salidas/${m.id}`)
                            }
                            className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition duration-200 ml-2"
                          >
                            Editar
                          </button> */}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <svg
                          className="w-16 h-16 mb-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                          />
                        </svg>
                        <p className="text-lg font-medium text-gray-500">
                          No se encontraron movimientos
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Intenta ajustar los filtros de búsqueda
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 🔹 Paginación mejorada */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-xl shadow-md">
              <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages} ({totalItems} registros)
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                  title="Primera página"
                >
                  ««
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                  title="Página anterior"
                >
                  ‹
                </button>

                {(() => {
                  const pages = [];
                  const maxVisible = 5;

                  if (totalPages <= maxVisible + 2) {
                    for (let i = 1; i <= totalPages; i++) {
                      pages.push(i);
                    }
                  } else {
                    pages.push(1);

                    let start = Math.max(2, currentPage - 2);
                    let end = Math.min(totalPages - 1, currentPage + 2);

                    if (currentPage <= 3) {
                      end = maxVisible;
                    } else if (currentPage >= totalPages - 2) {
                      start = totalPages - maxVisible + 1;
                    }

                    if (start > 2) {
                      pages.push("...");
                    }

                    for (let i = start; i <= end; i++) {
                      pages.push(i);
                    }

                    if (end < totalPages - 1) {
                      pages.push("...");
                    }

                    if (totalPages > 1) {
                      pages.push(totalPages);
                    }
                  }

                  return pages.map((page, idx) =>
                    page === "..." ? (
                      <span
                        key={`ellipsis-${idx}`}
                        className="px-3 py-2 text-gray-500"
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 rounded-lg transition text-sm font-medium ${
                          currentPage === page
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-gray-200 hover:bg-gray-300"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  );
                })()}

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                  title="Página siguiente"
                >
                  ›
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition text-sm font-medium"
                  title="Última página"
                >
                  »»
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MovementsHistory;
