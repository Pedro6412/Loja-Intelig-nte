import { usuarioRepository } from '../repositories/usuarioRepository.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';

const createAuthError = (message, statusCode = 401) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const authService = {
  login: async (email, senha) => {
    if (!email || !senha) {
      throw createAuthError('Email e senha sao obrigatorios', 400);
    }

    const usuario = await usuarioRepository.findByEmail(email);
    if (!usuario || usuario.status !== 'ativo') {
      throw createAuthError('Credenciais invalidas', 401);
    }

    // Prisma retorna senhaHash (camelCase). Mantemos fallback para compatibilidade.
    const senhaHash = usuario.senhaHash || usuario.senha_hash;
    if (!senhaHash) {
      throw createAuthError('Usuario sem senha cadastrada', 500);
    }

    const senhaValida = await comparePassword(senha, senhaHash);
    if (!senhaValida) {
      throw createAuthError('Credenciais invalidas', 401);
    }

    const token = generateToken(usuario.id, usuario.perfil);

    return {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
        status: usuario.status
      }
    };
  },

  register: async (data) => {
    if (!data?.nome || !data?.email || !data?.senha) {
      throw createAuthError('Nome, email e senha sao obrigatorios', 400);
    }

    const existingUser = await usuarioRepository.findByEmail(data.email);
    if (existingUser) {
      throw createAuthError('Email ja cadastrado', 409);
    }

    const senhaHash = await hashPassword(data.senha);
    const usuario = await usuarioRepository.create({ ...data, senhaHash });
    const { senhaHash: _senhaHash, ...usuarioSemSenha } = usuario;
    return usuarioSemSenha;
  }
};
