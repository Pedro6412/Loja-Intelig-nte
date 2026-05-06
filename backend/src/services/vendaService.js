import { vendaRepository } from '../repositories/vendaRepository.js';
import { estoqueRepository } from '../repositories/estoqueRepository.js';
import { produtoService } from './produtoService.js';

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

export const vendaService = {
  getAll: async () => vendaRepository.findAll(),

  getById: async (id) => {
    const venda = await vendaRepository.findById(id);
    if (!venda) throw new Error('Venda nao encontrada');
    return venda;
  },

  create: async (data) => {
    validateCreatePayload(data);

    const {
      clienteId,
      usuarioId,
      itens,
      desconto = 0,
      formaPagamento,
      forma_pagamento,
      observacoes
    } = data;

    const descontoNumerico = toNumberOrNull(desconto) ?? 0;
    if (descontoNumerico < 0) {
      throw createValidationError('Desconto nao pode ser negativo.');
    }

    for (const item of itens) {
      const produto = await produtoService.getById(item.produtoId || item.produto_id);
      const quantidade = Number(item.quantidade);
      if (produto.estoqueAtual < quantidade) {
        throw createValidationError(
          `Produto ${produto.nome} nao tem estoque suficiente. Estoque atual: ${produto.estoqueAtual}`
        );
      }
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
      throw createValidationError('Total da venda nao pode ser negativo.');
    }

    const venda = await vendaRepository.create({
      clienteId,
      usuarioId: Number(usuarioId),
      subtotal,
      total,
      desconto: descontoNumerico,
      formaPagamento: formaPagamento || forma_pagamento,
      observacoes,
      status: 'paga',
      itens: itensComSubtotal
    });

    for (const item of itensComSubtotal) {
      await estoqueRepository.registrarMovimentacao(
        item.produtoId || item.produto_id,
        'saida',
        item.quantidade,
        `Venda #${venda.id}`,
        `VENDA-${venda.id}`,
        Number(usuarioId)
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

  getDashboardStats: async () => ({
    totalDia: await vendaRepository.getDailyTotal(),
    totalMes: await vendaRepository.getMonthlyTotal(),
    quantidadeVendas: await vendaRepository.getCount(),
    produtosBaixoEstoque: await produtoService.getLowStock(),
    produtosMaisVendidos: await produtoService.getTopSelling(5),
    ultimasVendas: (await vendaRepository.findAll()).slice(0, 10)
  })
};
