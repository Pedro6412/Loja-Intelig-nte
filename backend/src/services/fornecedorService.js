import { fornecedorRepository } from '../repositories/fornecedorRepository.js';

export const fornecedorService = {
  getAll: async () => {
    return fornecedorRepository.findAll();
  },

  getById: async (id) => {
    const fornecedor = await fornecedorRepository.findById(id);
    if (!fornecedor) throw new Error('Fornecedor não encontrado');
    return fornecedor;
  },

  create: async (data) => {
    return fornecedorRepository.create(data);
  },

  update: async (id, data) => {
    const fornecedor = await fornecedorRepository.findById(id);
    if (!fornecedor) throw new Error('Fornecedor não encontrado');
    return fornecedorRepository.update(id, data);
  },

  delete: async (id) => {
    const fornecedor = await fornecedorRepository.findById(id);
    if (!fornecedor) throw new Error('Fornecedor não encontrado');
    return fornecedorRepository.delete(id);
  }
};
