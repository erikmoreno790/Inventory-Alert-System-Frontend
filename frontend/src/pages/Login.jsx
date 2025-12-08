import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Limpiar localStorage al montar el componente de login
  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Limpiar errores previos

    try {
      const res = await api.post("/auth/login", { email, password });

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        // Usar window.location para forzar recarga completa
        window.location.href = "/dashboard";
      } else {
        setError("Respuesta del servidor inválida");
      }
    } catch (err) {
      console.error("Error en login:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Error al iniciar sesión. Verifica tus credenciales."
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-amber-400">
          Iniciar Sesión
        </h1>
        <p className="text-gray-400 mb-6 text-center">
          Por favor, ingresa tus credenciales
        </p>
        {error && (
          <div className="bg-red-500 text-white px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-500 text-white px-4 py-2 rounded-md my-2"
            required
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-500 text-white px-4 py-2 rounded-md my-2"
            required
          />

          <div className="flex items-center justify-center mb-4 mt-4">
            <button
              type="submit"
              className="bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-colors duration-300"
            >
              Iniciar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
