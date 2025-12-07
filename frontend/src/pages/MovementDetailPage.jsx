import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Package2,
  FileText,
  AlertCircle,
  ArrowLeft,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  FileBarChart,
  Car,
  UserCircle,
  Hash,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";
import { toast } from "react-toastify";

// Componente auxiliar para las tarjetas de información
const InfoCard = ({
  icon: Icon,
  title,
  value,
  colorClass = "text-gray-700",
}) => (
  <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex items-center justify-between transition-transform hover:shadow-lg">
    <div className="flex flex-col">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <span className={`text-2xl font-bold mt-1 ${colorClass}`}>{value}</span>
    </div>
    <Icon size={32} className={`opacity-70 ${colorClass}`} />
  </div>
);

// Componente para fila de detalle
const DetailRow = ({
  icon: Icon,
  label,
  value,
  iconColor = "text-blue-500",
}) => (
  <div className="flex items-start gap-3 py-2">
    <Icon size={18} className={`mt-0.5 ${iconColor}`} />
    <div className="flex-1">
      <strong className="text-gray-600 text-sm">{label}:</strong>
      <p className="text-gray-800 mt-0.5">{value || "N/A"}</p>
    </div>
  </div>
);

const MovementDetailPage = () => {
  const { id, tipo } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [movimiento, setMovimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  //const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  // Validate token
  useEffect(() => {
    if (!token) {
      toast.error("Sesión no válida. Por favor, inicia sesión.");
      navigate("/login");
    }
  }, [token, navigate]);

  // Fetch movement details
  useEffect(() => {
    const fetchDetailMovement = async () => {
      if (!token || !id || !tipo) {
        setError("Parámetros inválidos.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await api.get(
          `/repuestos/movimientos/${id}/${tipo}`,
          config
        );

        // Handle array response (assuming endpoint might return an array)
        const data = Array.isArray(res.data) ? res.data[0] : res.data;
        console.log(res.data);

        // Map data to component format
        const mappedData = {
          id: data.movimiento_id ?? "N/A",
          repuesto: data.repuesto ?? "Sin nombre",
          categoria: data.categoria ?? "Sin categoría",
          referencia: data.referencia ?? "Sin referencia",
          cantidad: data.cantidad ?? 0,
          contraparte: data.contraparte ?? "N/A",
          factura: data.factura ?? "Sin factura",
          observacion: data.observacion ?? "Sin observaciones",
          fecha: data.fecha
            ? new Date(data.fecha).toLocaleString("es-ES", {
                dateStyle: "medium",
                timeStyle: "short",
              })
            : "Sin fecha",
          tipo_movimiento: data.tipo_movimiento ?? "N/A",
          subtipo: data.subtipo ?? "N/A",
          usuario: data.usuario ?? "Anónimo",
          cotizacion_id: data.cotizacion_id ?? null,
          cliente: data.cliente ?? null,
          vehiculo: data.vehiculo ?? null,
          placa: data.placa ?? null,
        };
        setMovimiento(mappedData);
      } catch (error) {
        console.error("Error cargando el detalle:", error);
        const errorMessage =
          error.response?.status === 401
            ? "Sesión expirada. Por favor, inicia sesión."
            : error.message || "Error al cargar los detalles.";
        setError(errorMessage);
        toast.error(errorMessage);
        if (error.response?.status === 401) navigate("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchDetailMovement();
  }, [id, tipo, token, navigate]);

  // Handle deletion
  // const handleDelete = useCallback(async () => {
  //   if (!window.confirm("¿Seguro que deseas eliminar este movimiento?")) return;

  //   if (!token || !id || !tipo) {
  //     toast.error("Parámetros inválidos.");
  //     return;
  //   }

  //   try {
  //     setIsDeleting(true);
  //     const config = { headers: { Authorization: `Bearer ${token}` } };
  //     const endpoint =
  //       tipo === "Entrada" ? `/entradas/${id}` : `/salidas/${id}`;
  //     await api.delete(endpoint, config);
  //     toast.success("Movimiento eliminado con éxito.");
  //     navigate("/inventario/movimientos");
  //   } catch (error) {
  //     console.error("Error eliminando el movimiento:", error);
  //     toast.error("Error al eliminar el movimiento.");
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // }, [id, tipo, token, navigate]);

  // Toggle sidebar
  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
                <p className="text-lg text-gray-600">Cargando detalles...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !movimiento) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
                  {error || "Movimiento no encontrado."}
                </p>
                <button
                  onClick={() => navigate(-1)}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Regresar
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        } md:ml-64`}
      >
        <TopNavbar onToggleSidebar={toggleSidebar} />
        <main className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <button
            onClick={() => navigate("/inventario/movimientos")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Volver al Historial de Movimientos
          </button>

          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  movimiento.tipo_movimiento === "Entrada"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {movimiento.tipo_movimiento === "Entrada" ? (
                  <TrendingUp size={32} />
                ) : (
                  <TrendingDown size={32} />
                )}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {movimiento.repuesto}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      movimiento.tipo_movimiento === "Entrada"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-red-100 text-red-800 border border-red-200"
                    }`}
                  >
                    {movimiento.tipo_movimiento}
                  </span>
                  <span className="text-sm text-gray-500">
                    Referencia:{" "}
                    <span className="font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {movimiento.referencia}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Tarjetas de Información Clave */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoCard
              icon={Package2}
              title="Cantidad"
              value={movimiento.cantidad}
              colorClass={
                movimiento.tipo_movimiento === "Entrada"
                  ? "text-green-600"
                  : "text-red-600"
              }
            />
            <InfoCard
              icon={FileBarChart}
              title="Categoría"
              value={movimiento.categoria}
              colorClass="text-blue-600"
            />
            <InfoCard
              icon={Calendar}
              title="Fecha"
              value={new Date(movimiento.fecha).toLocaleDateString()}
              colorClass="text-purple-600"
            />
            <InfoCard
              icon={User}
              title="Usuario"
              value={movimiento.usuario}
              colorClass="text-indigo-600"
            />
          </section>

          {/* Detalles del Movimiento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información General */}
            <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 border-b pb-3">
                <FileText size={20} className="text-orange-600" />
                Información General
              </h2>
              <div className="space-y-4">
                <DetailRow
                  icon={Package2}
                  label="Repuesto"
                  value={movimiento.repuesto}
                  iconColor="text-blue-500"
                />
                <DetailRow
                  icon={FileBarChart}
                  label="Categoría"
                  value={movimiento.categoria}
                  iconColor="text-purple-500"
                />
                <DetailRow
                  icon={Hash}
                  label="Referencia"
                  value={movimiento.referencia}
                  iconColor="text-gray-500"
                />
                <DetailRow
                  icon={FileText}
                  label="Motivo"
                  value={movimiento.subtipo}
                  iconColor="text-orange-500"
                />
                <DetailRow
                  icon={User}
                  label="Contraparte (Origen/Destino)"
                  value={movimiento.contraparte}
                  iconColor="text-teal-500"
                />
                <DetailRow
                  icon={FileText}
                  label="Factura"
                  value={movimiento.factura}
                  iconColor="text-green-500"
                />
              </div>
            </section>

            {/* Información de Cotización (si aplica) */}
            <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 border-b pb-3">
                <FileBarChart size={20} className="text-indigo-600" />
                Detalles de Cotización
              </h2>
              {movimiento.cotizacion_id ||
              movimiento.cliente ||
              movimiento.vehiculo ||
              movimiento.placa ? (
                <div className="space-y-4">
                  {movimiento.cotizacion_id && (
                    <DetailRow
                      icon={Hash}
                      label="# Cotización"
                      value={movimiento.cotizacion_id}
                      iconColor="text-indigo-500"
                    />
                  )}
                  {movimiento.cliente && (
                    <DetailRow
                      icon={UserCircle}
                      label="Cliente"
                      value={movimiento.cliente}
                      iconColor="text-blue-500"
                    />
                  )}
                  {movimiento.vehiculo && (
                    <DetailRow
                      icon={Car}
                      label="Vehículo"
                      value={movimiento.vehiculo}
                      iconColor="text-green-500"
                    />
                  )}
                  {movimiento.placa && (
                    <DetailRow
                      icon={Hash}
                      label="Placa"
                      value={movimiento.placa}
                      iconColor="text-orange-500"
                    />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <AlertCircle size={48} className="mb-3 opacity-50" />
                  <p className="text-sm">
                    No hay información de cotización asociada
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Observaciones */}
          {movimiento.observacion &&
            movimiento.observacion !== "Sin observaciones" && (
              <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 border-b pb-3">
                  <FileText size={20} className="text-gray-600" />
                  Observaciones
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {movimiento.observacion}
                </p>
              </section>
            )}
        </main>
      </div>
    </div>
  );
};

export default MovementDetailPage;
