import express from 'express';
import { sugestaoIAController } from '../controllers/sugestaoIAController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, sugestaoIAController.getAll);
router.get('/status/:status', authMiddleware, sugestaoIAController.getByStatus);
router.get('/:id', authMiddleware, sugestaoIAController.getById);
router.post('/', authMiddleware, sugestaoIAController.create);
router.post('/gerar', authMiddleware, sugestaoIAController.gerarSugestoes);
router.put('/:id/aprovar', authMiddleware, sugestaoIAController.aprovar);
router.put('/:id/rejeitar', authMiddleware, sugestaoIAController.rejeitar);

export default router;
