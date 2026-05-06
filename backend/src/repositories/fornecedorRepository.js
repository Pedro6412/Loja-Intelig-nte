import prisma from '../config/database.js';

const normalize = (data) => ({
  razaoSocial: data.razaoSocial || data.razao_social || data.nome || '',
  nomeFantasia: data.nomeFantasia || data.nome_fantasia || data.nome || null,
  cnpj: data.cnpj || null,
  telefone: data.telefone || null,
  email: data.email || null,
  endereco: data.endereco || null,
  cidade: data.cidade || null,
  estado: data.estado || null,
  status: data.status || 'ativo'
});

export const fornecedorRepository = {
  findAll: async () => prisma.fornecedor.findMany({
    where: { status: 'ativo' },
    include: { produtos: true },
    orderBy: { razaoSocial: 'asc' }
  }),

  findById: async (id) => prisma.fornecedor.findUnique({
    where: { id: Number(id) },
    include: { produtos: true }
  }),

  create: async (data) => prisma.fornecedor.create({ data: normalize(data) }),

  update: async (id, data) => prisma.fornecedor.update({ where: { id: Number(id) }, data: normalize(data) }),

  delete: async (id) => prisma.fornecedor.update({ where: { id: Number(id) }, data: { status: 'inativo' } })
};
