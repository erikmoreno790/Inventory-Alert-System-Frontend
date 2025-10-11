import { useState, useEffect } from "react";
import api from "../api";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";

const InventoryListPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroReferencia, setFiltroReferencia] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem("token");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const fetchInventario = async () => {
      try {
        const response = await api.get("/repuestos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setInventario(response.data);
      } catch (error) {
        console.error(
          "Error al obtener los productos:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };
    fetchInventario();
  }, [token]);

  // 🔍 Filtrado
  const filteredRepuestos = inventario.filter((item) => {
    const categoriaMatch = item.categoria
      .toLowerCase()
      .includes(filtroCategoria.toLowerCase());
    const nombreMatch = item.nombre
      .toLowerCase()
      .includes(filtroNombre.toLowerCase());
    const referenciaMatch = item.referencia
      ? item.referencia.toLowerCase().includes(filtroReferencia.toLowerCase())
      : false;

    return (
      (!filtroCategoria || categoriaMatch) &&
      (!filtroNombre || nombreMatch) &&
      (!filtroReferencia || referenciaMatch)
    );
  });

  // 🔹 Paginación
  const totalPages = Math.ceil(filteredRepuestos.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentRepuestos = filteredRepuestos.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // 🔹 Renderizado truncado
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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : ""
        } transition-all duration-300`}
      >
        <TopNavbar onToggleSidebar={toggleSidebar} />
        <main>
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">Inventario de Repuestos</h1>
              <Link
                to="/inventario/nuevo"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                + Nuevo Repuesto
              </Link>
            </div>

            {/* --- Filtros --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filtrar por categoría..."
                  value={filtroCategoria}
                  onChange={(e) => {
                    setFiltroCategoria(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filtrar por nombre..."
                  value={filtroNombre}
                  onChange={(e) => {
                    setFiltroNombre(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Filtrar por referencia..."
                  value={filtroReferencia}
                  onChange={(e) => {
                    setFiltroReferencia(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* --- Tabla --- */}
            {loading ? (
              <div className="text-center text-gray-600">Cargando...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border rounded-lg shadow">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left px-4 py-2">Nombre</th>
                      <th className="text-left px-4 py-2">Categoría</th>
                      <th className="text-left px-4 py-2">Referencia</th>
                      <th className="text-center px-4 py-2">Cantidad Actual</th>
                      <th className="text-center px-4 py-2">Cantidad Mínima</th>
                      <th className="text-center px-4 py-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentRepuestos.map((item) => (
                      <tr key={item.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{item.nombre}</td>
                        <td className="px-4 py-2">{item.categoria}</td>
                        <td className="px-4 py-2">{item.referencia}</td>
                        <td
                          className={`px-4 py-2 text-center ${
                            item.stock < item.stock_minimo
                              ? "text-red-600 font-bold"
                              : ""
                          }`}
                        >
                          {item.stock}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {item.stock_minimo}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <Link
                            to={`/inventario/${item.id}`}
                            className="text-blue-600 hover:underline text-sm"
                          >
                            Ver
                          </Link>{" "}
                          |{" "}
                          <Link
                            to={`/inventario/editar/${item.id}`}
                            className="text-green-600 hover:underline text-sm"
                          >
                            Editar
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {currentRepuestos.length === 0 && (
                      <tr>
                        <td
                          colSpan="6"
                          className="text-center py-4 text-gray-500"
                        >
                          No se encontraron repuestos.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* 🔹 Paginación truncada */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-4 gap-2">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Anterior
                    </button>

                    {renderPagination()}

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                      className="px-3 py-1 border rounded disabled:opacity-50"
                    >
                      Siguiente
                    </button>
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
