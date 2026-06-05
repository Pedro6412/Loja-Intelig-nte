import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { BarChart3, TrendingUp, AlertTriangle, Download, MapPin, CalendarDays } from 'lucide-react';

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('pt-BR');
};

const Relatorios = () => {
  const [stats, setStats] = useState(null);
  const [relatorioSemanal, setRelatorioSemanal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);

      try {
        const [statsResponse, semanalResponse] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/vendas/relatorios/semana-regioes')
        ]);
        setStats(statsResponse.data || null);
        setRelatorioSemanal(semanalResponse.data || null);
      } catch (requestError) {
        setError(requestError.response?.data?.error || 'Erro ao carregar relatorios');
        setStats(null);
        setRelatorioSemanal(null);
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

  const exportarRelatorioSemanal = () => {
    const headers = ['Regiao', 'Vendas', 'Total vendido', 'Item mais vendido', 'Quantidade do item'];
    const rows = (relatorioSemanal?.regioes || []).map((regiao) => [
      regiao.local,
      String(regiao.quantidadeVendas || 0),
      String(regiao.totalVendido || 0).replace('.', ','),
      regiao.itemMaisVendido?.produtoNome || 'Sem item',
      String(regiao.itemMaisVendido?.quantidade || 0)
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'relatorio-semanal-regioes.csv');
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
        <button
          type="button"
          onClick={exportarRelatorioSemanal}
          className="h-10 px-4 rounded-lg border border-[#cfcfcf] bg-white text-slate-800 font-medium hover:bg-[#f6f6f6] flex items-center gap-2"
        >
          <Download size={17} />
          Exportar Regioes
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
        <div className="bg-white border border-[#d9d9d9] rounded-xl p-4 xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <MapPin size={18} className="text-[#1b97e6]" />
              <h2 className="font-semibold text-slate-900">Relatorio Semanal por Regiao</h2>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <CalendarDays size={16} />
              <span>
                {formatDate(relatorioSemanal?.semanaInicio)} ate {formatDate(relatorioSemanal?.semanaFim)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="border border-[#ececec] rounded-lg px-3 py-2">
              <p className="text-sm text-slate-500">Regiao que mais vendeu</p>
              <p className="text-lg font-semibold text-slate-900">
                {relatorioSemanal?.melhorRegiao?.local || 'Sem dados'}
              </p>
            </div>
            <div className="border border-[#ececec] rounded-lg px-3 py-2">
              <p className="text-sm text-slate-500">Vendas na semana</p>
              <p className="text-lg font-semibold text-slate-900">{relatorioSemanal?.totalVendas || 0}</p>
            </div>
            <div className="border border-[#ececec] rounded-lg px-3 py-2">
              <p className="text-sm text-slate-500">Faturamento semanal</p>
              <p className="text-lg font-semibold text-slate-900">
                {formatCurrency(relatorioSemanal?.totalFaturado || 0)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-sm">
              <thead className="bg-[#f4f4f4] text-slate-500 uppercase text-[12px]">
                <tr>
                  <th className="text-left py-2 px-3">Regiao</th>
                  <th className="text-left py-2 px-3">Vendas</th>
                  <th className="text-left py-2 px-3">Total</th>
                  <th className="text-left py-2 px-3">Item mais vendido</th>
                  <th className="text-left py-2 px-3">Qtd.</th>
                </tr>
              </thead>
              <tbody>
                {(relatorioSemanal?.regioes || []).map((regiao) => (
                  <tr key={regiao.local} className="border-t border-[#e2e2e2]">
                    <td className="py-2 px-3 font-medium text-slate-900">{regiao.local}</td>
                    <td className="py-2 px-3">{regiao.quantidadeVendas || 0}</td>
                    <td className="py-2 px-3">{formatCurrency(regiao.totalVendido || 0)}</td>
                    <td className="py-2 px-3">{regiao.itemMaisVendido?.produtoNome || 'Sem item'}</td>
                    <td className="py-2 px-3">{regiao.itemMaisVendido?.quantidade || 0}</td>
                  </tr>
                ))}
                {(relatorioSemanal?.regioes || []).length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500">
                      Sem vendas registradas por regiao nesta semana.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

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
