import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import api from "../api";
import AlertMessage from "../components/AlertMessage";

const NuevaCotizacionPage = () => {
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ type: "", message: "", show: false });

  const token = localStorage.getItem("token");

  const initialCotizacion = {
    fecha: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
      .toISOString()
      .split("T")[0], // Formato YYYY-MM-DD (local)
    nombre_cliente: "",
    nit_cc: "",
    telefono: "",
    vehiculo: "",
    placa: "",
    kilometraje: "",
    nombre_mecanico: "",
    segundo_mecanico: "",
    observaciones: "",
    estatus: "Pendiente",
    porcentaje_descuento: 0,
    items: [
      {
        tipo_fuente: "manual", // "manual" o "inventario"
        categoria: "",
        referencia: "",
        descripcion: "",
        cantidad: 1,
        precio_unitario: 0,
        sub_total: 0,
        stock_disponible: null,
        repuesto_id: null, // ID único del repuesto
      },
    ],
  };

  const [cotizacion, setCotizacion] = useState(initialCotizacion);
  const [imagenes, setImagenes] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [repuestosPorCategoria, setRepuestosPorCategoria] = useState({});

  // Lista de vehículos predefinidos
  const vehiculosPredefinidos = [
    "Chevrolet Trailblazer",
    "Chevrolet Captiva",
    "Chevrolet Tracker",
    "Chevrolet Aveo",
    "Chevrolet Spark",
    "Chevrolet D-Max",
    "Chevrolet Sail",
    "Chevrolet Optra",
    "Chevrolet Onix",
    "Ford Explorer",
    "Ford Escape",
    "Ford EcoSport",
    "Ford Ranger",
    "Ford Fiesta",
    "Ford Focus",
    "Ford F-150",
    "Hyundai Tucson",
    "Hyundai Santa Fe",
    "Hyundai Creta",
    "Hyundai Elantra",
    "Hyundai Accent",
    "Honda CR-V",
    "Honda HR-V",
    "Honda Civic",
    "Kia Sportage",
    "Kia Sorento",
    "Kia Seltos",
    "Kia Rio",
    "Kia Picanto",
    "Kia Cerato",
    "Mazda 3",
    "Mazda 2",
    "Mazda CX-3",
    "Mazda CX-5",
    "Mazda CX-30",
    "Mazda CX-9",
    "Mazda BT-50",
    "Mazda B2000",
    "Mitsubishi L200",
    "Nissan X-Trail",
    "Nissan Qashqai",
    "Nissan Navara",
    "Nissan Kicks",
    "Nissan Sentra",
    "Nissan Versa",
    "Nissan Frontier (NP300)",
    "Renault Koleos",
    "Renault Duster",
    "Renault Stepway",
    "Renault Logan",
    "Renault Symbol",
    "Renault Fluence",
    "Renault Megane",
    "Toyota Prado TXL",
    "Toyota Fortuner",
    "Toyota Hilux",
    "Toyota Land Cruiser",
    "Toyota Rav4",
    "Toyota 4Runner",
    "Toyota Corolla",
    "Volkswagen Amarok",
    "Volkswagen Tiguan",
    "Volkswagen T-Cross",
    "Volkswagen Jetta",
    "Volkswagen Golf",
  ];

  // Lista de mecánicos predefinidos
  const mecanicosPredefinidos = [
    "Enuar Sierra",
    "Rodrigo Alvernia",
    "Jesus Domínguez",
    "Carlos Castillo",
    "Jose Barbosa",
    "Jhorman Peralta",
  ];

  const [listaVehiculos, setListaVehiculos] = useState(vehiculosPredefinidos);
  const [listaMecanicos, setListaMecanicos] = useState(mecanicosPredefinidos);
  const [mostrarInputVehiculo, setMostrarInputVehiculo] = useState(false);
  const [mostrarInputMecanico, setMostrarInputMecanico] = useState(false);
  const [mostrarInputSegundoMecanico, setMostrarInputSegundoMecanico] =
    useState(false);
  const [nuevoVehiculo, setNuevoVehiculo] = useState("");
  const [nuevoMecanico, setNuevoMecanico] = useState("");
  const [nuevoSegundoMecanico, setNuevoSegundoMecanico] = useState("");

  // Estados para validación
  const [errorTelefono, setErrorTelefono] = useState("");
  const [errorPlaca, setErrorPlaca] = useState("");

  // 🔹 Al montar, intentar cargar borrador desde localStorage
  useEffect(() => {
    const draft = localStorage.getItem("draftCotizacion");
    if (draft) {
      setCotizacion(JSON.parse(draft));
    }
    // Cargar categorías disponibles
    cargarCategorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 🔹 Cargar categorías únicas del inventario
  const cargarCategorias = async () => {
    try {
      const response = await api.get("/repuestos/categorias/lista", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategorias(response.data);
    } catch (error) {
      console.error("Error cargando categorías:", error);
    }
  };

  // 🔹 Cargar repuestos por categoría (TODOS, paginando si es necesario)
  const cargarRepuestosPorCategoria = async (categoria) => {
    if (repuestosPorCategoria[categoria]) return; // Ya cargados

    try {
      let todosLosRepuestos = [];
      let page = 1;
      let hasMore = true;

      // Hacer peticiones paginadas hasta obtener todos los repuestos
      while (hasMore) {
        const response = await api.get(
          `/repuestos?categoria=${encodeURIComponent(
            categoria
          )}&page=${page}&limit=100`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const datos = response.data.data || [];
        todosLosRepuestos = [...todosLosRepuestos, ...datos];

        // Verificar si hay más páginas
        const totalPages = response.data.pagination?.totalPages || 1;
        hasMore = page < totalPages;
        page++;
      }

      setRepuestosPorCategoria((prev) => ({
        ...prev,
        [categoria]: todosLosRepuestos,
      }));
    } catch (error) {
      console.error("Error cargando repuestos:", error);
    }
  };

  // 🔹 Guardar automáticamente cada vez que cambie la cotización
  useEffect(() => {
    localStorage.setItem("draftCotizacion", JSON.stringify(cotizacion));
  }, [cotizacion]);

  // 🔹 Calcular totales
  const calcularTotales = () => {
    let subtotal = 0;
    const items = cotizacion.items.map((item) => {
      const sub_total = item.cantidad * item.precio_unitario;
      subtotal += sub_total;
      return { ...item, sub_total };
    });
    const descuento = (subtotal * cotizacion.porcentaje_descuento) / 100;
    const total = subtotal - descuento;
    return { items, subtotal, descuento, total };
  };

  const { items, subtotal, descuento, total } = calcularTotales();

  // 🔹 Cambiar valores generales
  const handleChange = (e) => {
    setCotizacion({ ...cotizacion, [e.target.name]: e.target.value });
  };

  // 🔹 Validar teléfono (10 dígitos)
  const validarTelefono = (telefono) => {
    if (!telefono) {
      setErrorTelefono("");
      return true;
    }
    const regex = /^\d{10}$/;
    if (!regex.test(telefono)) {
      setErrorTelefono("⚠️ El teléfono debe tener exactamente 10 dígitos");
      return false;
    }
    setErrorTelefono("");
    return true;
  };

  // 🔹 Validar placa (3 letras + 3 números)
  const validarPlaca = (placa) => {
    if (!placa) {
      setErrorPlaca("");
      return true;
    }
    const regex = /^[A-Z]{3}\d{3}$/i;
    if (!regex.test(placa)) {
      setErrorPlaca(
        "⚠️ La placa debe tener 3 letras seguidas de 3 números (ej: ABC123)"
      );
      return false;
    }
    setErrorPlaca("");
    return true;
  };

  // 🔹 Manejar cambio de teléfono con validación
  const handleTelefonoChange = (e) => {
    const valor = e.target.value;
    setCotizacion({ ...cotizacion, telefono: valor });
    validarTelefono(valor);
  };

  // 🔹 Manejar cambio de placa con validación
  const handlePlacaChange = (e) => {
    const valor = e.target.value.toUpperCase();
    setCotizacion({ ...cotizacion, placa: valor });
    validarPlaca(valor);
  };

  // 🔹 Manejar cambio de vehículo
  const handleVehiculoChange = (e) => {
    const valor = e.target.value;
    if (valor === "__agregar_otro__") {
      setMostrarInputVehiculo(true);
      setCotizacion({ ...cotizacion, vehiculo: "" });
    } else {
      setMostrarInputVehiculo(false);
      setCotizacion({ ...cotizacion, vehiculo: valor });
    }
  };

  // Manejar cambio de mecánico
  const handleMecanicoChange = (e) => {
    const valor = e.target.value;
    if (valor === "__agregar_otro__") {
      setMostrarInputMecanico(true);
      setCotizacion({ ...cotizacion, nombre_mecanico: "" });
    } else {
      setMostrarInputMecanico(false);
      setCotizacion({ ...cotizacion, nombre_mecanico: valor });
    }
  };

  // Manejar cambio de segundo mecánico
  const handleSegundoMecanicoChange = (e) => {
    const valor = e.target.value;
    if (valor === "__agregar_otro__") {
      setMostrarInputSegundoMecanico(true);
      setCotizacion({ ...cotizacion, segundo_mecanico: "" });
    } else {
      setMostrarInputSegundoMecanico(false);
      setCotizacion({ ...cotizacion, segundo_mecanico: valor });
    }
  };

  // 🔹 Agregar nuevo vehículo a la lista
  const agregarNuevoVehiculo = () => {
    if (
      nuevoVehiculo.trim() &&
      !listaVehiculos.includes(nuevoVehiculo.trim())
    ) {
      const nuevoVehiculoFormateado = nuevoVehiculo.trim();
      setListaVehiculos([...listaVehiculos, nuevoVehiculoFormateado]);
      setCotizacion({ ...cotizacion, vehiculo: nuevoVehiculoFormateado });
      setNuevoVehiculo("");
      setMostrarInputVehiculo(false);
    }
  };

  const agregarNuevoMecanico = () => {
    if (
      nuevoMecanico.trim() &&
      !listaMecanicos.includes(nuevoMecanico.trim())
    ) {
      const nuevoMecanicoFormateado = nuevoMecanico.trim();
      setListaMecanicos([...listaMecanicos, nuevoMecanicoFormateado]);
      setCotizacion({
        ...cotizacion,
        nombre_mecanico: nuevoMecanicoFormateado,
      });
      setNuevoMecanico("");
      setMostrarInputMecanico(false);
    }
  };

  const agregarNuevoSegundoMecanico = () => {
    if (
      nuevoSegundoMecanico.trim() &&
      !listaMecanicos.includes(nuevoSegundoMecanico.trim())
    ) {
      const nuevoMecanicoFormateado = nuevoSegundoMecanico.trim();
      setListaMecanicos([...listaMecanicos, nuevoMecanicoFormateado]);
      setCotizacion({
        ...cotizacion,
        segundo_mecanico: nuevoMecanicoFormateado,
      });
      setNuevoSegundoMecanico("");
      setMostrarInputSegundoMecanico(false);
    }
  };

  const opcionesDescripcion = [
    "Campana tras. rectificada",
    "Disco del. y tras. rectificado",
    "Guardapolvo eje lado rueda con grasa y abrazada",
    "Guardapolvo eje lado caja",
    "Guardapolvo pasador mordaza der.",
    "Guardapolvo pasador mordaza izq.",
    "Juego de pastillas del. e.o en ceramica",
    "Juego de pastillas tras. e.o en ceramica",
    "Kit reparacion mordaza con mantenimiento",
    "Kit reparacion cilindro",
    "Mano de obra",
    "Pote de liquido sintético y cte",
    "Prensa bujes",
    "Rotula inferior e.o",
    "Rotula superior e.o",
  ];

  // 🔹 Cambiar valores de ítems
  const handleItemChange = async (index, field, value) => {
    const newItems = [...cotizacion.items];
    const item = newItems[index];

    // Cambio de tipo de fuente
    if (field === "tipo_fuente") {
      item.tipo_fuente = value;
      if (value === "manual") {
        item.categoria = "";
        item.referencia = "";
        item.stock_disponible = null;
        item.repuesto_id = null;
      } else {
        item.descripcion = "";
      }
    }

    // Cambio de categoría
    else if (field === "categoria") {
      item.categoria = value;
      item.referencia = "";
      item.descripcion = "";
      item.stock_disponible = null;
      item.repuesto_id = null;
      // Cargar repuestos de esta categoría
      if (value) {
        await cargarRepuestosPorCategoria(value);
      }
    }

    // Cambio de repuesto_id (cuando selecciona una referencia)
    else if (field === "repuesto_id") {
      item.repuesto_id = value;
      if (value && item.categoria) {
        const repuestos = repuestosPorCategoria[item.categoria] || [];
        const repuesto = repuestos.find(
          (r) => r.repuesto_id === parseInt(value)
        );
        if (repuesto) {
          item.referencia = repuesto.referencia;
          // Agregar categoría a la descripción: "Categoria - Nombre"
          item.descripcion = `${repuesto.categoria} - ${repuesto.nombre}`;
          item.stock_disponible = repuesto.stock;
          item.precio_unitario = repuesto.precio_unitario_venta || 0;
        }
      }
    }

    // Cambios normales
    else {
      item[field] =
        field === "cantidad" || field === "precio_unitario"
          ? parseFloat(value) || 0
          : value;
    }

    setCotizacion({ ...cotizacion, items: newItems });
  };

  // 🔹 Agregar ítem
  const addItem = () => {
    setCotizacion({
      ...cotizacion,
      items: [
        ...cotizacion.items,
        {
          tipo_fuente: "manual",
          categoria: "",
          referencia: "",
          descripcion: "",
          cantidad: 1,
          precio_unitario: 0,
          sub_total: 0,
          stock_disponible: null,
          repuesto_id: null,
        },
      ],
    });
  };

  // 🔹 Eliminar ítem
  const removeItem = (index) => {
    setCotizacion({
      ...cotizacion,
      items: cotizacion.items.filter((_, i) => i !== index),
    });
  };

  // 🔹 Manejar selección de imágenes
  const handleImageChange = (e) => {
    setImagenes([...imagenes, ...Array.from(e.target.files)]);
  };

  // 🔹 Eliminar imagen seleccionada
  const removeImage = (index) => {
    setImagenes(imagenes.filter((_, i) => i !== index));
  };

  // 🔹 Al enviar, limpiar el borrador
  const handleSubmit = async () => {
    if (!cotizacion.nombre_cliente.trim() || !cotizacion.placa.trim()) {
      setAlert({
        type: "error",
        message: "Por favor completa los campos obligatorios",
        show: true,
      });
      return;
    }

    // 🔹 Validar teléfono y placa antes de enviar
    const telefonoValido = validarTelefono(cotizacion.telefono);
    const placaValida = validarPlaca(cotizacion.placa);

    if (!telefonoValido || !placaValida) {
      setAlert({
        type: "error",
        message:
          "Por favor corrige los errores de validación en teléfono o placa",
        show: true,
      });
      return;
    }

    // 🔹 Validar stock para items de inventario
    const itemsConStockInsuficiente = items.filter(
      (item) =>
        item.tipo_fuente === "inventario" &&
        item.stock_disponible !== null &&
        item.cantidad > item.stock_disponible
    );

    if (itemsConStockInsuficiente.length > 0) {
      const detalles = itemsConStockInsuficiente
        .map(
          (item) =>
            `${item.descripcion}: necesita ${item.cantidad}, disponible ${item.stock_disponible}`
        )
        .join("\n");

      setAlert({
        type: "error",
        message: `Stock insuficiente:\n${detalles}`,
        show: true,
      });
      return;
    }

    try {
      // 👉 Recalcular totales antes de enviar
      const { items, subtotal, descuento, total } = calcularTotales();

      // 👉 Crear un objeto con los totales incluidos
      const cotizacionConTotales = {
        ...cotizacion,
        items, // items con sub_total
        subtotal,
        descuento,
        total,
      };

      const formData = new FormData();
      Object.entries(cotizacionConTotales).forEach(([key, value]) => {
        if (key === "items") {
          formData.append("items", JSON.stringify(value));
        } else {
          formData.append(key, value);
        }
      });

      imagenes.forEach((img) => formData.append("imagenes", img));

      await api.post("/cotizaciones", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setAlert({
        type: "success",
        message: "Cotización guardada exitosamente",
        show: true,
      });
      // 👉 Limpiar formulario
      setCotizacion(initialCotizacion);
      setImagenes([]);
      localStorage.removeItem("draftCotizacion"); // ✅ limpiar
      navigate("/historial-cotizaciones");
    } catch (error) {
      console.error(error);
      const errorMsg =
        error.response?.data?.error || "Error al guardar la cotización";
      const detalles = error.response?.data?.detalles;

      if (detalles && Array.isArray(detalles)) {
        const stockErrors = detalles
          .map(
            (e) =>
              `${e.item}: necesita ${e.solicitado}, disponible ${e.disponible}`
          )
          .join("\n");
        setAlert({
          type: "error",
          message: `${errorMsg}:\n${stockErrors}`,
          show: true,
        });
      } else {
        setAlert({
          type: "error",
          message: errorMsg,
          show: true,
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <main className="p-6 max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-800 text-center">
              Nueva Cotización
            </h1>
          </div>

          {/* Datos Generales */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4 mb-4 lg:mb-6">
            <input
              type="date"
              name="fecha"
              value={cotizacion.fecha}
              onChange={handleChange}
              className="border p-2"
            />
            <input
              name="nombre_cliente"
              value={cotizacion.nombre_cliente}
              onChange={handleChange}
              placeholder="Nombre del cliente *"
              className="border p-2"
            />
            <input
              name="nit_cc"
              value={cotizacion.nit_cc}
              onChange={handleChange}
              placeholder="NIT/CC"
              className="border p-2"
            />
            <div>
              <input
                name="telefono"
                type="text"
                maxLength="10"
                value={cotizacion.telefono}
                onChange={handleTelefonoChange}
                placeholder="Teléfono (10 dígitos)"
                className={`border p-2 w-full ${
                  errorTelefono ? "border-red-500" : ""
                }`}
              />
              {errorTelefono && (
                <p className="text-xs text-red-600 mt-1">{errorTelefono}</p>
              )}
            </div>
            <div>
              <input
                name="placa"
                type="text"
                maxLength="6"
                value={cotizacion.placa}
                onChange={handlePlacaChange}
                placeholder="Placa del vehículo * (ABC123)"
                className={`border p-2 w-full ${
                  errorPlaca ? "border-red-500" : ""
                }`}
              />
              {errorPlaca && (
                <p className="text-xs text-red-600 mt-1">{errorPlaca}</p>
              )}
            </div>

            {/* Selector de vehículo */}
            <div className="relative">
              {!mostrarInputVehiculo ? (
                <select
                  name="vehiculo"
                  value={cotizacion.vehiculo}
                  onChange={handleVehiculoChange}
                  className="border p-2 w-full"
                >
                  <option value="">Seleccionar vehículo</option>
                  {listaVehiculos.map((vehiculo, idx) => (
                    <option key={idx} value={vehiculo}>
                      {vehiculo}
                    </option>
                  ))}
                  <option
                    value="__agregar_otro__"
                    className="font-semibold text-indigo-600"
                  >
                    + Agregar otro vehículo
                  </option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevoVehiculo}
                    onChange={(e) => setNuevoVehiculo(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && agregarNuevoVehiculo()
                    }
                    placeholder="Ingrese nuevo vehículo"
                    className="border p-2 flex-1"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={agregarNuevoVehiculo}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarInputVehiculo(false);
                      setNuevoVehiculo("");
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            <input
              name="kilometraje"
              value={cotizacion.kilometraje}
              onChange={handleChange}
              placeholder="Kilometraje"
              className="border p-2"
            />

            {/* Selector de mecánico */}
            <div className="relative">
              {!mostrarInputMecanico ? (
                <select
                  name="nombre_mecanico"
                  value={cotizacion.nombre_mecanico}
                  onChange={handleMecanicoChange}
                  className="border p-2 w-full"
                >
                  <option value="">Seleccionar mecánico</option>
                  {listaMecanicos.map((mecanico, idx) => (
                    <option key={idx} value={mecanico}>
                      {mecanico}
                    </option>
                  ))}
                  <option
                    value="__agregar_otro__"
                    className="font-semibold text-indigo-600"
                  >
                    + Agregar otro mecánico
                  </option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevoMecanico}
                    onChange={(e) => setNuevoMecanico(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && agregarNuevoMecanico()
                    }
                    placeholder="Ingrese nuevo mecánico"
                    className="border p-2 flex-1"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={agregarNuevoMecanico}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarInputMecanico(false);
                      setNuevoMecanico("");
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>

            {/* Selector de segundo mecánico */}
            <div className="relative">
              {!mostrarInputSegundoMecanico ? (
                <select
                  name="segundo_mecanico"
                  value={cotizacion.segundo_mecanico}
                  onChange={handleSegundoMecanicoChange}
                  className="border p-2 w-full"
                >
                  <option value="">Segundo mecánico (opcional)</option>
                  {listaMecanicos.map((mecanico, idx) => (
                    <option key={idx} value={mecanico}>
                      {mecanico}
                    </option>
                  ))}
                  <option
                    value="__agregar_otro__"
                    className="font-semibold text-indigo-600"
                  >
                    + Agregar otro mecánico
                  </option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={nuevoSegundoMecanico}
                    onChange={(e) => setNuevoSegundoMecanico(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && agregarNuevoSegundoMecanico()
                    }
                    placeholder="Ingrese segundo mecánico"
                    className="border p-2 flex-1"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={agregarNuevoSegundoMecanico}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                  >
                    ✓
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarInputSegundoMecanico(false);
                      setNuevoSegundoMecanico("");
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          <textarea
            name="observaciones"
            value={cotizacion.observaciones}
            onChange={handleChange}
            placeholder="Observaciones"
            className="border p-2 w-full mb-6"
            rows={3}
          />

          {/* Subir imágenes */}
          <div className="mb-6">
            <label className="block mb-3 text-lg font-semibold text-gray-800">
              Adjuntar fotos (máx. 5)
            </label>

            {/* Input con estilo */}
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center justify-center w-full max-w-md border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
              >
                <div className="flex flex-col items-center justify-center py-6">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6h.1a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    Haz clic o arrastra imágenes aquí
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>

            {/* Previsualización de imágenes */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {imagenes.map((img, idx) => (
                <div
                  key={idx}
                  className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm"
                >
                  <img
                    src={URL.createObjectURL(img)}
                    alt={`preview-${idx}`}
                    className="w-full h-32 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-lg transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Items */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-lg lg:text-xl font-bold text-gray-800">
                  Items de la Cotización
                </h2>
                <span className="bg-indigo-100 text-indigo-700 font-semibold px-3 py-1 rounded-full text-sm">
                  {items.length}
                </span>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 lg:px-4 lg:py-2 rounded-lg shadow-md transition duration-200 flex items-center gap-2 text-sm lg:text-base"
              >
                <span className="text-xl">+</span>
                <span className="hidden sm:inline">Agregar Ítem</span>
                <span className="sm:hidden">Ítem</span>
              </button>
            </div>

            {/* Cards de Items con scroll independiente en móviles/tablets */}
            <div className="space-y-4 lg:space-y-4 max-h-[calc(100vh-28rem)] lg:max-h-none overflow-y-auto lg:overflow-visible pr-2 lg:pr-0 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
              {items.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                  <div className="text-gray-400 mb-2">
                    <svg
                      className="w-16 h-16 mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <p className="text-lg font-medium text-gray-600">
                      No hay ítems agregados
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Haz clic en "Agregar Ítem" para comenzar
                    </p>
                  </div>
                </div>
              ) : (
                items.map((item, idx) => {
                  const repuestosCategoria =
                    repuestosPorCategoria[item.categoria] || [];
                  const stockInsuficiente =
                    item.stock_disponible !== null &&
                    item.cantidad > item.stock_disponible;

                  return (
                    <div
                      key={idx}
                      className={`bg-white border-2 rounded-xl p-4 lg:p-6 shadow-sm hover:shadow-md transition-shadow ${
                        stockInsuficiente
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200"
                      }`}
                    >
                      {/* Header del Item */}
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-base lg:text-lg font-semibold text-gray-700">
                          Ítem #{idx + 1}
                        </h3>
                        <button
                          type="button"
                          onClick={() => removeItem(idx)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 lg:px-3 lg:py-1.5 rounded-lg transition duration-200 flex items-center gap-1 text-sm"
                        >
                          <span>✕</span>
                          <span className="hidden sm:inline">Eliminar</span>
                        </button>
                      </div>

                      {/* Grid de Campos */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Tipo de Fuente */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo de Fuente *
                          </label>
                          <select
                            value={item.tipo_fuente}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "tipo_fuente",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          >
                            <option value="manual">✍️ Manual</option>
                            <option value="inventario">📦 Inventario</option>
                          </select>
                        </div>

                        {/* Categoría (solo inventario) */}
                        {item.tipo_fuente === "inventario" && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Categoría *
                            </label>
                            <select
                              value={item.categoria}
                              onChange={(e) =>
                                handleItemChange(
                                  idx,
                                  "categoria",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                              <option value="">Seleccionar categoría...</option>
                              {categorias.map((cat) => (
                                <option key={cat} value={cat}>
                                  {cat}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* Referencia (solo inventario con categoría) */}
                        {item.tipo_fuente === "inventario" &&
                          item.categoria && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Repuesto *
                              </label>
                              <select
                                value={item.repuesto_id || ""}
                                onChange={(e) =>
                                  handleItemChange(
                                    idx,
                                    "repuesto_id",
                                    e.target.value
                                  )
                                }
                                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              >
                                <option value="">
                                  Seleccionar repuesto...
                                </option>
                                {repuestosCategoria.map((rep) => (
                                  <option
                                    key={rep.repuesto_id}
                                    value={rep.repuesto_id}
                                  >
                                    {rep.referencia} - {rep.nombre} (Stock:{" "}
                                    {rep.stock})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                        {/* Descripción */}
                        <div
                          className={
                            item.tipo_fuente === "inventario"
                              ? "md:col-span-2 lg:col-span-3"
                              : "md:col-span-2"
                          }
                        >
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción *
                          </label>
                          {item.tipo_fuente === "manual" ? (
                            <input
                              list="opcionesDescripcion"
                              value={item.descripcion}
                              onChange={(e) =>
                                handleItemChange(
                                  idx,
                                  "descripcion",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder="Ingrese descripción del servicio/repuesto"
                            />
                          ) : (
                            <input
                              value={item.descripcion}
                              readOnly
                              className="w-full border border-gray-300 rounded-lg p-2.5 bg-gray-100 text-gray-600 cursor-not-allowed"
                              placeholder="Se completa automáticamente al seleccionar referencia"
                            />
                          )}
                        </div>

                        {/* Cantidad */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.cantidad}
                            onChange={(e) =>
                              handleItemChange(idx, "cantidad", e.target.value)
                            }
                            className={`w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 ${
                              stockInsuficiente
                                ? "border-red-500 focus:border-red-500"
                                : "border-gray-300 focus:border-indigo-500"
                            }`}
                          />
                          {stockInsuficiente && (
                            <p className="text-xs text-red-600 mt-1 font-medium">
                              ⚠️ Stock disponible: {item.stock_disponible}
                            </p>
                          )}
                        </div>

                        {/* Precio Unitario */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio Unitario *
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={item.precio_unitario}
                            onChange={(e) =>
                              handleItemChange(
                                idx,
                                "precio_unitario",
                                e.target.value
                              )
                            }
                            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="$0"
                          />
                        </div>

                        {/* Subtotal */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subtotal
                          </label>
                          <div className="w-full border border-gray-200 rounded-lg p-2.5 bg-gray-50 text-gray-700 font-semibold">
                            {item.sub_total.toLocaleString("es-CO", {
                              style: "currency",
                              currency: "COP",
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Tabla oculta - solo para compatibilidad */}
          <table className="hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Tipo</th>
                <th className="border p-2">Categoría</th>
                <th className="border p-2">Referencia</th>
                <th className="border p-2">Descripción</th>
                <th className="border p-2">Cantidad</th>
                <th className="border p-2">Precio</th>
                <th className="border p-2">Subtotal</th>
                <th className="border p-2">Eliminar</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const repuestosCategoria =
                  repuestosPorCategoria[item.categoria] || [];
                const stockInsuficiente =
                  item.stock_disponible !== null &&
                  item.cantidad > item.stock_disponible;

                return (
                  <tr
                    key={idx}
                    className={stockInsuficiente ? "bg-red-50" : ""}
                  >
                    {/* Selector de tipo */}
                    <td className="border p-2">
                      <select
                        value={item.tipo_fuente}
                        onChange={(e) =>
                          handleItemChange(idx, "tipo_fuente", e.target.value)
                        }
                        className="border p-1 w-full"
                      >
                        <option value="manual">Manual</option>
                        <option value="inventario">Inventario</option>
                      </select>
                    </td>

                    {/* Categoría (solo si es inventario) */}
                    <td className="border p-2">
                      {item.tipo_fuente === "inventario" ? (
                        <select
                          value={item.categoria}
                          onChange={(e) =>
                            handleItemChange(idx, "categoria", e.target.value)
                          }
                          className="border p-1 w-full"
                        >
                          <option value="">Seleccionar...</option>
                          {categorias.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>

                    {/* Referencia (solo si es inventario y tiene categoría) */}
                    <td className="border p-2">
                      {item.tipo_fuente === "inventario" && item.categoria ? (
                        <select
                          value={item.referencia}
                          onChange={(e) =>
                            handleItemChange(idx, "referencia", e.target.value)
                          }
                          className="border p-1 w-full"
                        >
                          <option value="">Seleccionar...</option>
                          {repuestosCategoria.map((rep) => (
                            <option
                              key={rep.repuesto_id}
                              value={rep.referencia}
                            >
                              {rep.referencia} (Stock: {rep.stock})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-400 text-sm">N/A</span>
                      )}
                    </td>

                    {/* Descripción */}
                    <td className="border p-2">
                      {item.tipo_fuente === "manual" ? (
                        <input
                          list="opcionesDescripcion"
                          value={item.descripcion}
                          onChange={(e) =>
                            handleItemChange(idx, "descripcion", e.target.value)
                          }
                          className="border p-1 w-full"
                          placeholder="Descripción manual"
                        />
                      ) : (
                        <input
                          value={item.descripcion}
                          readOnly
                          className="border p-1 w-full bg-gray-100"
                          placeholder="Auto-rellenado"
                        />
                      )}
                    </td>

                    {/* Cantidad */}
                    <td className="border p-2">
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) =>
                          handleItemChange(idx, "cantidad", e.target.value)
                        }
                        className={`border p-1 w-16 ${
                          stockInsuficiente ? "border-red-500" : ""
                        }`}
                      />
                      {stockInsuficiente && (
                        <div className="text-xs text-red-600 mt-1">
                          Stock: {item.stock_disponible}
                        </div>
                      )}
                    </td>

                    {/* Precio */}
                    <td className="border p-2">
                      <input
                        type="number"
                        value={item.precio_unitario}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            "precio_unitario",
                            e.target.value
                          )
                        }
                        className="border p-1 w-24"
                      />
                    </td>

                    {/* Subtotal */}
                    <td className="border p-2">
                      {item.sub_total.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                      })}
                    </td>

                    {/* Eliminar */}
                    <td className="border p-2 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        X
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Datalist con sugerencias */}
          <datalist id="opcionesDescripcion">
            {opcionesDescripcion.map((op, i) => (
              <option key={i} value={op} />
            ))}
          </datalist>

          {/* Descuento */}
          <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
            <label className="font-medium text-gray-700">Descuento (%):</label>
            <input
              type="number"
              min="0"
              max="100"
              name="porcentaje_descuento"
              value={cotizacion.porcentaje_descuento}
              onChange={(e) =>
                setCotizacion({
                  ...cotizacion,
                  porcentaje_descuento: parseFloat(e.target.value) || 0,
                })
              }
              className="border p-2 w-full sm:w-24 rounded-lg"
            />
          </div>

          {/* Totales */}
          <div className="bg-linear-to-r from-indigo-50 to-blue-50 rounded-xl p-4 lg:p-6 mb-6 border border-indigo-200">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 font-medium">Subtotal:</span>
                <span className="text-lg font-semibold text-gray-800">
                  {subtotal.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                  })}
                </span>
              </div>
              {descuento > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-yellow-600 font-medium">
                    Descuento:
                  </span>
                  <span className="text-lg font-semibold text-yellow-600">
                    -{" "}
                    {descuento.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                    })}
                  </span>
                </div>
              )}
              <div className="border-t border-indigo-300 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-800 font-bold text-lg">
                    Total a pagar:
                  </span>
                  <span className="font-bold text-2xl lg:text-3xl text-green-600">
                    {total.toLocaleString("es-CO", {
                      style: "currency",
                      currency: "COP",
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón */}
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleSubmit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-200 font-medium w-full sm:w-auto"
            >
              Guardar Cotización
            </button>
          </div>
        </main>
      </div>
      {alert.show && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}
    </div>
  );
};

export default NuevaCotizacionPage;
