import prisma from '../config/database.js';

export const categoriaRepository = {
  findAll: async () => prisma.categoria.findMany({
    include: { produtos: true },
    orderBy: { nome: 'asc' }
  }),

  findById: async (id) => prisma.categoria.findUnique({
    where: { id: Number(id) },
    include: { produtos: true }
  }),

  create: async (data) => prisma.categoria.create({
    data: { nome: data.nome, descricao: data.descricao || null }
  }),

  update: async (id, data) => prisma.categoria.update({
    where: { id: Number(id) },
    data: { nome: data.nome, descricao: data.descricao || null }
  }),

  delete: async (id) => prisma.categoria.delete({ where: { id: Number(id) } })
};
