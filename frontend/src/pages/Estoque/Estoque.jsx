import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { Package, RefreshCw, Search } from 'lucide-react';

const toArray = (value) => Array.isArray(value) ? value : Array.isArray(value?.data) ? value.data : [];
const getEstoque = (produto) => Number(produto.estoqueAtual ?? produto.estoque_atual ?? produto.estoque ?? 0);
const getEstoqueMinimo = (produto) => Number(produto.estoqueMinimo ?? produto.estoque_minimo ?? 0);

const Estoque = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ produtoId: '', tipo: 'entrada', quantidade: '', motivo: '' });

  useEffect(() => {
    fetchProdutos();
  }, []);

  const fetchProdutos = async () => {
    try {
      const response = await api.get('/produtos');
      setProdutos(toArray(response.data));
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Erro ao buscar produtos em estoque.');
    } finally {
      setLoading(false);
    }
  };

  const filteredProdutos = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return produtos;
    return produtos.filter((produto) => {
      const categoria = produto.categoria?.nome || '';
      return `${produto.nome} ${categoria} ${produto.codigo_barras || produto.codigoBarras || ''}`.toLowerCase().includes(term);
    });
  }, [produtos, search]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const endpoint = formData.tipo === 'entrada' ? '/estoque/entrada' : formData.tipo === 'saida' ? '/estoque/saida' : '/estoque/ajuste';
      await api.post(endpoint, {
        produtoId: Number(formData.produtoId),
        quantidade: Number(formData.quantidade),
        motivo: formData.motivo
      });
      setShowModal(false);
      setFormData({ produtoId: '', tipo: 'entrada', quantidade: '', motivo: '' });
      await fetchProdutos();
      setError(null);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Erro ao registrar movimentacao.');
    }
  };

  if (loading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Estoque</h1>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600">
          <RefreshCw size={20} />
          Nova Movimentacao
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar produto, categoria ou codigo"
            className="w-full h-11 pl-10 pr-3 border rounded-lg"
          />
        </div>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque minimo</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProdutos.map((produto) => {
              const baixo = getEstoque(produto) <= getEstoqueMinimo(produto);
              return (
                <tr key={produto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-gray-500" />
                      </div>
                      <p className="font-medium text-gray-800">{produto.nome}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{produto.categoria?.nome || '-'}</td>
                  <td className="px-6 py-4 font-semibold text-gray-800">{getEstoque(produto)}</td>
                  <td className="px-6 py-4 text-gray-600">{getEstoqueMinimo(produto)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${baixo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {baixo ? 'Baixo' : 'Disponivel'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {filteredProdutos.length === 0 && (
              <tr><td colSpan={5} className="py-10 text-center text-gray-500">Nenhum produto encontrado.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nova Movimentacao</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
                <select value={formData.produtoId} onChange={(event) => setFormData({ ...formData, produtoId: event.target.value })} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="">Selecione um produto</option>
                  {produtos.map((produto) => <option key={produto.id} value={produto.id}>{produto.nome} (Estoque: {getEstoque(produto)})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <select value={formData.tipo} onChange={(event) => setFormData({ ...formData, tipo: event.target.value })} className="w-full px-3 py-2 border rounded-lg" required>
                  <option value="entrada">Entrada</option>
                  <option value="saida">Saida</option>
                  <option value="ajuste">Ajuste</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
                <input type="number" min="1" value={formData.quantidade} onChange={(event) => setFormData({ ...formData, quantidade: event.target.value })} className="w-full px-3 py-2 border rounded-lg" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                <input type="text" value={formData.motivo} onChange={(event) => setFormData({ ...formData, motivo: event.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Estoque;
