import { useState } from "react";
import { Download, Filter, DollarSign, FileText, TrendingUp, Percent } from "lucide-react";
import api from "../../api";

const ReporteVentas = () => {
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [estatus, setEstatus] = useState({ Aprobada: true, Pendiente: true, Rechazada: true });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(true);
  const [columnas, setColumnas] = useState({
    descripcion: true,
    total_cantidad: true,
    total_valor: true,
    en_cotizaciones: true,
    precio_promedio: true,
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
      const res = await api.get(`/reportes/ventas?${buildParams()}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
      alert("Error al obtener reporte de ventas");
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    try {
      const colsStr = Object.entries(columnas).filter(([, v]) => v).map(([k]) => k).join(",");
      const res = await api.get(`/reportes/ventas/pdf?${buildParams()}&columnas=${colsStr}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `reporte_ventas_${new Date().toISOString().split("T")[0]}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Error al descargar PDF");
    }
  };

  const fmt = (v) => `$ ${Number(v || 0).toLocaleString("es-CO")}`;
  const activeColumns = Object.entries(columnas).filter(([, v]) => v).map(([k]) => k);

  const filteredItems = data?.topItems?.filter((item) =>
    item.descripcion.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition"
        >
          <span className="flex items-center gap-2 font-semibold text-gray-700">
            <Filter size={16} /> Filtros
          </span>
          <span className="text-gray-400 text-sm">{showFilters ? "▲" : "▼"}</span>
        </button>

        {showFilters && (
          <div className="px-5 pb-4 space-y-4 border-t border-gray-100">
            {/* Fecha */}
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

            {/* Estatus checkboxes */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Estatus</label>
              <div className="flex gap-4">
                {["Aprobada", "Pendiente", "Rechazada"].map((s) => (
                  <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={estatus[s]}
                      onChange={() => setEstatus({ ...estatus, [s]: !estatus[s] })}
                      className="rounded text-emerald-600 focus:ring-emerald-500" />
                    <span className={
                      s === "Aprobada" ? "text-green-700" :
                      s === "Pendiente" ? "text-amber-700" : "text-red-700"
                    }>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Columnas visibles */}
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2">Columnas en tabla y PDF</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { key: "descripcion", label: "Descripción" },
                  { key: "total_cantidad", label: "Cantidad" },
                  { key: "total_valor", label: "Valor Total" },
                  { key: "en_cotizaciones", label: "# Cotizaciones" },
                  { key: "precio_promedio", label: "Precio Promedio" },
                ].map((col) => (
                  <label key={col.key} className="flex items-center gap-1.5 text-sm cursor-pointer">
                    <input type="checkbox" checked={columnas[col.key]}
                      onChange={() => setColumnas({ ...columnas, [col.key]: !columnas[col.key] })}
                      disabled={col.key === "descripcion"}
                      className="rounded text-emerald-600 focus:ring-emerald-500" />
                    {col.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-1">
              <button onClick={fetchData} disabled={loading}
                className="bg-emerald-600 text-white px-5 py-2 rounded-lg hover:bg-emerald-700 transition font-medium text-sm flex items-center gap-2 disabled:opacity-50">
                <TrendingUp size={16} />
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

      {/* KPIs */}
      {data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPI icon={<DollarSign size={20} />} label="Total Facturado" value={fmt(data.resumen.total_facturado)} color="emerald" />
            <KPI icon={<FileText size={20} />} label="Cotizaciones" value={data.resumen.total_cotizaciones} color="blue" />
            <KPI icon={<DollarSign size={20} />} label="Ticket Promedio" value={fmt(data.resumen.ticket_promedio)} color="purple" />
            <KPI icon={<Percent size={20} />} label="Tasa Aprobación"
              value={data.resumen.total_cotizaciones > 0
                ? `${((data.resumen.aprobadas / data.resumen.total_cotizaciones) * 100).toFixed(1)}%`
                : "0%"}
              color={data.resumen.aprobadas / data.resumen.total_cotizaciones >= 0.5 ? "emerald" : "red"} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <MiniKPI label="Aprobadas" value={data.resumen.aprobadas} className="text-green-700 bg-green-50 border-green-200" />
            <MiniKPI label="Pendientes" value={data.resumen.pendientes} className="text-amber-700 bg-amber-50 border-amber-200" />
            <MiniKPI label="Rechazadas" value={data.resumen.rechazadas} className="text-red-700 bg-red-50 border-red-200" />
          </div>

          {/* Búsqueda y Tabla Top Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <h3 className="font-semibold text-gray-700">Top Repuestos / Servicios Vendidos</h3>
              <input type="text" placeholder="Buscar repuesto..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full md:w-64 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {activeColumns.includes("descripcion") && <th className="px-4 py-2.5 text-left font-medium text-gray-600">Descripción</th>}
                    {activeColumns.includes("total_cantidad") && <th className="px-4 py-2.5 text-center font-medium text-gray-600">Cantidad</th>}
                    {activeColumns.includes("total_valor") && <th className="px-4 py-2.5 text-right font-medium text-gray-600">Valor Total</th>}
                    {activeColumns.includes("en_cotizaciones") && <th className="px-4 py-2.5 text-center font-medium text-gray-600"># Cotiz.</th>}
                    {activeColumns.includes("precio_promedio") && <th className="px-4 py-2.5 text-right font-medium text-gray-600">Precio Prom.</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredItems.length === 0 ? (
                    <tr><td colSpan={activeColumns.length} className="text-center py-6 text-gray-400">Sin datos</td></tr>
                  ) : (
                    filteredItems.map((item, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        {activeColumns.includes("descripcion") && <td className="px-4 py-2.5">{item.descripcion}</td>}
                        {activeColumns.includes("total_cantidad") && <td className="px-4 py-2.5 text-center font-medium">{item.total_cantidad}</td>}
                        {activeColumns.includes("total_valor") && <td className="px-4 py-2.5 text-right font-medium text-emerald-700">{fmt(item.total_valor)}</td>}
                        {activeColumns.includes("en_cotizaciones") && <td className="px-4 py-2.5 text-center">{item.en_cotizaciones}</td>}
                        {activeColumns.includes("precio_promedio") && <td className="px-4 py-2.5 text-right">{fmt(item.precio_promedio)}</td>}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {filteredItems.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex gap-6 text-sm text-gray-600">
                <span>Resultados: <strong>{filteredItems.length}</strong></span>
                <span>Total cantidad: <strong>{filteredItems.reduce((a, i) => a + Number(i.total_cantidad), 0)}</strong></span>
                <span>Valor total: <strong className="text-emerald-700">{fmt(filteredItems.reduce((a, i) => a + Number(i.total_valor), 0))}</strong></span>
              </div>
            )}
          </div>

          {/* Ventas por Mes */}
          {data.ventasMes && data.ventasMes.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-700">Ventas por Mes</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600">Mes</th>
                      <th className="px-4 py-2.5 text-center font-medium text-gray-600">Cotizaciones</th>
                      <th className="px-4 py-2.5 text-center font-medium text-gray-600">Aprobadas</th>
                      <th className="px-4 py-2.5 text-right font-medium text-gray-600">Facturado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.ventasMes.map((m, i) => (
                      <tr key={i} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-2.5 font-medium">{m.mes_label}</td>
                        <td className="px-4 py-2.5 text-center">{m.total_cotizaciones}</td>
                        <td className="px-4 py-2.5 text-center text-green-700">{m.aprobadas}</td>
                        <td className="px-4 py-2.5 text-right font-medium text-emerald-700">{fmt(m.total_facturado)}</td>
                      </tr>
                    ))}
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

// Shared KPI card components
const KPI = ({ icon, label, value, color }) => {
  const colors = {
    emerald: "bg-emerald-50 border-emerald-200 text-emerald-700",
    blue: "bg-blue-50 border-blue-200 text-blue-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
    red: "bg-red-50 border-red-200 text-red-700",
    amber: "bg-amber-50 border-amber-200 text-amber-700",
  };
  return (
    <div className={`rounded-xl border p-4 ${colors[color] || colors.blue}`}>
      <div className="flex items-center gap-2 mb-1 opacity-70">{icon}<span className="text-xs font-medium">{label}</span></div>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
};

const MiniKPI = ({ label, value, className }) => (
  <div className={`rounded-lg border p-3 text-center ${className}`}>
    <p className="text-xs font-medium mb-0.5">{label}</p>
    <p className="text-lg font-bold">{value}</p>
  </div>
);

export default ReporteVentas;
