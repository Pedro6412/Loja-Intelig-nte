import { categoriaRepository } from '../repositories/categoriaRepository.js';

export const categoriaService = {
  getAll: async () => {
    return categoriaRepository.findAll();
  },

  getById: async (id) => {
    const categoria = await categoriaRepository.findById(id);
    if (!categoria) throw new Error('Categoria não encontrada');
    return categoria;
  },

  create: async (data) => {
    return categoriaRepository.create(data);
  },

  update: async (id, data) => {
    const categoria = await categoriaRepository.findById(id);
    if (!categoria) throw new Error('Categoria não encontrada');
    return categoriaRepository.update(id, data);
  },

  delete: async (id) => {
    const categoria = await categoriaRepository.findById(id);
    if (!categoria) throw new Error('Categoria não encontrada');
    return categoriaRepository.delete(id);
  }
};
