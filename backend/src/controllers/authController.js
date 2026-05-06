import { authService } from '../services/authService.js';

export const authController = {
  login: async (req, res, next) => {
    try {
      const { email, senha } = req.body;
      const result = await authService.login(email, senha);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  register: async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  },

  me: async (req, res, next) => {
    try {
      res.json({
        userId: req.userId,
        perfil: req.userPerfil
      });
    } catch (error) {
      next(error);
    }
  }
};
