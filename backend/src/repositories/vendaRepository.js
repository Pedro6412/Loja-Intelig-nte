import prisma from '../config/database.js';
import { serializeVenda } from '../utils/serializers.js';

const includeVenda = {
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
      usuarioId: Number(data.usuarioId),
      subtotal: Number(data.subtotal),
      desconto: Number(data.desconto || 0),
      total: Number(data.total),
      formaPagamento: data.formaPagamento || data.forma_pagamento,
      localVenda: data.localVenda || data.local_venda || null,
      latitude: data.latitude ?? null,
      longitude: data.longitude ?? null,
      cidade: data.cidade || null,
      bairro: data.bairro || null,
      regiao: data.regiao || null,
      estado: data.estado || null,
      cep: data.cep || null,
      enderecoFormatado: data.enderecoFormatado || data.endereco_formatado || null,
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

  update: async (id, data) => serializeVenda(await prisma.venda.update({
    where: { id: Number(id) },
    data,
    include: includeVenda
  })),

  getDailyTotal: async () => { const vendas = await vendaRepository.findToday(); return vendas.reduce((s,v)=>s+v.total,0); },
  getMonthlyTotal: async () => { const vendas = await vendaRepository.findMonth(); return vendas.reduce((s,v)=>s+v.total,0); },
  getGeneralTotal: async () => {
    const result = await prisma.venda.aggregate({
      where: { status: 'paga' },
      _sum: { total: true }
    });
    return Number(result._sum.total || 0);
  },
  getCount: async () => prisma.venda.count({ where: { status: 'paga' } }),

  getWeeklySalesByLocation: async () => {
    const today = new Date();
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + mondayOffset);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const vendas = await prisma.venda.findMany({
      where: {
        status: 'paga',
        dataVenda: { gte: weekStart, lt: weekEnd }
      },
      include: includeVenda,
      orderBy: { dataVenda: 'desc' }
    });

    const regioesMap = new Map();

    for (const venda of vendas) {
      const vendaSerializada = serializeVenda(venda);
      const local =
        vendaSerializada.regiao?.trim() ||
        vendaSerializada.bairro?.trim() ||
        vendaSerializada.cidade?.trim() ||
        vendaSerializada.localVenda?.trim() ||
        'Local nao informado';

      if (!regioesMap.has(local)) {
        regioesMap.set(local, {
          local,
          quantidadeVendas: 0,
          totalVendido: 0,
          produtosMap: new Map()
        });
      }

      const regiao = regioesMap.get(local);
      regiao.quantidadeVendas += 1;
      regiao.totalVendido += Number(vendaSerializada.total || 0);

      for (const item of vendaSerializada.vendaItens) {
        const produtoId = item.produtoId;
        const produtoNome = item.produto?.nome || 'Produto removido';
        if (!regiao.produtosMap.has(produtoId)) {
          regiao.produtosMap.set(produtoId, {
            produtoId,
            produtoNome,
            quantidade: 0,
            totalVendido: 0
          });
        }

        const produto = regiao.produtosMap.get(produtoId);
        produto.quantidade += Number(item.quantidade || 0);
        produto.totalVendido += Number(item.subtotal || 0);
      }
    }

    const regioes = Array.from(regioesMap.values())
      .map((regiao) => {
        const produtos = Array.from(regiao.produtosMap.values()).sort(
          (a, b) => b.quantidade - a.quantidade
        );
        const itemMaisVendido = produtos[0] || null;
        const { produtosMap, ...rest } = regiao;

        return {
          ...rest,
          itemMaisVendido,
          produtos
        };
      })
      .sort((a, b) => b.totalVendido - a.totalVendido);

    return {
      semanaInicio: weekStart,
      semanaFim: weekEnd,
      totalVendas: vendas.length,
      totalFaturado: regioes.reduce((sum, regiao) => sum + regiao.totalVendido, 0),
      melhorRegiao: regioes[0] || null,
      regioes
    };
  }
};
