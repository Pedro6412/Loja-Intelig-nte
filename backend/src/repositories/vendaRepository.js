import prisma from '../config/database.js';
import { serializeVenda } from '../utils/serializers.js';

const includeVenda = {
  cliente: true,
  vendaItens: { include: { produto: true } }
};

export const vendaRepository = {
  findAll: async () => (await prisma.venda.findMany({ include: includeVenda, orderBy: { dataVenda: 'desc' } })).map(serializeVenda),

  findById: async (id) => {
    const venda = await prisma.venda.findUnique({ where: { id: Number(id) }, include: includeVenda });
    return venda ? serializeVenda(venda) : null;
  },

  findToday: async () => {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);
    return (await prisma.venda.findMany({ where: { dataVenda: { gte: today, lt: tomorrow }, status: 'paga' }, include: includeVenda })).map(serializeVenda);
  },

  findMonth: async () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonth = new Date(now.getFullYear(), now.getMonth()+1, 1);
    return (await prisma.venda.findMany({ where: { dataVenda: { gte: firstDay, lt: nextMonth }, status: 'paga' }, include: includeVenda })).map(serializeVenda);
  },

  create: async (data) => serializeVenda(await prisma.venda.create({
    data: {
      clienteId: data.clienteId ? Number(data.clienteId) : null,
      usuarioId: Number(data.usuarioId),
      subtotal: Number(data.subtotal),
      desconto: Number(data.desconto || 0),
      total: Number(data.total),
      formaPagamento: data.formaPagamento || data.forma_pagamento,
      status: data.status || 'paga',
      observacoes: data.observacoes || null,
      vendaItens: {
        create: data.itens.map((item) => ({
          produtoId: Number(item.produtoId || item.produto_id),
          quantidade: Number(item.quantidade),
          precoUnitario: Number(item.precoUnitario || item.preco_unitario),
          desconto: Number(item.desconto || 0),
          subtotal: Number(item.subtotal),
        }))
      }
    },
    include: includeVenda
  })),

  update: async (id, data) => prisma.venda.update({ where: { id: Number(id) }, data }),

  getDailyTotal: async () => { const vendas = await vendaRepository.findToday(); return vendas.reduce((s,v)=>s+v.total,0); },
  getMonthlyTotal: async () => { const vendas = await vendaRepository.findMonth(); return vendas.reduce((s,v)=>s+v.total,0); },
  getCount: async () => prisma.venda.count({ where: { status: 'paga' } })
};
