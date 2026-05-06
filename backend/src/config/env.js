// Configuração de conexão com banco de dados
// Prioriza o uso direto do DATABASE_URL
const getDatabaseUrl = () => {
  // Se DATABASE_URL estiver definido, usa ele
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Fallback: constrói a URL a partir de variáveis separadas
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || '3306';
  const user = process.env.DB_USER || 'root';
  const password = process.env.DB_PASSWORD || '';
  const database = process.env.DB_NAME || 'loja_inteligente';

  const passwordPart = password ? `:${password}` : '';
  return `mysql://${user}${passwordPart}@${host}:${port}/${database}`;
};

// Define o DATABASE_URL para o Prisma
process.env.DATABASE_URL = getDatabaseUrl();

export default getDatabaseUrl;
