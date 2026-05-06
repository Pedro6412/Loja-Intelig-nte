import { PrismaClient } from '@prisma/client';
import './env.js'; // Carrega a configuração de ambiente primeiro

const prisma = new PrismaClient();

export default prisma;
