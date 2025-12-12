import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  History,
  Edit,
  Trash,
  FileText,
  Package2,
  PlusCircle,
  MinusCircle,
  AlertTriangle, // Añadido para el indicador de stock
  ShoppingBag, // Para Precio de Venta
  MapPin, // Para Ubicación
  Layers, // Para Categoría
  Tag, // Para Marca
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import AlertMessage from "../components/AlertMessage";
import { formatDateLocal } from "../utils/dateUtils";

// Componente auxiliar para las Tarjetas de Información Clave
const InfoCard = ({
  icon: Icon,
  title,
  value,
  colorClass = "text-gray-700",
}) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 transition-transform hover:shadow-md">
    {Icon && <Icon size={24} className={`opacity-70 ${colorClass}`} />}
    <div className="flex flex-col">
      <p className="text-xs font-medium text-gray-500 uppercase">{title}</p>
      <span className={`text-lg font-semibold mt-0.5 ${colorClass}`}>
        {value}
      </span>
    </div>
  </div>
);

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  colorClass,
  disabled = false,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${colorClass}`}
  >
    {Icon && <Icon size={18} />} {label}
  </button>
);

const RepuestoDetailPage = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [producto, setProducto] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  // Descomentar para usar alertas
  // const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alert, setAlert] = useState({ type: "", message: "", show: false });

  useEffect(() => {
    // Prevenir carga si se está eliminando
    if (isDeleting) return;

    const fetchDetalleProducto = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [prodRes, movRes /*, alertasRes*/] = await Promise.all([
          api.get(`/repuestos/${id}`, config),
          api.get(`/repuestos/movimientos/${id}`, config),
          // api.get(`/alerts/product/${id}`, config),
        ]);
        setProducto(prodRes.data);
        setMovimientos(
          movRes.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        ); // Ordenar por fecha más reciente
        // setAlertas(alertasRes.data);
      } catch (error) {
        console.error("Error cargando el detalle:", error);
        // Si el repuesto no existe, redirigir
        if (error.response?.status === 404) {
          navigate("/inventario", {
            state: { message: "El repuesto no existe o fue eliminado" },
          });
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDetalleProducto();
  }, [id, token, isDeleting, navigate]);

  const handleDelete = async () => {
    if (
      !window.confirm(
        "⚠️ ¿Seguro que deseas eliminar este repuesto? Esta acción es irreversible."
      )
    )
      return;

    setIsDeleting(true); // Prevenir que useEffect intente cargar de nuevo

    try {
      await api.delete(`/repuestos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAlert({
        type: "success",
        message: "Repuesto eliminado exitosamente",
        show: true,
      });

      setTimeout(() => {
        navigate("/inventario");
      }, 1500);
    } catch (error) {
      setIsDeleting(false);
      const errorMsg =
        error.response?.data?.error || "Error al eliminar el repuesto";
      setAlert({
        type: "error",
        message: errorMsg,
        show: true,
      });
      console.error(error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        Cargando detalles del repuesto...
      </div>
    );
  if (!producto)
    return (
      <div className="flex justify-center items-center h-screen text-xl text-red-500">
        ❌ Repuesto no encontrado o eliminado.
      </div>
    );

  // Lógica para el color del stock
  const stockColorClass =
    producto.stock < 5 // Asumiendo un umbral de 5 para stock bajo
      ? "text-red-600"
      : producto.stock < 20
      ? "text-yellow-600"
      : "text-green-600";

  // Formato para el precio
  const formatCurrency = (amount) => {
    if (!amount) return "No especificado";
    return `$ ${parseFloat(amount)
      .toFixed(0)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <main className="p-6 max-w-7xl mx-auto">
          {/* Header y Acciones Principales */}
          <div className="space-y-4">
            <button
              onClick={() => navigate("/inventario")} // Mejor ir a la lista de inventario
              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition text-sm font-medium"
            >
              <ArrowLeft size={16} /> Volver a Inventario
            </button>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white p-6 rounded-xl shadow-md border border-gray-100">
              {/* Título y Referencia */}
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 text-blue-700 p-3 rounded-xl">
                  <Package2 size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    {producto.nombre}
                  </h1>
                  <p className="text-sm text-gray-500">
                    Referencia:{" "}
                    <span className="font-mono bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm font-semibold">
                      {producto.referencia}
                    </span>
                  </p>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="flex flex-wrap gap-2 lg:justify-end">
                <ActionButton
                  icon={PlusCircle}
                  label="Entrada"
                  onClick={() => navigate(`/inventario/entradas/${id}`)}
                  colorClass="bg-green-600 hover:bg-green-700 text-white"
                />
                <ActionButton
                  icon={MinusCircle}
                  label="Salida"
                  onClick={() => navigate(`/inventario/salidas/${id}`)}
                  colorClass="bg-orange-600 hover:bg-orange-700 text-white"
                />
                <ActionButton
                  icon={Edit}
                  label="Editar"
                  onClick={() => navigate(`/inventario/editar/${id}`)}
                  colorClass="bg-blue-600 hover:bg-blue-700 text-white"
                />
                <ActionButton
                  icon={Trash}
                  label="Eliminar"
                  onClick={handleDelete}
                  colorClass="bg-red-600 hover:bg-red-700 text-white"
                />
              </div>
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Tarjetas de Información Clave (Métricas) */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoCard
              icon={AlertTriangle}
              title="Stock Actual"
              value={producto.stock}
              colorClass={stockColorClass}
            />
            <InfoCard
              icon={Layers}
              title="Categoría"
              value={producto.categoria}
              colorClass="text-purple-600"
            />
            <InfoCard
              icon={Tag}
              title="Marca"
              value={producto.marca || "N/A"}
              colorClass="text-indigo-600"
            />
            <InfoCard
              icon={ShoppingBag}
              title="Precio de Venta"
              value={formatCurrency(producto.precio_unitario_venta)}
              colorClass="text-teal-600"
            />
          </section>

          {/* Detalles y Movimientos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna 1: Información Detallada */}
            <section className="lg:col-span-1 bg-white rounded-xl shadow-md border border-gray-100 p-6 h-fit">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-800 border-b pb-2">
                <FileText size={20} /> Detalles del Repuesto
              </h2>
              <div className="space-y-3 text-base">
                <p className="flex items-center gap-2">
                  <Package2 size={16} className="text-blue-500" />
                  <strong>Referencia:</strong> {producto.referencia}
                </p>
                <p className="flex items-center gap-2">
                  <MapPin size={16} className="text-orange-500" />
                  <strong>Ubicación:</strong>{" "}
                  {producto.ubicacion || "No asignada"}
                </p>
                {/* Agrega más campos si son relevantes y están disponibles, por ejemplo: */}
                {/* <p className="flex items-center gap-2">
                  <Calendar size={16} className="text-green-500" />
                  <strong>Última entrada:</strong> {new Date(producto.ultima_entrada).toLocaleDateString()}
                </p> */}
              </div>
            </section>

            {/* Columna 2: Historial de Movimientos */}
            <section className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4 border-b pb-2">
                <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-800">
                  <History size={20} /> Historial de Movimientos
                </h2>
                <button
                  onClick={() => navigate(`/inventario/movimientos/${id}`)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
                >
                  Ver todos &rarr;
                </button>
              </div>

              {movimientos.length > 0 ? (
                <div className="overflow-x-auto max-h-96">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 text-gray-600 sticky top-0">
                      <tr>
                        <th className="text-left px-4 py-2">Fecha</th>
                        <th className="text-left px-4 py-2">Tipo</th>
                        <th className="text-left px-4 py-2">Cantidad</th>
                        <th className="text-left px-4 py-2">Destino/Origen</th>
                        <th className="text-left px-4 py-2">Motivo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {movimientos.slice(0, 10).map((mov, i) => (
                        <tr
                          key={i}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-2">
                            {formatDateLocal(mov.fecha)}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                mov.tipo_movimiento === "Entrada"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {mov.tipo_movimiento}
                            </span>
                          </td>
                          <td
                            className={`px-4 py-2 font-medium ${
                              mov.tipo_movimiento === "Entrada"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {mov.tipo_movimiento === "Entrada"
                              ? `+${mov.cantidad}`
                              : `-${mov.cantidad}`}
                          </td>
                          <td className="px-4 py-2">
                            {mov.contraparte || "—"}
                          </td>
                          <td className="px-4 py-2 text-gray-500">
                            {mov.subtipo || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-base text-gray-500 py-4">
                  Aún no hay movimientos registrados para este repuesto.
                </p>
              )}
            </section>
          </div>

          {/* Alertas (Mantenido como sección comentada para fácil activación) */}
          {/*
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-600 border-b pb-2">
              <AlertTriangle size={20} /> Alertas de Inventario
            </h2>
            {alertas.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {alertas.map((alerta, index) => (
                  <li key={index} className="py-2 text-base flex items-center gap-2">
                    <AlertTriangle size={16} className="text-red-500" /> {alerta.mensaje || alerta.descripcion}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-base text-gray-500">
                No hay alertas activas para este repuesto.
              </p>
            )}
          </section>
          */}
        </main>
      </div>
      {alert.show && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}
    </div>
  );
};

export default RepuestoDetailPage;
