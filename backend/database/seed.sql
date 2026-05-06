-- Script SQL para popular o banco loja_inteligente
-- Ordem de execuÃ§Ã£o: tabelas sem foreign keys primeiro, depois tabelas com foreign keys
-- Senha demo: TroqueEstaSenha123! (altere antes de uso real)

USE loja_inteligente;

-- ============================================
-- 1. USUÃRIOS (sem foreign keys)
-- ============================================
INSERT INTO usuarios (id, nome, email, senha_hash, perfil, status, criado_em, atualizado_em) VALUES
(1, 'Administrador', 'admin@example.com', '$2a$10$YVaDA/hu85gXYMJd009sF.ndWsF6L0HLPeGcJO/sQOfX9uw4kDjC.', 'admin', 'ativo', NOW(), NOW()),
(2, 'Gerente da Loja', 'gerente@example.com', '$2a$10$YVaDA/hu85gXYMJd009sF.ndWsF6L0HLPeGcJO/sQOfX9uw4kDjC.', 'gerente', 'ativo', NOW(), NOW()),
(3, 'Vendedor Carlos', 'vendedor@example.com', '$2a$10$YVaDA/hu85gXYMJd009sF.ndWsF6L0HLPeGcJO/sQOfX9uw4kDjC.', 'vendedor', 'ativo', NOW(), NOW());

-- ============================================
-- 2. CATEGORIAS (sem foreign keys)
-- ============================================
INSERT INTO categorias (id, nome, descricao, status, criado_em, atualizado_em) VALUES
(1, 'EletrÃ´nicos', 'Produtos eletrÃ´nicos em geral', 'ativo', NOW(), NOW()),
(2, 'Casa e EscritÃ³rio', 'Produtos para casa e escritÃ³rio', 'ativo', NOW(), NOW()),
(3, 'IluminaÃ§Ã£o', 'Produtos de iluminaÃ§Ã£o', 'ativo', NOW(), NOW()),
(4, 'InformÃ¡tica', 'Computadores e acessÃ³rios', 'ativo', NOW(), NOW()),
(5, 'Telefonia', 'Celulares e acessÃ³rios', 'ativo', NOW(), NOW()),
(6, 'Ãudio e VÃ­deo', 'Sistemas de som e vÃ­deo', 'ativo', NOW(), NOW()),
(7, 'Games', 'Consoles e jogos', 'ativo', NOW(), NOW()),
(8, 'AcessÃ³rios', 'AcessÃ³rios variados', 'ativo', NOW(), NOW());

-- ============================================
-- 3. FORNECEDORES (sem foreign keys)
-- ============================================
INSERT INTO fornecedores (id, nome, cnpj, telefone, email, endereco, status, criado_em, atualizado_em) VALUES
(1, 'Tech Distribuidora Demo', '00.000.000/0000-01', '(00) 0000-0001', 'fornecedor01@example.com', 'Endereco ficticio fornecedor 1', 'ativo', NOW(), NOW()),
(2, 'Casa Demo Ltda', '00.000.000/0000-02', '(00) 0000-0002', 'fornecedor02@example.com', 'Endereco ficticio fornecedor 2', 'ativo', NOW(), NOW()),
(3, 'Global Demo', '00.000.000/0000-03', '(00) 0000-0003', 'fornecedor03@example.com', 'Endereco ficticio fornecedor 3', 'ativo', NOW(), NOW()),
(4, 'Luz Demo', '00.000.000/0000-04', '(00) 0000-0004', 'fornecedor04@example.com', 'Endereco ficticio fornecedor 4', 'ativo', NOW(), NOW()),
(5, 'GameZone Demo', '00.000.000/0000-05', '(00) 0000-0005', 'fornecedor05@example.com', 'Endereco ficticio fornecedor 5', 'ativo', NOW(), NOW()),
(6, 'Acessorios Demo', '00.000.000/0000-06', '(00) 0000-0006', 'fornecedor06@example.com', 'Endereco ficticio fornecedor 6', 'ativo', NOW(), NOW());

