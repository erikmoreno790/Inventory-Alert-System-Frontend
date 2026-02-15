import { useState } from "react";
import { Download, Filter, ArrowRightLeft, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import api from "../../api";

const ReporteMovimientos = () => {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [tipo, setTipo] = useState({ Entrada: true, Salida: true });
  const [motivo, setMotivo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [vistaTabla, setVistaTabla] = useState("categorias"); // categorias | motivos

  const buildParams = () => {
    const params = new URLSearchParams();
    if (fechaInicio) params.set("fechaInicio", fechaInicio);
    if (fechaFin) params.set("fechaFin", fechaFin);
    if (tipo.Entrada && !tipo.Salida) params.set("tipo", "Entrada");
    if (tipo.Salida && !tipo.Entrada) params.set("tipo", "Salida");
    if (motivo) params.set("motivo", motivo);
    if (categoria) params.set("categoria", categoria);
    return params.toString();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reporteRes, categoriasRes] = await Promise.all([
        api.get(`/reportes/movimientos?${buildParams()}`),
        categorias.length === 0 ? api.get("/repuestos/categorias/lista") : Promise.resolve(null),
      ]);
      setData(reporteRes.data);
      if (categoriasRes) setCategorias(categoriasRes.data.map((c) => c.categoria));
    } catch (err) {
      console.error(err);
      alert("Error al obtener reporte de movimientos");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const res = await api.get(`/reportes/movimientos/pdf?${buildParams()}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_movimientos_${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error al descargar PDF");
    }
  };

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
                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha inicio</label>
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha fin</label>
                <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>

            {/* Tipo checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Tipo de movimiento</label>
                <div className="flex gap-4">
                  {["Entrada", "Salida"].map((t) => (
                    <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={tipo[t]}
                        onChange={() => setTipo({ ...tipo, [t]: !tipo[t] })}
                        className="rounded text-emerald-600 focus:ring-emerald-500" />
                      <span className={t === "Entrada" ? "text-green-700" : "text-red-700"}>{t}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Motivo</label>
                <select value={motivo} onChange={(e) => setMotivo(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="">Todos</option>
                  {["compra", "devolucion", "ajuste", "venta", "uso", "creacion", "otro"].map((m) => (
                    <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Categoría</label>
                <select value={categoria} onChange={(e) => setCategoria(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value="">Todas</option>
                  {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={fetchData} disabled={loading}
                className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition font-medium text-sm flex items-center gap-2 disabled:opacity-50">
                <ArrowRightLeft size={16} />
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
            <KPI icon={<ArrowRightLeft size={20} />} label="Total Movimientos" value={data.resumen.total_movimientos} color="blue" />
            <KPI icon={<ArrowDownCircle size={20} />} label="Entradas" value={`${data.resumen.total_entradas} (${data.resumen.cantidad_entradas} uds)`} color="emerald" />
            <KPI icon={<ArrowUpCircle size={20} />} label="Salidas" value={`${data.resumen.total_salidas} (${data.resumen.cantidad_salidas} uds)`} color="red" />
            <KPI icon={<ArrowRightLeft size={20} />} label="Repuestos Afectados" value={data.resumen.repuestos_afectados} color="purple" />
          </div>

          {/* Tab selector */}
          <div className="flex gap-2">
            <button onClick={() => setVistaTabla("categorias")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${vistaTabla === "categorias" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              Por Categoría
            </button>
            <button onClick={() => setVistaTabla("motivos")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${vistaTabla === "motivos" ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              Por Motivo
            </button>
          </div>

          {/* Por Categoría */}
          {vistaTabla === "categorias" && data.porCategoria && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-600">Categoría</th>
                    <th className="px-4 py-2.5 text-center font-medium text-gray-600">Total</th>
                    <th className="px-4 py-2.5 text-center font-medium text-gray-600">Entradas</th>
                    <th className="px-4 py-2.5 text-center font-medium text-gray-600">Salidas</th>
                    <th className="px-4 py-2.5 text-center font-medium text-gray-600">Uds. Entrada</th>
                    <th className="px-4 py-2.5 text-center font-medium text-gray-600">Uds. Salida</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.porCategoria.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-6 text-gray-400">Sin datos</td></tr>
                  ) : (
                    data.porCategoria.map((cat, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2.5 font-medium">{cat.categoria}</td>
                        <td className="px-4 py-2.5 text-center font-medium">{cat.total_movimientos}</td>
                        <td className="px-4 py-2.5 text-center text-green-700">{cat.entradas}</td>
                        <td className="px-4 py-2.5 text-center text-red-700">{cat.salidas}</td>
                        <td className="px-4 py-2.5 text-center text-green-600">{cat.cantidad_entradas}</td>
                        <td className="px-4 py-2.5 text-center text-red-600">{cat.cantidad_salidas}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Por Motivo */}
          {vistaTabla === "motivos" && data.porMotivo && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-medium text-gray-600">Motivo</th>
                    <th className="px-4 py-2.5 text-center font-medium text-gray-600">Tipo</th>
                    <th className="px-4 py-2.5 text-center font-medium text-gray-600">Movimientos</th>
                    <th className="px-4 py-2.5 text-center font-medium text-gray-600">Cantidad Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.porMotivo.length === 0 ? (
                    <tr><td colSpan={4} className="text-center py-6 text-gray-400">Sin datos</td></tr>
                  ) : (
                    data.porMotivo.map((m, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2.5 font-medium capitalize">{m.motivo}</td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                            m.tipo === "Entrada" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>{m.tipo}</span>
                        </td>
                        <td className="px-4 py-2.5 text-center">{m.total_movimientos}</td>
                        <td className="px-4 py-2.5 text-center font-medium">{m.total_cantidad}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
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
    red: "bg-red-50 border-red-200 text-red-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.blue}`}>
      <div className="flex items-center gap-2 mb-1 opacity-70">{icon}<span className="text-xs font-medium">{label}</span></div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
};

export default ReporteMovimientos;
