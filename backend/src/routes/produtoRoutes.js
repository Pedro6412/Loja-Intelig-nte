import express from 'express';
import { produtoController } from '../controllers/produtoController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/low-stock/list', authMiddleware, produtoController.getLowStock);
router.get('/top-selling/list', authMiddleware, produtoController.getTopSelling);
router.get('/', authMiddleware, produtoController.getAll);
router.get('/:id', authMiddleware, produtoController.getById);
router.post('/', authMiddleware, produtoController.create);
router.put('/:id', authMiddleware, produtoController.update);
router.delete('/:id', authMiddleware, produtoController.delete);

export default router;