-- ============================================
-- 4. CLIENTES (sem foreign keys)
-- ============================================
INSERT INTO clientes (id, nome, cpf, telefone, email, endereco, status, criado_em, atualizado_em) VALUES
(1, 'Cliente Demo 1', '000.000.000-01', '(00) 90000-0001', 'cliente01@example.com', 'Endereco ficticio cliente 1', 'ativo', NOW(), NOW()),
(2, 'Cliente Demo 2', '000.000.000-02', '(00) 90000-0002', 'cliente02@example.com', 'Endereco ficticio cliente 2', 'ativo', NOW(), NOW()),
(3, 'Cliente Demo 3', '000.000.000-03', '(00) 90000-0003', 'cliente03@example.com', 'Endereco ficticio cliente 3', 'ativo', NOW(), NOW()),
(4, 'Cliente Demo 4', '000.000.000-04', '(00) 90000-0004', 'cliente04@example.com', 'Endereco ficticio cliente 4', 'ativo', NOW(), NOW()),
(5, 'Cliente Demo 5', '000.000.000-05', '(00) 90000-0005', 'cliente05@example.com', 'Endereco ficticio cliente 5', 'ativo', NOW(), NOW()),
(6, 'Cliente Demo 6', '000.000.000-06', '(00) 90000-0006', 'cliente06@example.com', 'Endereco ficticio cliente 6', 'ativo', NOW(), NOW()),
(7, 'Cliente Demo 7', '000.000.000-07', '(00) 90000-0007', 'cliente07@example.com', 'Endereco ficticio cliente 7', 'ativo', NOW(), NOW()),
(8, 'Cliente Demo 8', '000.000.000-08', '(00) 90000-0008', 'cliente08@example.com', 'Endereco ficticio cliente 8', 'ativo', NOW(), NOW()),
(9, 'Cliente Demo 9', '000.000.000-09', '(00) 90000-0009', 'cliente09@example.com', 'Endereco ficticio cliente 9', 'ativo', NOW(), NOW()),
(10, 'Cliente Demo 10', '000.000.000-10', '(00) 90000-0010', 'cliente10@example.com', 'Endereco ficticio cliente 10', 'ativo', NOW(), NOW()),
(11, 'Cliente Demo 11', '000.000.000-11', '(00) 90000-0011', 'cliente11@example.com', 'Endereco ficticio cliente 11', 'ativo', NOW(), NOW()),
(12, 'Cliente Demo 12', '000.000.000-12', '(00) 90000-0012', 'cliente12@example.com', 'Endereco ficticio cliente 12', 'ativo', NOW(), NOW());

