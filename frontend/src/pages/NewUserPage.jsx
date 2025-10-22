import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff } from "lucide-react";

const NewUserPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password_hash: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombre || !formData.email || !formData.password_hash) {
      toast.warning("Por favor completa todos los campos obligatorios");
      return;
    }

    if (formData.password_hash !== confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // enviar con los nombres que espera el backend
      const payload = {
        name: formData.nombre,
        email: formData.email,
        password: formData.password_hash,
      };

      await api.post("/auth/register", payload, config);

      toast.success("Usuario creado exitosamente");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error al crear el usuario");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavbar />
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Crear Nuevo Usuario</h2>

          <form
            onSubmit={handleSubmit}
            className="max-w-md bg-white shadow-md rounded-lg p-6 space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Juan Pérez"
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ej: usuario@correo.com"
                className="w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password_hash"
                  value={formData.password_hash}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full border rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
                  className="w-full border rounded-md p-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Crear Usuario
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default NewUserPage;
