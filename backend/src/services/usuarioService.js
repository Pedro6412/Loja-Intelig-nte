import { usuarioRepository } from '../repositories/usuarioRepository.js';
import { hashPassword } from '../utils/password.js';

const createValidationError = (message) => {
  const error = new Error(message);
  error.name = 'ValidationError';
  return error;
};

const validatePerfil = (perfil) => {
  if (!['admin', 'vendedor'].includes(perfil)) {
    throw createValidationError('Perfil deve ser ADM ou Vendedor');
  }
};

export const usuarioService = {
  getAll: async () => usuarioRepository.findAll(),

  getById: async (id) => {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) throw new Error('Usuario nao encontrado');
    return usuario;
  },

  create: async (data) => {
    if (!data?.nome?.trim() || !data?.email?.trim() || !data?.senha) {
      throw createValidationError('Nome completo, email e senha sao obrigatorios');
    }

    validatePerfil(data.perfil || 'vendedor');

    const existingUser = await usuarioRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email ja cadastrado');
    }

    const hashedPassword = await hashPassword(data.senha);
    const usuario = await usuarioRepository.create({
      ...data,
      perfil: data.perfil || 'vendedor',
      senhaHash: hashedPassword
    });

    const { senhaHash, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  },

  update: async (id, data) => {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) throw new Error('Usuario nao encontrado');

    if (data.perfil) validatePerfil(data.perfil);

    if (data.email && data.email !== usuario.email) {
      const existingUser = await usuarioRepository.findByEmail(data.email);
      if (existingUser) {
        throw new Error('Email ja cadastrado');
      }
    }

    if (data.senha) {
      data.senhaHash = await hashPassword(data.senha);
      delete data.senha;
    }

    const updated = await usuarioRepository.update(id, data);
    const { senhaHash, ...usuarioSemSenha } = updated;
    return usuarioSemSenha;
  },

  delete: async (id) => {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) throw new Error('Usuario nao encontrado');
    return usuarioRepository.softDelete(id);
  }
};
