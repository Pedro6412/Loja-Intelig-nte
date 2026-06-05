import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const EMPTY_FORM = { nome: '', email: '', senha: '', confirmarSenha: '', perfil: 'vendedor' };
const toArray = (value) => Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];

const Usuarios = () => {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const isAdmin = currentUser?.perfil === 'admin';

  useEffect(() => {
    if (isAdmin) fetchUsuarios();
    else setLoading(false);
  }, [isAdmin]);

  const fetchUsuarios = async () => {
    try {
      const response = await api.get('/usuarios');
      setUsuarios(toArray(response.data));
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Erro ao buscar usuarios.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingUsuario(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
    setError(null);
  };

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario);
    setFormData({ nome: usuario.nome, email: usuario.email, senha: '', confirmarSenha: '', perfil: usuario.perfil });
    setShowModal(true);
  };

  const validate = () => {
    if (!formData.nome.trim()) return 'Nome completo e obrigatorio.';
    if (!formData.email.trim()) return 'E-mail e obrigatorio.';
    if (!editingUsuario && !formData.senha) return 'Senha e obrigatoria.';
    if (formData.senha !== formData.confirmarSenha) return 'A confirmacao de senha nao confere.';
    if (!['admin', 'vendedor'].includes(formData.perfil)) return 'Selecione um perfil valido.';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    const payload = {
      nome: formData.nome,
      email: formData.email,
      perfil: formData.perfil,
      ...(formData.senha ? { senha: formData.senha } : {})
    };

    try {
      if (editingUsuario) {
        const response = await api.put(`/usuarios/${editingUsuario.id}`, payload);
        setUsuarios((prev) => prev.map((usuario) => (usuario.id === editingUsuario.id ? response.data : usuario)));
      } else {
        const response = await api.post('/usuarios', payload);
        setUsuarios((prev) => [response.data, ...prev]);
      }
      setShowModal(false);
      setEditingUsuario(null);
      setFormData(EMPTY_FORM);
      setError(null);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Erro ao salvar usuario.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este usuario?')) return;
    try {
      await api.delete(`/usuarios/${id}`);
      setUsuarios((prev) => prev.filter((usuario) => usuario.id !== id));
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Erro ao excluir usuario.');
    }
  };

  if (loading) return <div className="text-center py-8">Carregando...</div>;
  if (!isAdmin) return <div className="bg-white rounded-xl shadow-sm p-8 text-gray-700">Acesso restrito ao administrador.</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuarios</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600">
          <Plus size={20} />
          Novo Usuario
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome completo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Perfil</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Users size={20} className="text-indigo-600" />
                    </div>
                    <p className="font-medium text-gray-800">{usuario.nome}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{usuario.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-sm ${usuario.perfil === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                    {usuario.perfil === 'admin' ? 'ADM' : 'Vendedor'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(usuario)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar usuario">
                      <Pencil size={18} />
                    </button>
                    {usuario.id !== currentUser.id && (
                      <button onClick={() => handleDelete(usuario.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Excluir usuario">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingUsuario ? 'Editar Usuario' : 'Novo Usuario'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
                <input type="text" value={formData.nome} onChange={(event) => setFormData({ ...formData, nome: event.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha {editingUsuario && '(opcional)'}</label>
                <input type="password" value={formData.senha} onChange={(event) => setFormData({ ...formData, senha: event.target.value })} className="w-full px-3 py-2 border rounded-lg" required={!editingUsuario} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmacao de senha</label>
                <input type="password" value={formData.confirmarSenha} onChange={(event) => setFormData({ ...formData, confirmarSenha: event.target.value })} className="w-full px-3 py-2 border rounded-lg" required={!editingUsuario || !!formData.senha} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perfil</label>
                <select value={formData.perfil} onChange={(event) => setFormData({ ...formData, perfil: event.target.value })} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="admin">ADM</option>
                  <option value="vendedor">Vendedor</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Usuarios;
