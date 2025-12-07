import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000, // 30 segundos de timeout
});

// INTERCEPTOR: añade automáticamente el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Error en la petición:', error);
    return Promise.reject(error);
  }
);

// Interceptor de respuesta: manejo global de errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Error de red o timeout
    if (!error.response) {
      console.error('Error de red o servidor no disponible:', error.message);
      return Promise.reject({
        message: 'No se pudo conectar con el servidor. Verifica tu conexión.',
        originalError: error
      });
    }

    // Token expirado o inválido
    if (error.response?.status === 401) {
      console.warn('Sesión expirada, redirigiendo a login...');
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Evitar redirección si ya estamos en login
      if (window.location.pathname !== '/login') {
        window.location.href = "/login";
      }
    }

    // Error de rate limiting
    if (error.response?.status === 429) {
      console.warn('Demasiadas peticiones, por favor espera un momento');
    }

    // Errores 5xx del servidor
    if (error.response?.status >= 500) {
      console.error('Error del servidor:', error.response.data);
    }

    return Promise.reject(error);
  }
);

export default api;