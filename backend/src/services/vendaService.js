import { vendaRepository } from '../repositories/vendaRepository.js';
import { estoqueRepository } from '../repositories/estoqueRepository.js';
import { produtoService } from './produtoService.js';
import { reverseGeocodingService } from './reverseGeocodingService.js';

const createValidationError = (message) => {
  const error = new Error(message);
  error.name = 'ValidationError';
  return error;
};

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toPositiveInt = (value) => {
  const parsed = toNumberOrNull(value);
  if (parsed === null || !Number.isInteger(parsed) || parsed <= 0) return null;
  return parsed;
};

const pickFirstDefined = (...values) => values.find((value) => value !== undefined);

const toTextOrNull = (value) => {
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text || null;
};

const toCoordinateOrNull = (value) => {
  const parsed = toNumberOrNull(value);
  return parsed === null ? null : parsed;
};

const buildGeographicPayload = (data) => ({
  latitude: toCoordinateOrNull(pickFirstDefined(data.latitude, data.lat)),
  longitude: toCoordinateOrNull(pickFirstDefined(data.longitude, data.lng, data.lon)),
  cidade: toTextOrNull(data.cidade),
  bairro: toTextOrNull(data.bairro),
  regiao: toTextOrNull(data.regiao),
  estado: toTextOrNull(data.estado),
  cep: toTextOrNull(data.cep),
  enderecoFormatado: toTextOrNull(pickFirstDefined(data.enderecoFormatado, data.endereco_formatado))
});

const mergeGeographicPayload = async (data) => {
  const manualGeo = buildGeographicPayload(data);
  const hasCoordinates = manualGeo.latitude !== null && manualGeo.longitude !== null;
  const missingReadableFields =
    !manualGeo.cidade || !manualGeo.bairro || !manualGeo.regiao || !manualGeo.estado || !manualGeo.enderecoFormatado;

  const geocoded =
    hasCoordinates && missingReadableFields
      ? await reverseGeocodingService.resolve({
          latitude: manualGeo.latitude,
          longitude: manualGeo.longitude
        })
      : null;

  return {
    latitude: manualGeo.latitude ?? geocoded?.latitude ?? null,
    longitude: manualGeo.longitude ?? geocoded?.longitude ?? null,
    cidade: manualGeo.cidade ?? geocoded?.cidade ?? null,
    bairro: manualGeo.bairro ?? geocoded?.bairro ?? null,
    regiao: manualGeo.regiao ?? geocoded?.regiao ?? null,
    estado: manualGeo.estado ?? geocoded?.estado ?? null,
    cep: manualGeo.cep ?? geocoded?.cep ?? null,
    enderecoFormatado: manualGeo.enderecoFormatado ?? geocoded?.enderecoFormatado ?? null
  };
};

const validateCreatePayload = (data) => {
  const usuarioId = toPositiveInt(data?.usuarioId);
  if (!usuarioId) {
    throw createValidationError('Usuario da venda nao identificado. Faca login novamente.');
  }

  if (!Array.isArray(data?.itens) || data.itens.length === 0) {
    throw createValidationError('Adicione pelo menos um item para finalizar a venda.');
  }

  for (const item of data.itens) {
    const produtoId = toPositiveInt(item.produtoId || item.produto_id);
    const quantidade = toPositiveInt(item.quantidade);
    const precoUnitario = toNumberOrNull(item.precoUnitario || item.preco_unitario);

    if (!produtoId) {
      throw createValidationError('Item com produto invalido.');
    }

    if (!quantidade) {
      throw createValidationError('Quantidade do item deve ser maior que zero.');
    }

    if (precoUnitario === null || precoUnitario < 0) {
      throw createValidationError('Preco unitario do item invalido.');
    }
  }
};

const buildVendaPayload = async (data, status = 'paga') => {
  validateCreatePayload(data);

  const {
    usuarioId,
    itens,
    desconto = 0,
    formaPagamento,
    forma_pagamento,
    localVenda,
    local_venda,
    observacoes
  } = data;

  const descontoNumerico = toNumberOrNull(desconto) ?? 0;
  if (descontoNumerico < 0) {
    throw createValidationError('Desconto nao pode ser negativo.');
  }

  let subtotal = 0;
  const itensComSubtotal = itens.map((item) => {
    const precoUnitario = Number(item.precoUnitario || item.preco_unitario);
    const quantidade = Number(item.quantidade);
    const subtotalItem = quantidade * precoUnitario;
    subtotal += subtotalItem;
    return { ...item, precoUnitario, subtotal: subtotalItem };
  });

  const total = subtotal - descontoNumerico;
  if (total < 0) {
    throw createValidationError('Total nao pode ser negativo.');
  }

  const localVendaFinal = String(localVenda || local_venda || '').trim();
  const geographicPayload = await mergeGeographicPayload(data);

  return {
    usuarioId: Number(usuarioId),
    subtotal,
    total,
    desconto: descontoNumerico,
    formaPagamento: formaPagamento || forma_pagamento || status,
    localVenda: localVendaFinal || null,
    ...geographicPayload,
    observacoes,
    status,
    itens: itensComSubtotal
  };
};

export const vendaService = {
  getAll: async () => vendaRepository.findAll(),

  getById: async (id) => {
    const venda = await vendaRepository.findById(id);
    if (!venda) throw new Error('Venda nao encontrada');
    return venda;
  },

  create: async (data) => {
    const vendaPayload = await buildVendaPayload(data, 'paga');

    for (const item of vendaPayload.itens) {
      const produto = await produtoService.getById(item.produtoId || item.produto_id);
      const quantidade = Number(item.quantidade);
      if (produto.estoqueAtual < quantidade) {
        throw createValidationError(
          `Produto ${produto.nome} nao tem estoque suficiente. Estoque atual: ${produto.estoqueAtual}`
        );
      }
    }

    const venda = await vendaRepository.create(vendaPayload);

    for (const item of vendaPayload.itens) {
      await estoqueRepository.registrarMovimentacao(
        item.produtoId || item.produto_id,
        'saida',
        item.quantidade,
        `Venda #${venda.id}`,
        `VENDA-${venda.id}`,
        Number(vendaPayload.usuarioId)
      );
    }

    return venda;
  },

  getDailyStats: async () => {
    const vendas = await vendaRepository.findToday();
    return { quantidade: vendas.length, total: vendas.reduce((sum, venda) => sum + venda.total, 0) };
  },

  getMonthlyStats: async () => {
    const vendas = await vendaRepository.findMonth();
    return { quantidade: vendas.length, total: vendas.reduce((sum, venda) => sum + venda.total, 0) };
  },

  getWeeklyLocationReport: async () => vendaRepository.getWeeklySalesByLocation(),

  getDashboardStats: async () => ({
    totalDia: await vendaRepository.getDailyTotal(),
    totalMes: await vendaRepository.getMonthlyTotal(),
    totalGeral: await vendaRepository.getGeneralTotal(),
    quantidadeVendas: await vendaRepository.getCount(),
    produtosBaixoEstoque: await produtoService.getLowStock(),
    produtosMaisVendidos: await produtoService.getTopSelling(5),
    ultimasVendas: (await vendaRepository.findAll()).slice(0, 10)
  })
};
