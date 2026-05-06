import { clienteService } from '../services/clienteService.js';

export const clienteController = {
  getAll: async (req, res, next) => {
    try {
      const clientes = await clienteService.getAll();
      res.json(clientes);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const cliente = await clienteService.getById(id);
      res.json(cliente);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const cliente = await clienteService.create(req.body);
      res.status(201).json(cliente);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const cliente = await clienteService.update(id, req.body);
      res.json(cliente);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await clienteService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};
