import { categoriaRepository } from '../repositories/categoriaRepository.js';

const validateCategoria = (data) => {
  if (!data?.nome?.trim()) {
    const error = new Error('Nome da categoria e obrigatorio');
    error.name = 'ValidationError';
    throw error;
  }
};

export const categoriaService = {
  getAll: async () => categoriaRepository.findAll(),

  getById: async (id) => {
    const categoria = await categoriaRepository.findById(id);
    if (!categoria) throw new Error('Categoria nao encontrada');
    return categoria;
  },

  create: async (data) => {
    validateCategoria(data);
    return categoriaRepository.create(data);
  },

  update: async (id, data) => {
    const categoria = await categoriaRepository.findById(id);
    if (!categoria) throw new Error('Categoria nao encontrada');
    validateCategoria(data);
    return categoriaRepository.update(id, data);
  },

  delete: async (id) => {
    const categoria = await categoriaRepository.findById(id);
    if (!categoria) throw new Error('Categoria nao encontrada');
    return categoriaRepository.delete(id);
  }
};
