import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { AlertTriangle, Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';

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

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [formMode, setFormMode] = useState('rapido');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [searchTerm, setSearchTerm] = useState('');

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

    if (categoriasResult.status === 'fulfilled') setCategorias(toArray(categoriasResult.value.data));
    else setCategorias([]);

    if (fornecedoresResult.status === 'fulfilled') setFornecedores(toArray(fornecedoresResult.value.data));
    else setFornecedores([]);

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
    setFormMode('rapido');
    resetForm();
    setShowModal(true);
    setError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduto(null);
    setFormMode('rapido');
    resetForm();
  };

  const getCategoriaNome = (produto) => {
    if (produto.categoria?.nome) return produto.categoria.nome;
    const categoriaId = produto.categoriaId ?? produto.categoria_id;
    const categoria = categorias.find((item) => item.id === Number(categoriaId));
    return categoria?.nome || '-';
  };

  const getEstoqueAtual = (produto) => Number(produto.estoqueAtual ?? produto.estoque ?? produto.estoque_atual ?? 0);
  const getEstoqueMinimo = (produto) => Number(produto.estoqueMinimo ?? produto.estoque_minimo ?? 0);
  const getCodigoBarras = (produto) => produto.codigoBarras ?? produto.codigo_barras ?? 'Sem codigo';
  const getPrecoVenda = (produto) => Number(produto.precoVenda ?? produto.preco_venda ?? 0);
  const getPrecoCusto = (produto) => Number(produto.precoCusto ?? produto.preco_custo ?? 0);

  const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(Number(value || 0));

  const filteredProdutos = useMemo(() => {
    const query = normalizeText(searchTerm);
    if (!query) return produtos;
    return produtos.filter((produto) =>
      normalizeText(`${produto.nome} ${getCodigoBarras(produto)} ${getCategoriaNome(produto)}`).includes(query)
    );
  }, [produtos, searchTerm, categorias]);

  const estoqueBaixoCount = produtos.filter((produto) => getEstoqueAtual(produto) <= getEstoqueMinimo(produto)).length;
  const semCustoCount = produtos.filter((produto) => getPrecoCusto(produto) <= 0).length;

  const handleEdit = (produto) => {
    setEditingProduto(produto);
    setFormMode('completo');
    setFormData({
      nome: produto.nome || '',
      descricao: produto.descricao || '',
      preco_venda: String(produto.precoVenda ?? produto.preco_venda ?? ''),
      preco_custo: String(produto.precoCusto ?? produto.preco_custo ?? ''),
      estoque_atual: String(produto.estoqueAtual ?? produto.estoque ?? produto.estoque_atual ?? ''),
      estoque_minimo: String(produto.estoqueMinimo ?? produto.estoque_minimo ?? ''),
      codigo_barras: produto.codigoBarras ?? produto.codigo_barras ?? '',
      categoriaId: String(produto.categoriaId ?? produto.categoria_id ?? produto.categoria?.id ?? ''),
      fornecedorId: String(produto.fornecedorId ?? produto.fornecedor_id ?? produto.fornecedor?.id ?? '')
    });
    setShowModal(true);
    setError(null);
  };

  const validatePayload = (payload) => {
    if (!payload.nome?.trim()) return 'Nome do produto e obrigatorio';
    if (!Number.isFinite(payload.preco_venda) || payload.preco_venda < 0) return 'Preco de venda invalido';
    if (!Number.isInteger(payload.estoque_atual) || payload.estoque_atual < 0) return 'Estoque atual invalido';
    if (payload.estoque_minimo != null && (!Number.isInteger(payload.estoque_minimo) || payload.estoque_minimo < 0)) {
      return 'Estoque minimo invalido';
    }
    if (payload.preco_custo != null && (!Number.isFinite(payload.preco_custo) || payload.preco_custo < 0)) {
      return 'Preco de custo invalido';
    }
    if (payload.categoriaId != null && (!Number.isInteger(payload.categoriaId) || payload.categoriaId <= 0)) {
      return 'Categoria invalida';
    }
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      nome: formData.nome,
      descricao: formMode === 'completo' ? formData.descricao || null : null,
      preco_venda: Number(formData.preco_venda),
      preco_custo: formData.preco_custo === '' ? 0 : Number(formData.preco_custo),
      estoque_atual: Number(formData.estoque_atual),
      estoque_minimo: formData.estoque_minimo === '' ? 0 : Number(formData.estoque_minimo),
      codigo_barras: formMode === 'completo' ? formData.codigo_barras || null : null,
      categoriaId: formData.categoriaId ? Number(formData.categoriaId) : undefined,
      fornecedorId: formMode === 'completo' && formData.fornecedorId ? Number(formData.fornecedorId) : null
    };

    const validationError = validatePayload(payload);
    if (validationError) {
      setError(validationError);
      setSaving(false);
      return;
    }

    try {
      if (editingProduto) await api.put(`/produtos/${editingProduto.id}`, payload);
      else await api.post('/produtos', payload);

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

  if (loading) return <div className="py-8 text-center">Carregando...</div>;

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">Catalogo</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">Produtos</h1>
          </div>
          <button
            onClick={openCreateModal}
            className="flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={19} />
            Novo produto
          </button>
        </div>
      </section>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-slate-500">Produtos</p>
          <strong className="mt-1 block text-2xl text-slate-950">{produtos.length}</strong>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-800">
            <AlertTriangle size={17} />
            <p className="text-xs font-semibold uppercase">Estoque baixo</p>
          </div>
          <strong className="mt-1 block text-2xl text-amber-900">{estoqueBaixoCount}</strong>
        </div>
        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase text-blue-700">Sem custo</p>
          <strong className="mt-1 block text-2xl text-blue-900">{semCustoCount}</strong>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
              placeholder="Buscar produto"
            />
          </div>
        </div>

        {filteredProdutos.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Package size={32} className="text-slate-400" />
            </div>
            <p className="font-medium text-slate-700">Nenhum produto encontrado</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[860px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Categoria</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Preco</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Estoque</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-slate-500">Acoes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredProdutos.map((produto) => (
                    <tr key={produto.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                            <Package size={20} className="text-slate-500" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{produto.nome}</p>
                            <p className="text-sm text-slate-500">{getCodigoBarras(produto)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{getCategoriaNome(produto)}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">{formatCurrency(getPrecoVenda(produto))}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2 py-1 text-sm ${
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
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                            title="Editar produto"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(produto.id)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
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

            <div className="divide-y divide-slate-100 lg:hidden">
              {filteredProdutos.map((produto) => (
                <article key={produto.id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-slate-900">{produto.nome}</p>
                      <p className="mt-1 text-sm text-slate-500">{getCodigoBarras(produto)}</p>
                    </div>
                    <strong className="text-blue-700">{formatCurrency(getPrecoVenda(produto))}</strong>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-slate-600">Estoque {getEstoqueAtual(produto)}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(produto)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-blue-600"
                        title="Editar produto"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(produto.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-red-600"
                        title="Excluir produto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white p-5 shadow-2xl sm:p-6">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-bold text-slate-950">{editingProduto ? 'Editar produto' : 'Novo produto'}</h2>
              <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
                <button
                  type="button"
                  onClick={() => setFormMode('rapido')}
                  className={`h-9 rounded-md px-3 text-sm font-semibold ${
                    formMode === 'rapido' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  Rapido
                </button>
                <button
                  type="button"
                  onClick={() => setFormMode('completo')}
                  className={`h-9 rounded-md px-3 text-sm font-semibold ${
                    formMode === 'completo' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  Completo
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Nome</label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(event) => setFormData({ ...formData, nome: event.target.value })}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Preco venda</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.preco_venda}
                    onChange={(event) => setFormData({ ...formData, preco_venda: event.target.value })}
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Estoque atual</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.estoque_atual}
                    onChange={(event) => setFormData({ ...formData, estoque_atual: event.target.value })}
                    className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              {formMode === 'completo' && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Descricao</label>
                    <textarea
                      value={formData.descricao}
                      onChange={(event) => setFormData({ ...formData, descricao: event.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-blue-500"
                      rows={2}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Categoria</label>
                      <select
                        value={formData.categoriaId}
                        onChange={(event) => setFormData({ ...formData, categoriaId: event.target.value })}
                        className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                      >
                        <option value="">Geral</option>
                        {categorias.map((categoria) => (
                          <option key={categoria.id} value={categoria.id}>
                            {categoria.nome}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Fornecedor</label>
                      <select
                        value={formData.fornecedorId}
                        onChange={(event) => setFormData({ ...formData, fornecedorId: event.target.value })}
                        className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
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

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Preco custo</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.preco_custo}
                        onChange={(event) => setFormData({ ...formData, preco_custo: event.target.value })}
                        className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Estoque minimo</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.estoque_minimo}
                        onChange={(event) => setFormData({ ...formData, estoque_minimo: event.target.value })}
                        className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-semibold text-slate-700">Codigo de barras</label>
                    <input
                      type="text"
                      value={formData.codigo_barras}
                      onChange={(event) => setFormData({ ...formData, codigo_barras: event.target.value })}
                      className="h-11 w-full rounded-lg border border-slate-200 px-3 outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={closeModal} className="h-10 rounded-lg border border-slate-200 px-4 font-semibold hover:bg-slate-50">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 rounded-lg bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
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
