import { useEffect, useState } from "react";
import {
  Bell,
  Boxes,
  AlertTriangle,
  PlusCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Package,
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
  Calendar,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../api";

const DashboardPage = () => {
  const [totalCotizaciones, setTotalCotizaciones] = useState(0);
  const [cantidadRepuestos, setCantidadRepuestos] = useState(0);
  const [estadisticas, setEstadisticas] = useState([]);
  const [ultimosRepuestos, setUltimosRepuestos] = useState([]);
  const [ultimosMovimientos, setUltimosMovimientos] = useState([]);
  const [stockBajo, setStockBajo] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Función para obtener saludo según la hora
  const getSaludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Buenos días";
    if (hora < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [
          cotizacionesRes,
          repuestosRes,
          estadisticasRes,
          ultimosRepuestosRes,
          movimientosRes,
        ] = await Promise.all([
          api.get("/cotizaciones/approved/count", config),
          api.get("/repuestos/total-cantidad", config),
          api.get("/alerts/estadisticas", config),
          api.get("/repuestos/ultimos-agregados?limit=5", config),
          api.get("/repuestos/movimientos?page=1&limit=5", config),
        ]);

        // Extraer datos correctamente según el formato de respuesta
        const totalCotizacionesAprobadas = cotizacionesRes.data.count || 0;
        const cantidadRepuestosTotales = repuestosRes.data.total;
        const estadisticasAlertas = estadisticasRes.data;
        const ultimosRep = ultimosRepuestosRes.data;
        const movimientos = movimientosRes.data.data || movimientosRes.data;

        // Calcular repuestos con stock bajo (menos de 5)
        const stockBajoCount =
          estadisticasAlertas.find((s) => s.prioridad === "urgente")
            ?.no_leidas || 0;

        setTotalCotizaciones(totalCotizacionesAprobadas);
        setCantidadRepuestos(cantidadRepuestosTotales);
        setEstadisticas(estadisticasAlertas);
        setUltimosRepuestos(ultimosRep);
        setUltimosMovimientos(movimientos);
        setStockBajo(stockBajoCount);
      } catch (error) {
        console.error(
          "Error al cargar datos del dashboard:",
          error.response?.data || error.message || error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <main className="p-6 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-lg text-gray-600">Cargando dashboard...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Header con Saludo */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  {getSaludo()}, {user.nombre || "Usuario"}
                </h1>
                <p className="text-gray-600 flex items-center gap-2">
                  <Calendar size={16} />
                  {new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* KPIs Principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Total Cotizaciones */}
                <Link
                  to="/cotizaciones"
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <FileText className="text-green-600" size={24} />
                    </div>
                    <TrendingUp className="text-green-500" size={20} />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Cotizaciones
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {totalCotizaciones}
                  </p>
                </Link>

                {/* Cantidad de Repuestos */}
                <Link
                  to="/inventario"
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <Package className="text-purple-600" size={24} />
                    </div>
                    <Boxes className="text-purple-500" size={20} />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Total Repuestos
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {cantidadRepuestos}
                  </p>
                </Link>

                {/* Stock Bajo */}
                <Link
                  to="/alertas?prioridad=urgente"
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                      <AlertTriangle className="text-orange-600" size={24} />
                    </div>
                    <TrendingDown className="text-orange-500" size={20} />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Stock Crítico
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {stockBajo}
                  </p>
                </Link>

                {/* Total Alertas No Leídas */}
                <Link
                  to="/alertas"
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                      <Bell className="text-red-600" size={24} />
                    </div>
                    <AlertCircle className="text-red-500" size={20} />
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    Alertas No Leídas
                  </p>
                  <p className="text-3xl font-bold text-gray-800">
                    {estadisticas.reduce(
                      (sum, stat) => sum + parseInt(stat.no_leidas || 0),
                      0
                    )}
                  </p>
                </Link>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Alertas por Prioridad */}
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <AlertCircle className="text-indigo-600" size={24} />
                    Alertas por Prioridad
                  </h2>
                  <div className="grid grid-cols-2 gap-4">
                    {estadisticas.map((stat) => {
                      const iconByPrioridad = {
                        urgente: "⚠️",
                        alta: "🔴",
                        moderada: "🟡",
                        baja: "🟢",
                      };
                      const colorByPrioridad = {
                        urgente: "border-red-500 hover:bg-red-50",
                        alta: "border-orange-500 hover:bg-orange-50",
                        moderada: "border-yellow-500 hover:bg-yellow-50",
                        baja: "border-green-500 hover:bg-green-50",
                      };

                      return (
                        <Link
                          key={stat.prioridad}
                          to={`/alertas?prioridad=${stat.prioridad}`}
                          className={`block p-4 bg-white border-l-4 rounded-lg shadow-sm transition-all hover:shadow-md ${
                            colorByPrioridad[stat.prioridad] ||
                            "border-gray-400 hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-2xl">
                              {iconByPrioridad[stat.prioridad] || "📌"}
                            </span>
                            <span className="text-sm font-medium text-gray-500 uppercase">
                              {stat.prioridad}
                            </span>
                          </div>
                          <div className="text-3xl font-bold text-gray-800">
                            {stat.no_leidas}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            No leídas
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Accesos Rápidos */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    Accesos Rápidos
                  </h2>
                  <div className="space-y-3">
                    <Link
                      to="/inventario"
                      className="flex items-center gap-3 px-4 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm hover:shadow-md"
                    >
                      <Boxes size={20} />
                      <span className="font-medium">Ver Inventario</span>
                    </Link>
                    <Link
                      to="/inventario/nuevo"
                      className="flex items-center gap-3 px-4 py-3 bg-linear-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm hover:shadow-md"
                    >
                      <PlusCircle size={20} />
                      <span className="font-medium">Nuevo Repuesto</span>
                    </Link>
                    <Link
                      to="/cotizaciones/nueva"
                      className="flex items-center gap-3 px-4 py-3 bg-linear-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all shadow-sm hover:shadow-md"
                    >
                      <FileText size={20} />
                      <span className="font-medium">Nueva Cotización</span>
                    </Link>
                    <Link
                      to="/alertas"
                      className="flex items-center gap-3 px-4 py-3 bg-linear-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all shadow-sm hover:shadow-md"
                    >
                      <Bell size={20} />
                      <span className="font-medium">Ver Alertas</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Actividad Reciente */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Últimos Repuestos Agregados */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Package className="text-indigo-600" size={24} />
                    Últimos Repuestos Agregados
                  </h2>
                  {ultimosRepuestos.length > 0 ? (
                    <div className="space-y-3">
                      {ultimosRepuestos.map((repuesto) => (
                        <Link
                          key={repuesto.repuesto_id}
                          to={`/inventario/${repuesto.repuesto_id}`}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {repuesto.nombre}
                            </p>
                            <p className="text-sm text-gray-500">
                              {repuesto.categoria} • Stock: {repuesto.stock}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-indigo-600">
                              {repuesto.referencia || "—"}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No hay repuestos recientes
                    </p>
                  )}
                </div>

                {/* Últimos Movimientos */}
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock className="text-indigo-600" size={24} />
                    Actividad Reciente
                  </h2>
                  {ultimosMovimientos.length > 0 ? (
                    <div className="space-y-3">
                      {ultimosMovimientos.map((mov, idx) => (
                        <Link
                          key={idx}
                          to={`/movimientos/${mov.movimiento_id}/${mov.tipo}`}
                          className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div
                            className={`p-2 rounded-lg ${
                              mov.tipo === "Entrada"
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            {mov.tipo === "Entrada" ? (
                              <ArrowDownCircle
                                className="text-green-600"
                                size={20}
                              />
                            ) : (
                              <ArrowUpCircle
                                className="text-red-600"
                                size={20}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800">
                              {mov.tipo} - {mov.nombre_repuesto}
                            </p>
                            <p className="text-sm text-gray-500">
                              Cantidad: {mov.cantidad} • {mov.motivo}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(mov.fecha).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      No hay movimientos recientes
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
