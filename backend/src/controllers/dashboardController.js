import { dashboardService } from '../services/dashboardService.js';

export const dashboardController = {
  getStats: async (req, res, next) => {
    try {
      const stats = await dashboardService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
};
