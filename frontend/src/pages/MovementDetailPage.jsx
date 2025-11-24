import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Package2, Edit, Trash, FileText, AlertCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";
import { toast } from "react-toastify";

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
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-600 text-lg animate-pulse">
          Cargando detalles...
        </div>
      </div>
    );
  }

  // Error state
  if (error || !movimiento) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-red-500 text-lg flex items-center gap-2">
          <AlertCircle size={24} />
          {error || "Movimiento no encontrado."}
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
        <main className="p-8 space-y-8 max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Regresar
          </button>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 text-blue-700 p-3 rounded-full">
                <Package2 size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {movimiento.repuesto}
                </h1>
                <p className="text-sm text-gray-500">
                  Referencia:{" "}
                  <span className="font-mono bg-yellow-100 px-2 py-1 rounded">
                    {movimiento.referencia}
                  </span>
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {/* <button
                onClick={() =>
                  navigate(
                    `/inventario/movimiento/editar/${tipo.toLowerCase()}/${id}`
                  )
                }
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                aria-label="Editar movimiento"
              >
                <Edit size={16} /> Editar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className={`flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors ${
                  isDeleting ? "opacity-50 cursor-not-allowed" : ""
                }`}
                aria-label={
                  isDeleting ? "Eliminando..." : "Eliminar movimiento"
                }
              >
                <Trash size={16} /> {isDeleting ? "Eliminando..." : "Eliminar"}
              </button> */}
            </div>
          </div>

          {/* General Information */}
          <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold mb-6 text-orange-700 flex items-center gap-2">
              <FileText size={20} />
              Información General
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <div>
                <strong className="text-gray-600">Repuesto:</strong>
                <p className="mt-1">{movimiento.repuesto}</p>
              </div>
              <div>
                <strong className="text-gray-600">Categoría:</strong>
                <p className="mt-1">{movimiento.categoria}</p>
              </div>
              <div>
                <strong className="text-gray-600">Cantidad:</strong>
                <p className="mt-1">{movimiento.cantidad}</p>
              </div>
              <div>
                <strong className="text-gray-600">Factura:</strong>
                <p className="mt-1">{movimiento.factura}</p>
              </div>
              <div>
                <strong className="text-gray-600">Observación:</strong>
                <p className="mt-1">{movimiento.observacion}</p>
              </div>
              <div>
                <strong className="text-gray-600">Fecha:</strong>
                <p className="mt-1">{movimiento.fecha}</p>
              </div>
              <div>
                <strong className="text-gray-600">Tipo de movimiento:</strong>
                <p className="mt-1">{movimiento.tipo_movimiento}</p>
              </div>
              <div>
                <strong className="text-gray-600">Motivo:</strong>
                <p className="mt-1">{movimiento.subtipo}</p>
              </div>
              <div>
                <strong className="text-gray-600">Contraparte:</strong>
                <p className="mt-1">{movimiento.contraparte}</p>
              </div>
              <div>
                <strong className="text-gray-600">Usuario responsable:</strong>
                <p className="mt-1">{movimiento.usuario}</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default MovementDetailPage;
