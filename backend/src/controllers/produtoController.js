import { produtoService } from '../services/produtoService.js';

export const produtoController = {
  getAll: async (req, res, next) => {
    try {
      const produtos = await produtoService.getAll();
      res.json(produtos);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const produto = await produtoService.getById(id);
      res.json(produto);
    } catch (error) {
      next(error);
    }
  },

  getLowStock: async (req, res, next) => {
    try {
      const produtos = await produtoService.getLowStock();
      res.json(produtos);
    } catch (error) {
      next(error);
    }
  },

  getTopSelling: async (req, res, next) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const produtos = await produtoService.getTopSelling(limit);
      res.json(produtos);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const produto = await produtoService.create(req.body);
      res.status(201).json(produto);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const produto = await produtoService.update(id, req.body);
      res.json(produto);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await produtoService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};
