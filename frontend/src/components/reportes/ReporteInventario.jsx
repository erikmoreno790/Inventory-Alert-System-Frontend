import { useState } from "react";
import { Download, Filter, Package, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import api from "../../api";

const ReporteInventario = () => {
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [vistaTabla, setVistaTabla] = useState("categorias"); // categorias | criticos
  const [columnas, setColumnas] = useState({
    nombre: true,
    referencia: true,
    categoria: true,
    stock: true,
    valor_en_stock: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (categoria) params.set("categoria", categoria);

      const [reporteRes, categoriasRes] = await Promise.all([
        api.get(`/reportes/inventario?${params.toString()}`),
        categorias.length === 0 ? api.get("/repuestos/categorias/lista") : Promise.resolve(null),
      ]);

      setData(reporteRes.data);
      if (categoriasRes) setCategorias(categoriasRes.data.map((c) => c.categoria));
    } catch (err) {
      console.error(err);
      alert("Error al obtener reporte de inventario");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const params = new URLSearchParams();
      if (categoria) params.set("categoria", categoria);
      const colsStr = Object.entries(columnas).filter(([, v]) => v).map(([k]) => k).join(",");
      params.set("columnas", colsStr);

      const res = await api.get(`/reportes/inventario/pdf?${params.toString()}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_inventario_${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error al descargar PDF");
    }
  };

  const fmt = (v) => `$ ${Number(v || 0).toLocaleString("es-CO")}`;
  const activeColumns = Object.entries(columnas).filter(([, v]) => v).map(([k]) => k);

  const filteredCriticos = data?.itemsCriticos?.filter((item) =>
    item.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (item.referencia || "").toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <button onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition">
          <span className="flex items-center gap-2 font-semibold text-gray-700"><Filter size={16} /> Filtros</span>
          <span className="text-gray-400 text-sm">{showFilters ? "▲" : "▼"}</span>
        </button>

        {showFilters && (
          <div className="px-5 pb-4 space-y-4 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Categoría</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="">Todas las categorías</option>
                  {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Columnas para items críticos */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Columnas (Items Críticos)</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: "nombre", label: "Nombre" },
                  { key: "referencia", label: "Referencia" },
                  { key: "categoria", label: "Categoría" },
                  { key: "stock", label: "Stock" },
                  { key: "valor_en_stock", label: "Valor en Stock" },
                ].map((col) => (
                  <label key={col.key} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" checked={columnas[col.key]}
                      onChange={() => setColumnas({ ...columnas, [col.key]: !columnas[col.key] })}
                      disabled={col.key === "nombre"}
                      className="rounded text-emerald-600 focus:ring-emerald-500" />
                    {col.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={fetchData} disabled={loading}
                className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition font-medium text-sm flex items-center gap-2 disabled:opacity-50">
                <Package size={16} />
                {loading ? "Cargando..." : "Generar reporte"}
              </button>
              {data && (
                <button onClick={downloadPDF}
                  className="bg-slate-700 text-white px-5 py-2 rounded-lg hover:bg-slate-800 transition font-medium text-sm flex items-center gap-2">
                  <Download size={16} /> Descargar PDF
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {data && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI icon={<Package size={20} />} label="Valor Inventario (Venta)" value={fmt(data.resumen.valor_total_venta)} color="emerald" />
            <KPI icon={<Package size={20} />} label="Valor Inventario (Costo)" value={fmt(data.resumen.valor_total_costo)} color="blue" />
            <KPI icon={<Package size={20} />} label="Total Items" value={data.resumen.total_items} color="purple" />
            <KPI icon={<Package size={20} />} label="Total Unidades" value={data.resumen.total_unidades} color="blue" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-3 text-center text-red-700 bg-red-50 border-red-200">
              <div className="flex items-center justify-center gap-1 mb-0.5"><XCircle size={14} /><span className="text-xs font-medium">Sin Stock</span></div>
              <p className="text-lg font-bold">{data.resumen.items_sin_stock}</p>
            </div>
            <div className="rounded-lg border p-3 text-center text-amber-700 bg-amber-50 border-amber-200">
              <div className="flex items-center justify-center gap-1 mb-0.5"><AlertTriangle size={14} /><span className="text-xs font-medium">Stock Bajo</span></div>
              <p className="text-lg font-bold">{data.resumen.items_stock_bajo}</p>
            </div>
            <div className="rounded-lg border p-3 text-center text-green-700 bg-green-50 border-green-200">
              <div className="flex items-center justify-center gap-1 mb-0.5"><CheckCircle size={14} /><span className="text-xs font-medium">Stock OK</span></div>
              <p className="text-lg font-bold">{data.resumen.items_stock_ok}</p>
            </div>
          </div>

          {/* Tab selector */}
          <div className="flex gap-2">
            <button onClick={() => setVistaTabla("categorias")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${vistaTabla === "categorias" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              Por Categoría
            </button>
            <button onClick={() => setVistaTabla("criticos")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${vistaTabla === "criticos" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              Items Críticos ({data.itemsCriticos?.length || 0})
            </button>
          </div>

          {/* Tabla por categoría */}
          {vistaTabla === "categorias" && data.porCategoria && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-600">Categoría</th>
                    <th className="px-4 py-2.5 text-center font-medium text-gray-600">Items</th>
                    <th className="px-4 py-2.5 text-center font-medium text-gray-600">Unidades</th>
                    <th className="px-4 py-2.5 text-right font-medium text-gray-600">Valor Venta</th>
                    <th className="px-4 py-2.5 text-center font-medium text-gray-600">Sin Stock</th>
                    <th className="px-4 py-2.5 text-center font-medium text-gray-600">Stock Bajo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.porCategoria.map((cat, i) => (
                    <tr key={i} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-2.5 font-medium">{cat.categoria}</td>
                      <td className="px-4 py-2.5 text-center">{cat.total_items}</td>
                      <td className="px-4 py-2.5 text-center">{cat.total_unidades}</td>
                      <td className="px-4 py-2.5 text-right font-medium text-emerald-700">{fmt(cat.valor_venta)}</td>
                      <td className="px-4 py-2.5 text-center">{parseInt(cat.sin_stock) > 0 ? <span className="text-red-600 font-medium">{cat.sin_stock}</span> : "0"}</td>
                      <td className="px-4 py-2.5 text-center">{parseInt(cat.stock_bajo) > 0 ? <span className="text-amber-600 font-medium">{cat.stock_bajo}</span> : "0"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Tabla items críticos */}
          {vistaTabla === "criticos" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <input type="text" placeholder="Buscar item..." value={search} onChange={(e) => setSearch(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full md:w-64 focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      {activeColumns.includes("nombre") && <th className="px-4 py-2.5 text-left font-medium text-gray-600">Nombre</th>}
                      {activeColumns.includes("referencia") && <th className="px-4 py-2.5 text-left font-medium text-gray-600">Referencia</th>}
                      {activeColumns.includes("categoria") && <th className="px-4 py-2.5 text-left font-medium text-gray-600">Categoría</th>}
                      {activeColumns.includes("stock") && <th className="px-4 py-2.5 text-center font-medium text-gray-600">Stock</th>}
                      {activeColumns.includes("valor_en_stock") && <th className="px-4 py-2.5 text-right font-medium text-gray-600">Valor en Stock</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredCriticos.length === 0 ? (
                      <tr><td colSpan={activeColumns.length} className="text-center py-6 text-gray-400">Sin items críticos</td></tr>
                    ) : (
                      filteredCriticos.map((item, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition">
                          {activeColumns.includes("nombre") && <td className="px-4 py-2.5 font-medium">{item.nombre}</td>}
                          {activeColumns.includes("referencia") && <td className="px-4 py-2.5 text-gray-500">{item.referencia || "—"}</td>}
                          {activeColumns.includes("categoria") && <td className="px-4 py-2.5">{item.categoria}</td>}
                          {activeColumns.includes("stock") && (
                            <td className="px-4 py-2.5 text-center">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                                item.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                              }`}>{item.stock}</span>
                            </td>
                          )}
                          {activeColumns.includes("valor_en_stock") && <td className="px-4 py-2.5 text-right">{fmt(item.valor_en_stock)}</td>}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const KPI = ({ icon, label, value, color }) => {
  const colors = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.blue}`}>
      <div className="flex items-center gap-2 mb-1 opacity-70">{icon}<span className="text-xs font-medium">{label}</span></div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
};

export default ReporteInventario;
