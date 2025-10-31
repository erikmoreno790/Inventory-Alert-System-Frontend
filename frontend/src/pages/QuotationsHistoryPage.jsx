// QuotationsHistoryPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const QuotationsHistoryPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quotations, setQuotations] = useState([]);
  const [filters, setFilters] = useState({
    nombre_cliente: "",
    placa: "",
    estatus: "",
    fecha: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const navigate = useNavigate();
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // 🔹 Cargar todas las cotizaciones
  const fetchQuotations = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await api.get("/cotizaciones", config);

      // Ordenar por fecha descendente
      const sortedData = data.sort(
        (a, b) => new Date(b.fecha) - new Date(a.fecha)
      );

      setQuotations(sortedData);
    } catch (err) {
      console.error(err);
      alert("Error cargando cotizaciones");
    }
  };

  useEffect(() => {
    fetchQuotations();
  }, []);

  // 🔹 Eliminar cotización
  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta cotización?")) return;
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.delete(`/cotizaciones/${id}`, config);
      alert("Cotización eliminada");
      fetchQuotations();
    } catch (err) {
      console.error(err);
      alert("Error eliminando cotización");
    }
  };

  // 🔹 Filtrar cotizaciones
  const filteredQuotations = quotations.filter((q) => {
    const nombre_cliente = (q.nombre_cliente || "").toLowerCase();
    const placa = (q.placa || "").toLowerCase();
    const estatus = (q.estatus || "").toLowerCase();
    const fecha = q.fecha || "";

    return (
      nombre_cliente.includes(filters.nombre_cliente.toLowerCase()) &&
      placa.includes(filters.placa.toLowerCase()) &&
      (filters.estatus ? estatus === filters.estatus.toLowerCase() : true) &&
      (filters.fecha ? fecha.startsWith(filters.fecha) : true)
    );
  });

  // 🔹 Paginación
  const totalPages = Math.ceil(filteredQuotations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentQuotations = filteredQuotations.slice(
    startIndex,
    startIndex + itemsPerPage
  );

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
            <h2 className="text-3xl font-bold">Historial de Cotizaciones</h2>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <input
              type="text"
              placeholder="Cliente"
              value={filters.nombre_cliente}
              onChange={(e) =>
                setFilters({ ...filters, nombre_cliente: e.target.value })
              }
              className="border p-2"
            />
            <input
              type="text"
              placeholder="Placa"
              value={filters.placa}
              onChange={(e) =>
                setFilters({ ...filters, placa: e.target.value })
              }
              className="border p-2"
            />
            <select
              value={filters.estatus}
              onChange={(e) =>
                setFilters({ ...filters, estatus: e.target.value })
              }
              className="border p-2"
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
              className="border p-2"
            />
          </div>

          {/* Tabla */}
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Cliente</th>
                  <th className="border p-2">Placa</th>
                  <th className="border p-2">Fecha</th>
                  <th className="border p-2">Estatus</th>
                  <th className="border p-2">Total</th>
                  <th className="border p-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {currentQuotations.length > 0 ? (
                  currentQuotations.map((q, index) => (
                    <tr
                      key={q.id ? `quotation-${q.id}` : `quotation-${index}`}
                      className="hover:bg-gray-100"
                    >
                      <td className="border p-2">{q.nombre_cliente}</td>
                      <td className="border p-2">{q.placa}</td>
                      <td className="border p-2">
                        {/*Fecha en formato YYYY/MM/DD zona Colombia*/}
                        {new Date(q.fecha).toLocaleString("es-CO", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        })}
                        {/* {q.fecha} */}
                      </td>
                      <td className="border p-2 capitalize">{q.estatus}</td>
                      <td className="border p-2 font-bold">
                        {new Intl.NumberFormat("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 2,
                        }).format(q.total || 0)}
                      </td>
                      <td className="border p-2 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() =>
                              navigate(`/cotizacion/${q.id_cotizacion}`)
                            }
                            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition duration-200"
                          >
                            Ver
                          </button>
                          <button
                            onClick={() => handleDelete(q.id_cotizacion)}
                            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition duration-200"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center p-4 text-gray-500">
                      No se encontraron cotizaciones.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación truncada */}
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
        </main>
      </div>
    </div>
  );
};

export default QuotationsHistoryPage;
