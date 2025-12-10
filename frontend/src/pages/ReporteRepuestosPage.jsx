import { useState } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";

const token = localStorage.getItem("token");
const config = { headers: { Authorization: `Bearer ${token}` } };

const ReporteRepuestosPage = () => {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [reporte, setReporte] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState(""); // 🔍 búsqueda

  const fetchReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      alert("Selecciona un rango de fechas.");
      return;
    }
    try {
      setLoading(true);
      const res = await api.get(
        `/cotizacion-items/reporte-aprobadas?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`,
        config
      );
      setReporte(res.data);
    } catch (error) {
      console.error(error);
      alert("Error al obtener el reporte.");
    } finally {
      setLoading(false);
    }
  };

  // 🔍 Filtrado dinámico
  const filteredData = reporte.filter((item) =>
    item.descripcion.toLowerCase().includes(search.toLowerCase())
  );

  // 📊 Totales de los resultados filtrados
  const totalCantidad = filteredData.reduce(
    (acc, item) => acc + Number(item.total_cantidad || 0),
    0
  );
  const totalValor = filteredData.reduce(
    (acc, item) => acc + Number(item.total_valor || 0),
    0
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <main className="p-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            📊 Reporte de Repuestos Usados
          </h1>

          {/* Filtros */}
          <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha inicio
              </label>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="border rounded px-2 py-1 mt-1 w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha fin
              </label>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="border rounded px-2 py-1 mt-1 w-full"
              />
            </div>
            <button
              onClick={fetchReporte}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              {loading ? "Cargando..." : "Generar reporte"}
            </button>
          </div>

          {/* 🔍 Barra de búsqueda */}
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Buscar repuesto
            </label>
            <input
              type="text"
              placeholder="Ej: Bandas de freno pegadas"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded px-3 py-2 mt-1 w-full"
            />

            {/* 📊 Resumen resultados */}
            <div className="mt-3 text-sm text-gray-700">
              <p>
                Resultados encontrados: <strong>{filteredData.length}</strong>
              </p>
              <p>
                Total cantidad: <strong>{totalCantidad}</strong>
              </p>
              <p>
                Valor total:{" "}
                <strong>${totalValor.toLocaleString("es-CO")}</strong>
              </p>
            </div>
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-600">
                    Repuesto
                  </th>
                  <th className="px-4 py-2 text-center font-medium text-gray-600">
                    Cantidad total
                  </th>
                  <th className="px-4 py-2 text-center font-medium text-gray-600">
                    Valor total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-500">
                      No hay datos que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2">{item.descripcion}</td>
                      <td className="px-4 py-2 text-center">
                        {item.total_cantidad}
                      </td>
                      <td className="px-4 py-2 text-center">
                        ${Number(item.total_valor).toLocaleString("es-CO")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ReporteRepuestosPage;
