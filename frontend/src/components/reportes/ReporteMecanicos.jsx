import { useState } from "react";
import { Download, Filter, Wrench, Trophy, TrendingUp } from "lucide-react";
import api from "../../api";

const ReporteMecanicos = () => {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [columnas, setColumnas] = useState({
    mecanico: true,
    total_ordenes: true,
    ordenes_aprobadas: true,
    tasa_aprobacion: true,
    valor_aprobado: true,
  });

  const buildParams = () => {
    const params = new URLSearchParams();
    if (fechaInicio) params.set("fechaInicio", fechaInicio);
    if (fechaFin) params.set("fechaFin", fechaFin);
    return params.toString();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reportes/mecanicos?${buildParams()}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Error al obtener reporte de mecánicos");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const colsStr = Object.entries(columnas).filter(([, v]) => v).map(([k]) => k).join(",");
      const res = await api.get(`/reportes/mecanicos/pdf?${buildParams()}&columnas=${colsStr}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_mecanicos_${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error al descargar PDF");
    }
  };

  const fmt = (v) => `$ ${Number(v || 0).toLocaleString("es-CO")}`;
  const activeColumns = Object.entries(columnas).filter(([, v]) => v).map(([k]) => k);

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
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Fecha fin</label>
                <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
            </div>

            {/* Columnas */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Columnas en tabla y PDF</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: "mecanico", label: "Mecánico" },
                  { key: "total_ordenes", label: "Órdenes" },
                  { key: "ordenes_aprobadas", label: "Aprobadas" },
                  { key: "tasa_aprobacion", label: "Tasa Aprobación" },
                  { key: "valor_aprobado", label: "Valor Facturado" },
                ].map((col) => (
                  <label key={col.key} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" checked={columnas[col.key]}
                      onChange={() => setColumnas({ ...columnas, [col.key]: !columnas[col.key] })}
                      disabled={col.key === "mecanico"}
                      className="rounded text-emerald-600 focus:ring-emerald-500" />
                    {col.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={fetchData} disabled={loading}
                className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition font-medium text-sm flex items-center gap-2 disabled:opacity-50">
                <Wrench size={16} />
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
            <KPI icon={<TrendingUp size={20} />} label="Total Facturado" value={fmt(data.resumen.total_facturado)} color="emerald" />
            <KPI icon={<Wrench size={20} />} label="Total Mecánicos" value={data.resumen.total_mecanicos} color="blue" />
            <KPI icon={<TrendingUp size={20} />} label="Total Órdenes" value={data.resumen.total_ordenes} color="purple" />
            <KPI icon={<Trophy size={20} />} label="Mejor Mecánico" value={data.resumen.mejor_mecanico} color="amber" />
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100">
              <h3 className="font-semibold text-gray-700">Rendimiento por Mecánico</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5 text-center font-medium text-gray-600 w-10">#</th>
                    {activeColumns.includes("mecanico") && <th className="px-4 py-2.5 text-left font-medium text-gray-600">Mecánico</th>}
                    {activeColumns.includes("total_ordenes") && <th className="px-4 py-2.5 text-center font-medium text-gray-600">Órdenes</th>}
                    {activeColumns.includes("ordenes_aprobadas") && <th className="px-4 py-2.5 text-center font-medium text-gray-600">Aprobadas</th>}
                    {activeColumns.includes("tasa_aprobacion") && <th className="px-4 py-2.5 text-center font-medium text-gray-600">Tasa Aprob.</th>}
                    {activeColumns.includes("valor_aprobado") && <th className="px-4 py-2.5 text-right font-medium text-gray-600">Valor Facturado</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.mecanicos.length === 0 ? (
                    <tr><td colSpan={activeColumns.length + 1} className="text-center py-6 text-gray-400">Sin datos de mecánicos</td></tr>
                  ) : (
                    data.mecanicos.map((m, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2.5 text-center">
                          {i < 3 ? (
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                              i === 0 ? "bg-yellow-100 text-yellow-700" :
                              i === 1 ? "bg-gray-100 text-gray-600" :
                              "bg-orange-100 text-orange-700"
                            }`}>{i + 1}</span>
                          ) : <span className="text-gray-400">{i + 1}</span>}
                        </td>
                        {activeColumns.includes("mecanico") && <td className="px-4 py-2.5 font-medium">{m.mecanico}</td>}
                        {activeColumns.includes("total_ordenes") && <td className="px-4 py-2.5 text-center">{m.total_ordenes}</td>}
                        {activeColumns.includes("ordenes_aprobadas") && <td className="px-4 py-2.5 text-center text-green-700 font-medium">{m.ordenes_aprobadas}</td>}
                        {activeColumns.includes("tasa_aprobacion") && (
                          <td className="px-4 py-2.5 text-center">
                            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                              parseFloat(m.tasa_aprobacion) >= 70 ? "bg-green-100 text-green-700" :
                              parseFloat(m.tasa_aprobacion) >= 40 ? "bg-amber-100 text-amber-700" :
                              "bg-red-100 text-red-700"
                            }`}>{Number(m.tasa_aprobacion).toFixed(1)}%</span>
                          </td>
                        )}
                        {activeColumns.includes("valor_aprobado") && (
                          <td className="px-4 py-2.5 text-right font-medium text-emerald-700">{fmt(m.valor_aprobado)}</td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {data.mecanicos.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex gap-6 text-sm text-gray-600">
                <span>Total mecánicos: <strong>{data.mecanicos.length}</strong></span>
                <span>Total facturado: <strong className="text-emerald-700">{fmt(data.resumen.total_facturado)}</strong></span>
              </div>
            )}
          </div>
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
    amber: "bg-amber-50 border-amber-200 text-amber-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.blue}`}>
      <div className="flex items-center gap-2 mb-1 opacity-70">{icon}<span className="text-xs font-medium">{label}</span></div>
      <p className="text-xl font-bold truncate">{value}</p>
    </div>
  );
};

export default ReporteMecanicos;
