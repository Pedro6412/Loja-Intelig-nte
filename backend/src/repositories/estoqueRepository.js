import prisma from '../config/database.js';
import { serializeMovimentacao } from '../utils/serializers.js';

const withComputedStock = async (rows) => {
  const ids = [...new Set(rows.map(r => r.produtoId))];
  const produtos = await prisma.produto.findMany({ where: { id: { in: ids } }, select: { id: true, estoqueAtual: true } });
  const map = new Map(produtos.map(p => [p.id, p.estoqueAtual]));
  const sorted = [...rows].sort((a,b)=> new Date(b.criadoEm)-new Date(a.criadoEm));
  return sorted.map((mov) => {
    const atual = map.get(mov.produtoId) ?? null;
    let anterior = null, novo = atual;
    if (atual != null) {
      if (mov.tipo === 'entrada') anterior = atual - mov.quantidade;
      else if (mov.tipo === 'saida') anterior = atual + mov.quantidade;
      else anterior = atual;
      map.set(mov.produtoId, anterior);
    }
    return serializeMovimentacao(mov, anterior, novo);
  });
};

export const estoqueRepository = {
  findAll: async () => {
    const rows = await prisma.estoqueMovimentacao.findMany({
      include: { produto: true },
      orderBy: { criadoEm: 'desc' }
    });
    return withComputedStock(rows);
  },

  findByProduto: async (produtoId) => {
    const rows = await prisma.estoqueMovimentacao.findMany({
      where: { produtoId: Number(produtoId) },
      include: { produto: true },
      orderBy: { criadoEm: 'desc' }
    });
    return withComputedStock(rows);
  },

  create: async (data) =>
    serializeMovimentacao(
      await prisma.estoqueMovimentacao.create({ data, include: { produto: true } })
    ),

  registrarMovimentacao: async (produtoId, tipo, quantidade, motivo, referencia = null, usuarioId = null) => {
    const produto = await prisma.produto.findUnique({ where: { id: Number(produtoId) } });
    if (!produto) throw new Error('Produto não encontrado');

    const estoqueAnterior = produto.estoqueAtual;
    let estoqueNovo;

    if (tipo === 'entrada') estoqueNovo = estoqueAnterior + Number(quantidade);
    else if (tipo === 'saida') {
      estoqueNovo = estoqueAnterior - Number(quantidade);
      if (estoqueNovo < 0) throw new Error('Estoque insuficiente');
    } else estoqueNovo = Number(quantidade);

    await prisma.produto.update({ where: { id: Number(produtoId) }, data: { estoqueAtual: estoqueNovo } });

    const mov = await prisma.estoqueMovimentacao.create({
      data: {
        produtoId: Number(produtoId),
        tipo,
        quantidade: Number(quantidade),
        motivo: motivo || 'Movimentação de estoque',
        referencia,
        usuarioId: usuarioId ? Number(usuarioId) : null,
      },
      include: { produto: true }
    });
    return serializeMovimentacao(mov, estoqueAnterior, estoqueNovo);
  }
};
