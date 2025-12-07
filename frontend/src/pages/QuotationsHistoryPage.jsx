// QuotationsHistoryPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const QuotationsHistoryPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    nombre_cliente: "",
    placa: "",
    estatus: "",
    fecha: "",
  });

  // 🔹 Paginación del servidor
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 50; // Items por página desde el backend

  const navigate = useNavigate();
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // 🔹 Cargar cotizaciones con paginación del servidor y filtros
  const fetchQuotations = async (page = 1, appliedFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      // Construir parámetros con filtros
      const params = {
        page: page,
        limit: itemsPerPage,
      };

      // Agregar filtros solo si tienen valor
      if (appliedFilters.nombre_cliente) {
        params.nombre_cliente = appliedFilters.nombre_cliente;
      }
      if (appliedFilters.placa) {
        params.placa = appliedFilters.placa;
      }
      if (appliedFilters.estatus) {
        params.estatus = appliedFilters.estatus;
      }
      if (appliedFilters.fecha) {
        params.fecha = appliedFilters.fecha;
      }

      const response = await api.get("/cotizaciones", { params });

      // El backend devuelve { data: [...], pagination: {...} }
      const quotationsData = response.data?.data || [];
      const pagination = response.data?.pagination || {};

      setQuotations(quotationsData);
      setTotalPages(pagination.totalPages || 1);
      setTotalItems(pagination.total || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error cargando cotizaciones:", err);
      setError(
        "Error al cargar las cotizaciones. Por favor, intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cargar cotizaciones cuando cambia la página
  useEffect(() => {
    fetchQuotations(currentPage, filters);
  }, [currentPage]);

  // 🔹 Aplicar filtros: resetear a página 1 y recargar
  useEffect(() => {
    // Debounce para evitar demasiadas peticiones mientras el usuario escribe
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchQuotations(1, filters);
      } else {
        setCurrentPage(1); // Esto disparará el useEffect anterior
      }
    }, 300); // Espera 300ms después de que el usuario deja de escribir

    return () => clearTimeout(timeoutId);
  }, [filters.nombre_cliente, filters.placa, filters.estatus, filters.fecha]);

  // 🔹 Eliminar cotización
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta cotización?")) return;
    try {
      await api.delete(`/cotizaciones/${id}`);
      // Recargar la página actual con los filtros aplicados
      fetchQuotations(currentPage, filters);
    } catch (err) {
      console.error("Error eliminando cotización:", err);
      setError("Error al eliminar la cotización. Por favor, intenta de nuevo.");
    }
  };

  // 🔹 Limpiar todos los filtros
  const clearFilters = () => {
    setFilters({
      nombre_cliente: "",
      placa: "",
      estatus: "",
      fecha: "",
    });
    setCurrentPage(1);
  };

  // 🔹 Verificar si hay filtros activos
  const hasActiveFilters = Object.values(filters).some((value) => value !== "");

  // Ya no necesitamos filtrado en el cliente, todo viene filtrado del servidor
  const currentQuotations = quotations;

  // 🔹 Función para renderizar paginación truncada sin duplicados
  const renderPagination = () => {
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

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("....");
      }

      pages.push(totalPages);
    }

    // ✅ Quitar duplicados usando filter
    const uniquePages = pages.filter((p, index) => pages.indexOf(p) === index);

    return uniquePages.map((p, idx) =>
      p === "..." ? (
        <span key={`dots-${idx}`} className="px-3 py-1">
          ...
        </span>
      ) : (
        <button
          key={`page-${p}`}
          onClick={() => setCurrentPage(p)}
          className={`px-3 py-1 border rounded ${
            currentPage === p ? "bg-blue-500 text-white" : "bg-white"
          }`}
        >
          {p}
        </button>
      )
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className={`flex-1 transition-all duration-300 
    ${sidebarOpen ? "ml-64" : "ml-0"} md:ml-64`}
      >
        <TopNavbar onToggleSidebar={toggleSidebar} />
        <main className="p-6 max-w-6xl mx-auto">
          {/* Encabezado */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
              Historial de Cotizaciones
            </h1>
            <div className="text-sm text-gray-600">
              <span className="font-semibold">Total: {totalItems}</span>{" "}
              cotizaciones
              {hasActiveFilters && (
                <span className="ml-2 text-blue-600">(Filtradas)</span>
              )}
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Filtros */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <input
                type="text"
                placeholder="Cliente"
                value={filters.nombre_cliente}
                onChange={(e) =>
                  setFilters({ ...filters, nombre_cliente: e.target.value })
                }
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Placa"
                value={filters.placa}
                onChange={(e) =>
                  setFilters({ ...filters, placa: e.target.value })
                }
                className="border p-2 rounded"
              />
              <select
                value={filters.estatus}
                onChange={(e) =>
                  setFilters({ ...filters, estatus: e.target.value })
                }
                className="border p-2 rounded"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendiente</option>
                <option value="aprobada">Aprobada</option>
                <option value="rechazada">Rechazada</option>
              </select>
              <input
                type="date"
                value={filters.fecha}
                onChange={(e) =>
                  setFilters({ ...filters, fecha: e.target.value })
                }
                className="border p-2 rounded"
              />
            </div>

            {/* Botón para limpiar filtros */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {/* Tabla */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <p className="text-lg text-gray-500">Cargando cotizaciones...</p>
            </div>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="w-full border-collapse">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Placa
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Estatus
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentQuotations.length > 0 ? (
                    currentQuotations.map((q, index) => (
                      <tr
                        key={
                          q.id_cotizacion
                            ? `quotation-${q.id_cotizacion}`
                            : `quotation-${index}`
                        }
                        className={`transition-colors duration-150 hover:bg-gray-50 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {q.nombre_cliente}
                        </td>
                        <td className="px-6 py-4 text-sm font-mono text-gray-600 uppercase">
                          {q.placa}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {new Date(q.fecha).toLocaleString("es-CO", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                          })}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                              q.estatus?.toLowerCase() === "aprobada"
                                ? "bg-green-100 text-green-800 border border-green-200"
                                : q.estatus?.toLowerCase() === "rechazada"
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            }`}
                          >
                            {q.estatus?.charAt(0).toUpperCase() +
                              q.estatus?.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">
                          {new Intl.NumberFormat("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 2,
                          }).format(q.total || 0)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() =>
                                navigate(`/cotizacion/${q.id_cotizacion}`)
                              }
                              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            >
                              Ver
                            </button>
                            <button
                              onClick={() => handleDelete(q.id_cotizacion)}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <p className="text-lg font-medium text-gray-500">
                            {hasActiveFilters
                              ? "No se encontraron cotizaciones con los filtros aplicados."
                              : quotations.length === 0
                              ? "No hay cotizaciones registradas."
                              : "No se encontraron cotizaciones."}
                          </p>
                          {hasActiveFilters && (
                            <p className="text-sm text-gray-400 mt-1">
                              Intenta ajustar los filtros de búsqueda
                            </p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación truncada */}
          {!loading && totalPages > 1 && (
            <div className="mt-6 bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  Página {currentPage} de {totalPages}
                </span>
                <span className="text-sm text-gray-600">
                  Mostrando {quotations.length} de {totalItems} cotizaciones
                </span>
              </div>
              <div className="flex justify-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(1)}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                  title="Primera página"
                >
                  ««
                </button>
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                >
                  Anterior
                </button>

                {renderPagination()}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
                >
                  Siguiente
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(totalPages)}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-100"
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

export default QuotationsHistoryPage;
