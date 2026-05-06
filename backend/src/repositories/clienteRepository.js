import prisma from '../config/database.js';

const normalize = (data) => ({
  nome: data.nome,
  cpf: data.cpf || null,
  telefone: data.telefone || null,
  email: data.email || null,
  endereco: data.endereco || null,
  cidade: data.cidade || null,
  estado: data.estado || null,
  status: data.status || 'ativo'
});

export const clienteRepository = {
  findAll: async () => prisma.cliente.findMany({
    where: { status: 'ativo' },
    include: { vendas: true },
    orderBy: { nome: 'asc' }
  }),

  findById: async (id) => prisma.cliente.findUnique({
    where: { id: Number(id) },
    include: { vendas: true }
  }),

  create: async (data) => prisma.cliente.create({ data: normalize(data) }),

  update: async (id, data) => prisma.cliente.update({ where: { id: Number(id) }, data: normalize(data) }),

  softDelete: async (id) => prisma.cliente.update({ where: { id: Number(id) }, data: { status: 'inativo' } })
};
