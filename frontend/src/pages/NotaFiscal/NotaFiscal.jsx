import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { FileText, Download } from 'lucide-react';

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.vendas)) return value.vendas;
  return [];
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0));

const getVendaLocal = (venda) =>
  venda.regiao ||
  venda.bairro ||
  venda.cidade ||
  venda.localVenda ||
  venda.local_venda ||
  'Venda direta';

const NotaFiscal = () => {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busca, setBusca] = useState('');

  useEffect(() => {
    const fetchVendas = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/vendas');
        setVendas(toArray(response.data));
      } catch (requestError) {
        setError(requestError.response?.data?.error || 'Erro ao carregar vendas para nota fiscal');
        setVendas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVendas();
  }, []);

  const vendasFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return vendas;

    return vendas.filter((venda) => {
      const id = String(venda.id || '');
      const local = String(getVendaLocal(venda)).toLowerCase();
      const status = String(venda.status || '').toLowerCase();
      const pagamento = String(venda.formaPagamento || venda.forma_pagamento || '').toLowerCase();
      return id.includes(termo) || local.includes(termo) || status.includes(termo) || pagamento.includes(termo);
    });
  }, [vendas, busca]);

  const exportarCsv = () => {
    const headers = ['Venda', 'Data', 'Local', 'Total', 'Status'];
    const rows = vendasFiltradas.map((venda) => [
      String(venda.id),
      new Date(venda.createdAt || venda.data_venda || venda.dataVenda).toLocaleString('pt-BR'),
      getVendaLocal(venda),
      Number(venda.total || 0).toFixed(2),
      venda.status || 'paga'
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(';'))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'notas-fiscais-base.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const visualizarNf = (venda) => {
    const data = new Date(venda.createdAt || venda.data_venda || venda.dataVenda).toLocaleString('pt-BR');
    const local = getVendaLocal(venda);
    const mensagem =
      `Pre-visualizacao da Nota Fiscal\n\n` +
      `Venda: #${venda.id}\n` +
      `Data: ${data}\n` +
      `Local: ${local}\n` +
      `Total: ${formatCurrency(venda.total)}\n\n` +
      `Integracao com SEFAZ pode ser conectada nesta tela quando quiser.`;
    alert(mensagem);
  };

  if (loading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileText className="text-[#1b97e6]" size={24} />
          <h1 className="text-2xl font-semibold text-slate-900">Nota Fiscal</h1>
        </div>

        <button
          type="button"
          onClick={exportarCsv}
          className="h-10 px-4 rounded-lg bg-[#1b97e6] text-white font-medium hover:bg-[#0f88d7] flex items-center gap-2"
        >
          <Download size={17} />
          Exportar Base CSV
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">{error}</div>
      )}

      <div className="bg-white border border-[#d9d9d9] rounded-xl p-4">
        <input
          type="text"
          value={busca}
          onChange={(event) => setBusca(event.target.value)}
          placeholder="Buscar por numero da venda, local ou status"
          className="w-full h-10 px-3 border border-[#d3d3d3] rounded-lg"
        />
      </div>

      <div className="bg-white border border-[#d9d9d9] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead className="bg-[#f4f4f4] text-sm text-slate-600">
              <tr>
                <th className="text-left px-4 py-3">Venda</th>
                <th className="text-left px-4 py-3">Data</th>
                <th className="text-left px-4 py-3">Local</th>
                <th className="text-left px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-left px-4 py-3">Acao</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ececec]">
              {vendasFiltradas.map((venda) => (
                <tr key={venda.id} className="text-sm text-slate-700">
                  <td className="px-4 py-3 font-semibold">#{venda.id}</td>
                  <td className="px-4 py-3">
                    {new Date(venda.createdAt || venda.data_venda || venda.dataVenda).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">{getVendaLocal(venda)}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(venda.total)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                      {venda.status || 'paga'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => visualizarNf(venda)}
                      className="h-8 px-3 rounded-md border border-[#d0d0d0] hover:bg-[#f7f7f7]"
                    >
                      Visualizar NF
                    </button>
                  </td>
                </tr>
              ))}
              {vendasFiltradas.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500">
                    Nenhuma venda encontrada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NotaFiscal;
