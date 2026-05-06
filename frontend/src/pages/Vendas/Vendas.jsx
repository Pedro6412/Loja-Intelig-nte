import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import {
  Plus,
  Eye,
  MoreVertical,
  Banknote,
  MessageCircle,
  ChevronDown
} from 'lucide-react';

const TABS = [
  { key: 'historico', label: 'Historico' },
  { key: 'aberto', label: 'Pedido em Aberto' },
  { key: 'online', label: 'Pedido Online' },
  { key: 'orcamentos', label: 'Orcamentos' }
];

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.vendas)) return value.vendas;
  return [];
};

const getVendaItens = (venda) => venda.vendaItens || venda.venda_itens || [];

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(Number(value || 0));

const formatDate = (value) => new Date(value).toLocaleDateString('pt-BR');
const formatTime = (value) => new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

const Vendas = () => {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState('historico');
  const [selectedVendaId, setSelectedVendaId] = useState(null);

  const [showNovaVenda, setShowNovaVenda] = useState(false);
  const [showDetalhes, setShowDetalhes] = useState(false);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);

  const [novaVendaForm, setNovaVendaForm] = useState({
    clienteId: '',
    itens: [],
    desconto: 0,
    forma_pagamento: '',
    observacoes: ''
  });

  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [itemForm, setItemForm] = useState({ produtoId: '', quantidade: 1 });

  useEffect(() => {
    loadPage();
  }, []);

  const loadPage = async () => {
    setLoading(true);
    setError(null);

    const [vendasResult, clientesResult, produtosResult] = await Promise.allSettled([
      api.get('/vendas'),
      api.get('/clientes'),
      api.get('/produtos')
    ]);

    if (vendasResult.status === 'fulfilled') {
      const lista = toArray(vendasResult.value.data);
      setVendas(lista);
      setSelectedVendaId(lista[0]?.id ?? null);
    } else {
      setError(
        vendasResult.reason?.response?.data?.error ||
          vendasResult.reason?.message ||
          'Erro ao buscar vendas'
      );
      setVendas([]);
    }

    if (clientesResult.status === 'fulfilled') {
      setClientes(toArray(clientesResult.value.data));
    } else {
      setClientes([]);
    }

    if (produtosResult.status === 'fulfilled') {
      setProdutos(toArray(produtosResult.value.data));
    } else {
      setProdutos([]);
    }

    setLoading(false);
  };

  const adicionarItem = () => {
    const produtoId = Number(itemForm.produtoId);
    const quantidade = Number(itemForm.quantidade);
    if (!Number.isInteger(produtoId) || !Number.isInteger(quantidade) || quantidade < 1) return;

    const produto = produtos.find((p) => p.id === produtoId);
    if (!produto) return;
    const estoqueAtual = Number(produto.estoqueAtual ?? produto.estoque_atual ?? produto.estoque ?? 0);

    if (quantidade > estoqueAtual) {
      alert(`Quantidade maior que o estoque disponivel (${estoqueAtual}) para ${produto.nome}.`);
      return;
    }

    const precoUnitario = Number(produto.preco_venda ?? produto.precoVenda ?? 0);
    const itemExistente = novaVendaForm.itens.find((item) => item.produtoId === produtoId);

    if (itemExistente) {
      if (itemExistente.quantidade + quantidade > estoqueAtual) {
        alert(`Nao e possivel ultrapassar o estoque disponivel (${estoqueAtual}) para ${produto.nome}.`);
        return;
      }

      setNovaVendaForm((prev) => ({
        ...prev,
        itens: prev.itens.map((item) =>
          item.produtoId === produtoId
            ? { ...item, quantidade: item.quantidade + quantidade }
            : item
        )
      }));
    } else {
      setNovaVendaForm((prev) => ({
        ...prev,
        itens: [
          ...prev.itens,
          {
            produtoId,
            quantidade,
            preco_unitario: precoUnitario
          }
        ]
      }));
    }

    setItemForm({ produtoId: '', quantidade: 1 });
  };

  const removerItem = (index) => {
    setNovaVendaForm((prev) => ({
      ...prev,
      itens: prev.itens.filter((_, idx) => idx !== index)
    }));
  };

  const calcularTotal = useMemo(() => {
    const subtotal = novaVendaForm.itens.reduce(
      (sum, item) => sum + Number(item.quantidade) * Number(item.preco_unitario),
      0
    );
    return subtotal - Number(novaVendaForm.desconto || 0);
  }, [novaVendaForm]);

  const abrirDetalhes = (venda) => {
    setVendaSelecionada(venda);
    setShowDetalhes(true);
  };

  const handleSubmitVenda = async (event) => {
    event.preventDefault();
    if (novaVendaForm.itens.length === 0) {
      alert('Adicione pelo menos um item a venda');
      return;
    }

    for (const item of novaVendaForm.itens) {
      const produto = produtos.find((p) => p.id === item.produtoId);
      const estoqueAtual = Number(produto?.estoqueAtual ?? produto?.estoque_atual ?? produto?.estoque ?? 0);
      if (Number(item.quantidade) > estoqueAtual) {
        alert(`Quantidade do produto ${produto?.nome || item.produtoId} excede o estoque (${estoqueAtual}).`);
        return;
      }
    }

    try {
      await api.post('/vendas', {
        ...novaVendaForm,
        clienteId: novaVendaForm.clienteId ? Number(novaVendaForm.clienteId) : null
      });

      setShowNovaVenda(false);
      setNovaVendaForm({
        clienteId: '',
        itens: [],
        desconto: 0,
        forma_pagamento: '',
        observacoes: ''
      });

      await loadPage();
    } catch (requestError) {
      alert(requestError.response?.data?.error || 'Erro ao criar venda');
    }
  };

  if (loading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowNovaVenda(true)}
          className="h-10 px-6 rounded-full bg-[#1b97e6] text-white font-semibold hover:bg-[#0f88d7] transition-colors"
        >
          Nova Venda - F3
        </button>
        <button
          onClick={() => setShowNovaVenda(true)}
          className="h-10 px-6 rounded-full border border-[#b8b8b8] bg-[#f6f6f6] text-slate-800 font-semibold hover:bg-white"
        >
          Novo Pedido - F4
        </button>
        <button
          type="button"
          className="h-10 px-6 rounded-full border border-[#b8b8b8] bg-[#f6f6f6] text-slate-800 font-semibold hover:bg-white"
        >
          Novo Orcamento - F5
        </button>
        <button
          type="button"
          className="h-10 px-6 rounded-full border border-[#b8b8b8] bg-[#f6f6f6] text-slate-800 font-semibold hover:bg-white"
        >
          Troca ou Devolucao
        </button>
      </div>

      <div className="border-b border-[#cbcbcb]">
        <div className="flex flex-wrap gap-5 text-[28px] leading-none font-medium">
          {TABS.map((tab) => {
            const active = tab.key === abaAtiva;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setAbaAtiva(tab.key)}
                className={`pb-2 text-[30px] sm:text-[32px] ${
                  active
                    ? 'border-b-[3px] border-[#1b97e6] text-slate-900'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-[13px] text-slate-700">
        <span>Visualizacao:</span>
        <button type="button" className="underline font-semibold">Resumida</button>
        <span>por Produto</span>
        <button type="button" className="flex items-center gap-1">
          Vendas do caixa atual
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="bg-[#8d8d8d] text-white/95 text-sm px-3 py-2 rounded-t-md">
        Arraste aqui o cabecalho de uma coluna para agrupar por esta coluna
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md text-sm">{error}</div>
      )}

      <div className="bg-white border border-[#cfcfcf] rounded-b-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] w-full">
            <thead className="bg-[#f4f4f4] text-[12px] text-slate-500">
              <tr>
                <th className="w-8 py-2 px-2"></th>
                <th className="text-left py-2 px-3">Acao</th>
                <th className="text-left py-2 px-3">Numero</th>
                <th className="text-left py-2 px-3">Resumo</th>
                <th className="text-left py-2 px-3">Tipo</th>
                <th className="text-left py-2 px-3">Data</th>
                <th className="text-left py-2 px-3">Hora</th>
                <th className="text-left py-2 px-3">Origem</th>
                <th className="text-left py-2 px-3">Itens</th>
                <th className="text-left py-2 px-3">Cliente</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map((venda) => {
                const dataVenda = venda.createdAt || venda.data_venda || venda.dataVenda;
                const itens = getVendaItens(venda);
                const firstItem = itens[0]?.produto?.nome || 'ITEM';
                const itensResumo = `${itens.length || 0} ${String(firstItem).toUpperCase()}`;
                const selected = selectedVendaId === venda.id;

                return (
                  <tr
                    key={venda.id}
                    className={`text-sm border-t border-[#e2e2e2] cursor-pointer ${
                      selected ? 'bg-[#d9ebf8]' : 'bg-white hover:bg-[#f5f8fb]'
                    }`}
                    onClick={() => setSelectedVendaId(venda.id)}
                  >
                    <td className="px-2 py-3 text-slate-500">
                      <MoreVertical size={16} />
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          abrirDetalhes(venda);
                        }}
                        className="h-8 px-4 rounded-md bg-[#efefef] border border-[#d9d9d9] text-slate-700 font-semibold hover:bg-white"
                      >
                        Abrir - F2
                      </button>
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-800">{venda.id}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Banknote size={16} className="text-green-600" />
                        <span className="font-semibold">{formatCurrency(venda.total)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">Venda</td>
                    <td className="px-3 py-3">{formatDate(dataVenda)}</td>
                    <td className="px-3 py-3">{formatTime(dataVenda)}</td>
                    <td className="px-3 py-3">Local</td>
                    <td className="px-3 py-3">{itensResumo}</td>
                    <td className="px-3 py-3">{venda.cliente?.nome || 'Sem cliente'}</td>
                  </tr>
                );
              })}

              {vendas.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-10 text-center text-slate-500">
                    Nenhuma venda registrada ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <button
        type="button"
        className="fixed right-5 bottom-5 w-12 h-12 rounded-full bg-[#1595e4] text-white shadow-lg hover:bg-[#0e89d8] flex items-center justify-center"
        title="Ajuda"
      >
        <MessageCircle size={22} />
      </button>

      {showNovaVenda && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Nova Venda</h2>

            <form onSubmit={handleSubmitVenda} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Cliente</label>
                  <select
                    value={novaVendaForm.clienteId}
                    onChange={(event) =>
                      setNovaVendaForm((prev) => ({ ...prev, clienteId: event.target.value }))
                    }
                    className="w-full h-10 px-3 border border-[#d4d4d4] rounded-lg"
                  >
                    <option value="">Cliente nao informado</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={novaVendaForm.forma_pagamento}
                    onChange={(event) =>
                      setNovaVendaForm((prev) => ({ ...prev, forma_pagamento: event.target.value }))
                    }
                    className="w-full h-10 px-3 border border-[#d4d4d4] rounded-lg"
                  >
                    <option value="">Selecione</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao_credito">Cartao de Credito</option>
                    <option value="cartao_debito">Cartao de Debito</option>
                    <option value="pix">PIX</option>
                  </select>
                </div>
              </div>

              <div className="border border-[#dddddd] rounded-xl p-4">
                <h3 className="font-semibold mb-3">Adicionar Itens</h3>
                <div className="flex flex-col md:flex-row gap-3">
                  <select
                    value={itemForm.produtoId}
                    onChange={(event) => setItemForm((prev) => ({ ...prev, produtoId: event.target.value }))}
                    className="flex-1 h-10 px-3 border border-[#d4d4d4] rounded-lg"
                  >
                    <option value="">Selecione um produto</option>
                    {produtos
                      .filter((produto) => (produto.estoque ?? produto.estoque_atual ?? 0) > 0)
                      .map((produto) => (
                        <option key={produto.id} value={produto.id}>
                          {produto.nome} - {formatCurrency(produto.preco_venda ?? produto.precoVenda)}
                        </option>
                      ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={itemForm.quantidade}
                    onChange={(event) =>
                      setItemForm((prev) => ({ ...prev, quantidade: Number(event.target.value || 1) }))
                    }
                    className="h-10 w-24 px-3 border border-[#d4d4d4] rounded-lg"
                  />

                  <button
                    type="button"
                    onClick={adicionarItem}
                    className="h-10 px-4 rounded-lg bg-[#1b97e6] text-white font-medium hover:bg-[#0f88d7]"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>

              {novaVendaForm.itens.length > 0 && (
                <div className="border border-[#dddddd] rounded-xl p-4">
                  <h3 className="font-semibold mb-3">Itens da Venda</h3>
                  <table className="w-full text-sm">
                    <thead className="text-slate-500">
                      <tr>
                        <th className="text-left py-2">Produto</th>
                        <th className="text-left py-2">Qtd</th>
                        <th className="text-left py-2">Preco Unit.</th>
                        <th className="text-left py-2">Subtotal</th>
                        <th className="text-left py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {novaVendaForm.itens.map((item, index) => {
                        const produto = produtos.find((p) => p.id === item.produtoId);
                        return (
                          <tr key={`${item.produtoId}-${index}`} className="border-t border-[#ececec]">
                            <td className="py-2">{produto?.nome || 'Produto removido'}</td>
                            <td className="py-2">{item.quantidade}</td>
                            <td className="py-2">{formatCurrency(item.preco_unitario)}</td>
                            <td className="py-2">{formatCurrency(item.preco_unitario * item.quantidade)}</td>
                            <td className="py-2">
                              <button
                                type="button"
                                onClick={() => removerItem(index)}
                                className="text-red-600 hover:text-red-700"
                              >
                                Remover
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Desconto</label>
                  <input
                    type="number"
                    step="0.01"
                    value={novaVendaForm.desconto}
                    onChange={(event) =>
                      setNovaVendaForm((prev) => ({ ...prev, desconto: Number(event.target.value || 0) }))
                    }
                    className="w-full h-10 px-3 border border-[#d4d4d4] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Total</label>
                  <div className="h-10 px-3 border border-[#d4d4d4] rounded-lg bg-[#f5f5f5] font-semibold flex items-center">
                    {formatCurrency(calcularTotal)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Observacoes</label>
                <textarea
                  value={novaVendaForm.observacoes}
                  onChange={(event) =>
                    setNovaVendaForm((prev) => ({ ...prev, observacoes: event.target.value }))
                  }
                  className="w-full px-3 py-2 border border-[#d4d4d4] rounded-lg"
                  rows={2}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNovaVenda(false)}
                  className="h-10 px-5 rounded-lg border border-[#cfcfcf] hover:bg-[#f7f7f7]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-lg bg-[#1b97e6] text-white font-semibold hover:bg-[#0f88d7]"
                >
                  Finalizar Venda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetalhes && vendaSelecionada && (
        <div className="fixed inset-0 bg-black/45 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Detalhes da Venda #{vendaSelecionada.id}</h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Cliente</p>
                  <p className="font-medium">{vendaSelecionada.cliente?.nome || 'Nao informado'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Data</p>
                  <p className="font-medium">
                    {new Date(
                      vendaSelecionada.createdAt ||
                        vendaSelecionada.data_venda ||
                        vendaSelecionada.dataVenda
                    ).toLocaleString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="border border-[#dddddd] rounded-xl p-4">
                <h3 className="font-semibold mb-3">Itens</h3>
                <table className="w-full text-sm">
                  <thead className="text-slate-500">
                    <tr>
                      <th className="text-left py-2">Produto</th>
                      <th className="text-left py-2">Qtd</th>
                      <th className="text-left py-2">Preco Unit.</th>
                      <th className="text-left py-2">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getVendaItens(vendaSelecionada).map((item) => (
                      <tr key={item.id} className="border-t border-[#ececec]">
                        <td className="py-2">{item.produto?.nome || 'Produto removido'}</td>
                        <td className="py-2">{item.quantidade}</td>
                        <td className="py-2">{formatCurrency(item.preco_unitario ?? item.precoUnitario)}</td>
                        <td className="py-2">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-slate-500">Desconto</p>
                  <p className="font-medium">{formatCurrency(vendaSelecionada.desconto || 0)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-500">Total</p>
                  <p className="text-2xl font-bold text-[#1b97e6]">{formatCurrency(vendaSelecionada.total)}</p>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowDetalhes(false)}
                  className="h-10 px-5 rounded-lg border border-[#cfcfcf] hover:bg-[#f7f7f7]"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendas;
