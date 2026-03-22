import { useState } from "react";
import logo from "../assets/logo.png";
import { Link, useLocation } from "react-router-dom";
import "../components/styles/styles.css";
import {
  Menu,
  Home,
  Package,
  ClipboardList,
  Bell,
  LogOut,
  FileText,
  Wrench,
  Users,
  AlertTriangle,
  Search,
  Camera,
} from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleSidebar = () => setIsOpen(!isOpen);

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
      to: "/scanner",
      label: "Escanear Repuesto",
      icon: <Camera size={18} />,
    },
    {
      to: "/inventario/nuevo",
      label: "Nuevo Repuesto",
      icon: <Package size={18} />,
    },
    { to: "/inventario", label: "Buscar Repuesto", icon: <Search size={18} /> },
    {
      to: "/reportes",
      label: "Reportes",
      icon: <FileText size={18} />,
    },
    {
      to: "/inventario/movimientos",
      label: "Historial Entradas/Salidas",
      icon: <ClipboardList size={18} />,
    },
    { to: "/alertas", label: "Alertas", icon: <Bell size={18} /> },
    {
      to: "/alertas/configuracion",
      label: "Configurar Alertas",
      icon: <AlertTriangle size={18} />,
    },
    { to: "/usuarios", label: "Usuarios", icon: <Users size={18} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

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
        className={`sidebar-container fixed top-0 left-0 h-full w-64 bg-linear-to-b from-gray-900 via-gray-800 to-gray-700 text-gray-200 shadow-xl transform transition-transform duration-300 z-40 flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0`}
      >
        {/* Encabezado */}
        <div className="p-5 flex items-center justify-center border-b border-gray-700">
          <img src={logo} alt="Logo" className="h-20 w-20 rounded-full" />
        </div>

        {/* Navegación */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
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
                  onClick={() => setIsOpen(false)}
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

            {/* 🔹 Botón Cerrar sesión integrado */}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 mx-2 mt-4 rounded-lg text-red-400 hover:text-white hover:bg-red-600 transition"
            >
              <LogOut className="mr-3" size={18} />
              Cerrar sesión
            </button>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
