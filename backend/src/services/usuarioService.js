import { usuarioRepository } from '../repositories/usuarioRepository.js';
import { hashPassword } from '../utils/password.js';

export const usuarioService = {
  getAll: async () => {
    return usuarioRepository.findAll();
  },

  getById: async (id) => {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) throw new Error('Usuário não encontrado');
    return usuario;
  },

  create: async (data) => {
    const existingUser = await usuarioRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    const hashedPassword = await hashPassword(data.senha);
    const usuario = await usuarioRepository.create({
      ...data,
      senhaHash: hashedPassword
    });

    const { senhaHash, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  },

  update: async (id, data) => {
    const usuario = await usuarioRepository.findById(id);
    if (!usuario) throw new Error('Usuário não encontrado');

    if (data.email && data.email !== usuario.email) {
      const existingUser = await usuarioRepository.findByEmail(data.email);
      if (existingUser) {
        throw new Error('Email já cadastrado');
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
    if (!usuario) throw new Error('Usuário não encontrado');
    return usuarioRepository.softDelete(id);
  }
};
