import { useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  DollarSign,
  Package,
  Wrench,
  Users,
  ArrowRightLeft,
} from "lucide-react";
import ReporteVentas from "../components/reportes/ReporteVentas";
import ReporteInventario from "../components/reportes/ReporteInventario";
import ReporteMecanicos from "../components/reportes/ReporteMecanicos";
import ReporteClientes from "../components/reportes/ReporteClientes";
import ReporteMovimientos from "../components/reportes/ReporteMovimientos";

const tabs = [
  { key: "ventas", label: "Ventas", icon: DollarSign },
  { key: "inventario", label: "Inventario", icon: Package },
  { key: "mecanicos", label: "Mecánicos", icon: Wrench },
  { key: "clientes", label: "Clientes", icon: Users },
  { key: "movimientos", label: "Movimientos", icon: ArrowRightLeft },
];

const ReportesPage = () => {
  const [activeTab, setActiveTab] = useState("ventas");

  const renderTab = () => {
    switch (activeTab) {
      case "ventas":
        return <ReporteVentas />;
      case "inventario":
        return <ReporteInventario />;
      case "mecanicos":
        return <ReporteMecanicos />;
      case "clientes":
        return <ReporteClientes />;
      case "movimientos":
        return <ReporteMovimientos />;
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 md:ml-64">
        <main className="p-4 md:p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Centro de Reportes
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Analiza el rendimiento del taller con reportes detallados y
              descargables.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Active report */}
          {renderTab()}
        </main>
      </div>
    </div>
  );
};

export default ReportesPage;
