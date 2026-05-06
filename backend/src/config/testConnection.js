import prisma from './database.js';

export const testDatabaseConnection = async () => {
  try {
    await prisma.$connect();
    console.log('✅ Conexão com o banco de dados MySQL estabelecida com sucesso!');
    console.log(`📊 Banco de dados: ${process.env.DB_NAME}`);
    console.log(`🖥️  Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados MySQL:');
    console.error('   ', error.message);
    console.error('');
    console.error('🔧 Verifique:');
    console.error('   1. Se o MySQL está rodando');
    console.error('   2. Se as credenciais no arquivo .env estão corretas');
    console.error('   3. Se o banco de dados "loja_inteligente" existe');
    return false;
  } finally {
    await prisma.$disconnect();
  }
};

// Executa o teste se este arquivo for executado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testDatabaseConnection().then((success) => {
    process.exit(success ? 0 : 1);
  });
}
