import prisma from '../config/database.js';
import { serializeProduto } from '../utils/serializers.js';

const pickFirstDefined = (...values) => values.find((value) => value !== undefined);

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

const toNumberOrNull = (value) => {
  if (value === undefined || value === null || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toIntegerOrNull = (value) => {
  const parsed = toNumberOrNull(value);
  return parsed === null ? null : Math.trunc(parsed);
};

const toNumberOrDefault = (value, fallback = 0) => {
  const parsed = toNumberOrNull(value);
  return parsed === null ? fallback : parsed;
};

const toIntegerOrDefault = (value, fallback = 0) => {
  const parsed = toIntegerOrNull(value);
  return parsed === null ? fallback : parsed;
};

const normalizeCreateData = (data) => ({
  nome: data.nome?.trim(),
  descricao: data.descricao?.trim() || null,
  sku: data.sku ? String(data.sku).trim() : `SKU${Date.now()}`,
  codigoBarras: pickFirstDefined(data.codigoBarras, data.codigo_barras) || null,
  categoriaId: toIntegerOrNull(pickFirstDefined(data.categoriaId, data.categoria_id)),
  fornecedorId: toIntegerOrNull(pickFirstDefined(data.fornecedorId, data.fornecedor_id)),
  precoCusto: toNumberOrDefault(pickFirstDefined(data.preco_custo, data.precoCusto), 0),
  precoVenda: toNumberOrDefault(pickFirstDefined(data.preco_venda, data.precoVenda), 0),
  estoqueAtual: toIntegerOrDefault(
    pickFirstDefined(data.estoque_atual, data.estoqueAtual, data.estoque),
    0
  ),
  estoqueMinimo: toIntegerOrDefault(pickFirstDefined(data.estoque_minimo, data.estoqueMinimo), 0),
  unidadeMedida: (pickFirstDefined(data.unidade_medida, data.unidadeMedida) || 'UN').trim(),
  status: data.status || 'ativo'
});

const normalizeUpdateData = (data) => {
  const payload = {};

  if (hasOwn(data, 'nome')) payload.nome = data.nome?.trim();
  if (hasOwn(data, 'descricao')) payload.descricao = data.descricao?.trim() || null;
  if (hasOwn(data, 'sku') && data.sku) payload.sku = String(data.sku).trim();

  if (hasOwn(data, 'codigoBarras') || hasOwn(data, 'codigo_barras')) {
    payload.codigoBarras = pickFirstDefined(data.codigoBarras, data.codigo_barras) || null;
  }

  if (hasOwn(data, 'categoriaId') || hasOwn(data, 'categoria_id')) {
    payload.categoriaId = toIntegerOrNull(pickFirstDefined(data.categoriaId, data.categoria_id));
  }

  if (hasOwn(data, 'fornecedorId') || hasOwn(data, 'fornecedor_id')) {
    payload.fornecedorId = toIntegerOrNull(pickFirstDefined(data.fornecedorId, data.fornecedor_id));
  }

  if (hasOwn(data, 'preco_custo') || hasOwn(data, 'precoCusto')) {
    payload.precoCusto = toNumberOrDefault(pickFirstDefined(data.preco_custo, data.precoCusto), 0);
  }

  if (hasOwn(data, 'preco_venda') || hasOwn(data, 'precoVenda')) {
    payload.precoVenda = toNumberOrDefault(pickFirstDefined(data.preco_venda, data.precoVenda), 0);
  }

  if (hasOwn(data, 'estoque_atual') || hasOwn(data, 'estoqueAtual') || hasOwn(data, 'estoque')) {
    payload.estoqueAtual = toIntegerOrDefault(
      pickFirstDefined(data.estoque_atual, data.estoqueAtual, data.estoque),
      0
    );
  }

  if (hasOwn(data, 'estoque_minimo') || hasOwn(data, 'estoqueMinimo')) {
    payload.estoqueMinimo = toIntegerOrDefault(
      pickFirstDefined(data.estoque_minimo, data.estoqueMinimo),
      0
    );
  }

  if (hasOwn(data, 'unidade_medida') || hasOwn(data, 'unidadeMedida')) {
    payload.unidadeMedida = (
      pickFirstDefined(data.unidade_medida, data.unidadeMedida) || 'UN'
    ).trim();
  }

  if (hasOwn(data, 'status')) payload.status = data.status;

  return payload;
};

export const produtoRepository = {
  findAll: async () =>
    (
      await prisma.produto.findMany({
        where: { status: 'ativo' },
        include: { categoria: true, fornecedor: true },
        orderBy: { nome: 'asc' }
      })
    ).map(serializeProduto),

  findById: async (id) => {
    const produto = await prisma.produto.findUnique({
      where: { id: Number(id) },
      include: { categoria: true, fornecedor: true }
    });
    return produto ? serializeProduto(produto) : null;
  },

  findLowStock: async () =>
    (
      await prisma.produto.findMany({
        where: {
          status: 'ativo',
          estoqueAtual: { lte: prisma.produto.fields.estoqueMinimo }
        },
        include: { categoria: true },
        orderBy: { nome: 'asc' }
      })
    ).map(serializeProduto),

  findTopSelling: async (limit = 10) => {
    const produtosAgrupados = await prisma.vendaItem.groupBy({
      by: ['produtoId'],
      _sum: { quantidade: true },
      orderBy: { _sum: { quantidade: 'desc' } },
      take: limit
    });

    const produtoIds = produtosAgrupados.map((produto) => produto.produtoId);
    if (produtoIds.length === 0) return [];

    const produtosDetalhes = await prisma.produto.findMany({
      where: { id: { in: produtoIds } },
      include: { categoria: true, fornecedor: true }
    });

    const detalhesPorId = new Map(produtosDetalhes.map((produto) => [produto.id, produto]));

    return produtosAgrupados
      .map((item) => {
        const produto = detalhesPorId.get(item.produtoId);
        if (!produto) return null;

        return {
          ...serializeProduto(produto),
          totalVendido: item._sum.quantidade || 0
        };
      })
      .filter(Boolean);
  },

  create: async (data) =>
    serializeProduto(
      await prisma.produto.create({
        data: normalizeCreateData(data),
        include: { categoria: true, fornecedor: true }
      })
    ),

  update: async (id, data) =>
    serializeProduto(
      await prisma.produto.update({
        where: { id: Number(id) },
        data: normalizeUpdateData(data),
        include: { categoria: true, fornecedor: true }
      })
    ),

  updateStock: async (id, quantidade) =>
    serializeProduto(
      await prisma.produto.update({
        where: { id: Number(id) },
        data: { estoqueAtual: toIntegerOrDefault(quantidade, 0) },
        include: { categoria: true, fornecedor: true }
      })
    ),

  softDelete: async (id) =>
    serializeProduto(
      await prisma.produto.update({
        where: { id: Number(id) },
        data: { status: 'inativo' },
        include: { categoria: true, fornecedor: true }
      })
    )
};
