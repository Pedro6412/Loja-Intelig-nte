import { assistantIAService } from '../services/assistantIAService.js';

export const assistantIAController = {
  chat: async (req, res, next) => {
    try {
      const result = await assistantIAService.chat({
        message: req.body?.message,
        history: req.body?.history
      });

      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
