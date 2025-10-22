import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import TopNavbar from "../components/TopNavbar";
import api from "../api";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, Eye, Pencil, UserCog } from "lucide-react";

const UsersDetailsPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Obtener lista de usuarios
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };

        const res = await api.get("/users", config);
        setUsers(res.data);
      } catch (error) {
        console.error(error);
        toast.error("Error al obtener los usuarios");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filtrado dinámico
  const filteredUsers = users.filter(
  (u) =>
    (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.role || "").toLowerCase().includes(searchTerm.toLowerCase())
);


  // Función para abrir modal
  const openRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setShowRoleModal(true);
  };

  // Cambiar rol
  const handleAssignRole = async () => {
    if (!selectedUser || !newRole) return;

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      await api.post(
        `/users/assign-role/${selectedUser.id}`,
        { role: newRole },
        config
      );

      // Actualizar localmente
      setUsers((prev) =>
        prev.map((u) =>
          u.id === selectedUser.id ? { ...u, role: newRole } : u
        )
      );

      toast.success("Rol actualizado correctamente");
      setShowRoleModal(false);
    } catch (error) {
      console.error(error);
      toast.error("Error al cambiar el rol del usuario");
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <TopNavbar />

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Usuarios Registrados</h2>
            <button
              onClick={() => navigate("/usuarios/nuevo-usuario")}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              + Nuevo Usuario
            </button>
          </div>

          {/* Buscador */}
          <div className="flex items-center gap-2 mb-4">
            <Search className="text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre, correo o rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border rounded-md p-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Tabla de usuarios */}
          {loading ? (
            <p className="text-gray-600">Cargando usuarios...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-gray-600">No se encontraron usuarios.</p>
          ) : (
            <div className="overflow-x-auto bg-white shadow rounded-lg">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 uppercase text-sm">
                    <th className="p-3 border-b">Nombre</th>
                    <th className="p-3 border-b">Correo</th>
                    <th className="p-3 border-b">Rol</th>
                    <th className="p-3 border-b">Creado</th>
                    <th className="p-3 border-b">Actualizado</th>
                    <th className="p-3 border-b text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition text-gray-700"
                    >
                      <td className="p-3 border-b">{user.name}</td>
                      <td className="p-3 border-b">{user.email}</td>
                      <td className="p-3 border-b capitalize">{user.role}</td>
                      <td className="p-3 border-b">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 border-b">
                        {new Date(user.updated_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 border-b text-center flex justify-center gap-3">
                        <button
                          onClick={() => navigate(`/users/${user.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/users/edit/${user.id}`)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => openRoleModal(user)}
                          className="text-purple-600 hover:text-purple-800"
                        >
                          <UserCog size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal para cambiar rol */}
      {showRoleModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h3 className="text-lg font-semibold mb-4 text-center">
              Cambiar Rol de Usuario
            </h3>

            <p className="text-sm text-gray-700 mb-2">
              Usuario: <span className="font-medium">{selectedUser.name}</span>
            </p>

            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full border rounded-md p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="admin">Administrador</option>
              <option value="user">Usuario</option>
            </select>

            <div className="flex justify-between">
              <button
                onClick={() => setShowRoleModal(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAssignRole}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default UsersDetailsPage;
