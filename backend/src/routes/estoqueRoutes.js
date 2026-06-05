import express from 'express';
import { estoqueController } from '../controllers/estoqueController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, estoqueController.getAll);
router.get('/produto/:produtoId', authMiddleware, estoqueController.getByProduto);
router.post('/entrada', authMiddleware, estoqueController.registrarEntrada);
router.post('/saida', authMiddleware, estoqueController.registrarSaida);
router.post('/ajuste', authMiddleware, estoqueController.ajustarEstoque);

export default router;
