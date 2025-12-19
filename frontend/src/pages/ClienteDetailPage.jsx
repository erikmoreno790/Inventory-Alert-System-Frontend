import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import AlertMessage from '../components/AlertMessage';
import API_URL from '../api';

const ClienteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const sidebarOpen = useSelector((state) => state.sidebar?.isOpen || false);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchClienteDetail();
  }, [id]);

  const fetchClienteDetail = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/clientes/${id}/vehiculos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setCliente(data.data);
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: 'Error al cargar los datos del cliente'
        });
      }
    } catch (error) {
      console.error('Error al cargar cliente:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Error al cargar los datos del cliente'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          } md:ml-64`}
        >
          <main className="p-6">
            <div className="text-center py-12">
              <p className="text-gray-600">Cargando datos del cliente...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!cliente) {
    return (
      <div className="flex min-h-screen bg-gray-100">
        <Sidebar />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          } md:ml-64`}
        >
          <main className="p-6">
            <div className="text-center py-12">
              <p className="text-gray-600">Cliente no encontrado</p>
              <button
                onClick={() => navigate('/clientes')}
                className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
              >
                Volver a Clientes
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-0'
        } md:ml-64`}
      >
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
              <h1 className="text-3xl font-bold text-gray-800">
                Detalles del Cliente
              </h1>
              <button
                onClick={() => navigate('/clientes')}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-200"
              >
                Volver
              </button>
            </div>

            {/* Información del Cliente */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Información Personal
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Nombre
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {cliente.nombre}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Documento
                  </label>
                  <p className="text-lg text-gray-900">
                    {cliente.documento || 'No registrado'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Teléfono
                  </label>
                  <p className="text-lg text-gray-900">
                    {cliente.telefono || 'No registrado'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Email
                  </label>
                  <p className="text-lg text-gray-900">
                    {cliente.email || 'No registrado'}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Dirección
                  </label>
                  <p className="text-lg text-gray-900">
                    {cliente.direccion || 'No registrado'}
                  </p>
                </div>
              </div>
            </div>

            {/* Vehículos del Cliente */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  Vehículos Registrados
                </h2>
                <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-semibold">
                  {cliente.vehiculos?.length || 0} vehículos
                </span>
              </div>
              
              {!cliente.vehiculos || cliente.vehiculos.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No hay vehículos registrados para este cliente
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {cliente.vehiculos.map((vehiculo) => (
                    <div
                      key={vehiculo.vehiculo_id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition duration-200"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold">
                          {vehiculo.placa}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600">
                            Marca/Modelo
                          </label>
                          <p className="text-sm font-semibold text-gray-900">
                            {vehiculo.marca_modelo || 'No especificado'}
                          </p>
                        </div>
                        {vehiculo.año && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600">
                              Año
                            </label>
                            <p className="text-sm text-gray-900">
                              {vehiculo.año}
                            </p>
                          </div>
                        )}
                        {vehiculo.color && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600">
                              Color
                            </label>
                            <p className="text-sm text-gray-900">
                              {vehiculo.color}
                            </p>
                          </div>
                        )}
                        {vehiculo.kilometraje && (
                          <div>
                            <label className="block text-xs font-medium text-gray-600">
                              Kilometraje
                            </label>
                            <p className="text-sm text-gray-900">
                              {parseInt(vehiculo.kilometraje).toLocaleString()} km
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {alert.show && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert({ ...alert, show: false })}
        />
      )}
    </div>
  );
};

export default ClienteDetailPage;
