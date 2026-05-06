import { usuarioService } from '../services/usuarioService.js';

export const usuarioController = {
  getAll: async (req, res, next) => {
    try {
      const usuarios = await usuarioService.getAll();
      res.json(usuarios);
    } catch (error) {
      next(error);
    }
  },

  getById: async (req, res, next) => {
    try {
      const { id } = req.params;
      const usuario = await usuarioService.getById(id);
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const usuario = await usuarioService.create(req.body);
      res.status(201).json(usuario);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const usuario = await usuarioService.update(id, req.body);
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;
      await usuarioService.delete(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
};
