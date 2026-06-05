import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Award,
  BarChart3,
  CalendarDays,
  Map as MapIcon,
  MapPin,
  Navigation,
  Package,
  ShoppingBag,
  TrendingUp
} from 'lucide-react';
import api from '../../services/api';

const DEFAULT_CENTER = [-15.793889, -47.882778];

const REPORTS = [
  { key: 'diario', label: 'Diario' },
  { key: 'semanal', label: 'Semanal' },
  { key: 'mensal', label: 'Mensal' },
  { key: 'anual', label: 'Anual' }
];

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  if (Array.isArray(value?.vendas)) return value.vendas;
  return [];
};

const getVendaItens = (venda) => venda.vendaItens || venda.venda_itens || [];
const getStatus = (venda) => venda.status || 'paga';
const getLocalVenda = (venda) => (venda.local_venda || venda.localVenda || '').trim();
const getRegionName = (venda) =>
  (venda.regiao || venda.bairro || venda.cidade || getLocalVenda(venda) || 'Regiao nao informada').trim();
const getVendaDate = (venda) => new Date(venda.createdAt || venda.data_venda || venda.dataVenda || Date.now());

const parseCoordinate = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const extractCoordinates = (venda) => {
  const latitude = parseCoordinate(venda.latitude);
  const longitude = parseCoordinate(venda.longitude);
  if (latitude !== null && longitude !== null) return { latitude, longitude };

  const local = getLocalVenda(venda);
  const match = local.match(/(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)/);
  if (!match) return null;

  return {
    latitude: Number(match[1]),
    longitude: Number(match[2])
  };
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(value || 0));

const formatPercent = (value) =>
  new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 0 }).format(Number(value || 0));

const isSameDay = (date, reference) =>
  date.getFullYear() === reference.getFullYear() &&
  date.getMonth() === reference.getMonth() &&
  date.getDate() === reference.getDate();

const isSameWeek = (date, reference) => {
  const start = new Date(reference);
  const day = start.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  start.setDate(start.getDate() + mondayOffset);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return date >= start && date < end;
};

const isSameMonth = (date, reference) =>
  date.getFullYear() === reference.getFullYear() && date.getMonth() === reference.getMonth();

const isSameYear = (date, reference) => date.getFullYear() === reference.getFullYear();

const getPeriodLabel = (period) => {
  if (period === 'diario') return 'Produtos mais vendidos por regiao';
  if (period === 'semanal') return 'Comparativo entre regioes';
  if (period === 'mensal') return 'Evolucao das vendas por regiao';
  return 'Ranking anual das regioes';
};

const filterSalesByPeriod = (vendas, period) => {
  const now = new Date();
  return vendas.filter((venda) => {
    const date = getVendaDate(venda);
    if (period === 'diario') return isSameDay(date, now);
    if (period === 'semanal') return isSameWeek(date, now);
    if (period === 'mensal') return isSameMonth(date, now);
    return isSameYear(date, now);
  });
};

