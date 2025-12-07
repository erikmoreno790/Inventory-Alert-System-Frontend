import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";
import AlertMessage from "../components/AlertMessage";

const EditarCotizacionPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({ type: "", message: "", show: false });
  const [errorTelefono, setErrorTelefono] = useState("");
  const [errorPlaca, setErrorPlaca] = useState("");
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("token");
  const config = { headers: { Authorization: `Bearer ${token}` } };

  const [cotizacion, setCotizacion] = useState({
    fecha: "",
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
    items: [{ descripcion: "", cantidad: 1, precio_unitario: 0, sub_total: 0 }],
    imagenes: [],
  });

  useEffect(() => {
    const today = new Date();
    const localDate = new Date(
      today.getTime() - today.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split("T")[0];

    setCotizacion((prev) => ({ ...prev, fecha: localDate }));
  }, []);

  // 🔹 Traer cotización existente
  useEffect(() => {
    const fetchCotizacion = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get(`/cotizaciones/${id}`, config);
        const items = data.items.map((item) => ({
          ...item,
          sub_total: item.cantidad * item.precio_unitario,
        }));
        setCotizacion({ ...data, items, imagenes: data.imagenes || [] });
      } catch (err) {
        console.error("Error cargando cotización:", err);
        const errorMsg =
          err.response?.status === 404
            ? "Cotización no encontrada"
            : "Error cargando la cotización";
        setError(errorMsg);
        setAlert({ type: "error", message: errorMsg, show: true });
      } finally {
        setLoading(false);
      }
    };

    if (id && token) {
      fetchCotizacion();
    } else {
      navigate("/login");
    }
  }, [id, token, navigate]);

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

  // 🔹 Cambiar valores generales
  const handleChange = (e) => {
    setCotizacion({ ...cotizacion, [e.target.name]: e.target.value });
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

  // 🔹 Manejar selección de imágenes nuevas
  const handleImageChange = (e) => {
    setNewImages([...newImages, ...e.target.files]);
  };

  // 🔹 Eliminar imagen existente
  const handleDeleteImage = async (imgUrl) => {
    if (!window.confirm("¿Eliminar esta imagen?")) return;

    try {
      await api.delete(`/cotizaciones/${id}/imagenes`, {
        ...config,
        data: { imagen_url: imgUrl },
      });
      setCotizacion({
        ...cotizacion,
        imagenes: cotizacion.imagenes.filter((img) => img.url !== imgUrl),
      });
      setAlert({
        type: "success",
        message: "Imagen eliminada exitosamente",
        show: true,
      });
    } catch (error) {
      console.error("Error eliminando imagen:", error);
      setAlert({
        type: "error",
        message: "Error al eliminar imagen",
        show: true,
      });
    }
  };

  // 🔹 Subir imágenes nuevas
  const handleUploadImages = async () => {
    if (newImages.length === 0) {
      setAlert({
        type: "error",
        message: "Selecciona imágenes primero",
        show: true,
      });
      return;
    }

    const formData = new FormData();
    newImages.forEach((img) => formData.append("imagenes", img));

    try {
      setUploading(true);
      await api.post(`/cotizaciones/${id}/imagenes`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setAlert({
        type: "success",
        message: "Imágenes subidas correctamente",
        show: true,
      });
      setNewImages([]);
      // Refrescar cotización
      const { data } = await api.get(`/cotizaciones/${id}`, config);
      setCotizacion({ ...data, imagenes: data.imagenes || [] });
    } catch (error) {
      console.error("Error subiendo imágenes:", error);
      setAlert({
        type: "error",
        message: "Error al subir imágenes",
        show: true,
      });
    } finally {
      setUploading(false);
    }
  };

  // 🔹 Eliminar imagen nueva antes de subir
  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  // 🔹 Cambiar valores de ítems
  const handleItemChange = (index, field, value) => {
    const newItems = [...cotizacion.items];
    newItems[index][field] =
      field === "cantidad" || field === "precio_unitario"
        ? parseFloat(value) || 0
        : value;
    setCotizacion({ ...cotizacion, items: newItems });
  };

  const addItem = () => {
    setCotizacion({
      ...cotizacion,
      items: [
        ...cotizacion.items,
        { descripcion: "", cantidad: 1, precio_unitario: 0, sub_total: 0 },
      ],
    });
  };

  const removeItem = (index) => {
    setCotizacion({
      ...cotizacion,
      items: cotizacion.items.filter((_, i) => i !== index),
    });
  };

  // 🔹 Guardar cambios
  const handleSubmit = async () => {
    if (!cotizacion.nombre_cliente.trim() || !cotizacion.placa.trim()) {
      setAlert({
        type: "error",
        message: "El nombre del cliente y la placa son obligatorios",
        show: true,
      });
      return;
    }

    // Validar teléfono y placa antes de enviar
    const telefonoValido = validarTelefono(cotizacion.telefono);
    const placaValida = validarPlaca(cotizacion.placa);

    if (!telefonoValido || !placaValida) {
      setAlert({
        type: "error",
        message: "Por favor corrige los errores de validación",
        show: true,
      });
      return;
    }

    try {
      await api.put(
        `/cotizaciones/${id}`,
        {
          ...cotizacion,
          id_cotizacion: id,
          items,
          subtotal,
          descuento,
          total,
        },
        config
      );
      setAlert({
        type: "success",
        message: "¡Cotización actualizada exitosamente!",
        show: true,
      });
      setTimeout(() => {
        navigate("/historial-cotizaciones");
      }, 1500);
    } catch (error) {
      console.error("Error actualizando cotización:", error);
      const errorMsg =
        error.response?.data?.error || "Error al actualizar la cotización";
      setAlert({ type: "error", message: errorMsg, show: true });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Cargando cotización...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold text-gray-800 mb-2">{error}</p>
          <button
            onClick={() => navigate("/historial-cotizaciones")}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Volver al historial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        } md:ml-64`}
      >
        <TopNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main>
          <div className="p-6 max-w-4xl mx-auto">
            {/* 🔹 Encabezado mejorado */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                <button
                  onClick={() => navigate("/historial-cotizaciones")}
                  className="hover:text-blue-600 transition flex items-center gap-1"
                >
                  <ArrowLeft size={16} />
                  Cotizaciones
                </button>
                <span>/</span>
                <span className="text-gray-800 font-medium">Editar #{id}</span>
              </div>

              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">
                  Editar Cotización
                </h1>
                <button
                  onClick={handleSubmit}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-200 flex items-center gap-2"
                >
                  <Save size={18} />
                  Guardar Cambios
                </button>
              </div>
            </div>

            {/* Datos generales - Card moderna */}
            <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200">
                Datos Generales
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    value={cotizacion.fecha}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente *
                  </label>
                  <input
                    name="nombre_cliente"
                    value={cotizacion.nombre_cliente}
                    onChange={handleChange}
                    placeholder="Nombre del cliente"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NIT/CC
                  </label>
                  <input
                    name="nit_cc"
                    value={cotizacion.nit_cc || ""}
                    onChange={handleChange}
                    placeholder="NIT o C.C."
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    name="telefono"
                    type="text"
                    maxLength="10"
                    value={cotizacion.telefono || ""}
                    onChange={handleTelefonoChange}
                    placeholder="Teléfono (10 dígitos)"
                    className={`w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 ${
                      errorTelefono ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errorTelefono && (
                    <p className="text-xs text-red-600 mt-1">{errorTelefono}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Placa *
                  </label>
                  <input
                    name="placa"
                    type="text"
                    maxLength="6"
                    value={cotizacion.placa}
                    onChange={handlePlacaChange}
                    placeholder="Placa (ABC123)"
                    className={`w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 ${
                      errorPlaca ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errorPlaca && (
                    <p className="text-xs text-red-600 mt-1">{errorPlaca}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Vehículo
                  </label>
                  <input
                    name="vehiculo"
                    value={cotizacion.vehiculo || ""}
                    onChange={handleChange}
                    placeholder="Vehículo"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kilometraje
                  </label>
                  <input
                    name="kilometraje"
                    type="number"
                    value={cotizacion.kilometraje || ""}
                    onChange={handleChange}
                    placeholder="Kilometraje"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mecánico
                  </label>
                  <input
                    name="nombre_mecanico"
                    value={cotizacion.nombre_mecanico || ""}
                    onChange={handleChange}
                    placeholder="Mecánico"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Segundo Mecánico
                  </label>
                  <input
                    name="segundo_mecanico"
                    value={cotizacion.segundo_mecanico || ""}
                    onChange={handleChange}
                    placeholder="Segundo mecánico (opcional)"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Observaciones - Card */}
            <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4 pb-3 border-b border-gray-200">
                Observaciones
              </h2>
              <textarea
                name="observaciones"
                value={cotizacion.observaciones || ""}
                onChange={handleChange}
                placeholder="Observaciones adicionales..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                rows={4}
              />
            </div>

            {/* 🔹 Imágenes existentes - Card moderna */}
            <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <ImageIcon size={20} className="text-pink-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Imágenes Asociadas ({cotizacion.imagenes?.length || 0})
                </h2>
              </div>
              {cotizacion.imagenes && cotizacion.imagenes.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {cotizacion.imagenes.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-red-500 transition-all shadow-sm hover:shadow-md"
                    >
                      <img
                        src={img.url}
                        alt={`Imagen ${idx + 1}`}
                        className="w-full h-32 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center">
                        <button
                          onClick={() => handleDeleteImage(img.url)}
                          className="opacity-0 group-hover:opacity-100 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition transform hover:scale-110"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  No hay imágenes para esta cotización
                </p>
              )}
            </div>

            {/* 🔹 Subir nuevas imágenes - Card moderna */}
            <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-100">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <Upload size={20} className="text-blue-600" />
                <h2 className="text-lg font-bold text-gray-800">
                  Agregar Nuevas Imágenes
                </h2>
              </div>

              <div className="flex items-center justify-center w-full mb-4">
                <label
                  htmlFor="file-upload-edit"
                  className="flex flex-col items-center justify-center w-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition"
                >
                  <div className="flex flex-col items-center justify-center py-6">
                    <Upload className="w-10 h-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Haz clic o arrastra imágenes aquí
                    </p>
                  </div>
                  <input
                    id="file-upload-edit"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>

              {newImages.length > 0 && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-4">
                    {Array.from(newImages).map((file, idx) => (
                      <div
                        key={idx}
                        className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm"
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`preview-${idx}`}
                          className="w-full h-32 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(idx)}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1 shadow-lg transition"
                        >
                          ✕
                        </button>
                        <p className="text-xs text-gray-600 p-1 truncate bg-white bg-opacity-90">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleUploadImages}
                    disabled={uploading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload size={18} />
                        Subir {newImages.length} imagen
                        {newImages.length > 1 ? "es" : ""}
                      </>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* Items - Diseño moderno con cards */}
            <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-100">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                <h2 className="text-lg font-bold text-gray-800">
                  Ítems de la Cotización ({items.length})
                </h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-md transition duration-200 flex items-center gap-2"
                >
                  <span className="text-xl">+</span>
                  Agregar Ítem
                </button>
              </div>

              {/* Cards de Items */}
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 border-2 border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                  >
                    {/* Header del Item */}
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-700">
                        Ítem #{idx + 1}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg transition duration-200 flex items-center gap-1"
                      >
                        <Trash2 size={16} />
                        Eliminar
                      </button>
                    </div>

                    {/* Grid de Campos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Descripción */}
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción *
                        </label>
                        <input
                          value={item.descripcion}
                          onChange={(e) =>
                            handleItemChange(idx, "descripcion", e.target.value)
                          }
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                          placeholder="Descripción del producto/servicio"
                        />
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
                          className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
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

                      {/* Subtotal - Solo lectura */}
                      <div className="md:col-span-2 lg:col-span-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Subtotal
                        </label>
                        <div className="w-full border border-gray-200 rounded-lg p-2.5 bg-gray-100 text-gray-700 font-semibold">
                          {item.sub_total.toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totales - Diseño moderno */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md rounded-xl p-6 border border-blue-100">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Resumen de Totales
              </h2>
              <div className="flex justify-end">
                <div className="w-full md:w-96 space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <span className="font-medium text-gray-700">Subtotal:</span>
                    <span className="text-lg font-semibold text-gray-800">
                      {subtotal.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>

                  {/* Campo editable para descuento */}
                  <div className="flex justify-between items-center py-2 border-b border-blue-200">
                    <label className="font-medium text-gray-700">
                      Descuento (%):
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      name="porcentaje_descuento"
                      value={cotizacion.porcentaje_descuento}
                      onChange={handleChange}
                      className="border border-gray-300 rounded-lg p-2 w-20 text-right focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  {descuento > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-blue-200">
                      <span className="font-medium text-gray-700">
                        Descuento aplicado:
                      </span>
                      <span className="text-lg font-semibold text-red-600">
                        -{" "}
                        {descuento.toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-3 bg-white rounded-lg px-4 shadow-sm">
                    <span className="text-lg font-bold text-gray-800">
                      TOTAL:
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {total.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* AlertMessage Component */}
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

export default EditarCotizacionPage;
