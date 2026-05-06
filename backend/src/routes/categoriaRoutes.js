import express from 'express';
import { categoriaController } from '../controllers/categoriaController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, categoriaController.getAll);
router.get('/:id', authMiddleware, categoriaController.getById);
router.post('/', authMiddleware, categoriaController.create);
router.put('/:id', authMiddleware, categoriaController.update);
router.delete('/:id', authMiddleware, categoriaController.delete);

export default router;
