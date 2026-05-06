import { vendaService } from '../services/vendaService.js';

export const vendaController = {
  getAll: async (req, res, next) => {
    try {
      const vendas = await vendaService.getAll();
      res.json(vendas);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const venda = await vendaService.getById(id);
      res.json(venda);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const venda = await vendaService.create({
        ...req.body,
        usuarioId: req.body.usuarioId || req.userId
      });
      res.status(201).json(venda);
    } catch (error) {
      next(error);
    }
  },

  getDailyStats: async (req, res, next) => {
    try {
      const stats = await vendaService.getDailyStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  getMonthlyStats: async (req, res, next) => {
    try {
      const stats = await vendaService.getMonthlyStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
};
