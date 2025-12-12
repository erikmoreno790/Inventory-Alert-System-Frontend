/**
 * Utilidades para manejo correcto de fechas sin problemas de timezone
 */

/**
 * Formatea una fecha como string local (dd/MM/yyyy) sin conversión de timezone
 * @param {string|Date} dateInput - Fecha en formato ISO string o objeto Date
 * @returns {string} Fecha formateada como "dd/MM/yyyy"
 */
export const formatDateLocal = (dateInput) => {
    if (!dateInput) return "";

    let date;
    if (typeof dateInput === "string") {
        // Si es string ISO, extraer solo la parte de la fecha (YYYY-MM-DD)
        const dateOnly = dateInput.split("T")[0];
        const [year, month, day] = dateOnly.split("-");
        // Crear fecha usando los componentes directamente (sin conversión UTC)
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    } else {
        date = dateInput;
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
};

/**
 * Formatea una fecha como string local con hora (dd/MM/yyyy HH:mm)
 * @param {string|Date} dateInput - Fecha en formato ISO string o objeto Date
 * @returns {string} Fecha formateada como "dd/MM/yyyy HH:mm"
 */
export const formatDateTimeLocal = (dateInput) => {
    if (!dateInput) return "";

    const date = new Date(dateInput);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

/**
 * Convierte una fecha ISO a formato YYYY-MM-DD para inputs de tipo date
 * @param {string|Date} dateInput - Fecha en formato ISO string o objeto Date
 * @returns {string} Fecha en formato "YYYY-MM-DD"
 */
export const toInputDateFormat = (dateInput) => {
    if (!dateInput) return "";

    if (typeof dateInput === "string") {
        // Si ya está en formato ISO, extraer solo la fecha
        return dateInput.split("T")[0];
    }

    const date = new Date(dateInput);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};

/**
 * Obtiene la fecha actual en formato YYYY-MM-DD (zona horaria local)
 * @returns {string} Fecha actual en formato "YYYY-MM-DD"
 */
export const getTodayLocal = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
};
