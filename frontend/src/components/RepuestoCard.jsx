import {
  Package,
  ArrowUpCircle,
  ArrowDownCircle,
  Edit3,
  History,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function RepuestoCard({ repuesto }) {
  return (
    <div className="rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.15)] bg-white border border-gray-200 animate-fadeIn">
      {/* ENCABEZADO PREMIUM */}
      <div className="relative bg-gradient-to-r from-emerald-600 to-green-600 text-white p-10">
        {/* Ícono flotante */}
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white rounded-full p-5 shadow-xl border border-green-200">
          <Package size={60} className="text-emerald-600" />
        </div>

        {/* Info centrada */}
        <div className="mt-10 text-center">
          <h2 className="text-3xl font-extrabold drop-shadow-sm">
            {repuesto.nombre}
          </h2>

          <p className="text-lg opacity-90 mt-2">
            {repuesto.referencia || "Sin referencia"}
            <span className="mx-2 opacity-50">•</span>
            Código:{" "}
            <span className="font-semibold">{repuesto.codigo_barras}</span>
          </p>
        </div>
      </div>

      {/* CUERPO */}
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* INFO DEL REPUESTO */}
        <div className="space-y-5 text-lg">
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between">
            <span className="text-gray-600 font-semibold">Categoría:</span>
            <span className="font-bold">{repuesto.categoria}</span>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between">
            <span className="text-gray-600 font-semibold">Marca:</span>
            <span className="font-bold">{repuesto.marca || "—"}</span>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between">
            <span className="text-gray-600 font-semibold">Stock actual:</span>
            <span
              className={`text-3xl font-black ${
                repuesto.stock > 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              {repuesto.stock}
            </span>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex justify-between">
            <span className="text-gray-600 font-semibold">Precio venta:</span>
            <span className="text-2xl font-bold text-blue-600">
              ${parseFloat(repuesto.precio_unitario_venta).toLocaleString()}
            </span>
          </div>
        </div>

        {/* ACCIONES */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-8">
            Acciones disponibles
          </h3>

          <div className="grid grid-cols-2 gap-6">
            {/* ENTRADAS */}
            <Link
              to={`/inventario/entradas/${repuesto.repuesto_id}`}
              className="p-6 bg-white border border-emerald-200 rounded-2xl hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-emerald-50 flex flex-col items-center gap-3"
            >
              <ArrowUpCircle size={40} className="text-emerald-600" />
              <span className="font-semibold text-emerald-800">
                Registrar Entrada
              </span>
            </Link>

            {/* SALIDAS */}
            <Link
              to={`/inventario/salidas/${repuesto.repuesto_id}`}
              className="p-6 bg-white border border-red-200 rounded-2xl hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-red-50 flex flex-col items-center gap-3"
            >
              <ArrowDownCircle size={40} className="text-red-600" />
              <span className="font-semibold text-red-800">
                Registrar Salida
              </span>
            </Link>

            {/* EDITAR */}
            <Link
              to={`/inventario/editar/${repuesto.repuesto_id}`}
              className="p-6 bg-white border border-blue-200 rounded-2xl hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-blue-50 flex flex-col items-center gap-3"
            >
              <Edit3 size={40} className="text-blue-600" />
              <span className="font-semibold text-blue-800">
                Editar Repuesto
              </span>
            </Link>

            {/* MOVIMIENTOS */}
            <Link
              to={`/inventario/movimientos/repuesto/${repuesto.repuesto_id}`}
              className="p-6 bg-white border border-purple-200 rounded-2xl hover:shadow-xl transition-all duration-200 hover:-translate-y-1 hover:bg-purple-50 flex flex-col items-center gap-3"
            >
              <History size={40} className="text-purple-600" />
              <span className="font-semibold text-purple-800">
                Ver Movimientos
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
