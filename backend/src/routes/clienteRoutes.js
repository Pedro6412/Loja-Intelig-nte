import express from 'express';
import { clienteController } from '../controllers/clienteController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, clienteController.getAll);
router.get('/:id', authMiddleware, clienteController.getById);
router.post('/', authMiddleware, clienteController.create);
router.put('/:id', authMiddleware, clienteController.update);
router.delete('/:id', authMiddleware, clienteController.delete);

export default router;
