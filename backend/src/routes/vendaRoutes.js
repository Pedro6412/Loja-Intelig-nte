import express from 'express';
import { vendaController } from '../controllers/vendaController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats/daily', authMiddleware, vendaController.getDailyStats);
router.get('/stats/monthly', authMiddleware, vendaController.getMonthlyStats);
router.get('/relatorios/semana-regioes', authMiddleware, vendaController.getWeeklyLocationReport);
router.get('/', authMiddleware, vendaController.getAll);
router.get('/:id', authMiddleware, vendaController.getById);
router.post('/', authMiddleware, vendaController.create);

export default router;
