/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  AlertCircle,
  Clock,
  AlertTriangle,
  Trash2,
  CheckCircle,
  RefreshCw,
  Filter,
  X,
  Search,
  Calendar,
  ExternalLink,
  Package,
  Tag,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import { useNavigate, useSearchParams } from "react-router-dom";

const AlertsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [alertas, setAlertas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Paginación del servidor
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 50;

  // Filtros - inicializar desde URL params si existen
  const [filters, setFilters] = useState({
    prioridad: searchParams.get("prioridad") || "",
    categoria: searchParams.get("categoria") || "",
    leida: searchParams.get("leida") || "",
    repuesto: searchParams.get("repuesto") || "",
    fechaInicio: searchParams.get("fechaInicio") || "",
    fechaFin: searchParams.get("fechaFin") || "",
  });

  // Función para cargar alertas con filtros del servidor
  const fetchAlertas = async (page = 1, currentFilters = filters) => {
    if (!token) {
      navigate("/login");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Construir parámetros con filtros
      const params = {
        page: page,
        limit: itemsPerPage,
      };

      // Agregar filtros solo si tienen valor
      if (currentFilters.prioridad) params.prioridad = currentFilters.prioridad;
      if (currentFilters.categoria) params.categoria = currentFilters.categoria;
      if (currentFilters.leida !== "") params.leida = currentFilters.leida;
      if (currentFilters.repuesto) params.repuesto = currentFilters.repuesto;
      if (currentFilters.fechaInicio)
        params.fechaInicio = currentFilters.fechaInicio;
      if (currentFilters.fechaFin) params.fechaFin = currentFilters.fechaFin;

      const res = await api.get("/alerts", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      console.log("Alertas recibidas:", res.data);

      // El backend devuelve { data, pagination }
      const alertasData = res.data?.data || res.data || [];
      const pagination = res.data?.pagination || {};

      setAlertas(alertasData);
      setTotalPages(pagination.totalPages || 1);
      setTotalItems(pagination.total || 0);
      setCurrentPage(page);
    } catch (err) {
      console.error("Error al cargar alertas:", err);
      const errorMsg =
        err.response?.status === 401
          ? "Sesión expirada. Por favor, inicia sesión nuevamente."
          : "Error cargando alertas. Por favor, intenta de nuevo.";
      setError(errorMsg);
      if (err.response?.status === 401) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  // Cargar categorías al iniciar
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

  // Cargar alertas cuando cambia la página
  useEffect(() => {
    fetchAlertas(currentPage, filters);
  }, [currentPage]);

  // Aplicar filtros: resetear a página 1 y recargar con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchAlertas(1, filters);
      } else {
        setCurrentPage(1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [
    filters.prioridad,
    filters.categoria,
    filters.leida,
    filters.repuesto,
    filters.fechaInicio,
    filters.fechaFin,
  ]);

  const generarAlertas = async () => {
    setGenerando(true);
    try {
      const res = await api.post(
        "/alerts/generar",
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Resultado de generar alertas:", res.data);

      const { resultados } = res.data;
      const mensaje = `Alertas generadas exitosamente:
      
⚠️ Urgentes: ${resultados.urgente || 0}
🔴 Altas: ${resultados.alta || 0}
🟡 Moderadas: ${resultados.moderada || 0}
🗑️ Eliminadas: ${resultados.eliminadas || 0}
📊 Total procesadas: ${resultados.total || 0}`;

      alert(mensaje);
      await fetchAlertas(currentPage, filters);
    } catch (err) {
      console.error("Error al generar alertas:", err);
      alert(
        `Error al generar alertas: ${err.response?.data?.error || err.message}`
      );
    } finally {
      setGenerando(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const hasActiveFilters =
    filters.prioridad ||
    filters.categoria ||
    filters.leida !== "" ||
    filters.repuesto ||
    filters.fechaInicio ||
    filters.fechaFin;

  const clearFilters = () => {
    setFilters({
      prioridad: "",
      categoria: "",
      leida: "",
      repuesto: "",
      fechaInicio: "",
      fechaFin: "",
    });
    setCurrentPage(1);
  };

  const marcarComoLeida = async (id) => {
    try {
      await api.put(
        `/alerts/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchAlertas(currentPage, filters);
    } catch (err) {
      console.error("Error al marcar como leída:", err);
    }
  };

  const eliminarAlerta = async (id) => {
    if (!confirm("¿Eliminar esta alerta?")) return;
    try {
      await api.delete(`/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchAlertas(currentPage, filters);
    } catch (err) {
      console.error("Error al eliminar alerta:", err);
    }
  };

  const iconByPrioridad = (prioridad) => {
    switch (prioridad) {
      case "urgente":
        return <AlertCircle className="text-red-600" size={24} />;
      case "alta":
        return <AlertTriangle className="text-orange-600" size={24} />;
      case "moderada":
        return <Clock className="text-yellow-600" size={24} />;
      case "baja":
        return <AlertTriangle className="text-blue-600" size={24} />;
      default:
        return <AlertCircle className="text-gray-600" size={24} />;
    }
  };

  const colorByPrioridad = (prioridad) => {
    switch (prioridad) {
      case "urgente":
        return "border-red-500 bg-red-50";
      case "alta":
        return "border-orange-500 bg-orange-50";
      case "moderada":
        return "border-yellow-500 bg-yellow-50";
      case "baja":
        return "border-blue-500 bg-blue-50";
      default:
        return "border-gray-500 bg-gray-50";
    }
  };

  const nombrePrioridad = (prioridad) => {
    switch (prioridad) {
      case "urgente":
        return "⚠️ URGENTE";
      case "alta":
        return "🔴 ALTA";
      case "moderada":
        return "🟡 MODERADA";
      case "baja":
        return "🟢 BAJA";
      default:
        return "Otra";
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
        <main className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Alertas de Inventario
              </h1>
              <p className="text-gray-600 mt-1">
                Mostrando {alertas.length} de {totalItems} alertas
                {hasActiveFilters && " (filtradas)"}
              </p>
            </div>
            <button
              onClick={generarAlertas}
              disabled={generando}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition shadow-md"
            >
              <RefreshCw
                size={18}
                className={generando ? "animate-spin" : ""}
              />
              {generando ? "Generando..." : "Generar Alertas"}
            </button>
          </div>

          {/* Filtros */}
          <div className="bg-white p-6 rounded-xl shadow-md mb-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
              <Filter size={20} className="text-indigo-600" />
              <h2 className="text-lg font-bold text-gray-800">
                Filtros de Búsqueda
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Tag size={14} className="inline mr-1" />
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
                  Estado
                </label>
                <select
                  name="leida"
                  value={filters.leida}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Todas</option>
                  <option value="false">No leídas</option>
                  <option value="true">Leídas</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Search size={14} className="inline mr-1" />
                  Repuesto
                </label>
                <input
                  type="text"
                  name="repuesto"
                  placeholder="Buscar repuesto..."
                  value={filters.repuesto}
                  onChange={handleFilterChange}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
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

          {/* Lista de Alertas */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[40vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Cargando alertas...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center min-h-[40vh]">
              <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-gray-800 mb-2">
                  {error}
                </p>
                <button
                  onClick={() => fetchAlertas(currentPage, filters)}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Reintentar
                </button>
              </div>
            </div>
          ) : alertas.length === 0 ? (
            <div className="text-center bg-white rounded-xl shadow-md p-8 border border-gray-100">
              <CheckCircle className="mx-auto text-green-500 mb-4" size={48} />
              <p className="text-xl font-semibold text-gray-800 mb-2">
                {hasActiveFilters
                  ? "No se encontraron alertas con los filtros aplicados"
                  : "No hay alertas en el sistema"}
              </p>
              {!hasActiveFilters && (
                <>
                  <p className="text-gray-600 mb-4">
                    Las alertas se generan automáticamente al registrar
                    movimientos de inventario.
                  </p>
                  <p className="text-gray-600 mb-6">
                    Si tienes repuestos con stock bajo, haz clic en el botón
                    "Generar Alertas" arriba para sincronizar.
                  </p>
                  <button
                    onClick={generarAlertas}
                    disabled={generando}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition inline-flex items-center gap-2"
                  >
                    <RefreshCw
                      size={18}
                      className={generando ? "animate-spin" : ""}
                    />
                    {generando ? "Generando..." : "Generar Alertas Ahora"}
                  </button>
                </>
              )}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition"
                >
                  Limpiar Filtros
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {alertas.map((alerta) => (
                <div
                  key={alerta.alerta_id}
                  className={`flex items-start bg-white shadow-md rounded-xl p-5 border-l-4 transition-all hover:shadow-lg ${colorByPrioridad(
                    alerta.prioridad
                  )} ${alerta.leida ? "opacity-60" : ""}`}
                >
                  <div className="mr-4 mt-1">
                    {iconByPrioridad(alerta.prioridad)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-lg text-gray-800">
                        {nombrePrioridad(alerta.prioridad)}
                      </span>
                      {alerta.leida && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          Leída
                        </span>
                      )}
                    </div>
                    {/* Información del repuesto */}
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center gap-2">
                        <Tag size={16} className="text-purple-500" />
                        <strong className="text-sm text-gray-600">
                          Categoría:
                        </strong>
                        <span className="text-gray-800">
                          {alerta.categoria || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package size={16} className="text-blue-500" />
                        <strong className="text-sm text-gray-600">
                          Repuesto:
                        </strong>
                        <span className="text-gray-800">
                          {alerta.repuesto_nombre || "—"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <ExternalLink size={16} className="text-indigo-500" />
                        <strong className="text-sm text-gray-600">
                          Referencia:
                        </strong>
                        <button
                          onClick={() =>
                            navigate(`/inventario/${alerta.repuesto_id}`)
                          }
                          className="text-blue-600 hover:text-blue-800 font-mono font-semibold underline transition"
                        >
                          {alerta.referencia || "—"}
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={16} className="text-orange-500" />
                        <strong className="text-sm text-gray-600">
                          Stock actual:
                        </strong>
                        <span
                          className={`font-bold ${
                            alerta.stock_actual === 0
                              ? "text-red-600"
                              : alerta.stock_actual <= 1
                              ? "text-orange-600"
                              : alerta.stock_actual < 5
                              ? "text-yellow-600"
                              : "text-green-600"
                          }`}
                        >
                          {alerta.stock_actual ?? "—"}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-gray-400">
                      {format(new Date(alerta.fecha), "dd/MM/yyyy HH:mm")}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {!alerta.leida && (
                      <button
                        onClick={() => marcarComoLeida(alerta.alerta_id)}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                        title="Marcar como leída"
                      >
                        <CheckCircle size={20} />
                      </button>
                    )}
                    <button
                      onClick={() => eliminarAlerta(alerta.alerta_id)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                      title="Eliminar"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Paginación */}
          {!loading && !error && totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 bg-white p-4 rounded-xl shadow-md">
              <div className="text-sm text-gray-600">
                Página {currentPage} de {totalPages} ({totalItems} alertas)
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

export default AlertsPage;
