# Solución: Alertas no se muestran en AlertsHistoryPage

## 🔍 Problema Identificado

La página muestra "No hay alertas en el sistema" aunque existen repuestos con stock bajo porque:

1. **Las alertas NO se generan automáticamente al cargar la página**
2. Las alertas solo se generan cuando:
   - Se registra un movimiento de inventario (entrada/salida)
   - Se hace clic en el botón "Generar Alertas"

## ✅ Soluciones

### Solución 1: Generar Alertas Manualmente (Inmediato)

1. Abre la página de alertas: `/alertas`
2. Haz clic en el botón **"Generar Alertas"** (esquina superior derecha)
3. Espera a que aparezca el mensaje con los resultados
4. Las alertas aparecerán automáticamente

### Solución 2: Ejecutar endpoint desde el backend

Ejecuta este comando en tu terminal (con el servidor corriendo):

```bash
# PowerShell
$token = "TU_TOKEN_AQUI"
Invoke-RestMethod -Uri "http://localhost:3000/api/alerts/generar" -Method POST -Headers @{Authorization="Bearer $token"}
```

O usa Postman/Thunder Client:

```
POST http://localhost:3000/api/alerts/generar
Authorization: Bearer {tu_token}
```

### Solución 3: SQL Directo (Último recurso)

Si necesitas verificar que todo funciona, ejecuta directamente en PostgreSQL:

```sql
-- 1. Verificar repuestos con stock bajo
SELECT repuesto_id, nombre, stock
FROM repuestos
WHERE stock < 5 AND activo = TRUE;

-- 2. Verificar alertas existentes
SELECT * FROM alertas ORDER BY fecha DESC;

-- 3. Verificar que el campo prioridad existe
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'alertas' AND column_name = 'prioridad';
```

## 🔧 Cambios Realizados para Mejorar Depuración

### 1. Logs de Consola

Ahora verás en la consola del navegador:

- ✅ "Alertas recibidas: [...]"
- ✅ "Estadísticas recibidas: [...]"
- ✅ "Resultado de generar alertas: [...]"
- ❌ Mensajes de error detallados si algo falla

### 2. Mensaje Mejorado sin Alertas

En lugar de "¡Todo en orden!", ahora muestra:

- Explicación de cómo funcionan las alertas
- Sugerencia de hacer clic en "Generar Alertas"
- Botón prominente para generar alertas

### 3. Alerta Mejorada al Generar

Ahora muestra un desglose detallado:

```
⚠️ Urgentes: X
🔴 Altas: X
🟡 Moderadas: X
🗑️ Eliminadas: X
📊 Total procesadas: X
```

## 🐛 Cómo Verificar que Todo Funciona

### Paso 1: Abrir Consola del Navegador

1. Presiona `F12` en Chrome/Edge
2. Ve a la pestaña "Console"
3. Navega a `/alertas`

### Paso 2: Verificar Logs

Deberías ver:

```
Alertas recibidas: []
Estadísticas recibidas: []
```

Si ves errores como:

- `404 Not Found` → La ruta del backend está mal configurada
- `401 Unauthorized` → El token no es válido
- `500 Internal Server Error` → Error en el backend

### Paso 3: Generar Alertas

1. Haz clic en "Generar Alertas"
2. Verifica en la consola: `Resultado de generar alertas: {...}`
3. Deberías ver el mensaje con los resultados

### Paso 4: Verificar Alertas Aparecen

Después de generar, deberías ver las tarjetas de alertas en la página.

## 📋 Checklist de Verificación

- [ ] La migración SQL se ejecutó correctamente (campo `prioridad` existe)
- [ ] El campo `stock_minimo` fue eliminado de la tabla `repuestos`
- [ ] El backend está corriendo en el puerto correcto
- [ ] El `VITE_API_URL` en el frontend apunta al backend
- [ ] El token JWT es válido
- [ ] Hay repuestos en la base de datos con stock < 5

## 🚀 Próximos Pasos Automáticos

Para que las alertas se generen automáticamente en el futuro:

1. **Al crear/actualizar movimientos**, las alertas se generarán automáticamente
2. **NO necesitas** hacer clic en "Generar Alertas" cada vez
3. El botón "Generar Alertas" es solo para sincronización manual inicial

## 💡 Tip

Si quieres que las alertas se generen al cargar la página (opcional):

Agrega esto en `AlertsHistoryPage.jsx`:

```jsx
useEffect(() => {
  const inicializar = async () => {
    await fetchAlertas();
    await fetchEstadisticas();

    // Si no hay alertas, generar automáticamente
    if (alertas.length === 0) {
      await generarAlertas();
    }
  };

  inicializar();
}, []);
```

Pero **NO es recomendable** porque haría una llamada extra cada vez que cargues la página.
