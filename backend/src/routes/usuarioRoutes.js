import express from 'express';
import { usuarioController } from '../controllers/usuarioController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, adminMiddleware, usuarioController.getAll);
router.get('/:id', authMiddleware, adminMiddleware, usuarioController.getById);
router.post('/', authMiddleware, adminMiddleware, usuarioController.create);
router.put('/:id', authMiddleware, adminMiddleware, usuarioController.update);
router.delete('/:id', authMiddleware, adminMiddleware, usuarioController.delete);

export default router;
