import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api";
import '../styles/quotation-pdf.css';
import logo from "../assets/logo.png";
import { formatDateLocal } from "../utils/dateUtils";

const QuotationPDFView = () => {
  const navigate = useNavigate();
  const pdfRef = useRef();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  const formatCurrency = (value) => {
    if (typeof value !== "number") value = Number(value);
    if (isNaN(value)) return "$ 0";
    return `$ ${value.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const fetchQuotation = async () => {
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const { data } = await api.get(`/cotizaciones/${id}`, config);
      setQuotation(data);
    } catch (err) {
      console.error(err);
      alert("Error loading quotation details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotation();
  }, [id]);

  const handleDownloadPDF = async () => {
    try {
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const res = await fetch(`${baseURL}/cotizaciones/${id}/pdf`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        },
      });

      if (!res.ok) {
        let errorMsg = 'Error descargando PDF';
        try {
          const text = await res.text();
          errorMsg = text || errorMsg;
        } catch (e) {
          // Si no se puede leer el texto, usar mensaje genérico
        }
        throw new Error(errorMsg);
      }

      // Verificar que la respuesta es realmente un PDF
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/pdf')) {
        throw new Error('La respuesta no es un archivo PDF válido');
      }

      const blob = await res.blob();
      
      // Verificar que el blob tiene contenido
      if (blob.size === 0) {
        throw new Error('El PDF descargado está vacío');
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Cotizacion-${(quotation.nombre_cliente || 'cliente').replace(/[^a-z0-9\-]/gi, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar después de un pequeño delay para asegurar que la descarga inició
      setTimeout(() => {
        a.remove();
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Error al descargar PDF:', err);
      alert(`Error generando PDF: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-green-500 border-t-transparent mb-4"></div>
          <p className="text-lg text-gray-700 font-medium">Cargando cotización...</p>
        </div>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Cotización no encontrada</h2>
          <p className="text-gray-600 mb-6">No se pudo cargar la información de esta cotización.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            ← Regresar
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'aprobada':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'rechazada':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Action Bar */}
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg font-medium border border-gray-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Regresar
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-2.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
            Descargar PDF
          </button>
        </div>

        {/* PDF Document */}
        <div ref={pdfRef} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header - Gradient Professional */}
          <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 text-white p-8">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                {/* Logo and Title */}
                <div className="flex items-center gap-4">
                  <img src={logo} alt="Logo" className="w-20 h-20 object-contain" />
                  <div>
                    <h1 className="text-3xl font-bold mb-1">
                      Cotización #{quotation.id_cotizacion}
                    </h1>
                    <span className={`inline-block px-4 py-1 rounded-full text-sm font-semibold border ${getStatusColor(quotation.estatus)}`}>
                      {quotation.estatus}
                    </span>
                  </div>
                </div>

                {/* Company Info */}
                <div className="text-right text-sm lg:text-base">
                  <p className="font-bold text-lg mb-1">Frenos y Servicios del Valle</p>
                  <p className="text-gray-200 font-medium">Los Expertos</p>
                  <p className="text-gray-300 mt-2">Cra. 16 No. 23-35 Av Pastrana</p>
                  <p className="text-gray-300">Valledupar, Colombia</p>
                  <div className="flex flex-col gap-1 mt-2">
                    <p className="text-gray-200">📞 +57 315 886 8625</p>
                    <p className="text-gray-200">✉️ frenosyserviciosdelvalle@hotmail.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 lg:p-10">
            {/* Client Information Grid */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 mb-8 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Información del Cliente
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 min-w-[140px]">Cliente:</span>
                    <span className="text-gray-900 font-medium">{quotation.nombre_cliente}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 min-w-[140px]">NIT/CC:</span>
                    <span className="text-gray-900">{quotation.nit_cc || 'N/A'}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 min-w-[140px]">Teléfono:</span>
                    <span className="text-gray-900">{quotation.telefono || 'N/A'}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 min-w-[140px]">Placa:</span>
                    <span className="text-gray-900 font-bold bg-yellow-100 px-3 py-1 rounded">{quotation.placa}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 min-w-[140px]">Vehículo:</span>
                    <span className="text-gray-900">{quotation.vehiculo}</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 min-w-[140px]">Kilometraje:</span>
                    <span className="text-gray-900">{quotation.kilometraje} km</span>
                  </div>
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 min-w-[140px]">Mecánico:</span>
                    <span className="text-gray-900">{quotation.nombre_mecanico}</span>
                  </div>
                  {quotation.segundo_mecanico && (
                    <div className="flex items-start">
                      <span className="font-semibold text-gray-700 min-w-[140px]">2do Mecánico:</span>
                      <span className="text-gray-900">{quotation.segundo_mecanico}</span>
                    </div>
                  )}
                  <div className="flex items-start">
                    <span className="font-semibold text-gray-700 min-w-[140px]">Fecha:</span>
                    <span className="text-gray-900">{quotation.fecha ? formatDateLocal(quotation.fecha) : ''}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
                Productos y Servicios
              </h2>
              <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                      <th className="px-4 py-4 text-left font-semibold">Descripción</th>
                      <th className="px-4 py-4 text-center font-semibold w-28">Cantidad</th>
                      <th className="px-4 py-4 text-right font-semibold w-36">Precio Unit.</th>
                      <th className="px-4 py-4 text-right font-semibold w-36">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quotation.items?.length > 0 ? (
                      quotation.items.map((item, idx) => (
                        <tr
                          key={idx}
                          className={`border-b border-gray-200 transition-colors ${
                            idx % 2 === 0 ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 hover:bg-gray-100'
                          }`}
                        >
                          <td className="px-4 py-3 text-gray-900">{item.descripcion}</td>
                          <td className="px-4 py-3 text-center font-medium text-gray-900">{item.cantidad}</td>
                          <td className="px-4 py-3 text-right text-gray-900">{formatCurrency(item.precio_unitario)}</td>
                          <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatCurrency(item.total)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-4 py-8 text-center text-gray-500 italic">
                          No hay productos o servicios registrados
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totals Section */}
            <div className="flex justify-end mb-8">
              <div className="w-full max-w-sm">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200 shadow-md">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700 font-medium">Subtotal:</span>
                      <span className="text-lg font-semibold text-gray-900">{formatCurrency(quotation.subtotal)}</span>
                    </div>
                    
                    {quotation.descuento > 0 && (
                      <>
                        <div className="flex justify-between items-center text-red-600">
                          <span className="font-medium">Descuento:</span>
                          <span className="text-lg font-semibold">-{formatCurrency(quotation.descuento)}</span>
                        </div>
                        <div className="border-t border-gray-300 pt-3"></div>
                      </>
                    )}
                    
                    <div className="flex justify-between items-center bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-lg px-4 py-3 shadow-md">
                      <span className="font-bold text-lg">TOTAL:</span>
                      <span className="text-2xl font-bold">{formatCurrency(quotation.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Observations */}
            {quotation.observaciones && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Observaciones:
                </h3>
                <p className="text-gray-700 leading-relaxed">{quotation.observaciones}</p>
              </div>
            )}

            {/* Signature Section */}
            <div className="border-t border-gray-300 pt-8 mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <p className="font-semibold text-gray-700 mb-6">Firma del Cliente:</p>
                  <div className="border-t-2 border-gray-400 pt-2 w-64">
                    <p className="text-sm text-gray-600 text-center">{quotation.nombre_cliente}</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-6">Firma Autorizada:</p>
                  <div className="border-t-2 border-gray-400 pt-2 w-64">
                    <p className="text-sm text-gray-600 text-center">Frenos y Servicios del Valle</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white px-8 py-6">
            <div className="text-center space-y-2">
              <p className="font-semibold text-base">
                © {new Date().getFullYear()} Frenos y Servicios del Valle - Todos los derechos reservados
              </p>
              <div className="border-t border-slate-600 my-3"></div>
              <p className="text-sm text-gray-300">
                Desarrollado por <span className="font-semibold text-emerald-400">Erik Moreno</span>
              </p>
              <div className="flex justify-center items-center gap-4 text-sm text-gray-300">
                <a href="mailto:erikmoreno790@gmail.com" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  erikmoreno790@gmail.com
                </a>
                <span className="text-gray-500">|</span>
                <a href="tel:+573027515585" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                  </svg>
                  302 751 5585
                </a>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { 
            background: white !important; 
            margin: 0;
            padding: 0;
          }
          .no-print { 
            display: none !important; 
          }
          .shadow-2xl,
          .shadow-xl,
          .shadow-lg,
          .shadow-md { 
            box-shadow: none !important; 
          }
          .rounded-2xl,
          .rounded-xl {
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default QuotationPDFView;
