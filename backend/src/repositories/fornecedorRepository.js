import prisma from '../config/database.js';
import { serializeFornecedor } from '../utils/serializers.js';

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
  findAll: async () =>
    (
      await prisma.fornecedor.findMany({
        where: { status: 'ativo' },
        include: { produtos: true },
        orderBy: { razaoSocial: 'asc' }
      })
    ).map(serializeFornecedor),

  findById: async (id) => {
    const fornecedor = await prisma.fornecedor.findUnique({
      where: { id: Number(id) },
      include: { produtos: true }
    });
    return fornecedor ? serializeFornecedor(fornecedor) : null;
  },

  create: async (data) => serializeFornecedor(await prisma.fornecedor.create({ data: normalize(data) })),

  update: async (id, data) =>
    serializeFornecedor(await prisma.fornecedor.update({ where: { id: Number(id) }, data: normalize(data) })),

  delete: async (id) =>
    serializeFornecedor(await prisma.fornecedor.update({ where: { id: Number(id) }, data: { status: 'inativo' } }))
};
