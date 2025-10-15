import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";
import AlertMessage from "../components/AlertMessage";

const NuevaCotizacionPage = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    modelo: "",
    placa: "",
    kilometraje: "",
    nombre_mecanico: "",
    observaciones: "",
    estatus: "Pendiente",
    porcentaje_descuento: 0,
    items: [{ descripcion: "", cantidad: 1, precio_unitario: 0, sub_total: 0 }],
  };

  const [cotizacion, setCotizacion] = useState(initialCotizacion);
  const [imagenes, setImagenes] = useState([]);

  // 🔹 Al montar, intentar cargar borrador desde localStorage
  useEffect(() => {
    const draft = localStorage.getItem("draftCotizacion");
    if (draft) {
      setCotizacion(JSON.parse(draft));
    }
  }, []);

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

  const opcionesDescripcion = [
    "Axiales de direccion e.o",
    "Campana tras. rectificada",
    "Correa accesorio",
    "Banda de freno tras. pegada",
    "Balineras soporte amortiguador del.",
    "Buje barra estab. del.",
    "Buje tijera puño e.o",
    "Buje interno cuña e.o",
    "Buje tijera parte delantera",
    "Disco del. y tras. rectificado",
    "Guardapolvo eje lado rueda con grasa y abrazada",
    "Guardapolvo pasador mordaza izq.",
    "Juego de pastillas del. e.o en ceramica",
    "Juego de pastillas tras. e.o en ceramica",
    "Kit reparacion mordaza con mantenimiento",
    "Mano de obra",
    "Pote de liquido sintético y cte",
    "Prensa bujes",
    "Rotula inferior e.o",
    "Soporte amortiguador del. e.o",
    "Soporte motor central e.o",
    "Soporte motor derecho e.o",
    "Soporte motor izquierdo e.o",
    "Tijera del. e.o",
  ];

  // 🔹 Cambiar valores de ítems
  const handleItemChange = (index, field, value) => {
    const newItems = [...cotizacion.items];
    newItems[index][field] =
      field === "cantidad" || field === "precio_unitario"
        ? parseFloat(value) || 0
        : value;
    setCotizacion({ ...cotizacion, items: newItems });
  };

  // 🔹 Agregar ítem
  const addItem = () => {
    setCotizacion({
      ...cotizacion,
      items: [
        ...cotizacion.items,
        { descripcion: "", cantidad: 1, precio_unitario: 0, sub_total: 0 },
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
      setAlert({
        type: "error",
        message: "Error al guardar la cotización",
        show: true,
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div
        className={`flex-1 ${
          sidebarOpen ? "ml-64" : ""
        } transition-all duration-300`}
      >
        <TopNavbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main>
          <div className="p-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center border-b pb-4 mb-6">
              <h2 className="text-3xl font-bold">Nueva Cotización</h2>
              <button
                onClick={() => navigate(-1)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Regresar
              </button>
            </div>

            {/* Datos Generales */}
            <div className="grid grid-cols-2 gap-4 mb-6">
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
              <input
                name="telefono"
                value={cotizacion.telefono}
                onChange={handleChange}
                placeholder="Teléfono"
                className="border p-2"
              />
              <input
                name="placa"
                value={cotizacion.placa}
                onChange={handleChange}
                placeholder="Placa del vehículo *"
                className="border p-2"
              />
              <input
                name="vehiculo"
                value={cotizacion.vehiculo}
                onChange={handleChange}
                placeholder="Vehículo"
                className="border p-2"
              />
              <input
                name="modelo"
                value={cotizacion.modelo}
                onChange={handleChange}
                placeholder="Modelo"
                className="border p-2"
              />
              <input
                name="kilometraje"
                value={cotizacion.kilometraje}
                onChange={handleChange}
                placeholder="Kilometraje"
                className="border p-2"
              />
              <input
                name="nombre_mecanico"
                value={cotizacion.nombre_mecanico}
                onChange={handleChange}
                placeholder="Mecánico"
                className="border p-2"
              />
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
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={addItem}
                className="bg-green-500 text-white px-3 py-1 rounded"
              >
                + Agregar Ítem
              </button>
            </div>

            <table className="w-full border mb-4">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border p-2">Descripción</th>
                  <th className="border p-2">Cantidad</th>
                  <th className="border p-2">Precio</th>
                  <th className="border p-2">Subtotal</th>
                  <th className="border p-2">Eliminar</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="border p-2">
                      <input
                        list="opcionesDescripcion"
                        value={item.descripcion}
                        onChange={(e) =>
                          handleItemChange(idx, "descripcion", e.target.value)
                        }
                        className="border p-1 w-full"
                      />
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        value={item.cantidad}
                        onChange={(e) =>
                          handleItemChange(idx, "cantidad", e.target.value)
                        }
                        className="border p-1 w-16"
                      />
                    </td>
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
                    <td className="border p-2">
                      {item.sub_total.toLocaleString("es-CO", {
                        style: "currency",
                        currency: "COP",
                      })}
                    </td>
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
                ))}
              </tbody>
            </table>

            {/* Datalist con sugerencias */}
            <datalist id="opcionesDescripcion">
              {opcionesDescripcion.map((op, i) => (
                <option key={i} value={op} />
              ))}
            </datalist>

            {/* Descuento */}
            <div className="mb-4 flex items-center gap-4">
              <label className="font-medium text-gray-700">
                Descuento (%):
              </label>
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
                className="border p-2 w-24"
              />
            </div>

            {/* Totales */}
            <div className="text-right mb-6 border-t pt-4">
              <p>
                Subtotal:{" "}
                {subtotal.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                })}
              </p>
              {descuento > 0 && (
                <p className="text-yellow-600">
                  Descuento: -{" "}
                  {descuento.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                  })}
                </p>
              )}
              <p className="font-bold text-2xl text-green-700">
                Total a pagar:{" "}
                {total.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                })}
              </p>
            </div>

            {/* Botón */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleSubmit}
                className="bg-indigo-600 text-white px-4 py-2 rounded"
              >
                Guardar Cotización
              </button>
            </div>
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
