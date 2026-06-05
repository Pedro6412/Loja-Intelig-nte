USE loja_inteligente;

ALTER TABLE vendas
  ADD COLUMN IF NOT EXISTS local_venda VARCHAR(120) NULL AFTER forma_pagamento;
