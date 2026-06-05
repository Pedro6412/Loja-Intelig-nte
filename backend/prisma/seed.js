import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed com dados completos...');

  // Criar usuários
  const senhaHash = await bcrypt.hash('123456', 10);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@loja.com' },
    update: {},
    create: {
      nome: 'Administrador',
      email: 'admin@loja.com',
      senhaHash: senhaHash,
      perfil: 'admin',
      status: 'ativo'
    }
  });

  const gerente = await prisma.usuario.upsert({
    where: { email: 'gerente@loja.com' },
    update: {},
    create: {
      nome: 'Gerente da Loja',
      email: 'gerente@loja.com',
      senhaHash: senhaHash,
      perfil: 'gerente',
      status: 'ativo'
    }
  });

  const vendedor = await prisma.usuario.upsert({
    where: { email: 'vendedor@loja.com' },
    update: {},
    create: {
      nome: 'Vendedor Carlos',
      email: 'vendedor@loja.com',
      senhaHash: senhaHash,
      perfil: 'vendedor',
      status: 'ativo'
    }
  });

  console.log('✅ 3 Usuários criados');

  // Criar 8 categorias
  const eletronicos = await prisma.categoria.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nome: 'Eletrônicos',
      descricao: 'Produtos eletrônicos em geral',
      status: 'ativo'
    }
  });

  const casaEscritorio = await prisma.categoria.upsert({
    where: { id: 2 },
    update: {},
    create: {
      nome: 'Casa e Escritório',
      descricao: 'Produtos para casa e escritório',
      status: 'ativo'
    }
  });

  const iluminacao = await prisma.categoria.upsert({
    where: { id: 3 },
    update: {},
    create: {
      nome: 'Iluminação',
      descricao: 'Produtos de iluminação',
      status: 'ativo'
    }
  });

  const informatica = await prisma.categoria.upsert({
    where: { id: 4 },
    update: {},
    create: {
      nome: 'Informática',
      descricao: 'Computadores e acessórios',
      status: 'ativo'
    }
  });

  const telefonia = await prisma.categoria.upsert({
    where: { id: 5 },
    update: {},
    create: {
      nome: 'Telefonia',
      descricao: 'Celulares e acessórios',
      status: 'ativo'
    }
  });

  const audioVideo = await prisma.categoria.upsert({
    where: { id: 6 },
    update: {},
    create: {
      nome: 'Áudio e Vídeo',
      descricao: 'Sistemas de som e vídeo',
      status: 'ativo'
    }
  });

  const jogos = await prisma.categoria.upsert({
    where: { id: 7 },
    update: {},
    create: {
      nome: 'Games',
      descricao: 'Consoles e jogos',
      status: 'ativo'
    }
  });

  const acessorios = await prisma.categoria.upsert({
    where: { id: 8 },
    update: {},
    create: {
      nome: 'Acessórios',
      descricao: 'Acessórios variados',
      status: 'ativo'
    }
  });

  console.log('✅ 8 Categorias criadas');

  // Criar 6 fornecedores
  const fornecedor1 = await prisma.fornecedor.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nome: 'Tech Distribuidora',
      cnpj: '12.345.678/0001-90',
      telefone: '(11) 3456-7890',
      email: 'contato@techdist.com.br',
      endereco: 'Av. Paulista, 1000 - São Paulo',
      status: 'ativo'
    }
  });

  const fornecedor2 = await prisma.fornecedor.upsert({
    where: { id: 2 },
    update: {},
    create: {
      nome: 'Casa & Cia',
      cnpj: '98.765.432/0001-10',
      telefone: '(21) 2345-6789',
      email: 'vendas@casaecia.com.br',
      endereco: 'Rua das Flores, 500 - Rio de Janeiro',
      status: 'ativo'
    }
  });

  const fornecedor3 = await prisma.fornecedor.upsert({
    where: { id: 3 },
    update: {},
    create: {
      nome: 'Global Electronics',
      cnpj: '45.678.901/0001-23',
      telefone: '(31) 9876-5432',
      email: 'compras@globalelec.com',
      endereco: 'Av. Afonso Pena, 2000 - Belo Horizonte',
      status: 'ativo'
    }
  });

  const fornecedor4 = await prisma.fornecedor.upsert({
    where: { id: 4 },
    update: {},
    create: {
      nome: 'Luz & Cor',
      cnpj: '23.456.789/0001-45',
      telefone: '(41) 3344-5566',
      email: 'vendas@luzecor.com.br',
      endereco: 'Rua XV de Novembro, 800 - Curitiba',
      status: 'ativo'
    }
  });

  const fornecedor5 = await prisma.fornecedor.upsert({
    where: { id: 5 },
    update: {},
    create: {
      nome: 'GameZone Brasil',
      cnpj: '67.890.123/0001-67',
      telefone: '(51) 3210-9876',
      email: 'parceiros@gamezone.com',
      endereco: 'Av. Ipiranga, 1500 - Porto Alegre',
      status: 'ativo'
    }
  });

  const fornecedor6 = await prisma.fornecedor.upsert({
    where: { id: 6 },
    update: {},
    create: {
      nome: 'Acessórios Premium',
      cnpj: '89.012.345/0001-89',
      telefone: '(61) 3456-7890',
      email: 'contato@acessoriospremium.com.br',
      endereco: 'Setor Comercial Sul, Quadra 5 - Brasília',
      status: 'ativo'
    }
  });

  console.log('✅ 6 Fornecedores criados');

  // Criar 12 clientes
  const cliente1 = await prisma.cliente.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nome: 'João Silva',
      cpf: '123.456.789-00',
      telefone: '(11) 98765-4321',
      email: 'joao@email.com',
      endereco: 'Rua A, 123 - São Paulo',
      status: 'ativo'
    }
  });

  const cliente2 = await prisma.cliente.upsert({
    where: { id: 2 },
    update: {},
    create: {
      nome: 'Maria Santos',
      cpf: '987.654.321-00',
      telefone: '(21) 91234-5678',
      email: 'maria@email.com',
      endereco: 'Av. B, 456 - Rio de Janeiro',
      status: 'ativo'
    }
  });

  const cliente3 = await prisma.cliente.upsert({
    where: { id: 3 },
    update: {},
    create: {
      nome: 'Pedro Oliveira',
      cpf: '456.789.012-33',
      telefone: '(31) 99887-7665',
      email: 'pedro@email.com',
      endereco: 'Rua C, 789 - Belo Horizonte',
      status: 'ativo'
    }
  });

  const cliente4 = await prisma.cliente.upsert({
    where: { id: 4 },
    update: {},
    create: {
      nome: 'Ana Costa',
      cpf: '321.654.987-11',
      telefone: '(41) 97766-5544',
      email: 'ana@email.com',
      endereco: 'Av. D, 321 - Curitiba',
      status: 'ativo'
    }
  });

  const cliente5 = await prisma.cliente.upsert({
    where: { id: 5 },
    update: {},
    create: {
      nome: 'Lucas Ferreira',
      cpf: '654.321.098-77',
      telefone: '(51) 98877-6655',
      email: 'lucas@email.com',
      endereco: 'Rua E, 654 - Porto Alegre',
      status: 'ativo'
    }
  });

  const cliente6 = await prisma.cliente.upsert({
    where: { id: 6 },
    update: {},
    create: {
      nome: 'Juliana Almeida',
      cpf: '789.012.345-66',
      telefone: '(61) 97788-9900',
      email: 'juliana@email.com',
      endereco: 'Setor F, Quadra 2 - Brasília',
      status: 'ativo'
    }
  });

  const cliente7 = await prisma.cliente.upsert({
    where: { id: 7 },
    update: {},
    create: {
      nome: 'Rafael Lima',
      cpf: '234.567.890-12',
      telefone: '(11) 91122-3344',
      email: 'rafael@email.com',
      endereco: 'Rua F, 987 - São Paulo',
      status: 'ativo'
    }
  });

  const cliente8 = await prisma.cliente.upsert({
    where: { id: 8 },
    update: {},
    create: {
      nome: 'Carla Mendes',
      cpf: '890.123.456-78',
      telefone: '(21) 95544-3322',
      email: 'carla@email.com',
      endereco: 'Av. G, 210 - Rio de Janeiro',
      status: 'ativo'
    }
  });

  const cliente9 = await prisma.cliente.upsert({
    where: { id: 9 },
    update: {},
    create: {
      nome: 'Bruno Rocha',
      cpf: '345.678.901-23',
      telefone: '(31) 94433-2211',
      email: 'bruno@email.com',
      endereco: 'Rua H, 543 - Belo Horizonte',
      status: 'ativo'
    }
  });

  const cliente10 = await prisma.cliente.upsert({
    where: { id: 10 },
    update: {},
    create: {
      nome: 'Fernanda Pires',
      cpf: '567.890.123-45',
      telefone: '(41) 93322-1100',
      email: 'fernanda@email.com',
      endereco: 'Av. I, 876 - Curitiba',
      status: 'ativo'
    }
  });

  const cliente11 = await prisma.cliente.upsert({
    where: { id: 11 },
    update: {},
    create: {
      nome: 'Gustavo Nunes',
      cpf: '890.234.567-89',
      telefone: '(51) 92211-0099',
      email: 'gustavo@email.com',
      endereco: 'Rua J, 432 - Porto Alegre',
      status: 'ativo'
    }
  });

  const cliente12 = await prisma.cliente.upsert({
    where: { id: 12 },
    update: {},
    create: {
      nome: 'Patrícia Gomes',
      cpf: '123.890.456-70',
      telefone: '(61) 91100-9988',
      email: 'patricia@email.com',
      endereco: 'Setor G, Quadra 7 - Brasília',
      status: 'ativo'
    }
  });

  console.log('✅ 12 Clientes criados');

  // Criar 25 produtos
  const produto1 = await prisma.produto.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nome: 'Fone de Bluetooth Premium',
      descricao: 'Fone de ouvido bluetooth com cancelamento de ruído',
      precoVenda: 299.90,
      precoCusto: 180.00,
      estoque: 50,
      estoqueMinimo: 10,
      codigoBarras: '7891234567890',
      categoriaId: eletronicos.id,
      fornecedorId: fornecedor1.id,
      status: 'ativo'
    }
  });

  const produto2 = await prisma.produto.upsert({
    where: { id: 2 },
    update: {},
    create: {
      nome: 'Carregador Solar Portátil',
      descricao: 'Carregador solar 20000mAh',
      precoVenda: 199.90,
      precoCusto: 120.00,
      estoque: 3,
      estoqueMinimo: 5,
      codigoBarras: '7891234567891',
      categoriaId: eletronicos.id,
      fornecedorId: fornecedor1.id,
      status: 'ativo'
    }
  });

  const produto3 = await prisma.produto.upsert({
    where: { id: 3 },
    update: {},
    create: {
      nome: 'Kit Organização Escritório',
      descricao: 'Kit com organizadores de mesa',
      precoVenda: 89.90,
      precoCusto: 50.00,
      estoque: 25,
      estoqueMinimo: 10,
      codigoBarras: '7891234567892',
      categoriaId: casaEscritorio.id,
      fornecedorId: fornecedor2.id,
      status: 'ativo'
    }
  });

  const produto4 = await prisma.produto.upsert({
    where: { id: 4 },
    update: {},
    create: {
      nome: 'Luminária LED Inteligente',
      descricao: 'Luminária LED com controle por app',
      precoVenda: 149.90,
      precoCusto: 90.00,
      estoque: 15,
      estoqueMinimo: 5,
      codigoBarras: '7891234567893',
      categoriaId: iluminacao.id,
      fornecedorId: fornecedor2.id,
      status: 'ativo'
    }
  });

  // Produtos 5-10
  const produto5 = await prisma.produto.upsert({
    where: { id: 5 },
    update: {},
    create: {
      nome: 'Notebook Gamer i7',
      descricao: 'Notebook com processador i7, 16GB RAM, RTX 3060',
      precoVenda: 5999.90,
      precoCusto: 4500.00,
      estoque: 8,
      estoqueMinimo: 3,
      codigoBarras: '7891234567894',
      categoriaId: informatica.id,
      fornecedorId: fornecedor3.id,
      status: 'ativo'
    }
  });

  const produto6 = await prisma.produto.upsert({
    where: { id: 6 },
    update: {},
    create: {
      nome: 'Smartphone Android 128GB',
      descricao: 'Smartphone com tela 6.5", 128GB, 5G',
      precoVenda: 2499.90,
      precoCusto: 1800.00,
      estoque: 20,
      estoqueMinimo: 5,
      codigoBarras: '7891234567895',
      categoriaId: telefonia.id,
      fornecedorId: fornecedor1.id,
      status: 'ativo'
    }
  });

  const produto7 = await prisma.produto.upsert({
    where: { id: 7 },
    update: {},
    create: {
      nome: 'Soundbar Bluetooth 200W',
      descricao: 'Soundbar com subwoofer, Bluetooth 5.0',
      precoVenda: 899.90,
      precoCusto: 550.00,
      estoque: 12,
      estoqueMinimo: 4,
      codigoBarras: '7891234567896',
      categoriaId: audioVideo.id,
      fornecedorId: fornecedor4.id,
      status: 'ativo'
    }
  });

  const produto8 = await prisma.produto.upsert({
    where: { id: 8 },
    update: {},
    create: {
      nome: 'Console PlayStation 5',
      descricao: 'Console de última geração com 1TB',
      precoVenda: 4499.90,
      precoCusto: 3500.00,
      estoque: 5,
      estoqueMinimo: 2,
      codigoBarras: '7891234567897',
      categoriaId: jogos.id,
      fornecedorId: fornecedor5.id,
      status: 'ativo'
    }
  });

  const produto9 = await prisma.produto.upsert({
    where: { id: 9 },
    update: {},
    create: {
      nome: 'Cabo HDMI 4K 2m',
      descricao: 'Cabo HDMI de alta velocidade 4K',
      precoVenda: 49.90,
      precoCusto: 25.00,
      estoque: 100,
      estoqueMinimo: 20,
      codigoBarras: '7891234567898',
      categoriaId: acessorios.id,
      fornecedorId: fornecedor6.id,
      status: 'ativo'
    }
  });

  const produto10 = await prisma.produto.upsert({
    where: { id: 10 },
    update: {},
    create: {
      nome: 'Monitor 27" IPS 144Hz',
      descricao: 'Monitor gaming IPS 27 polegadas',
      precoVenda: 1899.90,
      precoCusto: 1400.00,
      estoque: 10,
      estoqueMinimo: 3,
      codigoBarras: '7891234567899',
      categoriaId: informatica.id,
      fornecedorId: fornecedor3.id,
      status: 'ativo'
    }
  });

  // Produtos 11-15
  const produto11 = await prisma.produto.upsert({
    where: { id: 11 },
    update: {},
    create: {
      nome: 'Teclado Mecânico RGB',
      descricao: 'Teclado mecânico com iluminação RGB',
      precoVenda: 349.90,
      precoCusto: 220.00,
      estoque: 30,
      estoqueMinimo: 8,
      codigoBarras: '7891234567900',
      categoriaId: informatica.id,
      fornecedorId: fornecedor6.id,
      status: 'ativo'
    }
  });

  const produto12 = await prisma.produto.upsert({
    where: { id: 12 },
    update: {},
    create: {
      nome: 'Mouse Gamer 16000DPI',
      descricao: 'Mouse gamer com sensor ótico 16000DPI',
      precoVenda: 199.90,
      precoCusto: 120.00,
      estoque: 35,
      estoqueMinimo: 10,
      codigoBarras: '7891234567901',
      categoriaId: informatica.id,
      fornecedorId: fornecedor6.id,
      status: 'ativo'
    }
  });

  const produto13 = await prisma.produto.upsert({
    where: { id: 13 },
    update: {},
    create: {
      nome: 'Tablet 10" 64GB',
      descricao: 'Tablet Android com tela 10 polegadas',
      precoVenda: 1299.90,
      precoCusto: 900.00,
      estoque: 15,
      estoqueMinimo: 5,
      codigoBarras: '7891234567902',
      categoriaId: telefonia.id,
      fornecedorId: fornecedor1.id,
      status: 'ativo'
    }
  });

  const produto14 = await prisma.produto.upsert({
    where: { id: 14 },
    update: {},
    create: {
      nome: 'Webcam Full HD 1080p',
      descricao: 'Webcam para streaming e videoconferências',
      precoVenda: 299.90,
      precoCusto: 180.00,
      estoque: 25,
      estoqueMinimo: 8,
      codigoBarras: '7891234567903',
      categoriaId: informatica.id,
      fornecedorId: fornecedor6.id,
      status: 'ativo'
    }
  });

  const produto15 = await prisma.produto.upsert({
    where: { id: 15 },
    update: {},
    create: {
      nome: 'Fita LED 5m RGB',
      descricao: 'Fita LED com controle remoto RGB',
      precoVenda: 79.90,
      precoCusto: 40.00,
      estoque: 60,
      estoqueMinimo: 15,
      codigoBarras: '7891234567904',
      categoriaId: iluminacao.id,
      fornecedorId: fornecedor4.id,
      status: 'ativo'
    }
  });

  // Produtos 16-20
  const produto16 = await prisma.produto.upsert({
    where: { id: 16 },
    update: {},
    create: {
      nome: 'Cadeira Gamer Ergonômica',
      descricao: 'Cadeira gamer com ajuste de altura',
      precoVenda: 899.90,
      precoCusto: 550.00,
      estoque: 8,
      estoqueMinimo: 3,
      codigoBarras: '7891234567905',
      categoriaId: casaEscritorio.id,
      fornecedorId: fornecedor2.id,
      status: 'ativo'
    }
  });

  const produto17 = await prisma.produto.upsert({
    where: { id: 17 },
    update: {},
    create: {
      nome: 'SSD 1TB NVMe',
      descricao: 'SSD NVMe de alta performance 1TB',
      precoVenda: 499.90,
      precoCusto: 320.00,
      estoque: 20,
      estoqueMinimo: 6,
      codigoBarras: '7891234567906',
      categoriaId: informatica.id,
      fornecedorId: fornecedor3.id,
      status: 'ativo'
    }
  });

  const produto18 = await prisma.produto.upsert({
    where: { id: 18 },
    update: {},
    create: {
      nome: 'Power Bank 20000mAh',
      descricao: 'Power Bank com carregamento rápido',
      precoVenda: 149.90,
      precoCusto: 90.00,
      estoque: 40,
      estoqueMinimo: 12,
      codigoBarras: '7891234567907',
      categoriaId: eletronicos.id,
      fornecedorId: fornecedor1.id,
      status: 'ativo'
    }
  });

  const produto19 = await prisma.produto.upsert({
    where: { id: 19 },
    update: {},
    create: {
      nome: 'Caixa de Som Bluetooth',
      descricao: 'Caixa de som portátil com 20W',
      precoVenda: 199.90,
      precoCusto: 120.00,
      estoque: 28,
      estoqueMinimo: 8,
      codigoBarras: '7891234567908',
      categoriaId: audioVideo.id,
      fornecedorId: fornecedor4.id,
      status: 'ativo'
    }
  });

  const produto20 = await prisma.produto.upsert({
    where: { id: 20 },
    update: {},
    create: {
      nome: 'Controle Xbox Series X',
      descricao: 'Controle oficial Xbox Series X',
      precoVenda: 449.90,
      precoCusto: 300.00,
      estoque: 18,
      estoqueMinimo: 5,
      codigoBarras: '7891234567909',
      categoriaId: jogos.id,
      fornecedorId: fornecedor5.id,
      status: 'ativo'
    }
  });

  // Produtos 21-25
  const produto21 = await prisma.produto.upsert({
    where: { id: 21 },
    update: {},
    create: {
      nome: 'Estação de Trabalho 3 Níveis',
      descricao: 'Estação de trabalho ajustável em 3 níveis',
      precoVenda: 699.90,
      precoCusto: 420.00,
      estoque: 12,
      estoqueMinimo: 4,
      codigoBarras: '7891234567910',
      categoriaId: casaEscritorio.id,
      fornecedorId: fornecedor2.id,
      status: 'ativo'
    }
  });

  const produto22 = await prisma.produto.upsert({
    where: { id: 22 },
    update: {},
    create: {
      nome: 'Headset Gamer 7.1',
      descricao: 'Headset gamer com som surround 7.1',
      precoVenda: 399.90,
      precoCusto: 250.00,
      estoque: 22,
      estoqueMinimo: 7,
      codigoBarras: '7891234567911',
      categoriaId: audioVideo.id,
      fornecedorId: fornecedor4.id,
      status: 'ativo'
    }
  });

  const produto23 = await prisma.produto.upsert({
    where: { id: 23 },
    update: {},
    create: {
      nome: 'Smartwatch Fitness',
      descricao: 'Smartwatch com monitoramento de atividades',
      precoVenda: 599.90,
      precoCusto: 380.00,
      estoque: 14,
      estoqueMinimo: 4,
      codigoBarras: '7891234567912',
      categoriaId: eletronicos.id,
      fornecedorId: fornecedor1.id,
      status: 'ativo'
    }
  });

  const produto24 = await prisma.produto.upsert({
    where: { id: 24 },
    update: {},
    create: {
      nome: 'Suporte para Notebook Ajustável',
      descricao: 'Suporte alumínio com ajuste de altura',
      precoVenda: 129.90,
      precoCusto: 75.00,
      estoque: 45,
      estoqueMinimo: 12,
      codigoBarras: '7891234567913',
      categoriaId: acessorios.id,
      fornecedorId: fornecedor6.id,
      status: 'ativo'
    }
  });

  const produto25 = await prisma.produto.upsert({
    where: { id: 25 },
    update: {},
    create: {
      nome: 'Kit 3 Câmeras de Segurança',
      descricao: 'Kit com 3 câmeras WiFi e DVR',
      precoVenda: 799.90,
      precoCusto: 480.00,
      estoque: 7,
      estoqueMinimo: 2,
      codigoBarras: '7891234567914',
      categoriaId: eletronicos.id,
      fornecedorId: fornecedor1.id,
      status: 'ativo'
    }
  });

  console.log('✅ 25 Produtos criados');

  // Criar 8 sugestões IA
  await prisma.sugestaoIA.upsert({
    where: { id: 1 },
    update: {},
    create: {
      produtoNome: 'Smartwatch Fitness',
      categoria: 'Eletrônicos',
      nivelTendencia: 'alta',
      justificativa: 'Aumento de 120% nas buscas por smartwatches fitness',
      score: 0.92,
      fonteDados: 'Google Trends',
      status: 'pendente'
    }
  });

  await prisma.sugestaoIA.upsert({
    where: { id: 2 },
    update: {},
    create: {
      produtoNome: 'Kit Home Office Completo',
      categoria: 'Casa e Escritório',
      nivelTendencia: 'media',
      justificativa: 'Trabalho remoto em alta',
      score: 0.75,
      fonteDados: 'Market Analysis',
      status: 'pendente'
    }
  });

  await prisma.sugestaoIA.upsert({
    where: { id: 3 },
    update: {},
    create: {
      produtoNome: 'Monitor 4K Gaming',
      categoria: 'Informática',
      nivelTendencia: 'alta',
      justificativa: 'Demanda crescente por monitores 4K para gaming',
      score: 0.88,
      fonteDados: 'Sales Data',
      status: 'pendente'
    }
  });

  await prisma.sugestaoIA.upsert({
    where: { id: 4 },
    update: {},
    create: {
      produtoNome: 'Cadeira Ergonômica Premium',
      categoria: 'Casa e Escritório',
      nivelTendencia: 'alta',
      justificativa: 'Preocupação com saúde ocupacional em home office',
      score: 0.85,
      fonteDados: 'Consumer Trends',
      status: 'pendente'
    }
  });

  await prisma.sugestaoIA.upsert({
    where: { id: 5 },
    update: {},
    create: {
      produtoNome: 'Câmera de Ação 4K',
      categoria: 'Eletrônicos',
      nivelTendencia: 'media',
      justificativa: 'Tendência de conteúdo de aventura nas redes sociais',
      score: 0.72,
      fonteDados: 'Social Media Analysis',
      status: 'pendente'
    }
  });

  await prisma.sugestaoIA.upsert({
    where: { id: 6 },
    update: {},
    create: {
      produtoNome: 'Kit Iluminação RGB',
      categoria: 'Iluminação',
      nivelTendencia: 'alta',
      justificativa: 'Popularização de setups gamer com iluminação RGB',
      score: 0.90,
      fonteDados: 'Gaming Market Report',
      status: 'pendente'
    }
  });

  await prisma.sugestaoIA.upsert({
    where: { id: 7 },
    update: {},
    create: {
      produtoNome: 'Tablet Gráfico Profissional',
      categoria: 'Informática',
      nivelTendencia: 'baixa',
      justificativa: 'Nicho específico, demanda estável',
      score: 0.55,
      fonteDados: 'Professional Market',
      status: 'pendente'
    }
  });

  await prisma.sugestaoIA.upsert({
    where: { id: 8 },
    update: {},
    create: {
      produtoNome: 'Console Portátil Retro',
      categoria: 'Games',
      nivelTendencia: 'media',
      justificativa: 'Nostalgia e tendência de retro gaming',
      score: 0.68,
      fonteDados: 'Gaming Industry Report',
      status: 'pendente'
    }
  });

  console.log('✅ 8 Sugestões IA criados');

  // Criar movimentações de estoque
  await prisma.estoqueMovimentacao.create({
    data: {
      produtoId: produto1.id,
      tipo: 'entrada',
      quantidade: 50,
      estoqueAnterior: 0,
      estoqueNovo: 50,
      motivo: 'Estoque inicial'
    }
  });

  await prisma.estoqueMovimentacao.create({
    data: {
      produtoId: produto2.id,
      tipo: 'entrada',
      quantidade: 10,
      estoqueAnterior: 0,
      estoqueNovo: 10,
      motivo: 'Estoque inicial'
    }
  });

  await prisma.estoqueMovimentacao.create({
    data: {
      produtoId: produto2.id,
      tipo: 'saida',
      quantidade: 7,
      estoqueAnterior: 10,
      estoqueNovo: 3,
      motivo: 'Venda de demonstração'
    }
  });

  await prisma.estoqueMovimentacao.create({
    data: {
      produtoId: produto5.id,
      tipo: 'entrada',
      quantidade: 10,
      estoqueAnterior: 0,
      estoqueNovo: 10,
      motivo: 'Estoque inicial'
    }
  });

  await prisma.estoqueMovimentacao.create({
    data: {
      produtoId: produto5.id,
      tipo: 'saida',
      quantidade: 2,
      estoqueAnterior: 10,
      estoqueNovo: 8,
      motivo: 'Venda #001',
      vendaId: 1
    }
  });

  await prisma.estoqueMovimentacao.create({
    data: {
      produtoId: produto8.id,
      tipo: 'entrada',
      quantidade: 8,
      estoqueAnterior: 0,
      estoqueNovo: 8,
      motivo: 'Estoque inicial'
    }
  });

  await prisma.estoqueMovimentacao.create({
    data: {
      produtoId: produto8.id,
      tipo: 'saida',
      quantidade: 3,
      estoqueAnterior: 8,
      estoqueNovo: 5,
      motivo: 'Venda #002',
      vendaId: 2
    }
  });

  console.log('✅ 6 Movimentações de estoque criadas');

  // Criar 10 vendas com seus itens
  const venda1 = await prisma.venda.create({
    data: {
      clienteId: cliente1.id,
      usuarioId: vendedor.id,
      total: 6299.80,
      desconto: 0,
      formaPagamento: 'Cartão de Crédito',
      status: 'concluida',
      observacoes: 'Cliente VIP',
      vendaItens: {
        create: [
          {
            produtoId: produto5.id,
            quantidade: 1,
            precoUnitario: 5999.90,
            subtotal: 5999.90
          },
          {
            produtoId: produto9.id,
            quantidade: 6,
            precoUnitario: 49.90,
            subtotal: 299.90
          }
        ]
      }
    }
  });

  const venda2 = await prisma.venda.create({
    data: {
      clienteId: cliente2.id,
      usuarioId: vendedor.id,
      total: 8999.70,
      desconto: 100.00,
      formaPagamento: 'Pix',
      status: 'concluida',
      observacoes: 'Pagamento à vista',
      vendaItens: {
        create: [
          {
            produtoId: produto8.id,
            quantidade: 2,
            precoUnitario: 4499.90,
            subtotal: 8999.80
          }
        ]
      }
    }
  });

  const venda3 = await prisma.venda.create({
    data: {
      clienteId: cliente3.id,
      usuarioId: gerente.id,
      total: 4499.80,
      desconto: 0,
      formaPagamento: 'Cartão de Débito',
      status: 'concluida',
      vendaItens: {
        create: [
          {
            produtoId: produto8.id,
            quantidade: 1,
            precoUnitario: 4499.90,
            subtotal: 4499.90
          }
        ]
      }
    }
  });

  const venda4 = await prisma.venda.create({
    data: {
      clienteId: cliente4.id,
      usuarioId: vendedor.id,
      total: 2499.90,
      desconto: 0,
      formaPagamento: 'Cartão de Crédito',
      status: 'concluida',
      vendaItens: {
        create: [
          {
            produtoId: produto6.id,
            quantidade: 1,
            precoUnitario: 2499.90,
            subtotal: 2499.90
          }
        ]
      }
    }
  });

  const venda5 = await prisma.venda.create({
    data: {
      clienteId: cliente5.id,
      usuarioId: vendedor.id,
      total: 1849.80,
      desconto: 50.00,
      formaPagamento: 'Pix',
      status: 'concluida',
      vendaItens: {
        create: [
          {
            produtoId: produto7.id,
            quantidade: 1,
            precoUnitario: 899.90,
            subtotal: 899.90
          },
          {
            produtoId: produto10.id,
            quantidade: 1,
            precoUnitario: 1899.90,
            subtotal: 1899.90
          }
        ]
      }
    }
  });

  const venda6 = await prisma.venda.create({
    data: {
      clienteId: cliente6.id,
      usuarioId: vendedor.id,
      total: 599.80,
      desconto: 0,
      formaPagamento: 'Dinheiro',
      status: 'concluida',
      vendaItens: {
        create: [
          {
            produtoId: produto1.id,
            quantidade: 2,
            precoUnitario: 299.90,
            subtotal: 599.80
          }
        ]
      }
    }
  });

  const venda7 = await prisma.venda.create({
    data: {
      clienteId: cliente7.id,
      usuarioId: gerente.id,
      total: 349.90,
      desconto: 0,
      formaPagamento: 'Cartão de Crédito',
      status: 'concluida',
      vendaItens: {
        create: [
          {
            produtoId: produto11.id,
            quantidade: 1,
            precoUnitario: 349.90,
            subtotal: 349.90
          }
        ]
      }
    }
  });

  const venda8 = await prisma.venda.create({
    data: {
      clienteId: cliente8.id,
      usuarioId: vendedor.id,
      total: 1299.80,
      desconto: 0,
      formaPagamento: 'Pix',
      status: 'concluida',
      vendaItens: {
        create: [
          {
            produtoId: produto13.id,
            quantidade: 1,
            precoUnitario: 1299.90,
            subtotal: 1299.90
          }
        ]
      }
    }
  });

  const venda9 = await prisma.venda.create({
    data: {
      clienteId: cliente9.id,
      usuarioId: vendedor.id,
      total: 449.80,
      desconto: 0,
      formaPagamento: 'Cartão de Débito',
      status: 'concluida',
      vendaItens: {
        create: [
          {
            produtoId: produto20.id,
            quantidade: 1,
            precoUnitario: 449.90,
            subtotal: 449.90
          }
        ]
      }
    }
  });

  const venda10 = await prisma.venda.create({
    data: {
      clienteId: cliente10.id,
      usuarioId: vendedor.id,
      total: 2299.80,
      desconto: 100.00,
      formaPagamento: 'Cartão de Crédito',
      status: 'concluida',
      observacoes: 'Cliente solicitou desconto',
      vendaItens: {
        create: [
          {
            produtoId: produto23.id,
            quantidade: 1,
            precoUnitario: 599.90,
            subtotal: 599.90
          },
          {
            produtoId: produto17.id,
            quantidade: 1,
            precoUnitario: 499.90,
            subtotal: 499.90
          },
          {
            produtoId: produto18.id,
            quantidade: 1,
            precoUnitario: 149.90,
            subtotal: 149.90
          },
          {
            produtoId: produto19.id,
            quantidade: 1,
            precoUnitario: 199.90,
            subtotal: 199.90
          }
        ]
      }
    }
  });

  console.log('✅ 10 Vendas criadas com seus itens');

  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📝 Credenciais de acesso:');
  console.log('   Admin: admin@loja.com / 123456');
  console.log('   Gerente: gerente@loja.com / 123456');
  console.log('   Vendedor: vendedor@loja.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
