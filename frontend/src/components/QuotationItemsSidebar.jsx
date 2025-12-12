import { useEffect } from "react";

const QuotationItemsSidebar = ({
  isOpen,
  onClose,
  items,
  subtotal,
  descuento,
  total,
}) => {
  // Cerrar automáticamente después de 3 segundos
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 6000);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay oscuro solo en móviles */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 lg:hidden z-40 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="bg-indigo-600 text-white p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h2 className="text-lg font-bold">Ítems de Cotización</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-indigo-700 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Contador de ítems */}
        <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Total de ítems:
            </span>
            <span className="bg-indigo-600 text-white font-bold px-3 py-1 rounded-full text-sm">
              {items.length}
            </span>
          </div>
        </div>

        {/* Lista de ítems con scroll */}
        <div className="overflow-y-auto h-[calc(100%-280px)] p-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <svg
                className="w-16 h-16 mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-sm font-medium">No hay ítems agregados</p>
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item, idx) => {
                const stockInsuficiente =
                  item.stock_disponible !== null &&
                  item.cantidad > item.stock_disponible;

                return (
                  <div
                    key={idx}
                    className={`border-2 rounded-lg p-3 ${
                      stockInsuficiente
                        ? "border-red-300 bg-red-50"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    {/* Número de ítem */}
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold text-sm text-indigo-600">
                        Ítem #{idx + 1}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          item.tipo_fuente === "inventario"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.tipo_fuente === "inventario"
                          ? "📦 Inventario"
                          : "✍️ Manual"}
                      </span>
                    </div>

                    {/* Descripción */}
                    <div className="mb-2">
                      <p className="text-sm font-medium text-gray-800 line-clamp-2">
                        {item.descripcion || "Sin descripción"}
                      </p>
                      {item.categoria && (
                        <p className="text-xs text-gray-500 mt-1">
                          Categoría: {item.categoria}
                        </p>
                      )}
                    </div>

                    {/* Cantidad y precio */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                      <div>
                        <span className="text-gray-600">Cantidad:</span>
                        <span className="ml-1 font-semibold text-gray-800">
                          {item.cantidad}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Precio:</span>
                        <span className="ml-1 font-semibold text-gray-800">
                          {item.precio_unitario.toLocaleString("es-CO", {
                            style: "currency",
                            currency: "COP",
                            minimumFractionDigits: 0,
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Subtotal */}
                    <div className="border-t pt-2 flex justify-between items-center">
                      <span className="text-xs text-gray-600">Subtotal:</span>
                      <span className="font-bold text-sm text-green-600">
                        {item.sub_total.toLocaleString("es-CO", {
                          style: "currency",
                          currency: "COP",
                          minimumFractionDigits: 0,
                        })}
                      </span>
                    </div>

                    {/* Alerta de stock */}
                    {stockInsuficiente && (
                      <div className="mt-2 text-xs text-red-600 font-medium flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Stock disponible: {item.stock_disponible}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer con totales */}
        <div className="absolute bottom-0 left-0 right-0 bg-linear-to-r from-indigo-50 to-blue-50 border-t-2 border-indigo-200 p-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 font-medium">Subtotal:</span>
              <span className="font-semibold text-gray-800">
                {subtotal.toLocaleString("es-CO", {
                  style: "currency",
                  currency: "COP",
                  minimumFractionDigits: 0,
                })}
              </span>
            </div>
            {descuento > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-yellow-600 font-medium">Descuento:</span>
                <span className="font-semibold text-yellow-600">
                  -{" "}
                  {descuento.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  })}
                </span>
              </div>
            )}
            <div className="border-t border-indigo-300 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-800 font-bold">Total:</span>
                <span className="font-bold text-xl text-green-600">
                  {total.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default QuotationItemsSidebar;
