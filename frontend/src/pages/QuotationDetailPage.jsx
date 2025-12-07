import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Edit,
  CheckCircle,
  XCircle,
  User,
  Car,
  Calendar,
  Phone,
  Wrench,
  DollarSign,
  Image as ImageIcon,
  AlertCircle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

// Componente auxiliar para las Tarjetas de Información
const InfoCard = ({
  icon: Icon,
  title,
  value,
  colorClass = "text-gray-700",
}) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 transition-transform hover:shadow-md">
    <Icon size={24} className={`opacity-70 ${colorClass}`} />
    <div className="flex flex-col">
      <p className="text-xs font-medium text-gray-500 uppercase">{title}</p>
      <span className={`text-lg font-semibold mt-0.5 ${colorClass}`}>
        {value}
      </span>
    </div>
  </div>
);

// Componente auxiliar para los botones de acción
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
    <Icon size={18} /> {label}
  </button>
);

const QuotationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [updating, setUpdating] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // 🔹 Obtener detalles de la cotización
  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/login");
          return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await api.get(`/cotizaciones/${id}`, config);
        console.log("Detalles de la cotización:", data);
        setQuotation(data);
      } catch (err) {
        console.error("Error cargando cotización:", err);
        const errorMsg =
          err.response?.status === 404
            ? "Cotización no encontrada"
            : "Error cargando detalles de la cotización";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuotation();
    }
  }, [id, navigate]);

  const handleStatusChange = async (newStatus) => {
    if (updating) return;

    const confirmMsg =
      newStatus === "Aprobada"
        ? "¿Confirmar aprobación de la cotización? Esto descontará los productos del inventario."
        : "¿Confirmar rechazo de la cotización?";

    if (!window.confirm(confirmMsg)) return;

    try {
      setUpdating(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await api.put(
        `/cotizaciones/${id}`,
        { ...quotation, estatus: newStatus },
        config
      );

      setQuotation({ ...quotation, estatus: newStatus });
      alert(`✅ Cotización ${newStatus.toLowerCase()} con éxito`);
    } catch (err) {
      console.error("Error actualizando estado:", err);
      const errorMsg =
        err.response?.data?.error ||
        "Error actualizando el estado de la cotización";
      alert(`❌ ${errorMsg}`);
    } finally {
      setUpdating(false);
    }
  };

  // 🔹 Función para formatear moneda
  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);

  // 🔹 Determinar color del badge de estado
  const getStatusBadge = (status) => {
    const badges = {
      Aprobada: "bg-green-100 text-green-800 border-green-300",
      Rechazada: "bg-red-100 text-red-800 border-red-300",
      Pendiente: "bg-yellow-100 text-yellow-800 border-yellow-300",
    };
    return badges[status] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            Cargando detalles de la cotización...
          </p>
        </div>
      </div>
    );
  }

  if (error || !quotation) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-800 mb-2">
            {error || "No se encontró la cotización"}
          </p>
          <button
            onClick={() => navigate("/historial-cotizaciones")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Volver al historial
          </button>
        </div>
      </div>
    );
  }

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
          {/* 🔹 Encabezado con breadcrumb y acciones */}
          <div className="mb-6">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
              <button
                onClick={() => navigate("/historial-cotizaciones")}
                className="hover:text-blue-600 transition flex items-center gap-1"
              >
                <ArrowLeft size={16} />
                Cotizaciones
              </button>
              <span>/</span>
              <span className="text-gray-800 font-medium">
                #{quotation.id_cotizacion}
              </span>
            </div>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-800">
                  Cotización #{quotation.id_cotizacion}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusBadge(
                    quotation.estatus
                  )}`}
                >
                  {quotation.estatus}
                </span>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-2">
                <ActionButton
                  icon={FileText}
                  label="Imprimir"
                  onClick={() =>
                    navigate(`/cotizacion/pdf/${quotation.id_cotizacion}`)
                  }
                  colorClass="bg-blue-600 text-white hover:bg-blue-700"
                />
                {quotation.estatus !== "Aprobada" && (
                  <ActionButton
                    icon={CheckCircle}
                    label="Aprobar"
                    onClick={() => handleStatusChange("Aprobada")}
                    colorClass="bg-green-600 text-white hover:bg-green-700"
                    disabled={updating}
                  />
                )}
                {quotation.estatus !== "Rechazada" && (
                  <ActionButton
                    icon={XCircle}
                    label="Rechazar"
                    onClick={() => handleStatusChange("Rechazada")}
                    colorClass="bg-red-600 text-white hover:bg-red-700"
                    disabled={updating}
                  />
                )}
                <ActionButton
                  icon={Edit}
                  label="Editar"
                  onClick={() =>
                    navigate(`/cotizaciones/editar/${quotation.id_cotizacion}`)
                  }
                  colorClass="bg-amber-600 text-white hover:bg-amber-700"
                />
              </div>
            </div>
          </div>

          {/* 🔹 Tarjetas de información clave */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <InfoCard
              icon={Calendar}
              title="Fecha"
              value={new Date(quotation.fecha).toLocaleDateString("es-CO", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
              colorClass="text-blue-600"
            />
            <InfoCard
              icon={User}
              title="Cliente"
              value={quotation.nombre_cliente || "N/A"}
              colorClass="text-purple-600"
            />
            <InfoCard
              icon={Wrench}
              title="Mecánico"
              value={quotation.nombre_mecanico || "N/A"}
              colorClass="text-orange-600"
            />
            <InfoCard
              icon={DollarSign}
              title="Total"
              value={formatCurrency(quotation.total)}
              colorClass="text-green-600"
            />
          </div>

          {/* 🔹 Detalles principales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Datos del Cliente */}
            <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <User size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Datos del Cliente
                </h2>
              </div>
              <div className="space-y-3">
                <DetailRow label="Nombre" value={quotation.nombre_cliente} />
                <DetailRow label="NIT/CC" value={quotation.nit_cc || "N/A"} />
                <DetailRow
                  label="Teléfono"
                  value={quotation.telefono || "N/A"}
                  icon={Phone}
                />
              </div>
            </div>

            {/* Datos del Vehículo */}
            <div className="bg-white shadow-md rounded-xl p-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <Car size={20} className="text-green-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Datos del Vehículo
                </h2>
              </div>
              <div className="space-y-3">
                <DetailRow
                  label="Vehículo"
                  value={quotation.vehiculo || "N/A"}
                />
                <DetailRow label="Placa" value={quotation.placa || "N/A"} />
                <DetailRow
                  label="Kilometraje"
                  value={
                    quotation.kilometraje
                      ? `${quotation.kilometraje.toLocaleString()} km`
                      : "N/A"
                  }
                />
              </div>
            </div>
          </div>

          {/* 🔹 Mecánicos asignados */}
          {(quotation.nombre_mecanico || quotation.segundo_mecanico) && (
            <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <Wrench size={20} className="text-orange-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Mecánicos Asignados
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quotation.nombre_mecanico && (
                  <DetailRow
                    label="Mecánico Principal"
                    value={quotation.nombre_mecanico}
                  />
                )}
                {quotation.segundo_mecanico && (
                  <DetailRow
                    label="Segundo Mecánico"
                    value={quotation.segundo_mecanico}
                  />
                )}
              </div>
            </div>
          )}

          {/* 🔹 Observaciones */}
          {quotation.observaciones && (
            <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <FileText size={20} className="text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Observaciones
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {quotation.observaciones}
              </p>
            </div>
          )}

          {/* 🔹 Imágenes */}
          {quotation.imagenes && quotation.imagenes.length > 0 && (
            <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <ImageIcon size={20} className="text-pink-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Imágenes Asociadas ({quotation.imagenes.length})
                </h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {quotation.imagenes.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-500 transition-all cursor-pointer shadow-sm hover:shadow-md"
                    onClick={() => setSelectedImage(img.url)}
                  >
                    <img
                      src={img.url}
                      alt={`cotizacion-img-${idx + 1}`}
                      className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                      <ImageIcon
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        size={24}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🔹 Tabla de ítems */}
          {quotation.items && quotation.items.length > 0 && (
            <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <FileText size={20} className="text-teal-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Productos / Servicios ({quotation.items.length})
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="text-left p-3 font-semibold text-gray-700">
                        #
                      </th>
                      <th className="text-left p-3 font-semibold text-gray-700">
                        Producto/Servicio
                      </th>
                      <th className="text-center p-3 font-semibold text-gray-700">
                        Cantidad
                      </th>
                      <th className="text-right p-3 font-semibold text-gray-700">
                        Precio Unit.
                      </th>
                      <th className="text-right p-3 font-semibold text-gray-700">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.items.map((item, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-gray-50 transition"
                      >
                        <td className="p-3 text-gray-600 font-medium">
                          {idx + 1}
                        </td>
                        <td className="p-3 text-gray-800">
                          {item.descripcion}
                        </td>
                        <td className="p-3 text-center text-gray-700 font-medium">
                          {item.cantidad}
                        </td>
                        <td className="p-3 text-right text-gray-700">
                          {formatCurrency(item.precio_unitario)}
                        </td>
                        <td className="p-3 text-right font-semibold text-gray-900">
                          {formatCurrency(item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 🔹 Totales */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md rounded-xl p-6 border border-blue-100">
            <div className="flex justify-end">
              <div className="w-full md:w-96 space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-blue-200">
                  <span className="font-medium text-gray-700">Subtotal:</span>
                  <span className="text-lg font-semibold text-gray-800">
                    {formatCurrency(quotation.subtotal)}
                  </span>
                </div>
                {quotation.porcentaje_descuento > 0 && (
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="font-medium text-gray-700">
                      Descuento ({quotation.porcentaje_descuento}%):
                    </span>
                    <span className="text-lg font-semibold text-red-600">
                      - {formatCurrency(quotation.descuento)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 bg-white rounded-lg px-4 shadow-sm">
                  <span className="text-lg font-bold text-gray-800">
                    TOTAL:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatCurrency(quotation.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 🔹 Modal de Imagen en Pantalla Completa */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-6xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage}
              alt="Vista previa"
              className="max-h-[90vh] max-w-full rounded-lg shadow-2xl"
            />
            <button
              className="absolute top-4 right-4 bg-red-600 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-red-700 transition shadow-lg"
              onClick={() => setSelectedImage(null)}
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente auxiliar para filas de detalles
const DetailRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <div className="flex items-center gap-2">
      {Icon && <Icon size={16} className="text-gray-400" />}
      <span className="text-sm font-medium text-gray-600">{label}:</span>
    </div>
    <span className="text-sm font-semibold text-gray-800">{value}</span>
  </div>
);

export default QuotationDetailsPage;
