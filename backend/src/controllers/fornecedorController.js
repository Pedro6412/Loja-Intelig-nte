import { fornecedorService } from '../services/fornecedorService.js';

export const fornecedorController = {
  getAll: async (req, res, next) => {
    try {
      const fornecedores = await fornecedorService.getAll();
      res.json(fornecedores);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const fornecedor = await fornecedorService.getById(id);
      res.json(fornecedor);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const fornecedor = await fornecedorService.create(req.body);
      res.status(201).json(fornecedor);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const fornecedor = await fornecedorService.update(id, req.body);
      res.json(fornecedor);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await fornecedorService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};
