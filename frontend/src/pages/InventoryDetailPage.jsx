import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  AlertTriangle,
  History,
  Edit,
  Trash,
  FileText,
  Package2,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const RepuestoDetailPage = () => {
  const { id } = useParams();
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [producto, setProducto] = useState(null);
  const [movimientos, setMovimientos] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  useEffect(() => {
    const fetchDetalleProducto = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [prodRes, movRes, alertasRes] = await Promise.all([
          api.get(`/repuestos/${id}`, config),
          // api.get(`/repuestos/movimientos/${id}`, config),
          // api.get(`/alerts/product/${id}`, config),
        ]);
        setProducto(prodRes.data);
        setMovimientos(movRes.data);
        setAlertas(alertasRes.data);
      } catch (error) {
        console.error("Error cargando el detalle:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetalleProducto();
  }, [id, token]);

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

  if (loading)
    return <div className="p-6 text-gray-600">Cargando detalles...</div>;
  if (!producto)
    return <div className="p-6 text-red-500">Repuesto no encontrado.</div>;

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-800">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : ""
        } transition-all duration-300`}
      >
        <TopNavbar onToggleSidebar={toggleSidebar} />

        <main className="p-8 space-y-8">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Regresar
          </button>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 text-blue-700 p-2 rounded-full">
                <Package2 size={28} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">{producto.nombre}</h1>
                {/* Mostrar referencia resaltada para mayor visualizacion */}
                <p className="text-base text-black-500">
                  Referencia:{" "}
                  <span className="font-mono bg-yellow-300 px-2 py-1 rounded">
                    {producto.referencia}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/inventario/editar/${id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
              >
                <Edit size={16} /> Editar
              </button>
              <button
                onClick={handleDelete}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                <Trash size={16} /> Eliminar
              </button>
              <button
                onClick={() => navigate(`/inventario/movimientos/${id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <History size={16} /> Movimientos
              </button>
            </div>
          </div>

          {/* Información general */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-4 text-orange-700">
              <FileText size={20} className="inline-block mr-2" />
              Información General
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-base ">
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
                      ? "text-red-600 font-semibold"
                      : "text-green-600 font-semibold"
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
                {producto.precio_unitario
                  ? `$ ${parseFloat(producto.precio_unitario)
                      .toFixed(0)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
                  : "No especificado"}
              </p>
            </div>
          </section>

          {/* Alertas */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} /> Alertas Asociadas
            </h2>
            {alertas.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {alertas.map((alerta, index) => (
                  <li key={index} className="py-2 text-base">
                    🔔 {alerta.mensaje || alerta.descripcion}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">
                No hay alertas para este repuesto.
              </p>
            )}
          </section>

          {/* Movimientos */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-700">
              <History size={20} /> Historial de Movimientos
            </h2>
            {movimientos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-base border border-gray-100 rounded-lg">
                  <thead className="bg-gray-100 text-gray-700">
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
                        className="border-t hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-2 capitalize">{mov.tipo}</td>
                        <td className="px-4 py-2">{mov.cantidad}</td>
                        <td className="px-4 py-2">
                          {new Date(mov.fecha).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-2">{mov.usuario || "N/A"}</td>
                        <td className="px-4 py-2">{mov.observacion || "—"}</td>
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
          </section>
        </main>
      </div>
    </div>
  );
};

export default RepuestoDetailPage;
