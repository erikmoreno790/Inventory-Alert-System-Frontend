import { useEffect } from "react";
import { X } from "lucide-react"; // ícono bonito de cierre

const AlertMessage = ({ type = "success", message, onClose }) => {
  // 🔹 Auto-cierre después de 3 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // 🔹 Estilos básicos y variantes de tipo
  const centeredTopStyle =
    "fixed top-6 left-1/2 transform -translate-x-1/2 px-5 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 transition-all duration-300";

  const types = {
    success: "bg-green-500 text-white",
    error: "bg-red-500 text-white",
    warning: "bg-yellow-400 text-black",
    info: "bg-blue-500 text-white",
  };

  return (
    <div className={`${centeredTopStyle} ${types[type]}`}>
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="text-white hover:opacity-80">
        <X size={18} />
      </button>
    </div>
  );
};

export default AlertMessage;
