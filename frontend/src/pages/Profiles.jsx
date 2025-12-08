import { useState, useEffect, useCallback } from "react";
import Sidebar from "../components/Sidebar";
import api from "../api";
import {
  Search,
  UserPlus,
  UserCog,
  Key,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  X,
  Check,
  Shield,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Profiles = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(""); // 'create', 'edit', 'role', 'password'
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    telefono: "",
    password: "",
    confirmPassword: "",
    role: "user",
  });

  const token = localStorage.getItem("token");
  const getConfig = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/users", getConfig());
      setUsers(res.data);
    } catch (error) {
      console.error(error);
      toast.error("Error al cargar usuarios");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter((u) => {
    const nombre = u.nombre?.toLowerCase() || "";
    const email = u.email?.toLowerCase() || "";
    const rol = u.rol?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return (
      nombre.includes(search) || email.includes(search) || rol.includes(search)
    );
  });

  const openModal = (type, user = null) => {
    setModalType(type);
    setSelectedUser(user);
    setShowModal(true);

    if (type === "create") {
      setFormData({
        name: "",
        email: "",
        telefono: "",
        password: "",
        confirmPassword: "",
        role: "user",
      });
    } else if (type === "edit" && user) {
      setFormData({
        name: user.nombre || "",
        email: user.email || "",
        telefono: user.telefono || "",
        password: "",
        confirmPassword: "",
        role: user.rol || "user",
      });
    } else if (type === "role" && user) {
      setFormData({
        ...formData,
        role: user.rol || "user",
      });
    } else if (type === "password" && user) {
      setFormData({
        ...formData,
        email: user.email || "",
        password: "",
        confirmPassword: "",
      });
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setFormData({
      name: "",
      email: "",
      telefono: "",
      password: "",
      confirmPassword: "",
      role: "user",
    });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateUser = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("Nombre, email y contraseña son requeridos");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      await api.post(
        "/users/nuevo-usuario",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        },
        getConfig()
      );

      toast.success("Usuario creado exitosamente");
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error al crear el usuario");
    }
  };

  const handleUpdateUser = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Nombre y email son requeridos");
      return;
    }

    try {
      await api.put(
        `/users/${selectedUser.id_usuario}`,
        {
          name: formData.name,
          email: formData.email,
          telefono: formData.telefono,
        },
        getConfig()
      );

      toast.success("Usuario actualizado exitosamente");
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error al actualizar el usuario"
      );
    }
  };

  const handleChangePassword = async () => {
    if (!formData.password || !formData.confirmPassword) {
      toast.error("Ambas contraseñas son requeridas");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    try {
      await api.post(
        `/users/change-credentials/${selectedUser.id_usuario}`,
        {
          email: formData.email,
          password: formData.password,
        },
        getConfig()
      );

      toast.success("Contraseña cambiada exitosamente");
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error al cambiar la contraseña"
      );
    }
  };

  const handleAssignRole = async () => {
    if (!formData.role) {
      toast.error("Debe seleccionar un rol");
      return;
    }

    try {
      await api.post(
        `/users/assign-role/${selectedUser.id_usuario}`,
        { role: formData.role },
        getConfig()
      );

      toast.success("Rol asignado exitosamente");
      fetchUsers();
      closeModal();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error al asignar el rol");
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (
      !window.confirm(
        `¿Estás seguro de eliminar al usuario "${userName}"? Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }

    try {
      await api.delete(`/users/${userId}`, getConfig());
      toast.success("Usuario eliminado exitosamente");
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Error al eliminar el usuario"
      );
    }
  };

  const handleSubmit = () => {
    if (modalType === "create") {
      handleCreateUser();
    } else if (modalType === "edit") {
      handleUpdateUser();
    } else if (modalType === "password") {
      handleChangePassword();
    } else if (modalType === "role") {
      handleAssignRole();
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800 border-purple-300";
      case "inventario":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "compras":
        return "bg-green-100 text-green-800 border-green-300";
      case "user":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Shield size={14} />;
      case "inventario":
      case "compras":
        return <UserCog size={14} />;
      default:
        return <User size={14} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 md:ml-64">
        <main className="p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                  Gestión de Perfiles
                </h1>
                <p className="text-gray-600">
                  Administra usuarios, roles y configuraciones
                </p>
              </div>
              <button
                onClick={() => openModal("create")}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md"
              >
                <UserPlus size={20} />
                Nuevo Usuario
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6 bg-white rounded-lg shadow-md p-4">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar por nombre, email o rol..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[50vh]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando usuarios...</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usuario
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan="5"
                          className="px-6 py-8 text-center text-gray-500"
                        >
                          No se encontraron usuarios
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr
                          key={user.id_usuario}
                          className="hover:bg-gray-50 transition"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="text-blue-600" size={20} />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {user.nombre || "Sin nombre"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail size={16} className="text-gray-400" />
                              {user.email || "Sin email"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={16} className="text-gray-400" />
                              {user.telefono || "No registrado"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(
                                user.rol
                              )}`}
                            >
                              {getRoleIcon(user.rol)}
                              {user.rol || "user"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openModal("edit", user)}
                                className="text-blue-600 hover:text-blue-900 p-2 hover:bg-blue-50 rounded transition"
                                title="Editar usuario"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => openModal("role", user)}
                                className="text-purple-600 hover:text-purple-900 p-2 hover:bg-purple-50 rounded transition"
                                title="Cambiar rol"
                              >
                                <Shield size={18} />
                              </button>
                              <button
                                onClick={() => openModal("password", user)}
                                className="text-green-600 hover:text-green-900 p-2 hover:bg-green-50 rounded transition"
                                title="Cambiar contraseña"
                              >
                                <Key size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteUser(user.id_usuario, user.nombre)
                                }
                                className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded transition"
                                title="Eliminar usuario"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Usuarios</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {users.length}
                  </p>
                </div>
                <User className="text-blue-500" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Administradores</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {users.filter((u) => u.rol === "admin").length}
                  </p>
                </div>
                <Shield className="text-purple-500" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Inventario</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {users.filter((u) => u.rol === "inventario").length}
                  </p>
                </div>
                <UserCog className="text-blue-500" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Compras</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {users.filter((u) => u.rol === "compras").length}
                  </p>
                </div>
                <UserCog className="text-green-500" size={32} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                {modalType === "create" && "Crear Nuevo Usuario"}
                {modalType === "edit" && "Editar Usuario"}
                {modalType === "password" && "Cambiar Contraseña"}
                {modalType === "role" && "Asignar Rol"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Create & Edit: Name */}
              {(modalType === "create" || modalType === "edit") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Juan Pérez"
                  />
                </div>
              )}

              {/* Create & Edit: Email */}
              {(modalType === "create" || modalType === "edit") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="usuario@ejemplo.com"
                  />
                </div>
              )}

              {/* Edit: Teléfono */}
              {modalType === "edit" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="3001234567"
                  />
                </div>
              )}

              {/* Create & Password: Password */}
              {(modalType === "create" || modalType === "password") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
              )}

              {/* Create & Password: Confirm Password */}
              {(modalType === "create" || modalType === "password") && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Confirma la contraseña"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={20} />
                      ) : (
                        <Eye size={20} />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Role: Select Role */}
              {modalType === "role" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seleccionar Rol *
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                    <option value="inventario">Inventario</option>
                    <option value="compras">Compras</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Los roles determinan los permisos del usuario en el sistema
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <Check size={20} />
                {modalType === "create" && "Crear"}
                {modalType === "edit" && "Actualizar"}
                {modalType === "password" && "Cambiar"}
                {modalType === "role" && "Asignar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default Profiles;
