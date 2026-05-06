import { clienteRepository } from '../repositories/clienteRepository.js';

export const clienteService = {
  getAll: async () => {
    return clienteRepository.findAll();
  },

  getById: async (id) => {
    const cliente = await clienteRepository.findById(id);
    if (!cliente) throw new Error('Cliente não encontrado');
    return cliente;
  },

  create: async (data) => {
    return clienteRepository.create(data);
  },

  update: async (id, data) => {
    const cliente = await clienteRepository.findById(id);
    if (!cliente) throw new Error('Cliente não encontrado');
    return clienteRepository.update(id, data);
  },

  delete: async (id) => {
    const cliente = await clienteRepository.findById(id);
    if (!cliente) throw new Error('Cliente não encontrado');
    return clienteRepository.softDelete(id);
  }
};
