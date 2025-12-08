import { useState, useEffect } from "react";
import { Bell, Info, AlertTriangle, CheckCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../api";

const AlertSettingsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [estadisticas, setEstadisticas] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchEstadisticas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchEstadisticas = async () => {
    setLoading(true);
    try {
      const res = await api.get("/alerts/estadisticas", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEstadisticas(res.data);
    } catch (err) {
      console.error("Error al cargar estadísticas:", err);
    } finally {
      setLoading(false);
    }
  };

  const niveles = [
    {
      prioridad: "urgente",
      titulo: "⚠️ URGENTE",
      descripcion: "Stock completamente agotado (0 unidades)",
      color: "bg-red-50 border-red-500",
      iconColor: "text-red-600",
      condicion: "Stock = 0",
    },
    {
      prioridad: "alta",
      titulo: "🔴 ALTA",
      descripcion: "Stock crítico - Solo 1 unidad disponible",
      color: "bg-orange-50 border-orange-500",
      iconColor: "text-orange-600",
      condicion: "Stock = 1",
    },
    {
      prioridad: "moderada",
      titulo: "🟡 MODERADA",
      descripcion: "Stock bajo - Entre 2 y 4 unidades",
      color: "bg-yellow-50 border-yellow-500",
      iconColor: "text-yellow-600",
      condicion: "Stock: 2-4",
    },
    {
      prioridad: "baja",
      titulo: "🟢 BAJA (Auto-elimina)",
      descripcion: "Stock normalizado - 5 o más unidades",
      color: "bg-green-50 border-green-500",
      iconColor: "text-green-600",
      condicion: "Stock ≥ 5",
    },
  ];

  const getEstadistica = (prioridad) => {
    const stat = estadisticas.find((s) => s.prioridad === prioridad);
    return stat || { cantidad: 0, no_leidas: 0 };
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : ""
        } transition-all duration-300`}
      >
        <main className="p-6 max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
              <Bell className="text-blue-600" size={32} />
              Configuración de Alertas
            </h1>
            <p className="text-gray-600">
              Sistema automático de alertas basado en niveles de stock
            </p>
          </div>

          {/* Información del Sistema */}
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="text-blue-600 shrink-0 mt-1" size={24} />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">
                  Sistema de Alertas Automático
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>
                    ✅ Las alertas se generan automáticamente al registrar
                    movimientos
                  </li>
                  <li>
                    ✅ Las alertas se actualizan cuando cambia el nivel de stock
                  </li>
                  <li>
                    ✅ Las alertas se eliminan automáticamente cuando el stock
                    alcanza 5 o más unidades
                  </li>
                  <li>✅ Solo existe una alerta activa por repuesto</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Niveles de Prioridad */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Niveles de Prioridad
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {niveles.map((nivel) => {
                const stat = getEstadistica(nivel.prioridad);
                return (
                  <div
                    key={nivel.prioridad}
                    className={`border-l-4 ${nivel.color} rounded-lg shadow-md p-5`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={nivel.iconColor} size={24} />
                        <h3 className="text-xl font-bold text-gray-800">
                          {nivel.titulo}
                        </h3>
                      </div>
                      {!loading && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-800">
                            {stat.no_leidas}
                          </div>
                          <div className="text-xs text-gray-500">activas</div>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 mb-2">
                      {nivel.descripcion}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-600 bg-white px-3 py-2 rounded">
                      <strong>Condición:</strong> {nivel.condicion}
                    </div>
                    {!loading && stat.cantidad > 0 && (
                      <div className="mt-3 text-xs text-gray-500">
                        Total histórico: {stat.cantidad}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Estadísticas Generales */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <CheckCircle className="text-green-600" size={24} />
              Resumen de Alertas
            </h2>
            {loading ? (
              <p className="text-gray-500">Cargando estadísticas...</p>
            ) : estadisticas.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle
                  className="mx-auto text-green-500 mb-3"
                  size={48}
                />
                <p className="text-lg font-semibold text-gray-800">
                  ¡Todo en orden!
                </p>
                <p className="text-gray-600">
                  No hay alertas registradas en el sistema
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="text-sm text-gray-600 mb-1">
                    Total de Alertas
                  </div>
                  <div className="text-3xl font-bold text-gray-800">
                    {estadisticas.reduce(
                      (sum, stat) => sum + parseInt(stat.cantidad),
                      0
                    )}
                  </div>
                </div>
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="text-sm text-red-600 mb-1">
                    Alertas Activas
                  </div>
                  <div className="text-3xl font-bold text-red-800">
                    {estadisticas.reduce(
                      (sum, stat) => sum + parseInt(stat.no_leidas),
                      0
                    )}
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="text-sm text-green-600 mb-1">
                    Alertas Leídas
                  </div>
                  <div className="text-3xl font-bold text-green-800">
                    {estadisticas.reduce(
                      (sum, stat) =>
                        sum +
                        (parseInt(stat.cantidad) - parseInt(stat.no_leidas)),
                      0
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recomendaciones */}
          <div className="bg-linear-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mt-6">
            <h3 className="text-xl font-bold text-purple-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="text-purple-600" size={24} />
              Recomendaciones
            </h3>
            <ul className="space-y-2 text-sm text-purple-800">
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>
                  <strong>Alertas URGENTES:</strong> Requieren acción inmediata.
                  El repuesto está agotado.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>
                  <strong>Alertas ALTAS:</strong> Planificar reabastecimiento
                  urgente. Solo queda 1 unidad.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>
                  <strong>Alertas MODERADAS:</strong> Stock bajo. Considerar
                  pedido próximamente.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600 font-bold">•</span>
                <span>
                  Las alertas se eliminan automáticamente cuando el stock
                  alcanza 5 o más unidades.
                </span>
              </li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AlertSettingsPage;
