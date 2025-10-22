import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";
import AlertMessage from "../components/AlertMessage";

const EditRepuestoPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const token = localStorage.getItem("token");
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    marca: "",
    compatibilidad: "",
    proveedor: "",
    stock: "",
    stock_minimo: "",
    precio_unitario_costo: "",
    precio_unitario_venta: "",
    unidad_medida: "",
    estado: "",
    referencia: "",
    ubicacion: "",
  });

  // 🔹 Cargar datos del repuesto existente
  useEffect(() => {
    if (!id) return;

    const fetchRepuesto = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await api.get(`/repuestos/${id}`, config);
        setForm(res.data);
      } catch (err) {
        console.error("Error cargando repuesto:", err);
      }
    };

    fetchRepuesto();
  }, [id, token]);

  // 🔹 Manejar cambios
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Actualizar repuesto
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };
      //Salida por consola para ver datos json que se envian
      console.log("Datos enviados:", form);

      await api.put(`/repuestos/${id}`, form, config);
      setAlert({
        show: true,
        type: "success",
        message: "Repuesto actualizado correctamente",
      });
      setTimeout(() => navigate("/inventario"), 2000);
    } catch (err) {
      console.error(
        "Error actualizando repuesto:",
        err.response?.data || err.message
      );
      setAlert({
        show: true,
        type: "error",
        message: "Error al actualizar el repuesto",
      });
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : ""
        }`}
      >
        <TopNavbar onToggleSidebar={toggleSidebar} />
        <main className="p-6 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              Editar Repuesto
            </h2>
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Regresar
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-xl shadow-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {/* Nombre */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Nombre *
              </label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Referencia */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Referencia
              </label>
              <input
                type="text"
                name="referencia"
                value={form.referencia}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Categoría *
              </label>
              <input
                type="text"
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Marca */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Marca
              </label>
              <input
                type="text"
                name="marca"
                value={form.marca}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Compatibilidad */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Compatibilidad
              </label>
              <input
                type="text"
                name="compatibilidad"
                value={form.compatibilidad}
                onChange={handleChange}
                placeholder="Ej: Toyota Hilux 2015-2020"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Proveedor */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Proveedor
              </label>
              <input
                type="text"
                name="proveedor"
                value={form.proveedor}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Stock actual
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min={0}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Precio de costo*/}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Precio unitario de costo
              </label>
              <input
                type="number"
                name="precio_unitario_costo"
                value={form.precio_unitario_costo}
                onChange={handleChange}
                min={0}
                step="0.01"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Precio de venta */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Precio unitario de venta
              </label>
              <input
                type="number"
                name="precio_unitario_venta"
                value={form.precio_unitario_venta}
                onChange={handleChange}
                min={0}
                step="0.01"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Estado
              </label>
              <select
                name="estado"
                value={form.estado}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="disponible">Disponible</option>
                <option value="agotado">Agotado</option>
                <option value="descontinuado">Descontinuado</option>
              </select>
            </div>

            {/* Ubicación */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Ubicación
              </label>
              <input
                type="text"
                name="ubicacion"
                value={form.ubicacion}
                onChange={handleChange}
                placeholder="Ej: Estante A3"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Botón Guardar */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </main>
      </div>
      {/*Div centrado en la parte superior */}
      {alert.show && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ show: false })}
        />
      )}
    </div>
  );
};

export default EditRepuestoPage;
