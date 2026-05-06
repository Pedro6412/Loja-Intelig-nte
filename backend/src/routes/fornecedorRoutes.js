import express from 'express';
import { fornecedorController } from '../controllers/fornecedorController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, fornecedorController.getAll);
router.get('/:id', authMiddleware, fornecedorController.getById);
router.post('/', authMiddleware, fornecedorController.create);
router.put('/:id', authMiddleware, fornecedorController.update);
router.delete('/:id', authMiddleware, fornecedorController.delete);

export default router;
