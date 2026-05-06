import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const seedPassword = process.env.SEED_USER_PASSWORD || 'TroqueEstaSenha123!';

async function main() {
  console.log('Iniciando seed com dados ficticios...');

  await prisma.vendaItem.deleteMany();
  await prisma.venda.deleteMany();
  await prisma.estoqueMovimentacao.deleteMany();
  await prisma.sugestaoIA.deleteMany();
  await prisma.produto.deleteMany();
  await prisma.cliente.deleteMany();
  await prisma.fornecedor.deleteMany();
  await prisma.categoria.deleteMany();
  await prisma.usuario.deleteMany();

  const senhaHash = await bcrypt.hash(seedPassword, 10);

  const usuarios = await Promise.all([
    prisma.usuario.create({ data: { nome: 'Administrador Demo', email: 'admin@example.com', senhaHash, perfil: 'admin', status: 'ativo' } }),
    prisma.usuario.create({ data: { nome: 'Gerente Demo', email: 'gerente@example.com', senhaHash, perfil: 'gerente', status: 'ativo' } }),
    prisma.usuario.create({ data: { nome: 'Vendedor Demo', email: 'vendedor@example.com', senhaHash, perfil: 'vendedor', status: 'ativo' } })
  ]);

  const categorias = await Promise.all([
    prisma.categoria.create({ data: { nome: 'Eletronicos', descricao: 'Produtos eletronicos em geral' } }),
    prisma.categoria.create({ data: { nome: 'Casa e Escritorio', descricao: 'Produtos para casa e escritorio' } }),
    prisma.categoria.create({ data: { nome: 'Informatica', descricao: 'Computadores e acessorios' } }),
    prisma.categoria.create({ data: { nome: 'Games', descricao: 'Consoles e jogos' } })
  ]);

  const fornecedores = await Promise.all([
    prisma.fornecedor.create({ data: { razaoSocial: 'Fornecedor Demo 01 Ltda', nomeFantasia: 'Fornecedor 01', cnpj: '00.000.000/0000-01', telefone: '(00) 0000-0001', email: 'fornecedor01@example.com', endereco: 'Endereco ficticio fornecedor 1', cidade: 'Cidade Demo', estado: 'DF' } }),
    prisma.fornecedor.create({ data: { razaoSocial: 'Fornecedor Demo 02 Ltda', nomeFantasia: 'Fornecedor 02', cnpj: '00.000.000/0000-02', telefone: '(00) 0000-0002', email: 'fornecedor02@example.com', endereco: 'Endereco ficticio fornecedor 2', cidade: 'Cidade Demo', estado: 'DF' } }),
    prisma.fornecedor.create({ data: { razaoSocial: 'Fornecedor Demo 03 Ltda', nomeFantasia: 'Fornecedor 03', cnpj: '00.000.000/0000-03', telefone: '(00) 0000-0003', email: 'fornecedor03@example.com', endereco: 'Endereco ficticio fornecedor 3', cidade: 'Cidade Demo', estado: 'DF' } })
  ]);

  const clientes = await Promise.all(
    Array.from({ length: 6 }, (_, index) => {
      const id = index + 1;
      return prisma.cliente.create({
        data: {
          nome: `Cliente Demo ${id}`,
          cpf: `000.000.000-${String(id).padStart(2, '0')}`,
          telefone: `(00) 90000-00${String(id).padStart(2, '0')}`,
          email: `cliente${String(id).padStart(2, '0')}@example.com`,
          endereco: `Endereco ficticio cliente ${id}`,
          cidade: 'Cidade Demo',
          estado: 'DF'
        }
      });
    })
  );

  const produtos = await Promise.all([
    prisma.produto.create({ data: { nome: 'Fone Bluetooth Demo', descricao: 'Produto ficticio para demonstracao', sku: 'DEMO-001', codigoBarras: '0000000000001', categoriaId: categorias[0].id, fornecedorId: fornecedores[0].id, precoCusto: 180.00, precoVenda: 299.90, estoqueAtual: 50, estoqueMinimo: 10 } }),
    prisma.produto.create({ data: { nome: 'Carregador Portatil Demo', descricao: 'Produto ficticio para demonstracao', sku: 'DEMO-002', codigoBarras: '0000000000002', categoriaId: categorias[0].id, fornecedorId: fornecedores[0].id, precoCusto: 120.00, precoVenda: 199.90, estoqueAtual: 12, estoqueMinimo: 5 } }),
    prisma.produto.create({ data: { nome: 'Kit Escritorio Demo', descricao: 'Produto ficticio para demonstracao', sku: 'DEMO-003', codigoBarras: '0000000000003', categoriaId: categorias[1].id, fornecedorId: fornecedores[1].id, precoCusto: 50.00, precoVenda: 89.90, estoqueAtual: 25, estoqueMinimo: 10 } }),
    prisma.produto.create({ data: { nome: 'Notebook Demo', descricao: 'Produto ficticio para demonstracao', sku: 'DEMO-004', codigoBarras: '0000000000004', categoriaId: categorias[2].id, fornecedorId: fornecedores[2].id, precoCusto: 4500.00, precoVenda: 5999.90, estoqueAtual: 8, estoqueMinimo: 3 } }),
    prisma.produto.create({ data: { nome: 'Console Demo', descricao: 'Produto ficticio para demonstracao', sku: 'DEMO-005', codigoBarras: '0000000000005', categoriaId: categorias[3].id, fornecedorId: fornecedores[2].id, precoCusto: 3500.00, precoVenda: 4499.90, estoqueAtual: 5, estoqueMinimo: 2 } })
  ]);

  await Promise.all(produtos.map((produto) =>
    prisma.estoqueMovimentacao.create({
      data: {
        produtoId: produto.id,
        tipo: 'entrada',
        quantidade: produto.estoqueAtual,
        motivo: 'Estoque inicial ficticio',
        usuarioId: usuarios[0].id
      }
    })
  ));

  const venda = await prisma.venda.create({
    data: {
      clienteId: clientes[0].id,
      usuarioId: usuarios[2].id,
      subtotal: 389.80,
      desconto: 0,
      total: 389.80,
      formaPagamento: 'Pix',
      status: 'paga',
      observacoes: 'Venda ficticia de demonstracao',
      vendaItens: {
        create: [
          { produtoId: produtos[0].id, quantidade: 1, precoUnitario: 299.90, subtotal: 299.90 },
          { produtoId: produtos[2].id, quantidade: 1, precoUnitario: 89.90, subtotal: 89.90 }
        ]
      }
    }
  });

  await prisma.sugestaoIA.createMany({
    data: [
      { produtoNome: 'Smartwatch Demo', categoriaId: categorias[0].id, nivelTendencia: 'alta', justificativa: 'Exemplo ficticio de tendencia para demonstracao', score: 0.92, fonteDados: 'Dados simulados' },
      { produtoNome: 'Kit Home Office Demo', categoriaId: categorias[1].id, nivelTendencia: 'media', justificativa: 'Exemplo ficticio de tendencia para demonstracao', score: 0.75, fonteDados: 'Dados simulados' }
    ]
  });

  console.log(`Seed concluido. Venda demo criada: ${venda.id}`);
  console.log('Credenciais demo:');
  console.log(`Admin: admin@example.com / ${seedPassword}`);
  console.log(`Gerente: gerente@example.com / ${seedPassword}`);
  console.log(`Vendedor: vendedor@example.com / ${seedPassword}`);
}

main()
  .catch((error) => {
    console.error('Erro no seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
