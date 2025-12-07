import { useState, useEffect } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

const InventoryListPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 🔹 Listas para filtros desplegables
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);

  // 🔹 Filtros
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroReferencia, setFiltroReferencia] = useState("");

  // 🔹 Paginación del servidor
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 50;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // 🔹 Cargar categorías y marcas al iniciar
  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const response = await api.get("/repuestos/categorias/lista");
        setCategorias(response.data || []);
      } catch (error) {
        console.error("Error cargando categorías:", error);
      }
    };

    const fetchMarcas = async () => {
      try {
        const response = await api.get("/repuestos/marcas/lista");
        setMarcas(response.data || []);
      } catch (error) {
        console.error("Error cargando marcas:", error);
      }
    };

    fetchCategorias();
    fetchMarcas();
  }, []);

  // 🔹 Cargar inventario con paginación y filtros del servidor
  const fetchInventario = async (
    page = 1,
    filters = {
      categoria: filtroCategoria,
      marca: filtroMarca,
      nombre: filtroNombre,
      referencia: filtroReferencia,
    }
  ) => {
    setLoading(true);
    setError(null);
    try {
      // Construir parámetros con filtros
      const params = {
        page: page,
        limit: itemsPerPage,
      };

      // Agregar filtros solo si tienen valor
      if (filters.categoria) params.categoria = filters.categoria;
      if (filters.marca) params.marca = filters.marca;
      if (filters.nombre) params.nombre = filters.nombre;
      if (filters.referencia) params.referencia = filters.referencia;

      const response = await api.get("/repuestos", { params });

      // El backend devuelve { data, pagination }
      const inventarioData = response.data?.data || [];
      const pagination = response.data?.pagination || {};

      setInventario(inventarioData);
      setTotalPages(pagination.totalPages || 1);
      setTotalItems(pagination.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error(
        "Error al obtener los productos:",
        error.response?.data || error.message
      );
      setError("Error al cargar el inventario. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cargar inventario cuando cambia la página
  useEffect(() => {
    fetchInventario(currentPage, {
      categoria: filtroCategoria,
      marca: filtroMarca,
      nombre: filtroNombre,
      referencia: filtroReferencia,
    });
  }, [currentPage]);

  // 🔹 Aplicar filtros: resetear a página 1 y recargar con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (currentPage === 1) {
        fetchInventario(1, {
          categoria: filtroCategoria,
          marca: filtroMarca,
          nombre: filtroNombre,
          referencia: filtroReferencia,
        });
      } else {
        setCurrentPage(1);
      }
    }, 300); // Espera 300ms después de que el usuario deja de escribir

    return () => clearTimeout(timeoutId);
  }, [filtroCategoria, filtroMarca, filtroNombre, filtroReferencia]);

  // 🔹 Verificar si hay filtros activos
  const hasActiveFilters =
    filtroCategoria || filtroMarca || filtroNombre || filtroReferencia;

  // Ya no necesitamos filtrado en el cliente, todo viene filtrado del servidor
  const currentRepuestos = inventario;

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
        pages.push("...");
      }

      pages.push(totalPages);
    }

    // Quitar duplicados
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

  // 🔹 Limpiar filtros
  const limpiarFiltros = () => {
    setFiltroCategoria("");
    setFiltroMarca("");
    setFiltroNombre("");
    setFiltroReferencia("");
    setCurrentPage(1);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className={`flex-1 transition-all duration-300 
    ${sidebarOpen ? "ml-64" : "ml-0"} md:ml-64`}
      >
        <TopNavbar onToggleSidebar={toggleSidebar} />
        <main>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                  Inventario de Repuestos
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">Total: {totalItems}</span>{" "}
                  repuestos
                  {hasActiveFilters && (
                    <span className="ml-2 text-blue-600">(Filtrados)</span>
                  )}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/inventario/nuevo")}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Agregar Repuesto
                </button>
                {hasActiveFilters && (
                  <button
                    onClick={limpiarFiltros}
                    className="px-4 py-2 bg-gray-300 text-black rounded hover:bg-gray-400 transition"
                  >
                    Limpiar Filtros
                  </button>
                )}
              </div>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            {/* --- Filtros --- */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Filtro Categoría - Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={filtroCategoria}
                    onChange={(e) => setFiltroCategoria(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todas las categorías</option>
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro Marca - Dropdown */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Marca
                  </label>
                  <select
                    value={filtroMarca}
                    onChange={(e) => setFiltroMarca(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todas las marcas</option>
                    {marcas.map((marca) => (
                      <option key={marca} value={marca}>
                        {marca}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Filtro Nombre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Buscar por nombre..."
                      value={filtroNombre}
                      onChange={(e) => setFiltroNombre(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Filtro Referencia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Referencia
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-2.5 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Buscar por referencia..."
                      value={filtroReferencia}
                      onChange={(e) => setFiltroReferencia(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* --- Tabla --- */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <p className="text-lg text-gray-500">Cargando repuestos...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Categoría
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Nombre
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Referencia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Marca
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Stock
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Precio Venta
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentRepuestos.map((item, index) => (
                        <tr
                          key={item.repuesto_id}
                          className={`hover:bg-blue-50 transition-colors duration-150 ${
                            index % 2 === 0 ? "bg-white" : "bg-gray-50"
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {item.categoria}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {item.nombre}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-600 font-mono">
                              {item.referencia || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-700 font-medium">
                              {item.marca || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                                item.stock < item.stock_minimo
                                  ? "bg-red-100 text-red-800 ring-2 ring-red-200"
                                  : item.stock < item.stock_minimo * 1.5
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {item.stock}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="text-sm font-semibold text-gray-900">
                              {Number(
                                item.precio_unitario_venta
                              ).toLocaleString("es-CO", {
                                style: "currency",
                                currency: "COP",
                                minimumFractionDigits: 0,
                              })}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/inventario/${item.repuesto_id}`)
                                }
                                className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-150"
                              >
                                Ver
                              </button>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/inventario/editar/${item.repuesto_id}`
                                  )
                                }
                                className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
                              >
                                Editar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {currentRepuestos.length === 0 && (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center">
                              <svg
                                className="w-16 h-16 text-gray-300 mb-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={1.5}
                                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                />
                              </svg>
                              <p className="text-gray-500 text-lg font-medium">
                                {hasActiveFilters
                                  ? "No se encontraron repuestos con los filtros aplicados."
                                  : inventario.length === 0
                                  ? "No hay repuestos registrados."
                                  : "No se encontraron repuestos."}
                              </p>
                              {hasActiveFilters && (
                                <button
                                  onClick={limpiarFiltros}
                                  className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
                                >
                                  Limpiar filtros
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 🔹 Paginación truncada */}
                {!loading && totalPages > 1 && (
                  <div className="mt-6 bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">
                        Página {currentPage} de {totalPages}
                      </span>
                      <span className="text-sm text-gray-600">
                        Mostrando {inventario.length} de {totalItems} repuestos
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
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default InventoryListPage;
