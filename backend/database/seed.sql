-- Script SQL para popular o banco loja_inteligente
-- Ordem de execução: tabelas sem foreign keys primeiro, depois tabelas com foreign keys
-- Senha padrão: 123456 (hash bcrypt: $2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq7z3Xq6K5vYqK5vYqK5vYqK5vYqK)

USE loja_inteligente;

-- ============================================
-- 1. USUÁRIOS (sem foreign keys)
-- ============================================
INSERT INTO usuarios (id, nome, email, senha_hash, perfil, status, criado_em, atualizado_em) VALUES
(1, 'Administrador', 'admin@loja.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq7z3Xq6K5vYqK5vYqK5vYqK5vYqK', 'admin', 'ativo', NOW(), NOW()),
(2, 'Gerente da Loja', 'gerente@loja.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq7z3Xq6K5vYqK5vYqK5vYqK5vYqK', 'gerente', 'ativo', NOW(), NOW()),
(3, 'Vendedor Carlos', 'vendedor@loja.com', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq7z3Xq6K5vYqK5vYqK5vYqK5vYqK', 'vendedor', 'ativo', NOW(), NOW());

-- ============================================
-- 2. CATEGORIAS (sem foreign keys)
-- ============================================
INSERT INTO categorias (id, nome, descricao, status, criado_em, atualizado_em) VALUES
(1, 'Eletrônicos', 'Produtos eletrônicos em geral', 'ativo', NOW(), NOW()),
(2, 'Casa e Escritório', 'Produtos para casa e escritório', 'ativo', NOW(), NOW()),
(3, 'Iluminação', 'Produtos de iluminação', 'ativo', NOW(), NOW()),
(4, 'Informática', 'Computadores e acessórios', 'ativo', NOW(), NOW()),
(5, 'Telefonia', 'Celulares e acessórios', 'ativo', NOW(), NOW()),
(6, 'Áudio e Vídeo', 'Sistemas de som e vídeo', 'ativo', NOW(), NOW()),
(7, 'Games', 'Consoles e jogos', 'ativo', NOW(), NOW()),
(8, 'Acessórios', 'Acessórios variados', 'ativo', NOW(), NOW());

-- ============================================
-- 3. FORNECEDORES (sem foreign keys)
-- ============================================
INSERT INTO fornecedores (id, nome, cnpj, telefone, email, endereco, status, criado_em, atualizado_em) VALUES
(1, 'Tech Distribuidora', '12.345.678/0001-90', '(11) 3456-7890', 'contato@techdist.com.br', 'Av. Paulista, 1000 - São Paulo', 'ativo', NOW(), NOW()),
(2, 'Casa & Cia', '98.765.432/0001-10', '(21) 2345-6789', 'vendas@casaecia.com.br', 'Rua das Flores, 500 - Rio de Janeiro', 'ativo', NOW(), NOW()),
(3, 'Global Electronics', '45.678.901/0001-23', '(31) 9876-5432', 'compras@globalelec.com', 'Av. Afonso Pena, 2000 - Belo Horizonte', 'ativo', NOW(), NOW()),
(4, 'Luz & Cor', '23.456.789/0001-45', '(41) 3344-5566', 'vendas@luzecor.com.br', 'Rua XV de Novembro, 800 - Curitiba', 'ativo', NOW(), NOW()),
(5, 'GameZone Brasil', '67.890.123/0001-67', '(51) 3210-9876', 'parceiros@gamezone.com', 'Av. Ipiranga, 1500 - Porto Alegre', 'ativo', NOW(), NOW()),
(6, 'Acessórios Premium', '89.012.345/0001-89', '(61) 3456-7890', 'contato@acessoriospremium.com.br', 'Setor Comercial Sul, Quadra 5 - Brasília', 'ativo', NOW(), NOW());

-- ============================================
-- 4. CLIENTES (sem foreign keys)
-- ============================================
INSERT INTO clientes (id, nome, cpf, telefone, email, endereco, status, criado_em, atualizado_em) VALUES
(1, 'João Silva', '123.456.789-00', '(11) 98765-4321', 'joao@email.com', 'Rua A, 123 - São Paulo', 'ativo', NOW(), NOW()),
(2, 'Maria Santos', '987.654.321-00', '(21) 91234-5678', 'maria@email.com', 'Av. B, 456 - Rio de Janeiro', 'ativo', NOW(), NOW()),
(3, 'Pedro Oliveira', '456.789.012-33', '(31) 99887-7665', 'pedro@email.com', 'Rua C, 789 - Belo Horizonte', 'ativo', NOW(), NOW()),
(4, 'Ana Costa', '321.654.987-11', '(41) 97766-5544', 'ana@email.com', 'Av. D, 321 - Curitiba', 'ativo', NOW(), NOW()),
(5, 'Lucas Ferreira', '654.321.098-77', '(51) 98877-6655', 'lucas@email.com', 'Rua E, 654 - Porto Alegre', 'ativo', NOW(), NOW()),
(6, 'Juliana Almeida', '789.012.345-66', '(61) 97788-9900', 'juliana@email.com', 'Setor F, Quadra 2 - Brasília', 'ativo', NOW(), NOW()),
(7, 'Rafael Lima', '234.567.890-12', '(11) 91122-3344', 'rafael@email.com', 'Rua F, 987 - São Paulo', 'ativo', NOW(), NOW()),
(8, 'Carla Mendes', '890.123.456-78', '(21) 95544-3322', 'carla@email.com', 'Av. G, 210 - Rio de Janeiro', 'ativo', NOW(), NOW()),
(9, 'Bruno Rocha', '345.678.901-23', '(31) 94433-2211', 'bruno@email.com', 'Rua H, 543 - Belo Horizonte', 'ativo', NOW(), NOW()),
(10, 'Fernanda Pires', '567.890.123-45', '(41) 93322-1100', 'fernanda@email.com', 'Av. I, 876 - Curitiba', 'ativo', NOW(), NOW()),
(11, 'Gustavo Nunes', '890.234.567-89', '(51) 92211-0099', 'gustavo@email.com', 'Rua J, 432 - Porto Alegre', 'ativo', NOW(), NOW()),
(12, 'Patrícia Gomes', '123.890.456-70', '(61) 91100-9988', 'patricia@email.com', 'Setor G, Quadra 7 - Brasília', 'ativo', NOW(), NOW());

-- ============================================
-- 5. PRODUTOS (com foreign keys para categoria e fornecedor)
-- ============================================
INSERT INTO produtos (id, nome, descricao, preco_venda, preco_custo, estoque, estoque_minimo, codigo_barras, status, categoriaId, fornecedorId, criado_em, atualizado_em) VALUES
(1, 'Fone de Bluetooth Premium', 'Fone de ouvido bluetooth com cancelamento de ruído', 299.90, 180.00, 50, 10, '7891234567890', 'ativo', 1, 1, NOW(), NOW()),
(2, 'Carregador Solar Portátil', 'Carregador solar 20000mAh', 199.90, 120.00, 3, 5, '7891234567891', 'ativo', 1, 1, NOW(), NOW()),
(3, 'Kit Organização Escritório', 'Kit com organizadores de mesa', 89.90, 50.00, 25, 10, '7891234567892', 'ativo', 2, 2, NOW(), NOW()),
(4, 'Luminária LED Inteligente', 'Luminária LED com controle por app', 149.90, 90.00, 15, 5, '7891234567893', 'ativo', 3, 2, NOW(), NOW()),
(5, 'Notebook Gamer i7', 'Notebook com processador i7, 16GB RAM, RTX 3060', 5999.90, 4500.00, 8, 3, '7891234567894', 'ativo', 4, 3, NOW(), NOW()),
(6, 'Smartphone Android 128GB', 'Smartphone com tela 6.5", 128GB, 5G', 2499.90, 1800.00, 20, 5, '7891234567895', 'ativo', 5, 1, NOW(), NOW()),
(7, 'Soundbar Bluetooth 200W', 'Soundbar com subwoofer, Bluetooth 5.0', 899.90, 550.00, 12, 4, '7891234567896', 'ativo', 6, 4, NOW(), NOW()),
(8, 'Console PlayStation 5', 'Console de última geração com 1TB', 4499.90, 3500.00, 5, 2, '7891234567897', 'ativo', 7, 5, NOW(), NOW()),
(9, 'Cabo HDMI 4K 2m', 'Cabo HDMI de alta velocidade 4K', 49.90, 25.00, 100, 20, '7891234567898', 'ativo', 8, 6, NOW(), NOW()),
(10, 'Monitor 27" IPS 144Hz', 'Monitor gaming IPS 27 polegadas', 1899.90, 1400.00, 10, 3, '7891234567899', 'ativo', 4, 3, NOW(), NOW()),
(11, 'Teclado Mecânico RGB', 'Teclado mecânico com iluminação RGB', 349.90, 220.00, 30, 8, '7891234567900', 'ativo', 4, 6, NOW(), NOW()),
(12, 'Mouse Gamer 16000DPI', 'Mouse gamer com sensor ótico 16000DPI', 199.90, 120.00, 35, 10, '7891234567901', 'ativo', 4, 6, NOW(), NOW()),
(13, 'Tablet 10" 64GB', 'Tablet Android com tela 10 polegadas', 1299.90, 900.00, 15, 5, '7891234567902', 'ativo', 5, 1, NOW(), NOW()),
(14, 'Webcam Full HD 1080p', 'Webcam para streaming e videoconferências', 299.90, 180.00, 25, 8, '7891234567903', 'ativo', 4, 6, NOW(), NOW()),
(15, 'Fita LED 5m RGB', 'Fita LED com controle remoto RGB', 79.90, 40.00, 60, 15, '7891234567904', 'ativo', 3, 4, NOW(), NOW()),
(16, 'Cadeira Gamer Ergonômica', 'Cadeira gamer com ajuste de altura', 899.90, 550.00, 8, 3, '7891234567905', 'ativo', 2, 2, NOW(), NOW()),
(17, 'SSD 1TB NVMe', 'SSD NVMe de alta performance 1TB', 499.90, 320.00, 20, 6, '7891234567906', 'ativo', 4, 3, NOW(), NOW()),
(18, 'Power Bank 20000mAh', 'Power Bank com carregamento rápido', 149.90, 90.00, 40, 12, '7891234567907', 'ativo', 1, 1, NOW(), NOW()),
(19, 'Caixa de Som Bluetooth', 'Caixa de som portátil com 20W', 199.90, 120.00, 28, 8, '7891234567908', 'ativo', 6, 4, NOW(), NOW()),
(20, 'Controle Xbox Series X', 'Controle oficial Xbox Series X', 449.90, 300.00, 18, 5, '7891234567909', 'ativo', 7, 5, NOW(), NOW()),
(21, 'Estação de Trabalho 3 Níveis', 'Estação de trabalho ajustável em 3 níveis', 699.90, 420.00, 12, 4, '7891234567910', 'ativo', 2, 2, NOW(), NOW()),
(22, 'Headset Gamer 7.1', 'Headset gamer com som surround 7.1', 399.90, 250.00, 22, 7, '7891234567911', 'ativo', 6, 4, NOW(), NOW()),
(23, 'Smartwatch Fitness', 'Smartwatch com monitoramento de atividades', 599.90, 380.00, 14, 4, '7891234567912', 'ativo', 1, 1, NOW(), NOW()),
(24, 'Suporte para Notebook Ajustável', 'Suporte alumínio com ajuste de altura', 129.90, 75.00, 45, 12, '7891234567913', 'ativo', 8, 6, NOW(), NOW()),
(25, 'Kit 3 Câmeras de Segurança', 'Kit com 3 câmeras WiFi e DVR', 799.90, 480.00, 7, 2, '7891234567914', 'ativo', 1, 1, NOW(), NOW());

-- ============================================
-- 6. ESTOQUE MOVIMENTAÇÕES (com foreign key para produto)
-- ============================================
INSERT INTO estoque_movimentacoes (id, produtoId, tipo, quantidade, estoque_anterior, estoque_novo, motivo, vendaId, criado_em) VALUES
(1, 1, 'entrada', 50, 0, 50, 'Estoque inicial', NULL, NOW()),
(2, 2, 'entrada', 10, 0, 10, 'Estoque inicial', NULL, NOW()),
(3, 2, 'saida', 7, 10, 3, 'Venda de demonstração', NULL, NOW()),
(4, 5, 'entrada', 10, 0, 10, 'Estoque inicial', NULL, NOW()),
(5, 5, 'saida', 2, 10, 8, 'Venda #001', 1, NOW()),
(6, 8, 'entrada', 8, 0, 8, 'Estoque inicial', NULL, NOW()),
(7, 8, 'saida', 3, 8, 5, 'Venda #002', 2, NOW()),
(8, 6, 'entrada', 25, 0, 25, 'Estoque inicial', NULL, NOW()),
(9, 6, 'saida', 5, 25, 20, 'Venda #003', 3, NOW()),
(10, 7, 'entrada', 15, 0, 15, 'Estoque inicial', NULL, NOW()),
(11, 7, 'saida', 3, 15, 12, 'Venda #004', 4, NOW()),
(12, 10, 'entrada', 12, 0, 12, 'Estoque inicial', NULL, NOW()),
(13, 10, 'saida', 2, 12, 10, 'Venda #005', 5, NOW()),
(14, 1, 'saida', 2, 50, 48, 'Venda #006', 6, NOW()),
(15, 11, 'entrada', 35, 0, 35, 'Estoque inicial', NULL, NOW()),
(16, 11, 'saida', 5, 35, 30, 'Venda #007', 7, NOW()),
(17, 13, 'entrada', 18, 0, 18, 'Estoque inicial', NULL, NOW()),
(18, 13, 'saida', 3, 18, 15, 'Venda #008', 8, NOW()),
(19, 20, 'entrada', 22, 0, 22, 'Estoque inicial', NULL, NOW()),
(20, 20, 'saida', 4, 22, 18, 'Venda #009', 9, NOW());

-- ============================================
-- 7. VENDAS (com foreign keys para cliente e usuario)
-- ============================================
INSERT INTO vendas (id, clienteId, usuarioId, total, desconto, forma_pagamento, status, observacoes, criado_em, atualizado_em) VALUES
(1, 1, 3, 6299.80, 0, 'Cartão de Crédito', 'concluida', 'Cliente VIP', NOW(), NOW()),
(2, 2, 3, 8999.70, 100.00, 'Pix', 'concluida', 'Pagamento à vista', NOW(), NOW()),
(3, 3, 2, 4499.80, 0, 'Cartão de Débito', 'concluida', NULL, NOW(), NOW()),
(4, 4, 3, 2499.90, 0, 'Cartão de Crédito', 'concluida', NULL, NOW(), NOW()),
(5, 5, 3, 1849.80, 50.00, 'Pix', 'concluida', NULL, NOW(), NOW()),
(6, 6, 3, 599.80, 0, 'Dinheiro', 'concluida', NULL, NOW(), NOW()),
(7, 7, 2, 349.90, 0, 'Cartão de Crédito', 'concluida', NULL, NOW(), NOW()),
(8, 8, 3, 1299.80, 0, 'Pix', 'concluida', NULL, NOW(), NOW()),
(9, 9, 3, 449.80, 0, 'Cartão de Débito', 'concluida', NULL, NOW(), NOW()),
(10, 10, 3, 2299.80, 100.00, 'Cartão de Crédito', 'concluida', 'Cliente solicitou desconto', NOW(), NOW());

-- ============================================
-- 8. VENDA ITENS (com foreign keys para venda e produto)
-- ============================================
INSERT INTO venda_itens (id, vendaId, produtoId, quantidade, preco_unitario, subtotal, criado_em) VALUES
-- Venda 1
(1, 1, 5, 1, 5999.90, 5999.90, NOW()),
(2, 1, 9, 6, 49.90, 299.90, NOW()),
-- Venda 2
(3, 2, 8, 2, 4499.90, 8999.80, NOW()),
-- Venda 3
(4, 3, 8, 1, 4499.90, 4499.90, NOW()),
-- Venda 4
(5, 4, 6, 1, 2499.90, 2499.90, NOW()),
-- Venda 5
(6, 5, 7, 1, 899.90, 899.90, NOW()),
(7, 5, 10, 1, 1899.90, 1899.90, NOW()),
-- Venda 6
(8, 6, 1, 2, 299.90, 599.80, NOW()),
-- Venda 7
(9, 7, 11, 1, 349.90, 349.90, NOW()),
-- Venda 8
(10, 8, 13, 1, 1299.90, 1299.90, NOW()),
-- Venda 9
(11, 9, 20, 1, 449.90, 449.90, NOW()),
-- Venda 10
(12, 10, 23, 1, 599.90, 599.90, NOW()),
(13, 10, 17, 1, 499.90, 499.90, NOW()),
(14, 10, 18, 1, 149.90, 149.90, NOW()),
(15, 10, 19, 1, 199.90, 199.90, NOW());

-- ============================================
-- 9. SUGESTÕES IA (sem foreign keys)
-- ============================================
INSERT INTO sugestoes_ia (id, produto_nome, categoria, nivel_tendencia, justificativa, score, fonte_dados, status, criado_em, atualizado_em) VALUES
(1, 'Smartwatch Fitness', 'Eletrônicos', 'alta', 'Aumento de 120% nas buscas por smartwatches fitness', 0.92, 'Google Trends', 'pendente', NOW(), NOW()),
(2, 'Kit Home Office Completo', 'Casa e Escritório', 'media', 'Trabalho remoto em alta', 0.75, 'Market Analysis', 'pendente', NOW(), NOW()),
(3, 'Monitor 4K Gaming', 'Informática', 'alta', 'Demanda crescente por monitores 4K para gaming', 0.88, 'Sales Data', 'pendente', NOW(), NOW()),
(4, 'Cadeira Ergonômica Premium', 'Casa e Escritório', 'alta', 'Preocupação com saúde ocupacional em home office', 0.85, 'Consumer Trends', 'pendente', NOW(), NOW()),
(5, 'Câmera de Ação 4K', 'Eletrônicos', 'media', 'Tendência de conteúdo de aventura nas redes sociais', 0.72, 'Social Media Analysis', 'pendente', NOW(), NOW()),
(6, 'Kit Iluminação RGB', 'Iluminação', 'alta', 'Popularização de setups gamer com iluminação RGB', 0.90, 'Gaming Market Report', 'pendente', NOW(), NOW()),
(7, 'Tablet Gráfico Profissional', 'Informática', 'baixa', 'Nicho específico, demanda estável', 0.55, 'Professional Market', 'pendente', NOW(), NOW()),
(8, 'Console Portátil Retro', 'Games', 'media', 'Nostalgia e tendência de retro gaming', 0.68, 'Gaming Industry Report', 'pendente', NOW(), NOW());

-- ============================================
-- RESUMO
-- ============================================
SELECT 'Seed concluído com sucesso!' AS mensagem;
SELECT COUNT(*) AS usuarios FROM usuarios;
SELECT COUNT(*) AS categorias FROM categorias;
SELECT COUNT(*) AS fornecedores FROM fornecedores;
SELECT COUNT(*) AS clientes FROM clientes;
SELECT COUNT(*) AS produtos FROM produtos;
SELECT COUNT(*) AS estoque_movimentacoes FROM estoque_movimentacoes;
SELECT COUNT(*) AS vendas FROM vendas;
SELECT COUNT(*) AS venda_itens FROM venda_itens;
SELECT COUNT(*) AS sugestoes_ia FROM sugestoes_ia;
