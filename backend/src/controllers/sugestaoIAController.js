import { sugestaoIAService } from '../services/sugestaoIAService.js';

export const sugestaoIAController = {
  getAll: async (req, res, next) => {
    try {
      const sugestoes = await sugestaoIAService.getAll();
      res.json(sugestoes);
    } catch (error) {
      next(error);
    }
  },

  getByStatus: async (req, res, next) => {
    try {
      const { status } = req.params;
      const sugestoes = await sugestaoIAService.getByStatus(status);
      res.json(sugestoes);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const sugestao = await sugestaoIAService.getById(id);
      res.json(sugestao);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const sugestao = await sugestaoIAService.create(req.body);
      res.status(201).json(sugestao);
    } catch (error) {
      next(error);
    }
  },

  aprovar: async (req, res, next) => {
    try {
      const { id } = req.params;
      const sugestao = await sugestaoIAService.aprovar(id);
      res.json(sugestao);
    } catch (error) {
      next(error);
    }
  },

  rejeitar: async (req, res, next) => {
    try {
      const { id } = req.params;
      const sugestao = await sugestaoIAService.rejeitar(id);
      res.json(sugestao);
    } catch (error) {
      next(error);
    }
  },

  gerarSugestoes: async (req, res, next) => {
    try {
      const sugestoes = await sugestaoIAService.gerarSugestoes();
      res.status(201).json(sugestoes);
    } catch (error) {
      next(error);
    }
  }
};
