import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { Search, Download, Store } from 'lucide-react';

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.produtos)) return value.produtos;
  return [];
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0));

const getEstoqueAtual = (produto) =>
  Number(produto.estoqueAtual ?? produto.estoque_atual ?? produto.estoque ?? 0);

const getPrecoVenda = (produto) => Number(produto.precoVenda ?? produto.preco_venda ?? 0);

const CatalogoOnline = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('todas');

  useEffect(() => {
    const fetchProdutos = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/produtos');
        setProdutos(toArray(response.data));
      } catch (requestError) {
        setError(requestError.response?.data?.error || 'Erro ao carregar catalogo');
        setProdutos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  const categorias = useMemo(() => {
    const unique = new Set();
    for (const produto of produtos) {
      if (produto.categoria?.nome) unique.add(produto.categoria.nome);
    }
    return [...unique].sort((a, b) => a.localeCompare(b));
  }, [produtos]);

  const produtosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return produtos.filter((produto) => {
      const nome = String(produto.nome || '').toLowerCase();
      const categoria = String(produto.categoria?.nome || '').toLowerCase();
      const matchBusca = !termo || nome.includes(termo) || categoria.includes(termo);
      const matchCategoria =
        categoriaFiltro === 'todas' || produto.categoria?.nome === categoriaFiltro;
      return matchBusca && matchCategoria;
    });
  }, [produtos, busca, categoriaFiltro]);

  const exportarCsv = () => {
    const headers = ['Nome', 'Categoria', 'Preco Venda', 'Estoque', 'Status Catalogo'];
    const rows = produtosFiltrados.map((produto) => [
      produto.nome,
      produto.categoria?.nome || 'Sem categoria',
      getPrecoVenda(produto).toFixed(2),
      String(getEstoqueAtual(produto)),
      getEstoqueAtual(produto) > 0 ? 'Disponivel' : 'Indisponivel'
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'catalogo-online.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Store className="text-[#1b97e6]" size={24} />
          <h1 className="text-2xl font-semibold text-slate-900">Catalogo Online</h1>
        </div>

        <button
          type="button"
          onClick={exportarCsv}
          className="h-10 px-4 rounded-lg bg-[#1b97e6] text-white font-medium hover:bg-[#0f88d7] flex items-center gap-2"
        >
          <Download size={17} />
          Exportar CSV
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">{error}</div>
      )}

      <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            placeholder="Buscar produto ou categoria"
            className="w-full h-10 pl-9 pr-3 border border-[#d3d3d3] rounded-lg"
          />
        </div>

        <select
          value={categoriaFiltro}
          onChange={(event) => setCategoriaFiltro(event.target.value)}
          className="h-10 px-3 border border-[#d3d3d3] rounded-lg min-w-56"
        >
          <option value="todas">Todas as categorias</option>
          {categorias.map((categoria) => (
            <option key={categoria} value={categoria}>
              {categoria}
            </option>
          ))}
        </select>
      </div>

      {produtosFiltrados.length === 0 ? (
        <div className="bg-white border border-[#d9d9d9] rounded-xl p-10 text-center text-slate-500">
          Nenhum produto encontrado para os filtros selecionados.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {produtosFiltrados.map((produto) => {
            const estoqueAtual = getEstoqueAtual(produto);
            const disponivel = estoqueAtual > 0;

            return (
              <div key={produto.id} className="bg-white border border-[#d9d9d9] rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-slate-900">{produto.nome}</h2>
                    <p className="text-sm text-slate-500">{produto.categoria?.nome || 'Sem categoria'}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      disponivel
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {disponivel ? 'Disponivel' : 'Indisponivel'}
                  </span>
                </div>

                <div className="text-sm text-slate-700 space-y-1">
                  <p>Preco: <span className="font-semibold">{formatCurrency(getPrecoVenda(produto))}</span></p>
                  <p>Estoque: <span className="font-semibold">{estoqueAtual}</span></p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CatalogoOnline;
