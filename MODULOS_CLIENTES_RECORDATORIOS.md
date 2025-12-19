# Módulos de Clientes y Recordatorios

## Descripción General

Se han creado dos módulos completos para la gestión de clientes y recordatorios de mantenimiento, totalmente integrados con el backend del sistema.

## Páginas Creadas

### 1. Gestión de Clientes (`ClientesPage.jsx`)

Página completa para administrar los clientes del sistema.

**Características:**
- ✅ Lista de clientes con tabla responsive
- ✅ Búsqueda en tiempo real (nombre, documento, teléfono, email)
- ✅ Crear nuevos clientes mediante modal
- ✅ Editar clientes existentes
- ✅ Eliminar clientes (con confirmación)
- ✅ Ver detalles completos del cliente
- ✅ Validación de campos obligatorios
- ✅ Mensajes de éxito/error mediante AlertMessage
- ✅ Integración completa con el backend

**Campos del formulario:**
- Nombre (obligatorio)
- Documento (CC/NIT)
- Teléfono
- Email
- Dirección

**Ruta:** `/clientes`

**Endpoints utilizados:**
- `GET /api/clientes` - Obtener todos los clientes
- `POST /api/clientes` - Crear nuevo cliente
- `PUT /api/clientes/:id` - Actualizar cliente
- `DELETE /api/clientes/:id` - Eliminar cliente

---

### 2. Detalles del Cliente (`ClienteDetailPage.jsx`)

Página para ver la información completa de un cliente y sus vehículos registrados.

**Características:**
- ✅ Visualización de datos personales del cliente
- ✅ Lista de vehículos asociados al cliente
- ✅ Tarjetas visuales para cada vehículo
- ✅ Información del vehículo (placa, marca/modelo, año, color, kilometraje)
- ✅ Contador de vehículos registrados
- ✅ Botón para volver a la lista de clientes

**Ruta:** `/clientes/:id`

**Endpoints utilizados:**
- `GET /api/clientes/:id/vehiculos` - Obtener cliente con sus vehículos

---

### 3. Gestión de Recordatorios (`RecordatoriosPage.jsx`)

Página completa para administrar recordatorios de mantenimiento.

**Características:**
- ✅ Lista de recordatorios con tabla responsive
- ✅ Filtros por estado (pendiente, enviado, cancelado, error)
- ✅ Filtros por tipo (mantenimiento, revisión, seguimiento, otro)
- ✅ Crear nuevos recordatorios
- ✅ Editar recordatorios existentes
- ✅ Eliminar recordatorios (con confirmación)
- ✅ Envío manual de SMS individual
- ✅ Badges de color según el estado
- ✅ Selección de cliente y vehículo en cascada
- ✅ Auto-completado de teléfono al seleccionar cliente
- ✅ Validación de campos obligatorios
- ✅ Mensajes de éxito/error mediante AlertMessage

**Campos del formulario:**
- Cliente (obligatorio) - select dinámico
- Vehículo (obligatorio) - select que carga según cliente
- Tipo (obligatorio) - mantenimiento, revisión, seguimiento, otro
- Fecha programada (obligatorio)
- Teléfono - se auto-completa del cliente
- Estado - pendiente, enviado, cancelado
- Mensaje - texto del recordatorio
- Notas - notas adicionales

**Estados de recordatorios:**
- 🟡 **Pendiente** - Recordatorio creado, no enviado
- 🟢 **Enviado** - SMS enviado exitosamente
- ⚫ **Cancelado** - Recordatorio cancelado
- 🔴 **Error** - Error al enviar SMS

**Tipos de recordatorios:**
- Mantenimiento
- Revisión
- Seguimiento
- Otro

**Ruta:** `/recordatorios`

**Endpoints utilizados:**
- `GET /api/recordatorios` - Obtener todos los recordatorios
- `GET /api/clientes` - Obtener lista de clientes
- `GET /api/clientes/:id/vehiculos` - Obtener vehículos de un cliente
- `POST /api/recordatorios` - Crear nuevo recordatorio
- `PUT /api/recordatorios/:id` - Actualizar recordatorio
- `DELETE /api/recordatorios/:id` - Eliminar recordatorio
- `POST /api/recordatorios/:id/enviar` - Enviar SMS individual

