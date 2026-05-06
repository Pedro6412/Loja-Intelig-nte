import prisma from '../config/database.js';

const selectBase = { id: true, nome: true, email: true, perfil: true, status: true, criadoEm: true, atualizadoEm: true };

export const usuarioRepository = {
  findAll: async () => prisma.usuario.findMany({ where: { status: 'ativo' }, select: selectBase, orderBy: { nome: 'asc' } }),
  findById: async (id) => prisma.usuario.findUnique({ where: { id: Number(id) }, select: selectBase }),
  findByEmail: async (email) => prisma.usuario.findUnique({ where: { email } }),
  create: async (data) => prisma.usuario.create({ data: { nome: data.nome, email: data.email, senhaHash: data.senhaHash, perfil: data.perfil || 'vendedor', status: data.status || 'ativo' } }),
  update: async (id, data) => prisma.usuario.update({ where: { id: Number(id) }, data: { ...('senhaHash' in data ? { senhaHash: data.senhaHash } : {}), ...('nome' in data ? { nome: data.nome } : {}), ...('email' in data ? { email: data.email } : {}), ...('perfil' in data ? { perfil: data.perfil } : {}), ...('status' in data ? { status: data.status } : {}) } }),
  softDelete: async (id) => prisma.usuario.update({ where: { id: Number(id) }, data: { status: 'inativo' } })
};
