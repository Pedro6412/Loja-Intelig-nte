import express from 'express';
import { assistantIAController } from '../controllers/assistantIAController.js';
import { adminMiddleware, authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/chat', authMiddleware, adminMiddleware, assistantIAController.chat);

export default router;
