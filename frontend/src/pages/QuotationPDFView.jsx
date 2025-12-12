import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api";
import html2pdf from "html2pdf.js";
import logo from "../assets/logo.png";
import { formatDateLocal } from "../utils/dateUtils";

const QuotationPDFView = () => {
  const navigate = useNavigate();
  const pdfRef = useRef();
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const { id } = useParams();

  // Agrega esta función arriba del componente
  const formatCurrency = (value) => {
    if (typeof value !== "number") value = Number(value);
    if (isNaN(value)) return "$ 0";
    return `$ ${value.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  // Fetch quotation details
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

  // Load data on component mount
  useEffect(() => {
    fetchQuotation();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600">Loading details...</p>
      </div>
    );
  }

  if (!quotation) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">No quotation data to display.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          Regresar
        </button>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    const element = pdfRef.current;
    const opt = {
      margin: 0.5,
      filename: `Cotizacion-${quotation.nombre_cliente || "cliente"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 1.5 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <div className="bg-gray-50 min-h-screen p-8 print:bg-white">
      {/* PDF Template */}
      <div
        ref={pdfRef}
        className="bg-white p-10 rounded-lg shadow-lg max-w-4xl mx-auto"
        style={{
          fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
          color: "#2D3748",
        }}
      >
        {/* Header */}
        <header
          style={{
            background: "linear-gradient(90deg, #000000ff 0%, #39713fff 100%)",
            color: "white",
            padding: "20px",
            borderRadius: "8px 8px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={logo}
              alt="Logo"
              style={{ width: "80px", marginRight: "20px" }}
            />
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: "24px",
                  fontWeight: "600",
                }}
              >
                Cotización #{quotation.id_cotizacion}
              </h1>
              <p style={{ margin: 0, fontSize: "14px" }}>{quotation.estatus}</p>
            </div>
          </div>
          <div style={{ textAlign: "right", fontSize: "12px" }}>
            <p style={{ margin: "0", fontWeight: "500" }}>
              Frenos y Servicios del Valle - Los Expertos
            </p>
            <p style={{ margin: "4px 0" }}>
              Cra. 16 No. 23-35 Av Pastrana, Valledupar, Colombia
            </p>
            <p style={{ margin: "4px 0" }}>
              +57 3158868625 | frenosyserviciosdelvalle@hotmail.com
            </p>
          </div>
        </header>

        {/* Client Information */}
        <section
          style={{ fontSize: "14px", marginBottom: "30px", lineHeight: "1.6" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
            }}
          >
            <div>
              <p>
                <strong>Cliente:</strong> {quotation.nombre_cliente}
              </p>
              <p>
                <strong>Placa del Vehiculo:</strong> {quotation.placa}
              </p>
              <p>
                <strong>Vehiculo:</strong> {quotation.vehiculo}
              </p>
            </div>
            <div>
              <p>
                <strong>Mecanico:</strong> {quotation.nombre_mecanico}
              </p>
              {quotation.segundo_mecanico && (
                <p>
                  <strong>Segundo Mecanico:</strong>{" "}
                  {quotation.segundo_mecanico}
                </p>
              )}
              <p>
                <strong>Kilometraje:</strong> {quotation.kilometraje}
              </p>
              <p>
                <strong>Fecha:</strong>{" "}
                {quotation.fecha ? formatDateLocal(quotation.fecha) : ""}
              </p>
            </div>
          </div>
        </section>

        {/* Products/Services Table */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: "13px",
            marginBottom: "30px",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#90EE90", color: "#2D3748" }}>
              <th style={thStyle}>Producto/Servicio</th>
              <th style={thStyle}>Cantidad</th>
              <th style={thStyle}>Precio Unitario</th>
              <th style={thStyle}>Total</th>
            </tr>
          </thead>
          <tbody>
            {quotation.items?.length > 0 ? (
              quotation.items.map((item, idx) => (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "#F7FAFC" : "#FFFFFF",
                  }}
                >
                  <td style={tdStyle}>{item.descripcion}</td>
                  <td style={tdStyle}>{item.cantidad}</td>
                  <td style={tdStyle}>
                    {formatCurrency(item.precio_unitario)}
                  </td>
                  <td style={tdStyle}>{formatCurrency(item.total)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td style={tdStyle} colSpan="4">
                  No products or services listed
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div className="w-full max-w-sm ml-auto mb-8">
          <div className="bg-white p-4">
            <div className="text-right space-y-2">
              <p style={{ fontSize: "14px", color: "#4B5563" }}>
                <strong>Subtotal:</strong> {formatCurrency(quotation.subtotal)}
              </p>

              {quotation.descuento > 0 && (
                <p style={{ fontSize: "14px", color: "#DC2626" }}>
                  <strong>Descuento:</strong> -
                  {formatCurrency(quotation.descuento)}
                </p>
              )}

              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "bold",
                  color: "#1E3A8A",
                  borderTop: "1px solid #D1D5DB",
                  paddingTop: "8px",
                }}
              >
                <strong>Total:</strong> {formatCurrency(quotation.total)}
              </p>
            </div>
          </div>
        </div>

        {/* Signature */}
        <div style={{ marginBottom: "40px", fontSize: "13px" }}>
          <p>
            <strong>Firma del cliente:</strong>
          </p>
          <div
            style={{
              borderTop: "1px solid #2D3748",
              width: "250px",
              marginTop: "50px",
            }}
          ></div>
        </div>

        {/* Footer */}
        <footer
          style={{
            borderTop: "1px solid #E2E8F0",
            marginTop: "40px",
            paddingTop: "15px",
            textAlign: "center",
            fontSize: "13px",
            color: "#4A5568",
            lineHeight: "1.6",
          }}
        >
          <p style={{ margin: "0", fontWeight: "500" }}>
            © {new Date().getFullYear()} Frenos y Servicios del Valle. Todos los
            derechos reservados.
          </p>

          <p style={{ margin: "8px 0 0" }}>
            Desarrollado por <strong>Erik Moreno</strong>
          </p>

          <p style={{ margin: "5px 0 0" }}>
            📧{" "}
            <a
              href="mailto:erikmoreno790@gmail.com"
              style={{ color: "#2B6CB0", textDecoration: "none" }}
            >
              erikmoreno790@gmail.com
            </a>{" "}
            | 📱{" "}
            <a
              href="tel:+573027515585"
              style={{ color: "#2B6CB0", textDecoration: "none" }}
            >
              302 751 5585
            </a>
          </p>
        </footer>
      </div>

      {/* Buttons */}
      <div className="text-center mt-8 no-print">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-600 text-white px-5 py-2.5 rounded-lg hover:bg-gray-700 transition mr-4"
        >
          Regresar
        </button>
        <button
          onClick={handleDownloadPDF}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
        >
          Descargar PDF
        </button>
      </div>

      {/* Print Styles */}
      <style>
        {`
          @media print {
            body { background: white !important; margin: 0; }
            .no-print { display: none !important; }
            .shadow-lg { box-shadow: none !important; }
          }
        `}
      </style>
    </div>
  );
};

const thStyle = {
  border: "1px solid #E2E8F0",
  padding: "12px",
  textAlign: "left",
  fontWeight: "600",
};

const tdStyle = {
  border: "1px solid #E2E8F0",
  padding: "12px",
  textAlign: "left",
};

export default QuotationPDFView;
