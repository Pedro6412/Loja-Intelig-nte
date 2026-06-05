import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Banknote,
  Briefcase,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MapPin,
  MessageCircle,
  Minus,
  MoreVertical,
  Package,
  PackagePlus,
  Plus,
  Receipt,
  Search,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  X
} from 'lucide-react';
import api from '../../services/api';
import { LOCATION_UPDATED_EVENT, readStoredLocation } from '../../utils/location';

const PAYMENT_METHODS = [
  { key: 'pix', label: 'Pix', icon: Receipt },
  { key: 'dinheiro', label: 'Dinheiro', icon: Banknote },
  { key: 'cartao_debito', label: 'Debito', icon: CreditCard },
  { key: 'cartao_credito', label: 'Credito', icon: CreditCard },
  { key: 'fiado', label: 'Fiado', icon: Briefcase }
];

const SALE_STEPS = [
  { key: 'produtos', label: 'Produtos' },
  { key: 'carrinho', label: 'Carrinho' },
  { key: 'pagamento', label: 'Pagamento' },
  { key: 'revisao', label: 'Revisao' }
];

const EMPTY_FORM = {
  itens: [],
  desconto: 0,
  forma_pagamento: 'pix',
  local_venda: '',
  latitude: null,
  longitude: null,
  cidade: '',
  bairro: '',
  regiao: '',
  estado: '',
  cep: '',
  endereco_formatado: '',
  observacoes: ''
};

const EMPTY_QUICK_PRODUCT = {
  nome: '',
  preco_venda: '',
  estoque_atual: '1',
  codigo_barras: ''
};

const LOCAIS_SUGERIDOS = [
  'Semaforo',
  'Terminal de onibus',
  'Escola',
  'Faculdade',
  'Feira',
  'Centro comercial',
  'Praia',
  'Evento',
  'Bairro residencial'
];

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.vendas)) return value.vendas;
  if (Array.isArray(value?.produtos)) return value.produtos;
  if (Array.isArray(value?.categorias)) return value.categorias;
  return [];
};

const getVendaItens = (venda) => venda.vendaItens || venda.venda_itens || [];
const getStatus = (venda) => venda.status || 'paga';
const getLocalVenda = (venda) => venda.regiao || venda.bairro || venda.cidade || venda.local_venda || venda.localVenda || '';
const getFormaPagamento = (venda) => venda.forma_pagamento || venda.formaPagamento || '';
const getProdutoPreco = (produto) => Number(produto.preco_venda ?? produto.precoVenda ?? 0);
const getProdutoCusto = (produto) => Number(produto.preco_custo ?? produto.precoCusto ?? 0);
const getProdutoEstoque = (produto) => Number(produto.estoqueAtual ?? produto.estoque_atual ?? produto.estoque ?? 0);
const getProdutoEstoqueMinimo = (produto) => Number(produto.estoqueMinimo ?? produto.estoque_minimo ?? 0);
const getProdutoCodigo = (produto) => produto.codigoBarras ?? produto.codigo_barras ?? produto.sku ?? '';

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

const formatDateTime = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('pt-BR');
};

const normalizeText = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

const isToday = (value) => {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const paymentLabel = {
  pix: 'Pix',
  dinheiro: 'Dinheiro',
  cartao_credito: 'Credito',
  cartao_debito: 'Debito',
  fiado: 'Fiado'
};

const getReadableRegion = (location) => location?.regiao || location?.bairro || location?.cidade || '';

const buildLocationFields = (location) => {
  if (!location) return {};

  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);
  const readableRegion = getReadableRegion(location);

  return {
    latitude: Number.isFinite(latitude) ? latitude : null,
    longitude: Number.isFinite(longitude) ? longitude : null,
    cidade: location.cidade || '',
    bairro: location.bairro || '',
    regiao: location.regiao || readableRegion || '',
    estado: location.estado || '',
    cep: location.cep || '',
    endereco_formatado: location.endereco_formatado || location.enderecoFormatado || '',
    local_venda: readableRegion || location.label || ''
  };
};

const DialogStyles = () => (
  <style>
    {`
      @keyframes vendasOverlayIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes vendasModalIn {
        from { opacity: 0; transform: translateY(12px) scale(0.98); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      @keyframes vendasDrawerIn {
        from { transform: translateX(100%); }
        to { transform: translateX(0); }
      }
    `}
  </style>
);

