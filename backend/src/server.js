import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler.js';
import { testDatabaseConnection } from './config/testConnection.js';

import authRoutes from './routes/authRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import categoriaRoutes from './routes/categoriaRoutes.js';
import fornecedorRoutes from './routes/fornecedorRoutes.js';
import produtoRoutes from './routes/produtoRoutes.js';
import vendaRoutes from './routes/vendaRoutes.js';
import estoqueRoutes from './routes/estoqueRoutes.js';
import sugestaoIARoutes from './routes/sugestaoIARoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import assistantIARoutes from './routes/assistantIARoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/fornecedores', fornecedorRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/vendas', vendaRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/sugestoes-ia', sugestaoIARoutes);
app.use('/api/assistant-ia', assistantIARoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Loja Inteligente API is running' });
});

app.use(errorHandler);

// Testar conexão com o banco antes de iniciar
const startServer = async () => {
  const dbConnected = await testDatabaseConnection();
  
  if (!dbConnected) {
    console.error('❌ Não foi possível iniciar o servidor sem conexão com o banco de dados');
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();
