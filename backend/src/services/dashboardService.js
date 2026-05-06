import { vendaService } from './vendaService.js';
import { produtoService } from './produtoService.js';

export const dashboardService = {
  getStats: async () => {
    return vendaService.getDashboardStats();
  }
};
