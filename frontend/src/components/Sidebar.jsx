import { useState } from "react";
import logo from "../assets/logo.png";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  Home,
  Package,
  ClipboardList,
  Bell,
  Settings,
  LogOut,
  FileText,
  Wrench,
  Users,
  AlertTriangle,
  Truck,
  Search,
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const links = [
    { to: "/dashboard", label: "Dashboard", icon: <Home size={18} /> },
    {
      to: "/cotizacion",
      label: "Nueva Cotización",
      icon: <Wrench size={18} />,
    },
    {
      to: "/historial-cotizaciones",
      label: "Historial de Cotizaciones",
      icon: <FileText size={18} />,
    },
    {
      to: "/inventario/nuevo",
      label: "Nuevo Repuesto",
      icon: <Package size={18} />,
    },
    { to: "/inventario", label: "Buscar Repuesto", icon: <Search size={18} /> },
    {
      to: "/inventario/entradas",
      label: "Entradas",
      icon: <Truck size={18} />,
    },
    {
      to: "/inventario/salidas",
      label: "Salidas",
      icon: <ClipboardList size={18} />,
    },
    {
      to: "/reportes/repuestos-usados",
      label: "Reportes",
      icon: <FileText size={18} />,
    },
    {
      to: "/historial-repuestos/entradas-salidas",
      label: "Historial Entradas/Salidas",
      icon: <ClipboardList size={18} />,
    },
    { to: "/alertas", label: "Alertas", icon: <Bell size={18} /> },
    {
      to: "/alertas/configuracion",
      label: "Configurar Alertas",
      icon: <AlertTriangle size={18} />,
    },
    {
      to: "/usuarios",
      label: "Usuarios",
      icon: <Users size={18} />,
    },
    {
      to: "/configuracion",
      label: "Configuración",
      icon: <Settings size={18} />,
    },
  ];

  return (
    <>
      {/* Botón hamburguesa - solo móviles */}
      <button
        className="md:hidden p-2 fixed top-4 left-4 z-50 bg-gray-900 text-white rounded-lg shadow-md hover:bg-gray-800"
        onClick={toggleSidebar}
      >
        <Menu />
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-700 text-gray-200 shadow-xl transform transition-transform duration-300 z-40 flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:w-64`}
      >
        {/* Encabezado */}
        <div className="p-5 flex items-center space-x-2 border-b border-gray-700">
          {/* Logo centrado */}
          <div className="flex justify-center w-full">
            <img src={logo} alt="Logo" className="h-20 w-20 rounded-full" />
          </div>
        </div>

        {/* Navegación */}
        <div className="flex-1 overflow-y-auto">
          <nav className="mt-4 flex flex-col space-y-1">
            {links.map((link) => {
              const active = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center px-4 py-2 rounded-lg mx-2 transition
                    ${
                      active
                        ? "bg-blue-600 text-white font-semibold shadow-sm"
                        : "hover:bg-gray-600 hover:text-white"
                    }`}
                  onClick={() => setIsOpen(false)} // autocierra en móvil
                >
                  <span
                    className={`mr-3 ${
                      active ? "text-white" : "text-blue-300"
                    }`}
                  >
                    {link.icon}
                  </span>
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer - Cerrar sesión */}
        <div className="p-4 border-t border-gray-700">
          <button
            className="flex items-center w-full text-sm text-red-400 hover:text-red-500"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/login";
            }}
          >
            <LogOut className="mr-2" size={18} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
