import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";

const InventoryFormPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { id } = useParams();
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    nombre: "",
    categoria: "",
    marca: "",
    compatibilidad: "",
    proveedor: "",
    stock: "",
    stock_minimo: "",
    precio_unitario_costo: "",
    precio_untario_venta: "",
    unidad_medida: "unidad",
    estado: "disponible",
    referencia: "",
    ubicacion: "",
  });

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const categorias = [
    "Amortiguador",
    "Disco",
    "Campana",
    "Bomba de Freno",
    "Correa",
    "Pastilla de Freno",
    "Manguera de Freno",
    "Bujía",
    "Retenedor",
    "Banda de Freno",
    "Guardapolvo",
    "Punta de eje",
    "Cilindro",
    "Booster",
    "Guaya",
  ];

  // 🔹 Si hay ID, cargar datos del producto para edición
  useEffect(() => {
    if (!id) return;

    const fetchProducto = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await api.get(`repuestos/${id}`, config);
        setForm({
          nombre: res.data.nombre || "",
          referencia: res.data.referencia || "",
          categoria: res.data.categoria || "",
          marca: res.data.marca || "",
          compatibilidad: res.data.compatibilidad || "",
          proveedor: res.data.proveedor || "",
          stock: res.data.stock || "",
          stock_minimo: res.data.stock_minimo || "",
          precio_unitario_costo: res.data.precio_unitario_costo || "",
          precio_unitario_venta: res.data.precio_unitario_venta || "",
          unidad_medida: res.data.unidad_medida || "unidad",
          estado: res.data.estado || "disponible",
          ubicacion: res.data.ubicacion || "",
        });
      } catch (err) {
        console.error("Error cargando producto:", err);
      }
    };

    fetchProducto();
  }, [id, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    };

    try {
      if (id) {
        await api.put(`/repuestos/${id}`, form, config);
      } else {
        console.log(form); // Verificar datos del formulario
        await api.post("/repuestos", form, config);
      }
      navigate("/inventario");
    } catch (err) {
      console.error(
        "Error al guardar el repuesto:",
        err.response?.data || err.message
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : ""
        } transition-all duration-300`}
      >
        <TopNavbar onToggleSidebar={toggleSidebar} />
        <main className="p-6 max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">
              {id ? "Editar Repuesto" : "Nuevo Repuesto"}
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
              <select
                name="categoria"
                value={form.categoria}
                onChange={handleChange}
                required
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Seleccione una categoría</option>
                {categorias.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
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
                Stock actual *
              </label>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                required
                min={0}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Stock mínimo */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Stock mínimo
              </label>
              <input
                type="number"
                name="stock_minimo"
                value={form.stock_minimo}
                onChange={handleChange}
                min={0}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Precio unitario de costo */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Precio unitario de Costo*
              </label>
              <input
                type="number"
                name="precio_unitario_costo"
                value={form.precio_unitario_costo}
                onChange={handleChange}
                required
                min={0}
                step="0.01"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Precio unitario de venta */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Precio unitario de Venta*
              </label>
              <input
                type="number"
                name="precio_unitario_venta"
                value={form.precio_unitario_venta}
                onChange={handleChange}
                required
                min={0}
                step="0.01"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Unidad de medida */}
            <div>
              <label className="block text-gray-700 mb-2 font-medium">
                Unidad de medida
              </label>
              <select
                name="unidad_medida"
                value={form.unidad_medida}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="unidad">Unidad</option>
                <option value="par">Par</option>
                <option value="juego">Juego</option>
                <option value="kit">Kit</option>
              </select>
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

            {/* Botón */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
              >
                {id ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default InventoryFormPage;
