import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

const RepuestoSearchModal = ({ isOpen, onClose, repuestos, onSelect }) => {
  const [filteredRepuestos, setFilteredRepuestos] = useState(repuestos);
  const [selectedRepuesto, setSelectedRepuesto] = useState(null);
  const [filters, setFilters] = useState({
    referencia: "",
    marca: "",
    nombre: "",
  });

  // Obtener listas únicas para los dropdowns
  const referencias = [
    ...new Set(repuestos.map((r) => r.referencia).filter(Boolean)),
  ].sort();
  const marcas = [
    ...new Set(repuestos.map((r) => r.marca).filter(Boolean)),
  ].sort();

  // Aplicar filtros
  useEffect(() => {
    let filtered = repuestos;

    if (filters.referencia) {
      filtered = filtered.filter((r) => r.referencia === filters.referencia);
    }

    if (filters.marca) {
      filtered = filtered.filter((r) => r.marca === filters.marca);
    }

    if (filters.nombre) {
      filtered = filtered.filter((r) =>
        r.nombre.toLowerCase().includes(filters.nombre.toLowerCase())
      );
    }

    setFilteredRepuestos(filtered);
  }, [filters, repuestos]);

  // Resetear al abrir/cerrar
  useEffect(() => {
    if (isOpen) {
      setFilters({ referencia: "", marca: "", nombre: "" });
      setSelectedRepuesto(null);
      setFilteredRepuestos(repuestos);
    }
  }, [isOpen, repuestos]);

  const handleAccept = () => {
    if (selectedRepuesto) {
      onSelect(selectedRepuesto);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedRepuesto(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Search className="text-indigo-600" size={24} />
            <h2 className="text-2xl font-bold text-gray-800">
              Buscar Repuesto
            </h2>
          </div>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Filtros */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro Referencia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Referencia
              </label>
              <select
                value={filters.referencia}
                onChange={(e) =>
                  setFilters({ ...filters, referencia: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Todas</option>
                {referencias.map((ref) => (
                  <option key={ref} value={ref}>
                    {ref}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Marca */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marca
              </label>
              <select
                value={filters.marca}
                onChange={(e) =>
                  setFilters({ ...filters, marca: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Todas</option>
                {marcas.map((marca) => (
                  <option key={marca} value={marca}>
                    {marca}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre
              </label>
              <input
                type="text"
                value={filters.nombre}
                onChange={(e) =>
                  setFilters({ ...filters, nombre: e.target.value })
                }
                placeholder="Buscar por nombre..."
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Tabla */}
        <div className="flex-1 overflow-auto p-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referencia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marca
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nombre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Disponible
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRepuestos.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Search size={48} className="text-gray-300" />
                      <p className="text-lg font-medium">
                        No se encontraron repuestos
                      </p>
                      <p className="text-sm">
                        Intenta ajustar los filtros de búsqueda
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRepuestos.map((repuesto) => (
                  <tr
                    key={repuesto.repuesto_id}
                    onClick={() => setSelectedRepuesto(repuesto)}
                    className={`cursor-pointer transition-colors ${
                      selectedRepuesto?.repuesto_id === repuesto.repuesto_id
                        ? "bg-indigo-50 border-l-4 border-indigo-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {repuesto.referencia}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {repuesto.marca || "-"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {repuesto.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded-full font-medium ${
                          repuesto.stock > 10
                            ? "bg-green-100 text-green-800"
                            : repuesto.stock > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {repuesto.stock}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer con botones */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleAccept}
            disabled={!selectedRepuesto}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

export default RepuestoSearchModal;
