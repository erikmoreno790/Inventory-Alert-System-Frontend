import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000, // 30 segundos de timeout
  withCredentials: true, // Importante para CORS con credenciales
  headers: {
    'Content-Type': 'application/json',
  }
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
    // Petición cancelada a propósito (p. ej. el usuario siguió escribiendo en un filtro)
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    // Error de red o timeout (la petición nunca obtuvo respuesta del servidor)
    if (!error.response) {
      const isTimeout = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
      console.error('Error de red o servidor no disponible:', error.code, error.message);
      return Promise.reject({
        type: isTimeout ? 'timeout' : 'network',
        message: isTimeout
          ? 'El servidor tardó demasiado en responder.'
          : 'No se pudo conectar con el servidor. Verifica tu conexión.',
        originalError: error
      });
    }

    // Token expirado o inválido - solo redirigir si NO es un error 404
    if (error.response?.status === 401) {
      console.warn('Sesión expirada o no autorizada');
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Evitar redirección si ya estamos en login
      if (window.location.pathname !== '/login') {
        console.log('Redirigiendo a login...');
        window.location.href = "/login";
      }
    }

    // Error 404 - No encontrado (no es problema de autenticación)
    if (error.response?.status === 404) {
      console.warn('Recurso no encontrado:', error.config?.url);
      // No limpiar localStorage ni redirigir, solo rechazar la promesa
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