-- ============================================
-- 5. PRODUTOS (com foreign keys para categoria e fornecedor)
-- ============================================
INSERT INTO produtos (id, nome, descricao, preco_venda, preco_custo, estoque, estoque_minimo, codigo_barras, status, categoriaId, fornecedorId, criado_em, atualizado_em) VALUES
(1, 'Fone de Bluetooth Premium', 'Fone de ouvido bluetooth com cancelamento de ruÃ­do', 299.90, 180.00, 50, 10, '7891234567890', 'ativo', 1, 1, NOW(), NOW()),
(2, 'Carregador Solar PortÃ¡til', 'Carregador solar 20000mAh', 199.90, 120.00, 3, 5, '7891234567891', 'ativo', 1, 1, NOW(), NOW()),
(3, 'Kit OrganizaÃ§Ã£o EscritÃ³rio', 'Kit com organizadores de mesa', 89.90, 50.00, 25, 10, '7891234567892', 'ativo', 2, 2, NOW(), NOW()),
(4, 'LuminÃ¡ria LED Inteligente', 'LuminÃ¡ria LED com controle por app', 149.90, 90.00, 15, 5, '7891234567893', 'ativo', 3, 2, NOW(), NOW()),
(5, 'Notebook Gamer i7', 'Notebook com processador i7, 16GB RAM, RTX 3060', 5999.90, 4500.00, 8, 3, '7891234567894', 'ativo', 4, 3, NOW(), NOW()),
(6, 'Smartphone Android 128GB', 'Smartphone com tela 6.5", 128GB, 5G', 2499.90, 1800.00, 20, 5, '7891234567895', 'ativo', 5, 1, NOW(), NOW()),
(7, 'Soundbar Bluetooth 200W', 'Soundbar com subwoofer, Bluetooth 5.0', 899.90, 550.00, 12, 4, '7891234567896', 'ativo', 6, 4, NOW(), NOW()),
(8, 'Console PlayStation 5', 'Console de Ãºltima geraÃ§Ã£o com 1TB', 4499.90, 3500.00, 5, 2, '7891234567897', 'ativo', 7, 5, NOW(), NOW()),
(9, 'Cabo HDMI 4K 2m', 'Cabo HDMI de alta velocidade 4K', 49.90, 25.00, 100, 20, '7891234567898', 'ativo', 8, 6, NOW(), NOW()),
(10, 'Monitor 27" IPS 144Hz', 'Monitor gaming IPS 27 polegadas', 1899.90, 1400.00, 10, 3, '7891234567899', 'ativo', 4, 3, NOW(), NOW()),
(11, 'Teclado MecÃ¢nico RGB', 'Teclado mecÃ¢nico com iluminaÃ§Ã£o RGB', 349.90, 220.00, 30, 8, '7891234567900', 'ativo', 4, 6, NOW(), NOW()),
(12, 'Mouse Gamer 16000DPI', 'Mouse gamer com sensor Ã³tico 16000DPI', 199.90, 120.00, 35, 10, '7891234567901', 'ativo', 4, 6, NOW(), NOW()),
(13, 'Tablet 10" 64GB', 'Tablet Android com tela 10 polegadas', 1299.90, 900.00, 15, 5, '7891234567902', 'ativo', 5, 1, NOW(), NOW()),
(14, 'Webcam Full HD 1080p', 'Webcam para streaming e videoconferÃªncias', 299.90, 180.00, 25, 8, '7891234567903', 'ativo', 4, 6, NOW(), NOW()),
(15, 'Fita LED 5m RGB', 'Fita LED com controle remoto RGB', 79.90, 40.00, 60, 15, '7891234567904', 'ativo', 3, 4, NOW(), NOW()),
(16, 'Cadeira Gamer ErgonÃ´mica', 'Cadeira gamer com ajuste de altura', 899.90, 550.00, 8, 3, '7891234567905', 'ativo', 2, 2, NOW(), NOW()),
(17, 'SSD 1TB NVMe', 'SSD NVMe de alta performance 1TB', 499.90, 320.00, 20, 6, '7891234567906', 'ativo', 4, 3, NOW(), NOW()),
(18, 'Power Bank 20000mAh', 'Power Bank com carregamento rÃ¡pido', 149.90, 90.00, 40, 12, '7891234567907', 'ativo', 1, 1, NOW(), NOW()),
(19, 'Caixa de Som Bluetooth', 'Caixa de som portÃ¡til com 20W', 199.90, 120.00, 28, 8, '7891234567908', 'ativo', 6, 4, NOW(), NOW()),
(20, 'Controle Xbox Series X', 'Controle oficial Xbox Series X', 449.90, 300.00, 18, 5, '7891234567909', 'ativo', 7, 5, NOW(), NOW()),
(21, 'EstaÃ§Ã£o de Trabalho 3 NÃ­veis', 'EstaÃ§Ã£o de trabalho ajustÃ¡vel em 3 nÃ­veis', 699.90, 420.00, 12, 4, '7891234567910', 'ativo', 2, 2, NOW(), NOW()),
(22, 'Headset Gamer 7.1', 'Headset gamer com som surround 7.1', 399.90, 250.00, 22, 7, '7891234567911', 'ativo', 6, 4, NOW(), NOW()),
(23, 'Smartwatch Fitness', 'Smartwatch com monitoramento de atividades', 599.90, 380.00, 14, 4, '7891234567912', 'ativo', 1, 1, NOW(), NOW()),
(24, 'Suporte para Notebook AjustÃ¡vel', 'Suporte alumÃ­nio com ajuste de altura', 129.90, 75.00, 45, 12, '7891234567913', 'ativo', 8, 6, NOW(), NOW()),
(25, 'Kit 3 CÃ¢meras de SeguranÃ§a', 'Kit com 3 cÃ¢meras WiFi e DVR', 799.90, 480.00, 7, 2, '7891234567914', 'ativo', 1, 1, NOW(), NOW());

