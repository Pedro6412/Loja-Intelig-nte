import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { BarChart3, TrendingUp, AlertTriangle, Download } from 'lucide-react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0));

const Relatorios = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data || null);
      } catch (requestError) {
        setError(requestError.response?.data?.error || 'Erro ao carregar relatorios');
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const ticketMedio = useMemo(() => {
    const totalMes = Number(stats?.totalMes || 0);
    const quantidade = Number(stats?.quantidadeVendas || 0);
    if (!quantidade) return 0;
    return totalMes / quantidade;
  }, [stats]);

  const exportarTopProdutos = () => {
    const headers = ['Produto', 'Categoria', 'Total Vendido'];
    const rows = (stats?.produtosMaisVendidos || []).map((produto) => [
      produto.nome || 'Sem nome',
      produto.categoria?.nome || 'Sem categoria',
      String(produto.totalVendido || 0)
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'relatorio-top-produtos.csv');
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
          <BarChart3 className="text-[#1b97e6]" size={24} />
          <h1 className="text-2xl font-semibold text-slate-900">Relatorios</h1>
        </div>

        <button
          type="button"
          onClick={exportarTopProdutos}
          className="h-10 px-4 rounded-lg bg-[#1b97e6] text-white font-medium hover:bg-[#0f88d7] flex items-center gap-2"
        >
          <Download size={17} />
          Exportar Top Produtos
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">{error}</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white border border-[#d9d9d9] rounded-xl p-4">
          <p className="text-sm text-slate-500">Total Dia</p>
          <p className="text-2xl font-semibold text-slate-900">{formatCurrency(stats?.totalDia || 0)}</p>
        </div>
        <div className="bg-white border border-[#d9d9d9] rounded-xl p-4">
          <p className="text-sm text-slate-500">Total Mes</p>
          <p className="text-2xl font-semibold text-slate-900">{formatCurrency(stats?.totalMes || 0)}</p>
        </div>
        <div className="bg-white border border-[#d9d9d9] rounded-xl p-4">
          <p className="text-sm text-slate-500">Quantidade de Vendas</p>
          <p className="text-2xl font-semibold text-slate-900">{stats?.quantidadeVendas || 0}</p>
        </div>
        <div className="bg-white border border-[#d9d9d9] rounded-xl p-4">
          <p className="text-sm text-slate-500">Ticket Medio</p>
          <p className="text-2xl font-semibold text-slate-900">{formatCurrency(ticketMedio)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white border border-[#d9d9d9] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-[#1b97e6]" />
            <h2 className="font-semibold text-slate-900">Produtos Mais Vendidos</h2>
          </div>
          <div className="space-y-2">
            {(stats?.produtosMaisVendidos || []).slice(0, 8).map((produto) => (
              <div
                key={produto.id}
                className="flex items-center justify-between text-sm border border-[#ececec] rounded-lg px-3 py-2"
              >
                <div>
                  <p className="font-medium text-slate-800">{produto.nome}</p>
                  <p className="text-slate-500">{produto.categoria?.nome || 'Sem categoria'}</p>
                </div>
                <span className="font-semibold text-slate-900">{produto.totalVendido || 0} un.</span>
              </div>
            ))}
            {(stats?.produtosMaisVendidos || []).length === 0 && (
              <p className="text-sm text-slate-500">Sem dados de vendas ainda.</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-[#d9d9d9] rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-orange-500" />
            <h2 className="font-semibold text-slate-900">Produtos com Estoque Baixo</h2>
          </div>
          <div className="space-y-2">
            {(stats?.produtosBaixoEstoque || []).slice(0, 8).map((produto) => {
              const atual = produto.estoqueAtual ?? produto.estoque_atual ?? produto.estoque ?? 0;
              const minimo = produto.estoqueMinimo ?? produto.estoque_minimo ?? 0;
              return (
                <div
                  key={produto.id}
                  className="text-sm border border-[#ffe0b2] bg-[#fff8ef] rounded-lg px-3 py-2"
                >
                  <p className="font-medium text-slate-900">{produto.nome}</p>
                  <p className="text-slate-600">
                    Estoque: <strong>{atual}</strong> / Minimo: <strong>{minimo}</strong>
                  </p>
                </div>
              );
            })}
            {(stats?.produtosBaixoEstoque || []).length === 0 && (
              <p className="text-sm text-slate-500">Nenhum produto em alerta de estoque.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;