const buildRegionSummary = (vendas) => {
  const map = new Map();

  vendas
    .filter((venda) => getStatus(venda) === 'paga')
    .forEach((venda) => {
      const regionName = getRegionName(venda);
      const coordinates = extractCoordinates(venda);

      if (!map.has(regionName)) {
        map.set(regionName, {
          local: regionName,
          cidade: venda.cidade || '',
          bairro: venda.bairro || '',
          estado: venda.estado || '',
          cep: venda.cep || '',
          enderecoFormatado: venda.endereco_formatado || venda.enderecoFormatado || '',
          quantidadeVendas: 0,
          totalVendido: 0,
          vendasLocalizadas: 0,
          latitudeTotal: 0,
          longitudeTotal: 0,
          produtos: new Map()
        });
      }

      const regiao = map.get(regionName);
      regiao.quantidadeVendas += 1;
      regiao.totalVendido += Number(venda.total || 0);

      if (coordinates) {
        regiao.vendasLocalizadas += 1;
        regiao.latitudeTotal += coordinates.latitude;
        regiao.longitudeTotal += coordinates.longitude;
      }

      getVendaItens(venda).forEach((item) => {
        const produtoId = item.produtoId || item.produto_id || item.produto?.id || item.produto?.nome;
        const produtoNome = item.produto?.nome || 'Produto removido';
        if (!regiao.produtos.has(produtoId)) {
          regiao.produtos.set(produtoId, { produtoId, produtoNome, quantidade: 0, totalVendido: 0 });
        }

        const produto = regiao.produtos.get(produtoId);
        produto.quantidade += Number(item.quantidade || 0);
        produto.totalVendido += Number(item.subtotal || 0);
      });
    });

  return Array.from(map.values())
    .map((regiao) => {
      const produtos = Array.from(regiao.produtos.values()).sort((a, b) => {
        if (b.quantidade !== a.quantidade) return b.quantidade - a.quantidade;
        return b.totalVendido - a.totalVendido;
      });

      return {
        ...regiao,
        produtos,
        itemMaisVendido: produtos[0] || null,
        ticketMedio: regiao.quantidadeVendas > 0 ? regiao.totalVendido / regiao.quantidadeVendas : 0,
        latitude: regiao.vendasLocalizadas > 0 ? regiao.latitudeTotal / regiao.vendasLocalizadas : null,
        longitude: regiao.vendasLocalizadas > 0 ? regiao.longitudeTotal / regiao.vendasLocalizadas : null
      };
    })
    .sort((a, b) => b.totalVendido - a.totalVendido);
};

const getPointSales = (vendas) =>
  vendas
    .filter((venda) => getStatus(venda) === 'paga')
    .map((venda) => {
      const coordinates = extractCoordinates(venda);
      if (!coordinates) return null;

      return {
        id: venda.id,
        regionName: getRegionName(venda),
        total: Number(venda.total || 0),
        date: getVendaDate(venda),
        ...coordinates
      };
    })
    .filter(Boolean);

