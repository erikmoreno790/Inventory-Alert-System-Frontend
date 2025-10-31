import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const QuotationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(null); // 🔹 Imagen para vista previa

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // 🔹 Obtener detalles de la cotización (definido dentro del useEffect para evitar dependencias faltantes)
  useEffect(() => {
    const fetchQuotation = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const { data } = await api.get(`/cotizaciones/${id}`, config);
        console.log("Detalles de la cotización:", data);
        setQuotation(data);
      } catch (err) {
        console.error(err);
        alert("Error cargando detalles de la cotización");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuotation();
    }
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await api.put(
        `/cotizaciones/${id}`,
        { ...quotation, estatus: newStatus },
        config
      );
      setQuotation({ ...quotation, estatus: newStatus });
      alert(`Cotización ${newStatus.toLowerCase()} con éxito`);
    } catch (err) {
      console.error(err);
      alert("Error actualizando el estado de la cotización");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-500">Cargando detalles...</p>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-red-500">No se encontró la cotización.</p>
      </div>
    );
  }

  // 🔹 Función para formatear moneda
  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(value || 0);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
       <div
        className={`flex-1 transition-all duration-300 
    ${sidebarOpen ? "ml-64" : "ml-0"} md:ml-64`}
      >
        <TopNavbar onToggleSidebar={toggleSidebar} />
        <main className="p-6 max-w-5xl mx-auto">
          {/* 🔹 Encabezado */}
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">
              Cotización #{quotation.id_cotizacion}
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  navigate(`/cotizacion/pdf/${quotation.id_cotizacion}`)
                }
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                Imprimir
              </button>
              {quotation.estatus !== "Aprobada" && (
                <button
                  onClick={() => handleStatusChange("Aprobada")}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  Aprobar
                </button>
              )}
              {quotation.estatus !== "Rechazada" && (
                <button
                  onClick={() => handleStatusChange("Rechazada")}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                >
                  Rechazar
                </button>
              )}
              <button
                onClick={() =>
                  navigate(`/cotizaciones/editar/${quotation.id_cotizacion}`)
                }
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
              >
                Editar / Modificar
              </button>
              <button
                onClick={() => navigate("/historial-cotizaciones")}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                Regresar
              </button>
            </div>
          </div>

          {/* 🔹 Sección de datos principales */}
          <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  Datos del Cliente
                </h2>
                <p>
                  <strong>Nombre:</strong> {quotation.nombre_cliente}
                </p>
                <p>
                  <strong>Vehículo:</strong> {quotation.vehiculo}
                </p>
                <p>
                  <strong>Kilometraje:</strong> {quotation.kilometraje || "N/A"}
                </p>
                <p>
                  <strong>Telefono:</strong> {quotation.telefono || "N/A"}
                </p>
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  Detalles de Cotización
                </h2>
                <p>
                  <strong>Mecánico:</strong>{" "}
                  {quotation.nombre_mecanico || "N/A"}
                </p>
                <p>
                  {/*Fecha en formato YYYY/MM/DD zona Colombia*/}
                  <strong>Fecha:</strong>{" "}
                  {new Date(quotation.fecha).toLocaleString("es-CO", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </p>
                <p>
                  <strong>Estatus:</strong> {quotation.estatus}
                </p>
              </div>
            </div>
          </div>

          {/* 🔹 Observaciones */}
          {quotation.observaciones && (
            <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold mb-2">Observaciones</h2>
              <p className="text-gray-700">{quotation.observaciones}</p>
            </div>
          )}

          {/* 🔹 Imágenes */}
          {quotation.imagenes && quotation.imagenes.length > 0 && (
            <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">Imágenes Asociadas</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {quotation.imagenes.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative border rounded-lg overflow-hidden"
                  >
                    <img
                      src={img.url} // ✅ Usamos la URL completa del backend
                      alt={`cotizacion-img-${idx}`}
                      className="w-full h-32 object-cover cursor-pointer hover:opacity-80 transition"
                      onClick={() => setSelectedImage(img.url)} // ✅ También aquí
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🔹 Tabla de ítems */}
          {quotation.items && quotation.items.length > 0 && (
            <div className="bg-white shadow-lg rounded-2xl p-6 mb-6">
              <h2 className="text-lg font-semibold mb-4">
                Productos / Servicios
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2 text-left">Producto</th>
                      <th className="border p-2 text-center">Cantidad</th>
                      <th className="border p-2 text-right">Precio Unitario</th>
                      <th className="border p-2 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="border p-2">{item.descripcion}</td>
                        <td className="border p-2 text-center">
                          {item.cantidad}
                        </td>
                        <td className="border p-2 text-right">
                          {formatCurrency(item.precio_unitario)}
                        </td>
                        <td className="border p-2 text-right font-semibold">
                          {formatCurrency(item.sub_total || item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 🔹 Totales */}
          <div className="bg-white shadow-lg rounded-2xl p-6">
            <div className="flex justify-end">
              <div className="w-full md:w-1/3">
                <div className="flex justify-between py-1">
                  <span className="font-medium">Subtotal:</span>
                  <span>{formatCurrency(quotation.subtotal)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium">Descuento:</span>
                  <span>{formatCurrency(quotation.descuento)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="font-medium">Total:</span>
                  <span className="text-xl font-bold">
                    {formatCurrency(quotation.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 🔹 Modal de Imagen */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Vista previa"
              className="max-h-[80vh] max-w-[90vw] rounded-lg"
            />
            <button
              className="absolute top-2 right-2 bg-red-600 text-white rounded-full px-3 py-1"
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

export default QuotationDetailsPage;
