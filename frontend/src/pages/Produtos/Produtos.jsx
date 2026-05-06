import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';

const EMPTY_FORM = {
  nome: '',
  descricao: '',
  preco_venda: '',
  preco_custo: '',
  estoque_atual: '',
  estoque_minimo: '',
  codigo_barras: '',
  categoriaId: '',
  fornecedorId: ''
};

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.produtos)) return value.produtos;
  if (Array.isArray(value?.categorias)) return value.categorias;
  if (Array.isArray(value?.fornecedores)) return value.fornecedores;
  return [];
};

const getFornecedorNome = (fornecedor) => {
  if (!fornecedor) return '';
  return (
    fornecedor.nome ||
    fornecedor.nomeFantasia ||
    fornecedor.nome_fantasia ||
    fornecedor.razaoSocial ||
    fornecedor.razao_social ||
    `Fornecedor #${fornecedor.id}`
  );
};

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);

    const [produtosResult, categoriasResult, fornecedoresResult] = await Promise.allSettled([
      api.get('/produtos'),
      api.get('/categorias'),
      api.get('/fornecedores')
    ]);

    if (produtosResult.status === 'fulfilled') {
      setProdutos(toArray(produtosResult.value.data));
    } else {
      const message =
        produtosResult.reason?.response?.data?.error ||
        produtosResult.reason?.message ||
        'Erro ao carregar produtos';
      setError(message);
    }

    if (categoriasResult.status === 'fulfilled') {
      setCategorias(toArray(categoriasResult.value.data));
    } else {
      setCategorias([]);
    }

    if (fornecedoresResult.status === 'fulfilled') {
      setFornecedores(toArray(fornecedoresResult.value.data));
    } else {
      setFornecedores([]);
    }

    setLoading(false);
  };

  const fetchProdutos = async () => {
    const response = await api.get('/produtos');
    setProdutos(toArray(response.data));
  };

  const resetForm = () => {
    setFormData(EMPTY_FORM);
  };

  const openCreateModal = () => {
    setEditingProduto(null);
    resetForm();
    setShowModal(true);
    setError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduto(null);
    resetForm();
  };

  const getCategoriaNome = (produto) => {
    if (produto.categoria?.nome) return produto.categoria.nome;
    const categoriaId = produto.categoriaId ?? produto.categoria_id;
    const categoria = categorias.find((item) => item.id === Number(categoriaId));
    return categoria?.nome || '-';
  };

  const getEstoqueAtual = (produto) => {
    return Number(produto.estoqueAtual ?? produto.estoque ?? produto.estoque_atual ?? 0);
  };

  const getEstoqueMinimo = (produto) => {
    return Number(produto.estoqueMinimo ?? produto.estoque_minimo ?? 0);
  };

  const getCodigoBarras = (produto) => {
    return produto.codigoBarras ?? produto.codigo_barras ?? 'Sem codigo';
  };

  const getPrecoVenda = (produto) => {
    return Number(produto.precoVenda ?? produto.preco_venda ?? 0);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value || 0));
  };

  const handleEdit = (produto) => {
    setEditingProduto(produto);
    setFormData({
      nome: produto.nome || '',
      descricao: produto.descricao || '',
      preco_venda: String(produto.precoVenda ?? produto.preco_venda ?? ''),
      preco_custo: String(produto.precoCusto ?? produto.preco_custo ?? ''),
      estoque_atual: String(produto.estoqueAtual ?? produto.estoque ?? produto.estoque_atual ?? ''),
      estoque_minimo: String(produto.estoqueMinimo ?? produto.estoque_minimo ?? ''),
      codigo_barras: produto.codigoBarras ?? produto.codigo_barras ?? '',
      categoriaId: String(produto.categoriaId ?? produto.categoria_id ?? produto.categoria?.id ?? ''),
      fornecedorId: String(
        produto.fornecedorId ?? produto.fornecedor_id ?? produto.fornecedor?.id ?? ''
      )
    });
    setShowModal(true);
    setError(null);
  };

  const validatePayload = (payload) => {
    if (!payload.nome?.trim()) return 'Nome do produto e obrigatorio';
    if (!payload.categoriaId || !Number.isInteger(payload.categoriaId) || payload.categoriaId <= 0) {
      return 'Selecione uma categoria valida';
    }
    if (!Number.isFinite(payload.preco_venda) || payload.preco_venda < 0) {
      return 'Preco de venda invalido';
    }
    if (!Number.isInteger(payload.estoque_atual) || payload.estoque_atual < 0) {
      return 'Estoque atual invalido';
    }
    if (!Number.isInteger(payload.estoque_minimo) || payload.estoque_minimo < 0) {
      return 'Estoque minimo invalido';
    }
    if (payload.preco_custo != null && (!Number.isFinite(payload.preco_custo) || payload.preco_custo < 0)) {
      return 'Preco de custo invalido';
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      nome: formData.nome,
      descricao: formData.descricao || null,
      preco_venda: Number(formData.preco_venda),
      preco_custo: formData.preco_custo === '' ? 0 : Number(formData.preco_custo),
      estoque_atual: Number(formData.estoque_atual),
      estoque_minimo: Number(formData.estoque_minimo),
      codigo_barras: formData.codigo_barras || null,
      categoriaId: Number(formData.categoriaId),
      fornecedorId: formData.fornecedorId ? Number(formData.fornecedorId) : null
    };

    const validationError = validatePayload(payload);
    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }

    try {
      if (editingProduto) {
        await api.put(`/produtos/${editingProduto.id}`, payload);
      } else {
        await api.post('/produtos', payload);
      }

      closeModal();
      await fetchProdutos();
    } catch (requestError) {
      const errorMessage =
        requestError.response?.data?.error ||
        requestError.message ||
        'Erro ao salvar produto. Tente novamente.';
      setError(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
      await api.delete(`/produtos/${id}`);
      await fetchProdutos();
    } catch (requestError) {
      const errorMessage =
        requestError.response?.data?.error ||
        requestError.message ||
        'Erro ao excluir produto. Tente novamente.';
      setError(errorMessage);
    }
  };

  if (loading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
        >
          <Plus size={20} />
          Novo Produto
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      {produtos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package size={32} className="text-gray-400" />
          </div>
          <p className="text-gray-700 font-medium">Nenhum produto cadastrado</p>
          <p className="text-sm text-gray-500 mt-1">Use o botao acima para cadastrar o primeiro produto.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoria</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Preco Venda</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estoque</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acoes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {produtos.map((produto) => (
                <tr key={produto.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{produto.nome}</p>
                        <p className="text-sm text-gray-500">{getCodigoBarras(produto)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{getCategoriaNome(produto)}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {formatCurrency(getPrecoVenda(produto))}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 rounded-full text-sm ${
                        getEstoqueAtual(produto) <= getEstoqueMinimo(produto)
                          ? 'bg-red-100 text-red-700'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {getEstoqueAtual(produto)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(produto)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="Editar produto"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(produto.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Excluir produto"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">{editingProduto ? 'Editar Produto' : 'Novo Produto'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(event) => setFormData({ ...formData, nome: event.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descricao</label>
                <textarea
                  value={formData.descricao}
                  onChange={(event) => setFormData({ ...formData, descricao: event.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
                  <select
                    value={formData.categoriaId}
                    onChange={(event) => setFormData({ ...formData, categoriaId: event.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categorias.map((categoria) => (
                      <option key={categoria.id} value={categoria.id}>
                        {categoria.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fornecedor</label>
                  <select
                    value={formData.fornecedorId}
                    onChange={(event) => setFormData({ ...formData, fornecedorId: event.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Sem fornecedor</option>
                    {fornecedores.map((fornecedor) => (
                      <option key={fornecedor.id} value={fornecedor.id}>
                        {getFornecedorNome(fornecedor)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preco Venda</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco_venda}
                    onChange={(event) => setFormData({ ...formData, preco_venda: event.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preco Custo</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco_custo}
                    onChange={(event) => setFormData({ ...formData, preco_custo: event.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Atual</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estoque_atual}
                    onChange={(event) => setFormData({ ...formData, estoque_atual: event.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estoque Minimo</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estoque_minimo}
                    onChange={(event) => setFormData({ ...formData, estoque_minimo: event.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Codigo de Barras</label>
                <input
                  type="text"
                  value={formData.codigo_barras}
                  onChange={(event) => setFormData({ ...formData, codigo_barras: event.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-70"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Produtos;
