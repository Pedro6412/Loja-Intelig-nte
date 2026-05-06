import { useEffect, useState } from 'react';
import api from '../../services/api';
import { ArrowDown, ArrowUp, RefreshCw, Package } from 'lucide-react';

const Estoque = () => {
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    produtoId: '',
    tipo: 'entrada',
    quantidade: '',
    motivo: ''
  });
  const [produtos, setProdutos] = useState([]);

  useEffect(() => {
    fetchMovimentacoes();
    fetchProdutos();
  }, []);

  const fetchMovimentacoes = async () => {
    try {
      const response = await api.get('/estoque');
      setMovimentacoes(response.data);
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProdutos = async () => {
    try {
      const response = await api.get('/produtos');
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = formData.tipo === 'entrada' ? '/estoque/entrada' :
                      formData.tipo === 'saida' ? '/estoque/saida' : '/estoque/ajuste';
      await api.post(endpoint, formData);
      setShowModal(false);
      setFormData({ produtoId: '', tipo: 'entrada', quantidade: '', motivo: '' });
      fetchMovimentacoes();
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      alert(error.response?.data?.error || 'Erro ao registrar movimentação');
    }
  };

  const getTipoBadge = (tipo) => {
    switch (tipo) {
      case 'entrada':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">Entrada</span>;
      case 'saida':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm">Saída</span>;
      case 'ajuste':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Ajuste</span>;
      default:
        return tipo;
    }
  };

  if (loading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Estoque</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
        >
          <RefreshCw size={20} />
          Nova Movimentação
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantidade</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque Anterior</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque Novo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {movimentacoes.map((mov) => (
              <tr key={mov.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Package size={20} className="text-gray-500" />
                    </div>
                    <p className="font-medium text-gray-800">{mov.produto?.nome || 'Produto removido'}</p>
                  </div>
                </td>
                <td className="px-6 py-4">{getTipoBadge(mov.tipo)}</td>
                <td className="px-6 py-4 font-medium">
                  <span className={mov.tipo === 'entrada' ? 'text-green-600' : 'text-red-600'}>
                    {mov.tipo === 'entrada' ? '+' : '-'}{mov.quantidade}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">{mov.estoque_anterior}</td>
                <td className="px-6 py-4 font-medium text-gray-800">{mov.estoque_novo}</td>
                <td className="px-6 py-4 text-gray-600">{mov.motivo || '-'}</td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(mov.createdAt || mov.criado_em).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nova Movimentação</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
                <select
                  value={formData.produtoId}
                  onChange={(e) => setFormData({ ...formData, produtoId: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} (Estoque: {p.estoque ?? p.estoque_atual})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select
                  value={formData.tipo}
                  onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saída</option>
                  <option value="ajuste">Ajuste</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                <input
                  type="number"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <input
                  type="text"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                >
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Estoque;
