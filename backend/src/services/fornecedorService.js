import { fornecedorRepository } from '../repositories/fornecedorRepository.js';

const validateFornecedor = (data) => {
  if (!data?.nome?.trim() && !data?.razaoSocial?.trim() && !data?.razao_social?.trim()) {
    const error = new Error('Nome do fornecedor e obrigatorio');
    error.name = 'ValidationError';
    throw error;
  }
};

export const fornecedorService = {
  getAll: async () => fornecedorRepository.findAll(),

  getById: async (id) => {
    const fornecedor = await fornecedorRepository.findById(id);
    if (!fornecedor) throw new Error('Fornecedor nao encontrado');
    return fornecedor;
  },

  create: async (data) => {
    validateFornecedor(data);
    return fornecedorRepository.create(data);
  },

  update: async (id, data) => {
    const fornecedor = await fornecedorRepository.findById(id);
    if (!fornecedor) throw new Error('Fornecedor nao encontrado');
    validateFornecedor(data);
    return fornecedorRepository.update(id, data);
  },

  delete: async (id) => {
    const fornecedor = await fornecedorRepository.findById(id);
    if (!fornecedor) throw new Error('Fornecedor nao encontrado');
    return fornecedorRepository.delete(id);
  }
};
