import { categoriaService } from '../services/categoriaService.js';

export const categoriaController = {
  getAll: async (req, res, next) => {
    try {
      const categorias = await categoriaService.getAll();
      res.json(categorias);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const categoria = await categoriaService.getById(id);
      res.json(categoria);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const categoria = await categoriaService.create(req.body);
      res.status(201).json(categoria);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const categoria = await categoriaService.update(id, req.body);
      res.json(categoria);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await categoriaService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};
