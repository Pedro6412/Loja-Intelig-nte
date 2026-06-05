import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Pencil, Plus, Trash2, Truck } from 'lucide-react';

const EMPTY_FORM = { nome: '', cnpj: '', telefone: '', email: '' };
const toArray = (value) => Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];

const Fornecedores = () => {
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    fetchFornecedores();
  }, []);

  const fetchFornecedores = async () => {
    try {
      const response = await api.get('/fornecedores');
      setFornecedores(toArray(response.data));
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Erro ao buscar fornecedores.');
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingFornecedor(null);
    setFormData(EMPTY_FORM);
    setShowModal(true);
    setError(null);
  };

  const handleEdit = (fornecedor) => {
    setEditingFornecedor(fornecedor);
    setFormData({
      nome: fornecedor.nome || fornecedor.razaoSocial || '',
      cnpj: fornecedor.cnpj || '',
      telefone: fornecedor.telefone || '',
      email: fornecedor.email || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.nome.trim()) {
      setError('Nome do fornecedor e obrigatorio.');
      return;
    }

    try {
      if (editingFornecedor) {
        const response = await api.put(`/fornecedores/${editingFornecedor.id}`, formData);
        setFornecedores((prev) => prev.map((fornecedor) => (fornecedor.id === editingFornecedor.id ? response.data : fornecedor)));
      } else {
        const response = await api.post('/fornecedores', formData);
        setFornecedores((prev) => [response.data, ...prev]);
      }
      setShowModal(false);
      setEditingFornecedor(null);
      setFormData(EMPTY_FORM);
      setError(null);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Erro ao salvar fornecedor.');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este fornecedor?')) return;
    try {
      await api.delete(`/fornecedores/${id}`);
      setFornecedores((prev) => prev.filter((fornecedor) => fornecedor.id !== id));
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Erro ao excluir fornecedor.');
    }
  };

  if (loading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Fornecedores</h1>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600">
          <Plus size={20} />
          Novo Fornecedor
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CNPJ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Telefone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">E-mail</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {fornecedores.map((fornecedor) => (
              <tr key={fornecedor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Truck size={20} className="text-blue-600" />
                    </div>
                    <p className="font-medium text-gray-800">{fornecedor.nome}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600">{fornecedor.cnpj || '-'}</td>
                <td className="px-6 py-4 text-gray-600">{fornecedor.telefone || '-'}</td>
                <td className="px-6 py-4 text-gray-600">{fornecedor.email || '-'}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(fornecedor)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Editar fornecedor">
                      <Pencil size={18} />
                    </button>
                    <button onClick={() => handleDelete(fornecedor.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Excluir fornecedor">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {fornecedores.length === 0 && <tr><td colSpan={5} className="py-10 text-center text-gray-500">Nenhum fornecedor cadastrado.</td></tr>}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input type="text" value={formData.nome} onChange={(event) => setFormData({ ...formData, nome: event.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CNPJ</label>
                <input type="text" value={formData.cnpj} onChange={(event) => setFormData({ ...formData, cnpj: event.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                <input type="text" value={formData.telefone} onChange={(event) => setFormData({ ...formData, telefone: event.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} className="w-full px-3 py-2 border rounded-lg" />
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

export default Fornecedores;