const ModalShell = ({ title, icon: Icon, onClose, children, maxWidth = 'max-w-2xl' }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      const dialogs = Array.from(document.querySelectorAll('[data-vendas-dialog="true"]'));
      if (dialogs[dialogs.length - 1] !== dialogRef.current) return;
      event.stopImmediatePropagation?.();
      onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={dialogRef}
      data-vendas-dialog="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 sm:p-5"
      style={{ animation: 'vendasOverlayIn 220ms ease-out' }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`max-h-[92vh] w-full ${maxWidth} overflow-hidden rounded-lg bg-white shadow-2xl`}
        style={{ animation: 'vendasModalIn 240ms ease-out' }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            {Icon && <Icon size={19} className="shrink-0 text-blue-600" />}
            <h2 className="truncate text-lg font-bold text-slate-950">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[calc(92vh-58px)] overflow-y-auto p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
};

const DrawerShell = ({ title, icon: Icon, onClose, children }) => {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      const dialogs = Array.from(document.querySelectorAll('[data-vendas-dialog="true"]'));
      if (dialogs[dialogs.length - 1] !== dialogRef.current) return;
      event.stopImmediatePropagation?.();
      onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div
      ref={dialogRef}
      data-vendas-dialog="true"
      className="fixed inset-0 z-[60] flex justify-end bg-slate-950/40"
      style={{ animation: 'vendasOverlayIn 220ms ease-out' }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <aside
        className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl sm:rounded-l-lg"
        style={{ animation: 'vendasDrawerIn 260ms ease-out' }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            {Icon && <Icon size={19} className="shrink-0 text-blue-600" />}
            <h2 className="truncate text-lg font-bold text-slate-950">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            title="Fechar"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>
      </aside>
    </div>
  );
};

const ProductTile = ({ produto, onAdd, onOpen, quantityInCart = 0 }) => {
  const estoque = getProdutoEstoque(produto);
  const estoqueBaixo = estoque <= getProdutoEstoqueMinimo(produto);
  const isAdded = quantityInCart > 0;
  const isAtStockLimit = isAdded && quantityInCart >= estoque;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(produto)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(produto);
        }
      }}
      className="flex min-h-[116px] cursor-pointer flex-col justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition hover:border-blue-200 hover:shadow-md"
    >
      <div className="min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="min-h-[40px] text-sm font-semibold leading-snug text-slate-950">{produto.nome}</p>
            <p className="mt-1 text-xs text-slate-500">{getProdutoCodigo(produto) || 'Sem codigo'}</p>
          </div>
          <Package size={18} className="shrink-0 text-blue-600" />
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <strong className="text-lg text-blue-700">{formatCurrency(getProdutoPreco(produto))}</strong>
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              estoqueBaixo ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {estoque} un
          </span>
        </div>
      </div>
      {isAdded ? (
        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_44px] gap-2">
          <div className="flex h-9 items-center justify-center rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-semibold text-blue-700">
            +{quantityInCart} {quantityInCart === 1 ? 'adicionado' : 'adicionados'}
          </div>
          <button
            type="button"
            disabled={isAtStockLimit}
            onClick={(event) => {
              event.stopPropagation();
              onAdd(produto);
            }}
            className="flex h-9 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            title={isAtStockLimit ? 'Estoque maximo no carrinho' : 'Aumentar quantidade'}
          >
            <Plus size={17} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAdd(produto);
          }}
          className="mt-3 flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus size={16} />
          Adicionar
        </button>
      )}
    </article>
  );
};

