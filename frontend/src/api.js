import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // esto está bien
  // No necesitas withCredentials: true aquí porque NO usas cookies
});

// INTERCEPTOR: añade automáticamente el token a todas las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token"); // o como lo guardes tú
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Opcional pero muy útil: manejo global de errores 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // si guardas datos del usuario
      window.location.href = "/login"; // o usa tu router
    }
    return Promise.reject(error);
  }
);

export default api;