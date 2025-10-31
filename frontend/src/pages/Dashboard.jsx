import { useEffect, useState } from "react";
import { Bell, Boxes, AlertTriangle, PlusCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const DashboardPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [totalCotizaciones, setTotalCotizaciones] = useState(0);
  const [cantidadRepuestos, setCantidadRepuestos] = useState(0);
  const [totalRepuestosPorCategoria, setTotalRepuestosPorCategoria] = useState(
    {}
  );
  //const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [cotizacionesRes, repuestosRes, totalRepuestoRes] =
          await Promise.all([
            //api.get("/alerts/products/:id", config),
            api.get("/cotizaciones", config),
            api.get("/repuestos/total-cantidad", config),
            api.get("/repuestos/categoria", config),
          ]);

        {
          /*console.log(
          "Respuesta de repuestos por categoría:",
          totalRepuestoRes.data
        );*/
        }

        //const alertasActivas = alertasRes.data;
        const cotizaciones = cotizacionesRes.data;
        const cantidadRepuestosTotales = repuestosRes.data.total;
        const totalRepuestosPorCategoria = totalRepuestoRes.data;

        setTotalRepuestosPorCategoria(totalRepuestosPorCategoria);
        setTotalCotizaciones(cotizaciones.length);
        setCantidadRepuestos(cantidadRepuestosTotales);
        //setAlertas(alertasActivas.slice(0, 5)); // últimas 5 alertas
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
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className={`flex-1 transition-all duration-300 
    ${sidebarOpen ? "ml-64" : "ml-0"} md:ml-64`}
      >
        <TopNavbar onToggleSidebar={toggleSidebar} />

        <main className="p-6">
          {loading ? (
            <p className="text-gray-600">Cargando datos...</p>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {/* Total Cotizaciones */}
                <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
                  <PlusCircle className="text-green-600" />
                  <div>
                    <p className="text-gray-600 text-sm">Total Cotizaciones</p>
                    <p className="text-xl font-bold">{totalCotizaciones}</p>
                  </div>
                </div>

                {/* Total Repuestos */}
                {/*<div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
                  <Boxes className="text-blue-600" />
                  <div>
                    <p className="text-gray-600 text-sm">Total Repuestos</p>
                    <p className="text-xl font-bold">{cantidadRepuestos}</p>
                  </div>
                </div>*/}
                {/* Cantidad de Repuestos */}
                <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
                  <Boxes className="text-purple-600" />
                  <div>
                    <p className="text-gray-600 text-sm">
                      Cantidad de Repuestos
                    </p>
                    <p className="text-xl font-bold">{cantidadRepuestos}</p>
                  </div>
                </div>
                {/* Total repuesto por categorias */}
                {/*Los datos llegan así: 
               0: 
                {categoria: 'Guaya', cantidad_total: '140'}
                1
                : 
                {categoria: 'Campana', cantidad_total: '186'}*/}
                {totalRepuestosPorCategoria.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow flex items-center gap-4"
                  >
                    <Boxes className="text-yellow-600" />
                    <div>
                      <p className="text-gray-600 text-sm">
                        Total en {item.categoria}
                      </p>
                      <p className="text-xl font-bold">{item.cantidad_total}</p>
                    </div>
                  </div>
                ))}

                {/* Alertas Activas */}
                <div className="bg-white p-4 rounded-lg shadow flex items-center gap-4">
                  <Bell className="text-red-600" />
                  <div>
                    <p className="text-gray-600 text-sm">Alertas Activas</p>
                    <p className="text-xl font-bold">0</p>
                  </div>
                </div>
              </div>

              {/* Últimas alertas */}
              {/*<div className="bg-white p-4 rounded-lg shadow mb-6">
                <h2 className="text-lg font-semibold mb-4">Últimas Alertas</h2>
                {alertas.length > 0 ? (
                  <ul className="space-y-3">
                    {alertas.map((alerta, index) => (
                      <li
                        key={index}
                        className="flex items-start gap-3 border-b pb-2 last:border-none"
                      >
                        <AlertTriangle
                          className="text-yellow-600 mt-1"
                          size={18}
                        />
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {alerta.repuesto_nombre ||
                              "Repuesto no identificado"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {alerta.mensaje ||
                              alerta.descripcion ||
                              "Alerta sin mensaje"}
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                            <Clock size={12} />{" "}
                            {new Date(alerta.fecha).toLocaleDateString(
                              "es-CO",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">
                    No hay alertas recientes.
                  </p>
                )}
              </div>*/}

              {/* Accesos rápidos */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Accesos Rápidos</h2>
                <div className="flex flex-wrap gap-4">
                  <Link
                    to="/inventario"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Boxes size={18} />
                    Inventario
                  </Link>
                  <Link
                    to="/inventario/nuevo"
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    <PlusCircle size={18} />
                    Nuevo Repuesto
                  </Link>
                  <Link
                    to="/alertas"
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Bell size={18} />
                    Ver Alertas
                  </Link>
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