-- ============================================
-- 6. ESTOQUE MOVIMENTAÃ‡Ã•ES (com foreign key para produto)
-- ============================================
INSERT INTO estoque_movimentacoes (id, produtoId, tipo, quantidade, estoque_anterior, estoque_novo, motivo, vendaId, criado_em) VALUES
(1, 1, 'entrada', 50, 0, 50, 'Estoque inicial', NULL, NOW()),
(2, 2, 'entrada', 10, 0, 10, 'Estoque inicial', NULL, NOW()),
(3, 2, 'saida', 7, 10, 3, 'Venda de demonstraÃ§Ã£o', NULL, NOW()),
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
(1, 1, 3, 6299.80, 0, 'CartÃ£o de CrÃ©dito', 'concluida', 'Cliente VIP', NOW(), NOW()),
(2, 2, 3, 8999.70, 100.00, 'Pix', 'concluida', 'Pagamento Ã  vista', NOW(), NOW()),
(3, 3, 2, 4499.80, 0, 'CartÃ£o de DÃ©bito', 'concluida', NULL, NOW(), NOW()),
(4, 4, 3, 2499.90, 0, 'CartÃ£o de CrÃ©dito', 'concluida', NULL, NOW(), NOW()),
(5, 5, 3, 1849.80, 50.00, 'Pix', 'concluida', NULL, NOW(), NOW()),
(6, 6, 3, 599.80, 0, 'Dinheiro', 'concluida', NULL, NOW(), NOW()),
(7, 7, 2, 349.90, 0, 'CartÃ£o de CrÃ©dito', 'concluida', NULL, NOW(), NOW()),
(8, 8, 3, 1299.80, 0, 'Pix', 'concluida', NULL, NOW(), NOW()),
(9, 9, 3, 449.80, 0, 'CartÃ£o de DÃ©bito', 'concluida', NULL, NOW(), NOW()),
(10, 10, 3, 2299.80, 100.00, 'CartÃ£o de CrÃ©dito', 'concluida', 'Cliente solicitou desconto', NOW(), NOW());

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
-- 9. SUGESTÃ•ES IA (sem foreign keys)
-- ============================================
INSERT INTO sugestoes_ia (id, produto_nome, categoria, nivel_tendencia, justificativa, score, fonte_dados, status, criado_em, atualizado_em) VALUES
(1, 'Smartwatch Fitness', 'EletrÃ´nicos', 'alta', 'Aumento de 120% nas buscas por smartwatches fitness', 0.92, 'Google Trends', 'pendente', NOW(), NOW()),
(2, 'Kit Home Office Completo', 'Casa e EscritÃ³rio', 'media', 'Trabalho remoto em alta', 0.75, 'Market Analysis', 'pendente', NOW(), NOW()),
(3, 'Monitor 4K Gaming', 'InformÃ¡tica', 'alta', 'Demanda crescente por monitores 4K para gaming', 0.88, 'Sales Data', 'pendente', NOW(), NOW()),
(4, 'Cadeira ErgonÃ´mica Premium', 'Casa e EscritÃ³rio', 'alta', 'PreocupaÃ§Ã£o com saÃºde ocupacional em home office', 0.85, 'Consumer Trends', 'pendente', NOW(), NOW()),
(5, 'CÃ¢mera de AÃ§Ã£o 4K', 'EletrÃ´nicos', 'media', 'TendÃªncia de conteÃºdo de aventura nas redes sociais', 0.72, 'Social Media Analysis', 'pendente', NOW(), NOW()),
(6, 'Kit IluminaÃ§Ã£o RGB', 'IluminaÃ§Ã£o', 'alta', 'PopularizaÃ§Ã£o de setups gamer com iluminaÃ§Ã£o RGB', 0.90, 'Gaming Market Report', 'pendente', NOW(), NOW()),
(7, 'Tablet GrÃ¡fico Profissional', 'InformÃ¡tica', 'baixa', 'Nicho especÃ­fico, demanda estÃ¡vel', 0.55, 'Professional Market', 'pendente', NOW(), NOW()),
(8, 'Console PortÃ¡til Retro', 'Games', 'media', 'Nostalgia e tendÃªncia de retro gaming', 0.68, 'Gaming Industry Report', 'pendente', NOW(), NOW());

-- ============================================
-- RESUMO
-- ============================================
SELECT 'Seed concluÃ­do com sucesso!' AS mensagem;
SELECT COUNT(*) AS usuarios FROM usuarios;
SELECT COUNT(*) AS categorias FROM categorias;
SELECT COUNT(*) AS fornecedores FROM fornecedores;
SELECT COUNT(*) AS clientes FROM clientes;
SELECT COUNT(*) AS produtos FROM produtos;
SELECT COUNT(*) AS estoque_movimentacoes FROM estoque_movimentacoes;
SELECT COUNT(*) AS vendas FROM vendas;
SELECT COUNT(*) AS venda_itens FROM venda_itens;
SELECT COUNT(*) AS sugestoes_ia FROM sugestoes_ia;


