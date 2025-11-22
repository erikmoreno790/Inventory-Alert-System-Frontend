// src/components/RepuestoCard.jsx
import { Package, ArrowUpCircle, ArrowDownCircle, Edit3, History } from "lucide-react";
import { Link } from "react-router-dom";

export default function RepuestoCard({ repuesto }) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-green-500">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-8 text-center">
        <Package size={80} className="mx-auto mb-4" />
        <h2 className="text-4xl font-bold mb-2">{repuesto.nombre}</h2>
        <p className="text-2xl opacity-90">
          {repuesto.referencia || "Sin referencia"} • Código: {repuesto.codigo_barras}
        </p>
      </div>

      <div className="p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 text-lg">
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Categoría:</span>
            <span className="font-bold text-gray-800">{repuesto.categoria}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Marca:</span>
            <span className="font-bold">{repuesto.marca || "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Stock actual:</span>
            <span
              className={`text-3xl font-black ${
                repuesto.stock > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {repuesto.stock}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium text-gray-600">Precio venta:</span>
            <span className="text-2xl font-bold text-blue-600">
              ${parseFloat(repuesto.precio_unitario_venta).toLocaleString()}
            </span>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-gray-800 text-center mb-6">
            ¿Qué deseas hacer?
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <Link
              to={`/inventario/entradas/nuevo?repuesto=${repuesto.repuesto_id}`}
              className="bg-gradient-to-br from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xl py-8 rounded-2xl shadow-xl flex flex-col items-center gap-3 transition transform hover:scale-105"
            >
              <ArrowUpCircle size={48} />
              Registrar Entrada
            </Link>

            <Link
              to={`/inventario/salidas/nuevo?repuesto=${repuesto.repuesto_id}`}
              className="bg-gradient-to-br from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-bold text-xl py-8 rounded-2xl shadow-xl flex flex-col items-center gap-3 transition transform hover:scale-105"
            >
              <ArrowDownCircle size={48} />
              Registrar Salida
            </Link>

            <Link
              to={`/inventario/editar/${repuesto.repuesto_id}`}
              className="bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xl py-8 rounded-2xl shadow-xl flex flex-col items-center gap-3 transition transform hover:scale-105"
            >
              <Edit3 size={48} />
              Editar Repuesto
            </Link>

            <Link
              to={`/inventario/movimientos/repuesto/${repuesto.repuesto_id}`}
              className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-xl py-8 rounded-2xl shadow-xl flex flex-col items-center gap-3 transition transform hover:scale-105"
            >
              <History size={48} />
              Ver Movimientos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
