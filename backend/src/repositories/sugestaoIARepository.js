import prisma from '../config/database.js';
import { serializeSugestao } from '../utils/serializers.js';

const normalize = (data) => ({
  produtoNome: (data.produto_nome || data.produtoNome || '').trim(),
  categoriaId: data.categoria_id || data.categoriaId || data.categoria?.id || null,
  nivelTendencia: (data.nivel_tendencia || data.nivelTendencia || '').trim(),
  justificativa: (data.justificativa || '').trim(),
  fonteDados: data.fonte_dados || data.fonteDados || null,
  score: data.score == null ? null : Number(data.score),
  status: data.status || 'pendente'
});

export const sugestaoIARepository = {
  findAll: async () => (await prisma.sugestaoIA.findMany({ include: { categoria: true }, orderBy: { score: 'desc' } })).map(serializeSugestao),
  findByStatus: async (status) => (await prisma.sugestaoIA.findMany({ where: { status }, include: { categoria: true }, orderBy: { score: 'desc' } })).map(serializeSugestao),
  findById: async (id) => { const s = await prisma.sugestaoIA.findUnique({ where: { id: Number(id) }, include: { categoria: true } }); return s ? serializeSugestao(s) : null; },
  create: async (data) =>
    serializeSugestao(
      await prisma.sugestaoIA.create({
        data: normalize(data),
        include: { categoria: true }
      })
    ),
  update: async (id, data) =>
    serializeSugestao(
      await prisma.sugestaoIA.update({
        where: { id: Number(id) },
        data: normalize(data),
        include: { categoria: true }
      })
    ),
  aprovar: async (id) =>
    serializeSugestao(
      await prisma.sugestaoIA.update({
        where: { id: Number(id) },
        data: { status: 'aprovada' },
        include: { categoria: true }
      })
    ),
  rejeitar: async (id) =>
    serializeSugestao(
      await prisma.sugestaoIA.update({
        where: { id: Number(id) },
        data: { status: 'rejeitada' },
        include: { categoria: true }
      })
    )
};