const Vendas = () => {
  const [vendas, setVendas] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSale, setSavingSale] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOptional, setShowOptional] = useState(false);
  const [showQuickProduct, setShowQuickProduct] = useState(false);
  const [quickProduct, setQuickProduct] = useState(EMPTY_QUICK_PRODUCT);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [vendaSelecionada, setVendaSelecionada] = useState(null);
  const [showSaleFlow, setShowSaleFlow] = useState(false);
  const [saleStep, setSaleStep] = useState('produtos');
  const [currentLocation, setCurrentLocation] = useState(() => readStoredLocation());

  useEffect(() => {
    loadPage();
  }, []);

  useEffect(() => {
    const handleLocationUpdated = (event) => {
      setCurrentLocation(event.detail || readStoredLocation());
    };

    window.addEventListener(LOCATION_UPDATED_EVENT, handleLocationUpdated);
    return () => window.removeEventListener(LOCATION_UPDATED_EVENT, handleLocationUpdated);
  }, []);

  useEffect(() => {
    if (!currentLocation?.label) return;
    const locationFields = buildLocationFields(currentLocation);
    setFormData((prev) => ({
      ...prev,
      latitude: prev.latitude ?? locationFields.latitude ?? null,
      longitude: prev.longitude ?? locationFields.longitude ?? null,
      cidade: prev.cidade || locationFields.cidade || '',
      bairro: prev.bairro || locationFields.bairro || '',
      regiao: prev.regiao || locationFields.regiao || '',
      estado: prev.estado || locationFields.estado || '',
      cep: prev.cep || locationFields.cep || '',
      endereco_formatado: prev.endereco_formatado || locationFields.endereco_formatado || '',
      local_venda:
        !prev.local_venda || prev.local_venda.startsWith('Localizacao atual:')
          ? locationFields.local_venda || prev.local_venda
          : prev.local_venda
    }));
  }, [currentLocation]);

  const loadPage = async () => {
    setLoading(true);
    setError(null);
    const [vendasResult, produtosResult, categoriasResult] = await Promise.allSettled([
      api.get('/vendas'),
      api.get('/produtos'),
      api.get('/categorias')
    ]);

    if (vendasResult.status === 'fulfilled') setVendas(toArray(vendasResult.value.data));
    else setError(vendasResult.reason?.response?.data?.error || 'Erro ao buscar vendas');

    if (produtosResult.status === 'fulfilled') setProdutos(toArray(produtosResult.value.data));
    if (categoriasResult.status === 'fulfilled') setCategorias(toArray(categoriasResult.value.data));
    setLoading(false);
  };

  const subtotalForm = useMemo(
    () => formData.itens.reduce((sum, item) => sum + Number(item.quantidade) * Number(item.preco_unitario), 0),
    [formData.itens]
  );

  const totalForm = useMemo(
    () => Math.max(subtotalForm - Number(formData.desconto || 0), 0),
    [formData.desconto, subtotalForm]
  );

  const totalItens = formData.itens.reduce((sum, item) => sum + Number(item.quantidade || 0), 0);
  const cartQuantityByProductId = useMemo(() => {
    const map = new Map();
    formData.itens.forEach((item) => {
      map.set(Number(item.produtoId), Number(item.quantidade || 0));
    });
    return map;
  }, [formData.itens]);
  const currentStepIndex = SALE_STEPS.findIndex((step) => step.key === saleStep);
  const detectedRegion = getReadableRegion(currentLocation);

  const historicoVendas = useMemo(
    () => vendas.filter((venda) => getStatus(venda) === 'paga'),
    [vendas]
  );

  const todaySales = useMemo(
    () => historicoVendas.filter((venda) => isToday(venda.createdAt || venda.data_venda || venda.dataVenda)),
    [historicoVendas]
  );

  const soldProductsMap = useMemo(() => {
    const map = new Map();
    historicoVendas.forEach((venda) => {
      getVendaItens(venda).forEach((item) => {
        const produtoId = Number(item.produtoId || item.produto_id);
        map.set(produtoId, (map.get(produtoId) || 0) + Number(item.quantidade || 0));
      });
    });
    return map;
  }, [historicoVendas]);

  const todayProductsMap = useMemo(() => {
    const map = new Map();
    todaySales.forEach((venda) => {
      getVendaItens(venda).forEach((item) => {
        const produtoId = Number(item.produtoId || item.produto_id);
        map.set(produtoId, (map.get(produtoId) || 0) + Number(item.quantidade || 0));
      });
    });
    return map;
  }, [todaySales]);

  const topSellingProducts = useMemo(
    () =>
      produtos
        .filter((produto) => soldProductsMap.has(produto.id))
        .sort((a, b) => (soldProductsMap.get(b.id) || 0) - (soldProductsMap.get(a.id) || 0))
        .slice(0, 6),
    [produtos, soldProductsMap]
  );

  const todaySoldProducts = useMemo(
    () =>
      produtos
        .filter((produto) => todayProductsMap.has(produto.id))
        .sort((a, b) => (todayProductsMap.get(b.id) || 0) - (todayProductsMap.get(a.id) || 0))
        .slice(0, 6),
    [produtos, todayProductsMap]
  );

  const recentProducts = useMemo(
    () =>
      [...produtos]
        .sort((a, b) => new Date(b.createdAt || b.criado_em || 0) - new Date(a.createdAt || a.criado_em || 0))
        .slice(0, 6),
    [produtos]
  );

  const searchedProducts = useMemo(() => {
    const query = normalizeText(searchTerm);
    if (!query) return [];
    return produtos
      .filter((produto) => {
        const haystack = normalizeText(`${produto.nome} ${getProdutoCodigo(produto)}`);
        return haystack.includes(query);
      })
      .slice(0, 8);
  }, [produtos, searchTerm]);

  const hasSearchWithoutResult = searchTerm.trim() && searchedProducts.length === 0;

  const resetSale = () => {
    const locationFields = buildLocationFields(currentLocation);
    setFormData({
      ...EMPTY_FORM,
      ...locationFields,
      forma_pagamento: 'pix',
      local_venda: locationFields.local_venda || ''
    });
    setSearchTerm('');
    setShowOptional(false);
    setShowQuickProduct(false);
    setQuickProduct(EMPTY_QUICK_PRODUCT);
    setSelectedProduto(null);
    setSaleStep('produtos');
  };

  const openSaleFlow = () => {
    setError(null);
    setSuccess(null);
    setShowSaleFlow(true);
    setSaleStep(formData.itens.length > 0 ? saleStep : 'produtos');
  };

  const closeSaleFlow = () => {
    setShowSaleFlow(false);
    setError(null);
  };

  const moveStep = (direction) => {
    const nextIndex = Math.min(Math.max(currentStepIndex + direction, 0), SALE_STEPS.length - 1);
    setSaleStep(SALE_STEPS[nextIndex].key);
  };

  const adicionarProduto = (produto, quantidade = 1) => {
    const produtoId = Number(produto.id);
    const quantidadeFinal = Math.max(Number(quantidade) || 1, 1);
    const estoque = getProdutoEstoque(produto);

    if (estoque <= 0) {
      setError(`${produto.nome} esta sem estoque.`);
      return;
    }

    setError(null);
    setSuccess(null);
    setFormData((prev) => {
      const existente = prev.itens.find((item) => item.produtoId === produtoId);
      const quantidadeAtual = existente?.quantidade || 0;
      const novaQuantidade = quantidadeAtual + quantidadeFinal;

      if (novaQuantidade > estoque) {
        setError(`Estoque disponivel para ${produto.nome}: ${estoque}.`);
        return prev;
      }

      if (existente) {
        return {
          ...prev,
          itens: prev.itens.map((item) =>
            item.produtoId === produtoId ? { ...item, quantidade: novaQuantidade } : item
          )
        };
      }

      return {
        ...prev,
        itens: [
          ...prev.itens,
          {
            produtoId,
            quantidade: quantidadeFinal,
            preco_unitario: getProdutoPreco(produto)
          }
        ]
      };
    });
    setSearchTerm('');
  };

  const atualizarQuantidade = (produtoId, quantidade) => {
    const quantidadeFinal = Number(quantidade);
    if (!Number.isInteger(quantidadeFinal) || quantidadeFinal < 1) return;
    const produto = produtos.find((item) => item.id === produtoId);
    if (produto && quantidadeFinal > getProdutoEstoque(produto)) {
      setError(`Estoque disponivel para ${produto.nome}: ${getProdutoEstoque(produto)}.`);
      return;
    }

    setError(null);
    setFormData((prev) => ({
      ...prev,
      itens: prev.itens.map((item) => (item.produtoId === produtoId ? { ...item, quantidade: quantidadeFinal } : item))
    }));
  };

  const removerItem = (produtoId) => {
    setFormData((prev) => ({ ...prev, itens: prev.itens.filter((item) => item.produtoId !== produtoId) }));
  };

  const validateSale = () => {
    if (formData.itens.length === 0) return 'Adicione pelo menos um item.';
    if (Number(formData.desconto || 0) < 0) return 'Desconto nao pode ser negativo.';
    return null;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateSale();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSavingSale(true);
    setError(null);
    setSuccess(null);

    const payload = {
      ...formData,
      forma_pagamento: formData.forma_pagamento || 'pix',
      local_venda: formData.local_venda || ''
    };

    try {
      const response = await api.post('/vendas', payload);
      setVendas((prev) => [response.data, ...prev]);

      const produtosResponse = await api.get('/produtos');
      setProdutos(toArray(produtosResponse.data));
      setSuccess('Venda finalizada.');
      resetSale();
      setShowSaleFlow(false);
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Erro ao salvar venda.');
    } finally {
      setSavingSale(false);
    }
  };

  const openQuickProduct = () => {
    setQuickProduct((prev) => ({
      ...prev,
      nome: prev.nome || searchTerm
    }));
    setShowQuickProduct(true);
    setError(null);
  };

  const closeQuickProduct = () => {
    setShowQuickProduct(false);
    setError(null);
  };

  const handleQuickProductSubmit = async (event) => {
    event.preventDefault();
    const nome = quickProduct.nome.trim();
    const preco = Number(quickProduct.preco_venda);
    const estoque = Number(quickProduct.estoque_atual);

    if (!nome) {
      setError('Informe o nome do produto.');
      return;
    }

    if (!Number.isFinite(preco) || preco < 0) {
      setError('Informe um preco valido.');
      return;
    }

    if (!Number.isInteger(estoque) || estoque < 0) {
      setError('Informe um estoque valido.');
      return;
    }

    setSavingProduct(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        nome,
        preco_venda: preco,
        preco_custo: 0,
        estoque_atual: estoque,
        estoque_minimo: 0,
        codigo_barras: quickProduct.codigo_barras || null,
        categoriaId: categorias[0]?.id || undefined
      };
      const response = await api.post('/produtos', payload);
      const produto = response.data;
      setProdutos((prev) => [...prev, produto].sort((a, b) => a.nome.localeCompare(b.nome)));
      setShowQuickProduct(false);
      setQuickProduct(EMPTY_QUICK_PRODUCT);
      setSearchTerm('');
      if (estoque > 0) adicionarProduto(produto);
      setSuccess('Produto cadastrado.');
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'Erro ao cadastrar produto.');
    } finally {
      setSavingProduct(false);
    }
  };

  const renderProductGroup = (title, items) => {
    if (items.length === 0) return null;

    return (
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h4 className="text-sm font-bold text-slate-800">{title}</h4>
          <span className="text-xs font-semibold text-slate-400">{items.length}</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((produto) => (
            <ProductTile
              key={produto.id}
              produto={produto}
              onAdd={adicionarProduto}
              onOpen={setSelectedProduto}
              quantityInCart={cartQuantityByProductId.get(Number(produto.id)) || 0}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderCartItems = () => {
    if (formData.itens.length === 0) {
      return (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
          <ShoppingCart size={34} className="text-slate-300" />
          <p className="mt-3 font-semibold text-slate-700">Carrinho vazio</p>
        </div>
      );
    }

    return (
      <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
        {formData.itens.map((item) => {
          const produto = produtos.find((p) => p.id === item.produtoId);
          return (
            <div key={item.produtoId} className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_116px_96px_40px] sm:items-center">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-950">{produto?.nome || 'Produto removido'}</p>
                <p className="text-sm text-slate-500">{formatCurrency(item.preco_unitario)} cada</p>
              </div>
              <div className="grid h-10 grid-cols-3 overflow-hidden rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => atualizarQuantidade(item.produtoId, item.quantidade - 1)}
                  className="flex items-center justify-center bg-slate-50 text-slate-700 hover:bg-slate-100"
                  title="Diminuir quantidade"
                >
                  <Minus size={15} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={item.quantidade}
                  onChange={(event) => atualizarQuantidade(item.produtoId, Number(event.target.value))}
                  className="w-full border-x border-slate-200 text-center text-sm font-semibold outline-none"
                  aria-label="Quantidade"
                />
                <button
                  type="button"
                  onClick={() => atualizarQuantidade(item.produtoId, item.quantidade + 1)}
                  className="flex items-center justify-center bg-slate-50 text-slate-700 hover:bg-slate-100"
                  title="Aumentar quantidade"
                >
                  <Plus size={15} />
                </button>
              </div>
              <strong className="text-blue-700">{formatCurrency(item.preco_unitario * item.quantidade)}</strong>
              <button
                type="button"
                onClick={() => removerItem(item.produtoId)}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-100 text-red-600 hover:bg-red-50"
                title="Remover item"
              >
                <Trash2 size={16} />
              </button>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) return <div className="py-8 text-center text-slate-600">Carregando...</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <DialogStyles />

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">PDV rapido</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Vendas</h2>
            <p className="mt-1 text-sm text-slate-500">Abra uma venda guiada e mantenha o historico sempre visivel.</p>
          </div>

          <button
            type="button"
            onClick={openSaleFlow}
            className="flex h-12 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 font-bold text-white hover:bg-blue-700 lg:min-w-[220px]"
          >
            <ShoppingBag size={18} />
            Nova venda
          </button>
        </div>
      </section>

      {(error || success) && !showSaleFlow && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
          }`}
        >
          {error || success}
        </div>
      )}

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Historico</h3>
              <p className="text-sm text-slate-500">{historicoVendas.length} venda(s)</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
              Hoje: {todaySales.length} venda(s)
            </div>
          </div>
        </div>

        <div className="hidden overflow-x-auto lg:block">
          <table className="min-w-[860px] w-full">
            <thead className="bg-slate-50 text-[12px] uppercase text-slate-500">
              <tr>
                <th className="w-8 px-2 py-3"></th>
                <th className="px-3 py-3 text-left">Acoes</th>
                <th className="px-3 py-3 text-left">Numero</th>
                <th className="px-3 py-3 text-left">Data</th>
                <th className="px-3 py-3 text-left">Local</th>
                <th className="px-3 py-3 text-left">Itens</th>
                <th className="px-3 py-3 text-left">Pagamento</th>
                <th className="px-3 py-3 text-left">Total</th>
              </tr>
            </thead>
            <tbody>
              {historicoVendas.map((venda) => {
                const itens = getVendaItens(venda);
                const payment = getFormaPagamento(venda);
                return (
                  <tr key={venda.id} className="border-t border-slate-100 text-sm hover:bg-blue-50/40">
                    <td className="px-2 py-3 text-slate-500">
                      <MoreVertical size={16} />
                    </td>
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => setVendaSelecionada(venda)}
                        className="h-8 rounded-lg border border-slate-200 bg-white px-3 font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Abrir
                      </button>
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-900">#{venda.id}</td>
                    <td className="px-3 py-3">{formatDateTime(venda.createdAt || venda.data_venda || venda.dataVenda)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin size={15} className="text-blue-600" />
                        <span>{getLocalVenda(venda) || 'Nao informado'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">{itens.length}</td>
                    <td className="px-3 py-3">{paymentLabel[payment] || payment || 'Nao informado'}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Banknote size={16} className="text-emerald-600" />
                        <span className="font-semibold">{formatCurrency(venda.total)}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-slate-100 lg:hidden">
          {historicoVendas.map((venda) => {
            const itens = getVendaItens(venda);
            const payment = getFormaPagamento(venda);
            return (
              <article key={venda.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">Venda #{venda.id}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatDateTime(venda.createdAt || venda.data_venda || venda.dataVenda)}</p>
                  </div>
                  <strong className="text-right text-lg text-blue-700">{formatCurrency(venda.total)}</strong>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                  <MapPin size={15} className="text-blue-600" />
                  <span className="min-w-0 truncate">{getLocalVenda(venda) || 'Nao informado'}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {itens.length} item(ns) - {paymentLabel[payment] || payment || 'Pagamento'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setVendaSelecionada(venda)}
                    className="h-9 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white"
                  >
                    Abrir
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        {historicoVendas.length === 0 && (
          <div className="p-10 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
              <ShoppingCart size={24} />
            </div>
            <p className="mt-3 font-semibold text-slate-800">Nenhuma venda encontrada.</p>
          </div>
        )}
      </section>

      <button
        type="button"
        className="fixed bottom-5 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700"
        title="Ajuda"
      >
        <MessageCircle size={22} />
      </button>

      {showSaleFlow && (
        <ModalShell title="Nova venda" icon={ShoppingBag} onClose={closeSaleFlow} maxWidth="max-w-6xl">
          <div className="mb-5 grid gap-2 sm:grid-cols-4">
            {SALE_STEPS.map((step, index) => {
              const active = step.key === saleStep;
              const done = index < currentStepIndex;
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setSaleStep(step.key)}
                  className={`h-10 rounded-lg border px-3 text-sm font-semibold transition-colors ${
                    active
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : done
                        ? 'border-blue-100 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-white'
                  }`}
                >
                  {index + 1}. {step.label}
                </button>
              );
            })}
          </div>

          {(error || success) && (
            <div
              className={`mb-4 rounded-lg border p-3 text-sm ${
                error ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {error || success}
            </div>
          )}

          <form id="vendas-form" onSubmit={handleSubmit}>
            {saleStep === 'produtos' && (
              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Search size={19} className="text-blue-600" />
                    <h3 className="font-bold text-slate-950">Produtos</h3>
                  </div>
                  <button
                    type="button"
                    onClick={openQuickProduct}
                    className="flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    <PackagePlus size={16} />
                    Cadastrar
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="search"
                    value={searchTerm}
                    onChange={(event) => {
                      setSearchTerm(event.target.value);
                      if (event.target.value.trim()) {
                        setQuickProduct((prev) => ({ ...prev, nome: event.target.value }));
                      }
                    }}
                    className="h-12 w-full rounded-lg border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-blue-500"
                    placeholder="Buscar produto ou codigo"
                  />
                </div>

                <div className="mt-4 space-y-5">
                  {searchTerm.trim() ? (
                    <>
                      {renderProductGroup('Resultado da busca', searchedProducts)}
                      {hasSearchWithoutResult && (
                        <button
                          type="button"
                          onClick={openQuickProduct}
                          className="flex min-h-[76px] w-full items-center justify-center gap-2 rounded-lg border border-dashed border-blue-300 bg-blue-50 px-4 font-semibold text-blue-700 hover:bg-blue-100"
                        >
                          <PackagePlus size={18} />
                          Cadastrar "{searchTerm.trim()}"
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {renderProductGroup('Mais vendidos', topSellingProducts)}
                      {renderProductGroup('Vendidos hoje', todaySoldProducts)}
                      {renderProductGroup('Ultimos cadastrados', recentProducts)}
                    </>
                  )}
                </div>
              </section>
            )}

            {saleStep === 'carrinho' && (
              <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={19} className="text-blue-600" />
                    <h3 className="font-bold text-slate-950">Carrinho</h3>
                  </div>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                    {totalItens} item(ns)
                  </span>
                </div>
                {renderCartItems()}

                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50">
                  <button
                    type="button"
                    onClick={() => setShowOptional((prev) => !prev)}
                    className="flex h-11 w-full items-center justify-between px-3 text-left font-semibold text-slate-800"
                  >
                    <span className="flex items-center gap-2">
                      <MapPin size={17} className="text-blue-600" />
                      Local e detalhes
                    </span>
                    <ChevronRight size={17} className={showOptional ? 'rotate-90 transition-transform' : 'transition-transform'} />
                  </button>

                  {showOptional && (
                    <div className="grid gap-3 border-t border-slate-200 p-3">
                      <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-700">Local</label>
                        <input
                          type="text"
                          list="locais-venda"
                          value={formData.local_venda}
                          onChange={(event) => setFormData((prev) => ({ ...prev, local_venda: event.target.value }))}
                          className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                          placeholder="Local da venda"
                        />
                        <datalist id="locais-venda">
                          {LOCAIS_SUGERIDOS.map((local) => (
                            <option key={local} value={local} />
                          ))}
                        </datalist>
                      </div>

                      <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase text-blue-700">Regiao detectada</p>
                            <p className="font-semibold text-slate-900">
                              {detectedRegion || formData.regiao || 'A confirmar pela geocodificacao'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const locationFields = buildLocationFields(currentLocation);
                                const region = detectedRegion || formData.regiao || locationFields.regiao || '';
                                setFormData((prev) => ({
                                  ...prev,
                                  ...locationFields,
                                  regiao: region,
                                  local_venda: region || locationFields.local_venda || prev.local_venda
                                }));
                              }}
                              className="h-9 rounded-lg bg-blue-600 px-3 text-sm font-semibold text-white hover:bg-blue-700"
                            >
                              Confirmar
                            </button>
                            <button
                              type="button"
                              onClick={() => setFormData((prev) => ({ ...prev, regiao: '' }))}
                              className="h-9 rounded-lg border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                            >
                              Alterar regiao
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700">Regiao</label>
                            <input
                              type="text"
                              value={formData.regiao}
                              onChange={(event) => setFormData((prev) => ({ ...prev, regiao: event.target.value }))}
                              className="h-10 w-full rounded-lg border border-blue-100 px-3 text-sm outline-none focus:border-blue-500"
                              placeholder="Ex.: Sobradinho"
                            />
                          </div>
                          <div>
                            <label className="mb-1 block text-sm font-semibold text-slate-700">Cidade</label>
                            <input
                              type="text"
                              value={formData.cidade}
                              onChange={(event) => setFormData((prev) => ({ ...prev, cidade: event.target.value }))}
                              className="h-10 w-full rounded-lg border border-blue-100 px-3 text-sm outline-none focus:border-blue-500"
                              placeholder="Ex.: Brasilia"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            {saleStep === 'pagamento' && (
              <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4">
                  <div className="rounded-lg border border-slate-200 bg-white p-4">
                    <h3 className="font-bold text-slate-950">Pagamento</h3>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {PAYMENT_METHODS.map((method) => {
                        const Icon = method.icon;
                        const active = formData.forma_pagamento === method.key;
                        return (
                          <button
                            key={method.key}
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, forma_pagamento: method.key }))}
                            className={`flex h-11 items-center justify-center gap-2 rounded-lg border text-sm font-semibold ${
                              active
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                            }`}
                          >
                            <Icon size={16} />
                            {method.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Desconto</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.desconto}
                        onChange={(event) => setFormData((prev) => ({ ...prev, desconto: Number(event.target.value || 0) }))}
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Observacoes</label>
                      <input
                        type="text"
                        value={formData.observacoes}
                        onChange={(event) => setFormData((prev) => ({ ...prev, observacoes: event.target.value }))}
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-bold text-slate-950">Resumo</h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <strong className="text-slate-900">{formatCurrency(subtotalForm)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Desconto</span>
                      <strong className="text-slate-900">{formatCurrency(formData.desconto)}</strong>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex items-end justify-between gap-3">
                        <span className="font-bold text-slate-900">Total</span>
                        <strong className="text-3xl text-blue-700">{formatCurrency(totalForm)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {saleStep === 'revisao' && (
              <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="rounded-lg border border-slate-200 bg-white p-4">
                  <h3 className="mb-3 font-bold text-slate-950">Itens da venda</h3>
                  {formData.itens.length === 0 ? (
                    <p className="text-sm text-slate-500">Adicione produtos antes de finalizar.</p>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {formData.itens.map((item) => {
                        const produto = produtos.find((p) => p.id === item.produtoId);
                        return (
                          <div key={item.produtoId} className="flex items-center justify-between gap-3 py-3 text-sm">
                            <span className="min-w-0 truncate text-slate-700">
                              {produto?.nome || 'Produto removido'} x {item.quantidade}
                            </span>
                            <strong className="text-slate-950">{formatCurrency(item.preco_unitario * item.quantidade)}</strong>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <h3 className="font-bold text-slate-950">Conferencia</h3>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-3 text-slate-600">
                      <span>Pagamento</span>
                      <strong className="text-right text-slate-900">
                        {paymentLabel[formData.forma_pagamento] || formData.forma_pagamento}
                      </strong>
                    </div>
                    <div className="flex justify-between gap-3 text-slate-600">
                      <span>Local</span>
                      <strong className="text-right text-slate-900">{formData.regiao || formData.local_venda || 'Nao informado'}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <strong className="text-slate-900">{formatCurrency(subtotalForm)}</strong>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Desconto</span>
                      <strong className="text-slate-900">{formatCurrency(formData.desconto)}</strong>
                    </div>
                    <div className="border-t border-slate-200 pt-3">
                      <div className="flex items-end justify-between gap-3">
                        <span className="font-bold text-slate-900">Total</span>
                        <strong className="text-3xl text-blue-700">{formatCurrency(totalForm)}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </form>

          <div className="mt-5 flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={resetSale}
              className="h-10 rounded-lg border border-slate-200 px-4 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Limpar venda
            </button>
            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <button
                type="button"
                onClick={currentStepIndex === 0 ? closeSaleFlow : () => moveStep(-1)}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 font-semibold text-slate-700 hover:bg-slate-50"
              >
                <ChevronLeft size={16} />
                {currentStepIndex === 0 ? 'Fechar' : 'Voltar'}
              </button>
              {saleStep === 'revisao' ? (
                <button
                  type="submit"
                  form="vendas-form"
                  disabled={savingSale}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
                >
                  <CheckCircle2 size={17} />
                  {savingSale ? 'Salvando...' : 'Finalizar venda'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => moveStep(1)}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700"
                >
                  Continuar
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        </ModalShell>
      )}

      {selectedProduto && (
        <DrawerShell
          title="Detalhes do produto"
          icon={Package}
          onClose={() => setSelectedProduto(null)}
        >
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">
                {selectedProduto.categoria?.nome ||
                  categorias.find((categoria) => Number(categoria.id) === Number(selectedProduto.categoriaId || selectedProduto.categoria_id))?.nome ||
                  'Sem categoria'}
              </p>
              <h3 className="mt-1 text-2xl font-bold text-slate-950">{selectedProduto.nome}</h3>
              <p className="mt-2 text-sm text-slate-500">{getProdutoCodigo(selectedProduto) || 'Sem codigo'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Preco</p>
                <strong className="mt-1 block text-xl text-blue-700">{formatCurrency(getProdutoPreco(selectedProduto))}</strong>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Estoque</p>
                <strong className="mt-1 block text-xl text-slate-950">{getProdutoEstoque(selectedProduto)} un</strong>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Minimo</p>
                <strong className="mt-1 block text-xl text-slate-950">{getProdutoEstoqueMinimo(selectedProduto)} un</strong>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Custo</p>
                <strong className="mt-1 block text-xl text-slate-950">{formatCurrency(getProdutoCusto(selectedProduto))}</strong>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Adicionar ao carrinho</p>
                  <p className="text-sm text-slate-500">Mantem a venda atual aberta ao fundo.</p>
                </div>
                <button
                  type="button"
                  onClick={() => adicionarProduto(selectedProduto)}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={16} />
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </DrawerShell>
      )}

      {showQuickProduct && (
        <ModalShell
          title="Cadastrar produto"
          icon={PackagePlus}
          onClose={closeQuickProduct}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleQuickProductSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            )}

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Nome do produto</label>
              <input
                type="text"
                value={quickProduct.nome}
                onChange={(event) => setQuickProduct((prev) => ({ ...prev, nome: event.target.value }))}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                placeholder="Ex.: Cabo USB"
                autoFocus
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Preco de venda</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={quickProduct.preco_venda}
                  onChange={(event) => setQuickProduct((prev) => ({ ...prev, preco_venda: event.target.value }))}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Estoque inicial</label>
                <input
                  type="number"
                  min="0"
                  value={quickProduct.estoque_atual}
                  onChange={(event) => setQuickProduct((prev) => ({ ...prev, estoque_atual: event.target.value }))}
                  className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                  placeholder="1"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Codigo opcional</label>
              <input
                type="text"
                value={quickProduct.codigo_barras}
                onChange={(event) => setQuickProduct((prev) => ({ ...prev, codigo_barras: event.target.value }))}
                className="h-11 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                placeholder="Codigo de barras ou referencia"
              />
            </div>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeQuickProduct}
                className="h-10 rounded-lg border border-slate-200 px-5 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={savingProduct}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 font-semibold text-white hover:bg-blue-700 disabled:opacity-70"
              >
                <Plus size={16} />
                {savingProduct ? 'Salvando...' : 'Salvar produto'}
              </button>
            </div>
          </form>
        </ModalShell>
      )}

      {vendaSelecionada && (
        <ModalShell
          title={`Detalhes #${vendaSelecionada.id}`}
          icon={Receipt}
          onClose={() => setVendaSelecionada(null)}
        >
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Local da venda</p>
                <p className="font-medium">{getLocalVenda(vendaSelecionada) || 'Nao informado'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Data</p>
                <p className="font-medium">{formatDateTime(vendaSelecionada.createdAt || vendaSelecionada.data_venda)}</p>
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 p-4">
              <h3 className="mb-3 font-bold">Itens</h3>
              {getVendaItens(vendaSelecionada).map((item) => (
                <div key={item.id || item.produtoId} className="flex justify-between gap-3 border-t border-slate-100 py-2 text-sm first:border-t-0">
                  <span>
                    {item.produto?.nome || 'Produto removido'} x {item.quantidade}
                  </span>
                  <strong>{formatCurrency(item.subtotal)}</strong>
                </div>
              ))}
            </div>
            <div className="flex items-end justify-between">
              <span className="text-slate-500">Venda</span>
              <strong className="text-2xl text-blue-700">{formatCurrency(vendaSelecionada.total)}</strong>
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setVendaSelecionada(null)}
                className="h-10 rounded-lg border border-slate-200 px-5 font-semibold hover:bg-slate-50"
              >
                Fechar
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
};

export default Vendas;
