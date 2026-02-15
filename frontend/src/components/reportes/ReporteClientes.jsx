import { useState } from "react";
import { Download, Filter, Users, DollarSign, CalendarDays } from "lucide-react";
import api from "../../api";

const ReporteClientes = () => {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [limit, setLimit] = useState(20);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [columnas, setColumnas] = useState({
    nombre_cliente: true,
    placa: true,
    total_cotizaciones: true,
    cotizaciones_aprobadas: true,
    total_facturado: true,
    ultima_visita: true,
  });

  const buildParams = () => {
    const params = new URLSearchParams();
    if (fechaInicio) params.set("fechaInicio", fechaInicio);
    if (fechaFin) params.set("fechaFin", fechaFin);
    params.set("limit", String(limit));
    return params.toString();
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reportes/clientes?${buildParams()}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Error al obtener reporte de clientes");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const colsStr = Object.entries(columnas).filter(([, v]) => v).map(([k]) => k).join(",");
      const res = await api.get(`/reportes/clientes/pdf?${buildParams()}&columnas=${colsStr}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_clientes_${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error al descargar PDF");
    }
  };

  const fmt = (v) => `$ ${Number(v || 0).toLocaleString("es-CO")}`;
  const fmtDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("es-CO", { year: "numeric", month: "short", day: "numeric" });
  };
  const activeColumns = Object.entries(columnas).filter(([, v]) => v).map(([k]) => k);

  const filteredClientes = data?.topClientes?.filter((c) =>
    c.nombre_cliente.toLowerCase().includes(search.toLowerCase()) ||
    (c.placa || "").toLowerCase().includes(search.toLowerCase())
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
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
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Top N clientes</label>
                <select value={limit} onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option value={10}>Top 10</option>
                  <option value={20}>Top 20</option>
                  <option value={50}>Top 50</option>
                  <option value={100}>Top 100</option>
                </select>
              </div>
            </div>

            {/* Columnas */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Columnas en tabla y PDF</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: "nombre_cliente", label: "Cliente" },
                  { key: "placa", label: "Placa" },
                  { key: "total_cotizaciones", label: "Cotizaciones" },
                  { key: "cotizaciones_aprobadas", label: "Aprobadas" },
                  { key: "total_facturado", label: "Total Facturado" },
                  { key: "ultima_visita", label: "Última Visita" },
                ].map((col) => (
                  <label key={col.key} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" checked={columnas[col.key]}
                      onChange={() => setColumnas({ ...columnas, [col.key]: !columnas[col.key] })}
                      disabled={col.key === "nombre_cliente"}
                      className="rounded text-emerald-600 focus:ring-emerald-500" />
                    {col.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button onClick={fetchData} disabled={loading}
                className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition font-medium text-sm flex items-center gap-2 disabled:opacity-50">
                <Users size={16} />
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
            <KPI icon={<DollarSign size={20} />} label="Total Facturado" value={fmt(data.resumen.total_facturado)} color="emerald" />
            <KPI icon={<Users size={20} />} label="Clientes Únicos" value={data.resumen.total_clientes_unicos} color="blue" />
            <KPI icon={<CalendarDays size={20} />} label="Total Cotizaciones" value={data.resumen.total_cotizaciones} color="purple" />
            <KPI icon={<DollarSign size={20} />} label="Ticket Promedio" value={fmt(data.resumen.ticket_promedio)} color="amber" />
          </div>

          {/* Tabla */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h3 className="font-semibold text-gray-700">Top Clientes por Facturación</h3>
              <input type="text" placeholder="Buscar cliente o placa..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full md:w-64 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5 text-center font-medium text-gray-600 w-10">#</th>
                    {activeColumns.includes("nombre_cliente") && <th className="px-4 py-2.5 text-left font-medium text-gray-600">Cliente</th>}
                    {activeColumns.includes("placa") && <th className="px-4 py-2.5 text-left font-medium text-gray-600">Placa</th>}
                    {activeColumns.includes("total_cotizaciones") && <th className="px-4 py-2.5 text-center font-medium text-gray-600">Cotiz.</th>}
                    {activeColumns.includes("cotizaciones_aprobadas") && <th className="px-4 py-2.5 text-center font-medium text-gray-600">Aprobadas</th>}
                    {activeColumns.includes("total_facturado") && <th className="px-4 py-2.5 text-right font-medium text-gray-600">Total Facturado</th>}
                    {activeColumns.includes("ultima_visita") && <th className="px-4 py-2.5 text-left font-medium text-gray-600">Última Visita</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredClientes.length === 0 ? (
                    <tr><td colSpan={activeColumns.length + 1} className="text-center py-6 text-gray-400">Sin datos</td></tr>
                  ) : (
                    filteredClientes.map((c, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2.5 text-center text-gray-400">{i + 1}</td>
                        {activeColumns.includes("nombre_cliente") && <td className="px-4 py-2.5 font-medium">{c.nombre_cliente}</td>}
                        {activeColumns.includes("placa") && <td className="px-4 py-2.5 text-gray-500">{c.placa || "—"}</td>}
                        {activeColumns.includes("total_cotizaciones") && <td className="px-4 py-2.5 text-center">{c.total_cotizaciones}</td>}
                        {activeColumns.includes("cotizaciones_aprobadas") && <td className="px-4 py-2.5 text-center text-green-700 font-medium">{c.cotizaciones_aprobadas}</td>}
                        {activeColumns.includes("total_facturado") && <td className="px-4 py-2.5 text-right font-medium text-emerald-700">{fmt(c.total_facturado)}</td>}
                        {activeColumns.includes("ultima_visita") && <td className="px-4 py-2.5 text-gray-500">{fmtDate(c.ultima_visita)}</td>}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredClientes.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex gap-6 text-sm text-gray-600">
                <span>Mostrando: <strong>{filteredClientes.length}</strong> clientes</span>
                <span>Total facturado: <strong className="text-emerald-700">{fmt(filteredClientes.reduce((a, c) => a + Number(c.total_facturado), 0))}</strong></span>
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
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
};

export default ReporteClientes;