---

## Integración con el Sistema

### Rutas agregadas en `App.jsx`:
```jsx
<Route path="/clientes" element={<PrivateRoute><ClientesPage /></PrivateRoute>} />
<Route path="/clientes/:id" element={<PrivateRoute><ClienteDetailPage /></PrivateRoute>} />
<Route path="/recordatorios" element={<PrivateRoute><RecordatoriosPage /></PrivateRoute>} />
```

### Enlaces agregados en el Sidebar:
- 👤 **Clientes** - `/clientes` (icono: UserCircle)
- 📅 **Recordatorios** - `/recordatorios` (icono: Calendar)

---

## Backend Integrado

Todos los módulos están completamente integrados con el backend existente:

### Modelos:
- `clienteModel.js` - Modelo de clientes
- `recordatorioModel.js` - Modelo de recordatorios

### Controladores:
- `clienteController.js` - Lógica de negocio de clientes
- `recordatorioController.js` - Lógica de negocio de recordatorios

### Rutas:
- `clienteRoutes.js` - Endpoints de clientes
- `recordatorioRoutes.js` - Endpoints de recordatorios

---

## Características Técnicas

### Diseño Responsive:
- ✅ Tablas responsivas que se adaptan a móviles
- ✅ Grids que cambian según el tamaño de pantalla
- ✅ Modales centrados y con scroll
- ✅ Sidebar responsive con menú hamburguesa

### Experiencia de Usuario:
- ✅ Mensajes de confirmación antes de eliminar
- ✅ Alertas visuales de éxito/error
- ✅ Validación de campos en tiempo real
- ✅ Auto-completado inteligente de campos
- ✅ Estados visuales claros con badges de colores
- ✅ Loading states durante carga de datos

### Seguridad:
- ✅ Todas las rutas protegidas con `PrivateRoute`
- ✅ Autenticación mediante JWT token
- ✅ Autorización por roles (admin, user)

---

## Cómo Usar

### Gestión de Clientes:
1. Navegar a "Clientes" en el sidebar
2. Crear un nuevo cliente con el botón "+ Nuevo Cliente"
3. Buscar clientes usando la barra de búsqueda
4. Ver detalles de un cliente haciendo clic en "Ver"
5. Editar o eliminar clientes según sea necesario

### Gestión de Recordatorios:
1. Navegar a "Recordatorios" en el sidebar
2. Filtrar recordatorios por estado o tipo
3. Crear un nuevo recordatorio con el botón "+ Nuevo Recordatorio"
4. Seleccionar un cliente (obligatorio)
5. Seleccionar un vehículo del cliente (obligatorio)
6. Completar los detalles del recordatorio
7. Enviar SMS manualmente si es necesario con el botón "Enviar"

---

## Mejoras Futuras Sugeridas

- [ ] Paginación para listas largas de clientes/recordatorios
- [ ] Exportar lista de clientes a Excel/CSV
- [ ] Historial de recordatorios enviados por cliente
- [ ] Envío masivo programado de recordatorios
- [ ] Plantillas de mensajes SMS predefinidas
- [ ] Integración con WhatsApp Business API
- [ ] Dashboard de métricas de recordatorios
- [ ] Notificaciones push para recordatorios próximos

---

## Tecnologías Utilizadas

- **Frontend:** React + Redux + React Router
- **Estilos:** TailwindCSS
- **Iconos:** Lucide React
- **Backend:** Node.js + Express
- **Base de Datos:** PostgreSQL
- **Autenticación:** JWT

---

## Notas Importantes

1. Los recordatorios requieren que el cliente tenga un teléfono registrado para poder enviar SMS
2. El sistema valida automáticamente los datos antes de crear/actualizar
3. Los vehículos se cargan dinámicamente al seleccionar un cliente
4. El estado de los recordatorios se actualiza automáticamente después de enviar SMS
5. Todos los cambios se reflejan inmediatamente en la interfaz

---

**Desarrollado por:** Sistema de Inventario y Alertas
**Fecha:** Diciembre 2025
**Versión:** 1.0.0