const MapaRegioes = () => {
  const [vendas, setVendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLocal, setSelectedLocal] = useState(null);
  const [reportPeriod, setReportPeriod] = useState('diario');
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);

  useEffect(() => {
    const loadVendas = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get('/vendas');
        setVendas(toArray(response.data));
      } catch (requestError) {
        setError(requestError.response?.data?.error || 'Erro ao carregar regioes de venda');
      } finally {
        setLoading(false);
      }
    };

    loadVendas();
  }, []);

  const vendasPagas = useMemo(() => vendas.filter((venda) => getStatus(venda) === 'paga'), [vendas]);
  const regioes = useMemo(() => buildRegionSummary(vendasPagas), [vendasPagas]);
  const pointSales = useMemo(() => getPointSales(vendasPagas), [vendasPagas]);
  const reportSales = useMemo(() => filterSalesByPeriod(vendasPagas, reportPeriod), [vendasPagas, reportPeriod]);
  const reportRegions = useMemo(() => buildRegionSummary(reportSales), [reportSales]);

  const selectedRegiao = regioes.find((regiao) => regiao.local === selectedLocal) || regioes[0] || null;
  const totalFaturado = regioes.reduce((sum, regiao) => sum + regiao.totalVendido, 0);
  const vendasLocalizadas = pointSales.length;
  const totalFaturadoLocalizado = pointSales.reduce((sum, sale) => sum + sale.total, 0);
  const vendasSemLocal = vendasPagas.length - vendasLocalizadas;
  const regiaoMaisVendeu = regioes[0] || null;
  const reportRegiaoMaisQuantidade =
    [...reportRegions].sort((a, b) => b.quantidadeVendas - a.quantidadeVendas)[0] || null;
  const maxRegionSales = Math.max(...regioes.map((regiao) => regiao.quantidadeVendas), 1);

  useEffect(() => {
    if (loading || !mapContainerRef.current || mapRef.current) return;

    mapRef.current = L.map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 11,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap'
    }).addTo(mapRef.current);

    markerLayerRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, [loading]);

  useEffect(() => {
    if (!mapRef.current || !markerLayerRef.current) return;

    markerLayerRef.current.clearLayers();

    regioes
      .filter((regiao) => regiao.latitude !== null && regiao.longitude !== null)
      .forEach((regiao) => {
        const isSelected = selectedRegiao?.local === regiao.local;
        const heatIntensity = regiao.quantidadeVendas / maxRegionSales;
        const circleColor = heatIntensity > 0.66 ? '#dc2626' : heatIntensity > 0.33 ? '#f59e0b' : '#2563eb';
        const radius = 240 + heatIntensity * 760;

        L.circle([regiao.latitude, regiao.longitude], {
          radius,
          color: circleColor,
          fillColor: circleColor,
          fillOpacity: isSelected ? 0.28 : 0.16,
          weight: isSelected ? 3 : 1.5
        })
          .addTo(markerLayerRef.current)
          .on('click', () => setSelectedLocal(regiao.local));

        const icon = L.divIcon({
          className: 'loja-region-marker',
          html: `<button type="button" class="loja-region-marker__button ${isSelected ? 'is-selected' : ''}">${regiao.quantidadeVendas}</button>`,
          iconSize: [42, 42],
          iconAnchor: [21, 21]
        });

        L.marker([regiao.latitude, regiao.longitude], { icon })
          .addTo(markerLayerRef.current)
          .bindPopup(
            `<strong>${regiao.local}</strong><br/>${regiao.quantidadeVendas} venda(s)<br/>${formatCurrency(
              regiao.totalVendido
            )}`
          )
          .on('click', () => setSelectedLocal(regiao.local));
      });

    pointSales.forEach((sale) => {
      L.circleMarker([sale.latitude, sale.longitude], {
        radius: 5,
        color: '#0f766e',
        fillColor: '#14b8a6',
        fillOpacity: 0.75,
        weight: 1
      })
        .addTo(markerLayerRef.current)
        .bindPopup(
          `<strong>Venda #${sale.id}</strong><br/>${sale.regionName}<br/>${formatCurrency(sale.total)}`
        );
    });

    const bounds = regioes
      .filter((regiao) => regiao.latitude !== null && regiao.longitude !== null)
      .map((regiao) => [regiao.latitude, regiao.longitude]);

    if (bounds.length > 0) {
      mapRef.current.fitBounds(bounds, { padding: [36, 36], maxZoom: 13 });
    } else {
      mapRef.current.setView(DEFAULT_CENTER, 11);
    }
  }, [regioes, pointSales, selectedRegiao?.local, maxRegionSales]);

  useEffect(() => {
    if (!mapRef.current || !selectedRegiao?.latitude || !selectedRegiao?.longitude) return;
    mapRef.current.panTo([selectedRegiao.latitude, selectedRegiao.longitude]);
  }, [selectedRegiao?.local, selectedRegiao?.latitude, selectedRegiao?.longitude]);

  if (loading) return <div className="py-8 text-center">Carregando...</div>;

  return (
    <div className="space-y-5">
      <style>{`
        .loja-region-marker { background: transparent; border: 0; }
        .loja-region-marker__button {
          align-items: center;
          background: #ffffff;
          border: 2px solid #2563eb;
          border-radius: 999px;
          box-shadow: 0 10px 24px rgba(15, 23, 42, 0.22);
          color: #1d4ed8;
          display: flex;
          font-weight: 800;
          height: 42px;
          justify-content: center;
          width: 42px;
        }
        .loja-region-marker__button.is-selected {
          background: #2563eb;
          color: #ffffff;
        }
      `}</style>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MapIcon className="text-[#1b97e6]" size={24} />
          <h1 className="text-2xl font-semibold text-slate-900">Mapa de Regioes</h1>
        </div>
      </div>

      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
        <div className="rounded-lg border border-[#d9d9d9] bg-white p-4">
          <p className="text-sm text-slate-500">Regioes atendidas</p>
          <p className="text-2xl font-semibold text-slate-900">{regioes.length}</p>
        </div>
        <div className="rounded-lg border border-[#d9d9d9] bg-white p-4">
          <p className="text-sm text-slate-500">Vendas localizadas</p>
          <p className="text-2xl font-semibold text-slate-900">{vendasLocalizadas}</p>
        </div>
        <div className="rounded-lg border border-[#d9d9d9] bg-white p-4">
          <p className="text-sm text-slate-500">Faturamento localizado</p>
          <p className="text-2xl font-semibold text-slate-900">{formatCurrency(totalFaturadoLocalizado)}</p>
        </div>
        <div className="rounded-lg border border-[#d9d9d9] bg-white p-4">
          <p className="text-sm text-slate-500">Regiao que mais vendeu</p>
          <p className="truncate text-2xl font-semibold text-slate-900">{regiaoMaisVendeu?.local || '-'}</p>
        </div>
        <div className="rounded-lg border border-[#d9d9d9] bg-white p-4">
          <p className="text-sm text-slate-500">Sem coordenadas</p>
          <p className="text-2xl font-semibold text-slate-900">{Math.max(vendasSemLocal, 0)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.7fr_1fr]">
        <section className="overflow-hidden rounded-lg border border-[#d9d9d9] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
            <div>
              <h2 className="font-semibold text-slate-900">Mapa geografico de vendas</h2>
              <p className="text-sm text-slate-500">OpenStreetMap com pontos de venda e mapa de calor por regiao.</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin size={16} className="text-[#ef4444]" />
              <span>{pointSales.length} ponto(s)</span>
            </div>
          </div>
          <div ref={mapContainerRef} className="h-[540px] w-full bg-[#eef5f3]" />
        </section>

        <aside className="space-y-4 rounded-lg border border-[#d9d9d9] bg-white p-4">
          <div className="flex items-center gap-2">
            <Navigation size={18} className="text-[#1b97e6]" />
            <h2 className="font-semibold text-slate-900">Painel da regiao</h2>
          </div>

          {selectedRegiao ? (
            <>
              <div>
                <p className="text-sm text-slate-500">Regiao selecionada</p>
                <p className="text-xl font-semibold text-slate-900">{selectedRegiao.local}</p>
                {(selectedRegiao.cidade || selectedRegiao.estado) && (
                  <p className="text-sm text-slate-500">
                    {[selectedRegiao.cidade, selectedRegiao.estado].filter(Boolean).join(' - ')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-[#ececec] px-3 py-2">
                  <p className="text-xs text-slate-500">Vendas</p>
                  <p className="text-lg font-semibold text-slate-900">{selectedRegiao.quantidadeVendas}</p>
                </div>
                <div className="rounded-lg border border-[#ececec] px-3 py-2">
                  <p className="text-xs text-slate-500">Total</p>
                  <p className="text-lg font-semibold text-slate-900">{formatCurrency(selectedRegiao.totalVendido)}</p>
                </div>
                <div className="rounded-lg border border-[#ececec] px-3 py-2">
                  <p className="text-xs text-slate-500">Ticket</p>
                  <p className="text-lg font-semibold text-slate-900">{formatCurrency(selectedRegiao.ticketMedio)}</p>
                </div>
              </div>

              <div className="rounded-lg border border-[#e0edf8] bg-[#f5fbff] px-3 py-2">
                <div className="mb-1 flex items-center gap-2 text-[#1b70a8]">
                  <Package size={16} />
                  <span className="text-sm font-semibold">Produto mais vendido</span>
                </div>
                <p className="font-medium text-slate-900">
                  {selectedRegiao.itemMaisVendido?.produtoNome || 'Sem produto'}
                </p>
                <p className="text-sm text-slate-600">{selectedRegiao.itemMaisVendido?.quantidade || 0} unidades</p>
              </div>

              <div>
                <div className="mb-2 flex items-center gap-2">
                  <ShoppingBag size={17} className="text-slate-600" />
                  <h3 className="font-semibold text-slate-900">Top 5 produtos</h3>
                </div>
                <div className="max-h-[250px] space-y-2 overflow-y-auto pr-1">
                  {selectedRegiao.produtos.slice(0, 5).map((produto, index) => (
                    <div key={produto.produtoId} className="rounded-lg border border-[#ececec] px-3 py-2 text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-slate-800">
                          {index + 1}. {produto.produtoNome}
                        </span>
                        <span className="font-semibold text-slate-900">{produto.quantidade} un.</span>
                      </div>
                      <p className="text-slate-500">{formatCurrency(produto.totalVendido)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Registre uma venda com local para visualizar o mapa.</p>
          )}
        </aside>
      </div>

      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-lg border border-[#d9d9d9] bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 size={19} className="text-[#1b97e6]" />
            <h2 className="font-semibold text-slate-900">Faturamento por regiao</h2>
          </div>
          <div className="space-y-3">
            {regioes.slice(0, 7).map((regiao) => {
              const percent = totalFaturado > 0 ? (regiao.totalVendido / totalFaturado) * 100 : 0;
              return (
                <button
                  key={regiao.local}
                  type="button"
                  onClick={() => setSelectedLocal(regiao.local)}
                  className="w-full rounded-lg border border-slate-100 p-3 text-left hover:bg-slate-50"
                >
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-slate-900">{regiao.local}</span>
                    <span className="text-slate-600">{formatCurrency(regiao.totalVendido)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max(percent, 4)}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatPercent(percent)}% do faturamento localizado</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-[#d9d9d9] bg-white p-4">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays size={19} className="text-[#1b97e6]" />
              <h2 className="font-semibold text-slate-900">Relatorios geograficos</h2>
            </div>
            <div className="grid grid-cols-4 rounded-lg border border-slate-200 bg-slate-50 p-1">
              {REPORTS.map((report) => (
                <button
                  key={report.key}
                  type="button"
                  onClick={() => setReportPeriod(report.key)}
                  className={`h-9 rounded-md px-3 text-sm font-semibold ${
                    reportPeriod === report.key ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-white'
                  }`}
                >
                  {report.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">Maior faturamento</p>
              <strong className="mt-1 block truncate text-slate-950">{reportRegions[0]?.local || '-'}</strong>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">Mais vendas</p>
              <strong className="mt-1 block truncate text-slate-950">{reportRegiaoMaisQuantidade?.local || '-'}</strong>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">Ticket medio</p>
              <strong className="mt-1 block text-slate-950">
                {formatCurrency(
                  reportRegions.reduce((sum, regiao) => sum + regiao.totalVendido, 0) /
                    Math.max(reportRegions.reduce((sum, regiao) => sum + regiao.quantidadeVendas, 0), 1)
                )}
              </strong>
            </div>
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">Regioes</p>
              <strong className="mt-1 block text-slate-950">{reportRegions.length}</strong>
            </div>
          </div>

          <div className="mb-2 flex items-center gap-2">
            <TrendingUp size={17} className="text-slate-600" />
            <h3 className="font-semibold text-slate-900">{getPeriodLabel(reportPeriod)}</h3>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="hidden grid-cols-[minmax(0,1.2fr)_90px_130px_130px_minmax(0,1fr)] bg-slate-50 px-3 py-2 text-xs font-semibold uppercase text-slate-500 md:grid">
              <span>Regiao</span>
              <span>Vendas</span>
              <span>Faturamento</span>
              <span>Ticket medio</span>
              <span>Produto campeao</span>
            </div>
            <div className="divide-y divide-slate-100">
              {reportRegions.map((regiao) => (
                <button
                  key={regiao.local}
                  type="button"
                  onClick={() => setSelectedLocal(regiao.local)}
                  className="grid w-full gap-2 px-3 py-3 text-left text-sm hover:bg-blue-50/40 md:grid-cols-[minmax(0,1.2fr)_90px_130px_130px_minmax(0,1fr)] md:items-center"
                >
                  <span className="font-semibold text-slate-900">{regiao.local}</span>
                  <span>{regiao.quantidadeVendas}</span>
                  <span>{formatCurrency(regiao.totalVendido)}</span>
                  <span>{formatCurrency(regiao.ticketMedio)}</span>
                  <span className="min-w-0 truncate">{regiao.itemMaisVendido?.produtoNome || '-'}</span>
                </button>
              ))}

              {reportRegions.length === 0 && (
                <div className="p-6 text-center text-sm text-slate-500">Sem vendas localizadas neste periodo.</div>
              )}
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
            <div className="flex items-center gap-2 text-blue-900">
              <Award size={17} />
              <span className="font-semibold">Produto mais vendido por regiao</span>
            </div>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {reportRegions.slice(0, 4).map((regiao) => (
                <div key={regiao.local} className="rounded-lg bg-white/80 px-3 py-2 text-sm">
                  <p className="font-semibold text-slate-900">{regiao.local}</p>
                  <p className="text-slate-600">
                    {regiao.itemMaisVendido?.produtoNome || '-'} ({regiao.itemMaisVendido?.quantidade || 0} un.)
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default MapaRegioes;
