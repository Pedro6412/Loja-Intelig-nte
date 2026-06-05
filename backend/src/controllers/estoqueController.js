import { estoqueService } from '../services/estoqueService.js';

export const estoqueController = {
  getAll: async (req, res, next) => {
    try {
      const movimentacoes = await estoqueService.getAll();
      res.json(movimentacoes);
    } catch (error) {
      next(error);
    }
  },

  getByProduto: async (req, res, next) => {
    try {
      const { produtoId } = req.params;
      const movimentacoes = await estoqueService.getByProduto(produtoId);
      res.json(movimentacoes);
    } catch (error) {
      next(error);
    }
  },

  registrarEntrada: async (req, res, next) => {
    try {
      const { produtoId, quantidade, motivo } = req.body;
      const movimentacao = await estoqueService.registrarEntrada(produtoId, quantidade, motivo, req.userId);
      res.status(201).json(movimentacao);
    } catch (error) {
      next(error);
    }
  },

  registrarSaida: async (req, res, next) => {
    try {
      const { produtoId, quantidade, motivo } = req.body;
      const movimentacao = await estoqueService.registrarSaida(produtoId, quantidade, motivo, req.userId);
      res.status(201).json(movimentacao);
    } catch (error) {
      next(error);
    }
  },

  ajustarEstoque: async (req, res, next) => {
    try {
      const { produtoId, quantidade, motivo } = req.body;
      const movimentacao = await estoqueService.ajustarEstoque(produtoId, quantidade, motivo, req.userId);
      res.status(201).json(movimentacao);
    } catch (error) {
      next(error);
    }
  }
};
