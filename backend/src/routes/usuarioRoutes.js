import express from 'express';
import { usuarioController } from '../controllers/usuarioController.js';
import { authMiddleware, gerenteAdminMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, gerenteAdminMiddleware, usuarioController.getAll);
router.get('/:id', authMiddleware, gerenteAdminMiddleware, usuarioController.getById);
router.post('/', authMiddleware, gerenteAdminMiddleware, usuarioController.create);
router.put('/:id', authMiddleware, gerenteAdminMiddleware, usuarioController.update);
router.delete('/:id', authMiddleware, gerenteAdminMiddleware, usuarioController.delete);

export default router;
