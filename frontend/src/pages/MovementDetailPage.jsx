import { useEffect, useState } from "react";
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
import api from "../api";
import { toast } from "react-toastify";

const MovementDetailPage = () => {
  const { id, tipo } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

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

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 md:ml-64">
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
        <Sidebar />
        <div className="flex-1 md:ml-64">
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <main className="p-6 max-w-7xl mx-auto">
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

          {/* Detalles del Movimiento */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Información General */}
            <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 border-b border-gray-200 pb-3">
                <FileText size={22} className="text-orange-600" />
                Información General
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Hash size={18} className="text-gray-500 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      ID Movimiento
                    </p>
                    <p className="text-gray-800 font-semibold">
                      {movimiento.id}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Calendar size={18} className="text-purple-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Fecha y Hora
                    </p>
                    <p className="text-gray-800 font-semibold">
                      {movimiento.fecha}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <User size={18} className="text-indigo-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Usuario
                    </p>
                    <p className="text-gray-800 font-semibold">
                      {movimiento.usuario}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <AlertCircle size={18} className="text-amber-600 shrink-0" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Motivo
                    </p>
                    <p className="text-gray-800 font-semibold">
                      {movimiento.subtipo}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <Package2
                    size={18}
                    className={
                      movimiento.tipo_movimiento === "Entrada"
                        ? "text-green-600 shrink-0"
                        : "text-red-600 shrink-0"
                    }
                  />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Cantidad
                    </p>
                    <p
                      className={`font-bold text-lg ${
                        movimiento.tipo_movimiento === "Entrada"
                          ? "text-green-700"
                          : "text-red-700"
                      }`}
                    >
                      {movimiento.cantidad}
                    </p>
                  </div>
                </div>
                {movimiento.factura && movimiento.factura !== "Sin factura" && (
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors">
                    <FileText size={18} className="text-blue-600 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                        Factura
                      </p>
                      <p className="text-blue-800 font-semibold">
                        {movimiento.factura}
                      </p>
                    </div>
                  </div>
                )}
                {movimiento.contraparte && movimiento.contraparte !== "N/A" && (
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors">
                    <UserCircle size={18} className="text-green-600 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-green-600 uppercase tracking-wide">
                        Proveedor/Contraparte
                      </p>
                      <p className="text-green-800 font-semibold">
                        {movimiento.contraparte}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Información de Cotización */}
            <section className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 text-gray-800 border-b border-gray-200 pb-3">
                <FileBarChart size={22} className="text-indigo-600" />
                Información de Cotización
              </h2>
              {movimiento.cliente ||
              movimiento.vehiculo ||
              movimiento.placa ||
              movimiento.cotizacion_id ? (
                <div className="space-y-3">
                  {movimiento.cotizacion_id && (
                    <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors">
                      <Hash size={18} className="text-indigo-600 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-indigo-600 uppercase tracking-wide">
                          ID Cotización
                        </p>
                        <p className="text-indigo-800 font-semibold">
                          {movimiento.cotizacion_id}
                        </p>
                      </div>
                    </div>
                  )}
                  {movimiento.cliente && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <UserCircle
                        size={18}
                        className="text-blue-600 shrink-0"
                      />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Cliente
                        </p>
                        <p className="text-gray-800 font-semibold">
                          {movimiento.cliente}
                        </p>
                      </div>
                    </div>
                  )}
                  {movimiento.vehiculo && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Car size={18} className="text-green-600 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Vehículo
                        </p>
                        <p className="text-gray-800 font-semibold">
                          {movimiento.vehiculo}
                        </p>
                      </div>
                    </div>
                  )}
                  {movimiento.placa && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <Hash size={18} className="text-purple-600 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Placa
                        </p>
                        <p className="text-gray-800 font-mono font-semibold uppercase">
                          {movimiento.placa}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400 bg-gray-50 rounded-lg">
                  <AlertCircle size={56} className="mb-4 opacity-40" />
                  <p className="text-sm font-medium">
                    No hay información de cotización asociada
                  </p>
                  <p className="text-xs mt-1 text-gray-400">
                    Este movimiento no está vinculado a ninguna cotización
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Observaciones */}
          {movimiento.observacion &&
            movimiento.observacion !== "Sin observaciones" && (
              <section className="bg-linear-to-br from-amber-50 to-orange-50 rounded-xl shadow-md border border-amber-200 p-6 mt-6 hover:shadow-xl transition-shadow">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 border-b border-amber-300 pb-3">
                  <FileText size={22} className="text-amber-600" />
                  Observaciones
                </h2>
                <div className="bg-white p-4 rounded-lg border border-amber-200">
                  <p className="text-gray-700 leading-relaxed italic">
                    "{movimiento.observacion}"
                  </p>
                </div>
              </section>
            )}
        </main>
      </div>
    </div>
  );
};

export default MovementDetailPage;
