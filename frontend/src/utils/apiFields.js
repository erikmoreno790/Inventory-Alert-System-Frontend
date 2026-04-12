/**
 * Constantes de campos del backend para mantener consistencia
 * entre las respuestas de la API y el uso en el frontend.
 */

// Campos del endpoint GET /api/dashboard/summary
export const DASHBOARD = {
  TOTAL_COTIZACIONES: 'totalCotizaciones',
  TOTAL_REPUESTOS: 'totalRepuestos',
  STOCK_BAJO: 'stockBajo',
  TOTAL_ALERTAS_NO_LEIDAS: 'totalAlertasNoLeidas',
  ESTADISTICAS: 'estadisticas',
  ULTIMOS_REPUESTOS: 'ultimosRepuestos',
  ULTIMOS_MOVIMIENTOS: 'ultimosMovimientos',
};

// Campos de un repuesto
export const REPUESTO = {
  ID: 'repuesto_id',
  NOMBRE: 'nombre',
  CATEGORIA: 'categoria',
  STOCK: 'stock',
  REFERENCIA: 'referencia',
  FECHA_ACTUALIZACION: 'fecha_actualizacion',
  CODIGO_BARRAS: 'codigo_barras',
};

// Campos de un movimiento
export const MOVIMIENTO = {
  ID: 'movimiento_id',
  REPUESTO_ID: 'repuesto_id',
  REPUESTO_NOMBRE: 'repuesto',
  CATEGORIA: 'categoria',
  REFERENCIA: 'referencia',
  CANTIDAD: 'cantidad',
  FECHA: 'fecha',
  SUBTIPO: 'subtipo',
  TIPO_MOVIMIENTO: 'tipo_movimiento',
};

// Campos de estadísticas de alertas
export const ESTADISTICA_ALERTA = {
  PRIORIDAD: 'prioridad',
  CANTIDAD: 'cantidad',
  NO_LEIDAS: 'no_leidas',
};

// Valores de tipo de movimiento
export const TIPO_MOVIMIENTO = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
};

// Valores de prioridad de alertas
export const PRIORIDAD = {
  URGENTE: 'urgente',
  ALTA: 'alta',
  MODERADA: 'moderada',
  BAJA: 'baja',
};

// Umbral de stock bajo para badge visual
export const STOCK_BAJO_UMBRAL = 5;
