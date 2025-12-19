import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import AlertMessage from '../components/AlertMessage';
import API_URL from '../api';

const RecordatoriosPage = () => {
  const sidebarOpen = useSelector((state) => state.sidebar?.isOpen || false);
  const [recordatorios, setRecordatorios] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentRecordatorio, setCurrentRecordatorio] = useState(null);
  const [filterEstado, setFilterEstado] = useState('');
  const [filterTipo, setFilterTipo] = useState('');
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });

  const [formData, setFormData] = useState({
    cliente_id: '',
    vehiculo_id: '',
    tipo: 'mantenimiento',
    fecha_programada: '',
    mensaje: '',
    telefono: '',
    estado: 'pendiente',
    notas: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch recordatorios
      const recordatoriosRes = await fetch(`${API_URL}/recordatorios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const recordatoriosData = await recordatoriosRes.json();
      
      // Fetch clientes
      const clientesRes = await fetch(`${API_URL}/clientes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const clientesData = await clientesRes.json();

      if (recordatoriosData.success) {
        setRecordatorios(recordatoriosData.data);
      }
      if (clientesData.success) {
        setClientes(clientesData.data);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Error al cargar datos'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVehiculosByCliente = async (clienteId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/clientes/${clienteId}/vehiculos`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      
      if (data.success && data.data.vehiculos) {
        setVehiculos(data.data.vehiculos);
      }
    } catch (error) {
      console.error('Error al cargar vehículos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    if (name === 'cliente_id' && value) {
      fetchVehiculosByCliente(value);
      
      // Auto-fill teléfono del cliente
      const cliente = clientes.find(c => c.cliente_id === parseInt(value));
      if (cliente && cliente.telefono) {
        setFormData(prev => ({
          ...prev,
          cliente_id: value,
          telefono: cliente.telefono
        }));
      }
    }
  };

  const openCreateModal = () => {
    const today = new Date().toISOString().split('T')[0];
    setFormData({
      cliente_id: '',
      vehiculo_id: '',
      tipo: 'mantenimiento',
      fecha_programada: today,
      mensaje: '',
      telefono: '',
      estado: 'pendiente',
      notas: ''
    });
    setEditMode(false);
    setCurrentRecordatorio(null);
    setVehiculos([]);
    setShowModal(true);
  };

  const openEditModal = async (recordatorio) => {
    setFormData({
      cliente_id: recordatorio.cliente_id || '',
      vehiculo_id: recordatorio.vehiculo_id || '',
      tipo: recordatorio.tipo || 'mantenimiento',
      fecha_programada: recordatorio.fecha_programada?.split('T')[0] || '',
      mensaje: recordatorio.mensaje || '',
      telefono: recordatorio.telefono || '',
      estado: recordatorio.estado || 'pendiente',
      notas: recordatorio.notas || ''
    });
    
    if (recordatorio.cliente_id) {
      await fetchVehiculosByCliente(recordatorio.cliente_id);
    }
    
    setEditMode(true);
    setCurrentRecordatorio(recordatorio);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setFormData({
      cliente_id: '',
      vehiculo_id: '',
      tipo: 'mantenimiento',
      fecha_programada: '',
      mensaje: '',
      telefono: '',
      estado: 'pendiente',
      notas: ''
    });
    setCurrentRecordatorio(null);
    setEditMode(false);
    setVehiculos([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.cliente_id || !formData.vehiculo_id || !formData.fecha_programada) {
      setAlert({
        show: true,
        type: 'error',
        message: 'Por favor complete los campos obligatorios'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const url = editMode
        ? `${API_URL}/recordatorios/${currentRecordatorio.recordatorio_id}`
        : `${API_URL}/recordatorios`;
      
      const method = editMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setAlert({
          show: true,
          type: 'success',
          message: editMode ? 'Recordatorio actualizado exitosamente' : 'Recordatorio creado exitosamente'
        });
        closeModal();
        fetchData();
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: data.message || 'Error al guardar recordatorio'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Error al guardar recordatorio'
      });
    }
  };

  const handleDelete = async (recordatorioId) => {
    if (!window.confirm('¿Está seguro de eliminar este recordatorio?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/recordatorios/${recordatorioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setAlert({
          show: true,
          type: 'success',
          message: 'Recordatorio eliminado exitosamente'
        });
        fetchData();
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: data.message || 'Error al eliminar recordatorio'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Error al eliminar recordatorio'
      });
    }
  };

  const handleEnviarSMS = async (recordatorioId) => {
    if (!window.confirm('¿Desea enviar el SMS de recordatorio ahora?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/recordatorios/${recordatorioId}/enviar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setAlert({
          show: true,
          type: 'success',
          message: 'SMS enviado exitosamente'
        });
        fetchData();
      } else {
        setAlert({
          show: true,
          type: 'error',
          message: data.message || 'Error al enviar SMS'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setAlert({
        show: true,
        type: 'error',
        message: 'Error al enviar SMS'
      });
    }
  };

  const filteredRecordatorios = recordatorios.filter(rec => {
    if (filterEstado && rec.estado !== filterEstado) return false;
    if (filterTipo && rec.tipo !== filterTipo) return false;
    return true;
  });

  const getEstadoBadge = (estado) => {
    const badges = {
      pendiente: 'bg-yellow-100 text-yellow-800',
      enviado: 'bg-green-100 text-green-800',
      cancelado: 'bg-gray-100 text-gray-800',
      error: 'bg-red-100 text-red-800'
    };
    return badges[estado] || 'bg-gray-100 text-gray-800';
  };

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
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-4">
                Gestión de Recordatorios
              </h1>
              <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                <div className="flex gap-4 flex-wrap">
                  <select
                    value={filterEstado}
                    onChange={(e) => setFilterEstado(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Todos los estados</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="enviado">Enviado</option>
                    <option value="cancelado">Cancelado</option>
                    <option value="error">Error</option>
                  </select>

                  <select
                    value={filterTipo}
                    onChange={(e) => setFilterTipo(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="">Todos los tipos</option>
                    <option value="mantenimiento">Mantenimiento</option>
                    <option value="revision">Revisión</option>
                    <option value="seguimiento">Seguimiento</option>
                    <option value="otro">Otro</option>
                  </select>
                </div>

                <button
                  onClick={openCreateModal}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg shadow-md transition duration-200 flex items-center gap-2"
                >
                  <span className="text-xl">+</span>
                  Nuevo Recordatorio
                </button>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">Cargando recordatorios...</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vehículo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Fecha Programada
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Teléfono
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRecordatorios.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                            No se encontraron recordatorios
                          </td>
                        </tr>
                      ) : (
                        filteredRecordatorios.map((recordatorio) => (
                          <tr key={recordatorio.recordatorio_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {recordatorio.cliente_nombre || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {recordatorio.vehiculo_placa || '-'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {recordatorio.vehiculo_marca || ''}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 capitalize">
                                {recordatorio.tipo}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(recordatorio.fecha_programada).toLocaleDateString('es-CO')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {recordatorio.telefono || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getEstadoBadge(recordatorio.estado)}`}>
                                {recordatorio.estado}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {recordatorio.estado === 'pendiente' && (
                                <button
                                  onClick={() => handleEnviarSMS(recordatorio.recordatorio_id)}
                                  className="text-green-600 hover:text-green-900 mr-4"
                                >
                                  Enviar
                                </button>
                              )}
                              <button
                                onClick={() => openEditModal(recordatorio)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                Editar
                              </button>
                              <button
                                onClick={() => handleDelete(recordatorio.recordatorio_id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                {editMode ? 'Editar Recordatorio' : 'Nuevo Recordatorio'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cliente <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="cliente_id"
                      value={formData.cliente_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="">Seleccione un cliente</option>
                      {clientes.map((cliente) => (
                        <option key={cliente.cliente_id} value={cliente.cliente_id}>
                          {cliente.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vehículo <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="vehiculo_id"
                      value={formData.vehiculo_id}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.cliente_id}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100"
                    >
                      <option value="">Seleccione un vehículo</option>
                      {vehiculos.map((vehiculo) => (
                        <option key={vehiculo.vehiculo_id} value={vehiculo.vehiculo_id}>
                          {vehiculo.placa} - {vehiculo.marca_modelo}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="mantenimiento">Mantenimiento</option>
                      <option value="revision">Revisión</option>
                      <option value="seguimiento">Seguimiento</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha Programada <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="fecha_programada"
                      value={formData.fecha_programada}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="3001234567"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="enviado">Enviado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mensaje
                    </label>
                    <textarea
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Mensaje del recordatorio..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas
                    </label>
                    <textarea
                      name="notas"
                      value={formData.notas}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Notas adicionales..."
                    />
                  </div>
                </div>

                <div className="flex gap-4 justify-end">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition duration-200"
                  >
                    {editMode ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

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

export default RecordatoriosPage;
