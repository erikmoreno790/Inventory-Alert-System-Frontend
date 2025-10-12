import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  History,
  Edit,
  Trash,
  PlusCircle,
  FileText,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const RepuestoDetailPage = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Estados para controlar la interfaz
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [producto, setProducto] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Carga la información del repuesto, sus movimientos y alertas
  useEffect(() => {
    const fetchDetalleProducto = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [prodRes, movRes, alertasRes] = await Promise.all([
          api.get(`/repuestos/${id}`, config),
          //api.get(`/repuestos/movimientos/${id}`, config),
          // api.get(`/alerts/product/${id}`, config),
        ]);
        setProducto(prodRes.data);
        setMovimientos(movRes.data);
        setAlertas(alertasRes.data);
      } catch (error) {
        console.error(
          "Error cargando el detalle:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };
    fetchDetalleProducto();
  }, [id, token]);

  // Función para eliminar repuesto
  const handleDelete = async () => {
    if (!window.confirm("¿Seguro que deseas eliminar este repuesto?")) return;
    try {
      await api.delete(`/repuestos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Repuesto eliminado con éxito.");
      navigate("/inventario");
    } catch (error) {
      alert("Error al eliminar el repuesto.");
      console.error(error);
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Cargando detalles...</div>;
  }

  if (!producto) {
    return <div className="p-6 text-red-500">Repuesto no encontrado.</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar y Navbar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : ""
        } transition-all duration-300`}
      >
        <TopNavbar onToggleSidebar={toggleSidebar} />
        <main>
          <div className="p-6 space-y-6">
            {/* Botón de regreso */}
            <Link
              to="/inventario"
              className="text-blue-600 hover:underline flex items-center mb-4"
            >
              <ArrowLeft className="mr-2" size={16} /> Volver al Inventario
            </Link>

            {/* Header del producto con acciones */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <h1 className="text-3xl font-bold">{producto.nombre}</h1>
              <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                <Link
                  to={`/inventario/editar/${id}`}
                  className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                >
                  <Edit size={18} /> Editar
                </Link>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-1 px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  <Trash size={18} /> Eliminar
                </button>
                <Link
                  to={`/inventario/movimiento/nuevo/${id}`}
                  className="flex items-center gap-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  <PlusCircle size={18} /> Movimiento
                </Link>
                <button
                  onClick={() => alert("Generar PDF en construcción")}
                  className="flex items-center gap-1 px-3 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                >
                  <FileText size={18} /> PDF
                </button>
              </div>
            </div>

            {/* Card de información general */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 rounded-lg shadow">
              <p>
                <strong>Categoría:</strong> {producto.categoria}
              </p>
              <p>
                <strong>Marca:</strong> {producto.marca || "No especificado"}
              </p>
              <p>
                <strong>Stock actual:</strong>{" "}
                <span
                  className={`${
                    producto.stock < producto.stock_minimo
                      ? "text-red-600 font-bold"
                      : "text-green-600 font-bold"
                  }`}
                >
                  {producto.stock}
                </span>
              </p>
              <p>
                <strong>Stock mínimo:</strong> {producto.stock_minimo}
              </p>
              <p>
                <strong>Ubicación:</strong>{" "}
                {producto.ubicacion || "No asignada"}
              </p>
              <p>
                <strong>Precio:</strong>{" "}
                {/* Formatear precio_unitario a estilo con punto de mil ej: $ 128.500 sin decimales*/}
                {parseFloat(producto.precio_unitario)
                  .toFixed(0)
                  .replace(/\B(?=(\d{3})+(?!\d))/g, ".")
                  ? `$ ${parseFloat(producto.precio_unitario)
                      .toFixed(0)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
                  : "No especificado"}
              </p>
              <p className="md:col-span-2">
                <strong>Referencia:</strong>{" "}
                {producto.referencia || "Sin referencia disponible"}
              </p>
            </div>

            {/* Sección de alertas */}
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-red-600">
                <AlertTriangle size={20} /> Alertas Asociadas
              </h2>
              {alertas.length > 0 ? (
                <ul className="space-y-2 bg-white p-4 rounded-lg shadow">
                  {alertas.map((alerta, index) => (
                    <li key={index} className="text-sm border-b pb-2">
                      🔔 {alerta.mensaje || alerta.descripcion}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">
                  No hay alertas asociadas a este repuesto.
                </p>
              )}
            </div>

            {/* Historial de movimientos */}
            <div>
              <h2 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <History size={20} /> Historial de Movimientos
              </h2>
              {movimientos.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border rounded-lg shadow">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="text-left px-4 py-2">Tipo</th>
                        <th className="text-left px-4 py-2">Cantidad</th>
                        <th className="text-left px-4 py-2">Fecha</th>
                        <th className="text-left px-4 py-2">Responsable</th>
                        <th className="text-left px-4 py-2">Observaciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movimientos.map((mov, i) => (
                        <tr
                          key={i}
                          className="border-t hover:bg-gray-50 text-sm"
                        >
                          <td className="px-4 py-2 capitalize">{mov.tipo}</td>
                          <td className="px-4 py-2">{mov.cantidad}</td>
                          <td className="px-4 py-2">
                            {new Date(mov.fecha).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">{mov.usuario || "N/A"}</td>
                          <td className="px-4 py-2">
                            {mov.observacion || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  Este repuesto no tiene movimientos registrados.
                </p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default RepuestoDetailPage;
