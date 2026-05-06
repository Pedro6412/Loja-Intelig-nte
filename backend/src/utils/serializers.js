const pickFirstDefined = (...values) => values.find((value) => value !== undefined);

export const toNumber = (value) => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'object' && value !== null && 'toNumber' in value) {
    return value.toNumber();
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toInteger = (value, fallback = null) => {
  const numeric = toNumber(value);
  if (numeric === null) return fallback;
  return Math.trunc(numeric);
};

export const serializeProduto = (produto) => {
  if (!produto) return produto;

  const precoVenda = toNumber(pickFirstDefined(produto.preco_venda, produto.precoVenda)) ?? 0;
  const precoCusto = toNumber(pickFirstDefined(produto.preco_custo, produto.precoCusto));
  const estoqueAtual = toInteger(
    pickFirstDefined(produto.estoqueAtual, produto.estoque_atual, produto.estoque),
    0
  );
  const estoqueMinimo = toInteger(
    pickFirstDefined(produto.estoqueMinimo, produto.estoque_minimo),
    0
  );
  const categoriaId = toInteger(pickFirstDefined(produto.categoriaId, produto.categoria_id));
  const fornecedorId = toInteger(pickFirstDefined(produto.fornecedorId, produto.fornecedor_id));
  const codigoBarras = pickFirstDefined(produto.codigoBarras, produto.codigo_barras) ?? null;
  const createdAt =
    pickFirstDefined(produto.createdAt, produto.criadoEm, produto.criado_em) ?? null;
  const updatedAt =
    pickFirstDefined(produto.updatedAt, produto.atualizadoEm, produto.atualizado_em) ?? null;

  return {
    ...produto,
    preco_venda: precoVenda,
    precoVenda,
    preco_custo: precoCusto,
    precoCusto,
    estoque: estoqueAtual,
    estoque_atual: estoqueAtual,
    estoqueAtual,
    estoque_minimo: estoqueMinimo,
    estoqueMinimo,
    categoria_id: categoriaId,
    categoriaId,
    fornecedor_id: fornecedorId,
    fornecedorId,
    codigo_barras: codigoBarras,
    codigoBarras,
    createdAt,
    criado_em: createdAt,
    updatedAt,
    atualizado_em: updatedAt
  };
};

export const serializeVendaItem = (item) => {
  const precoUnitario = toNumber(pickFirstDefined(item.preco_unitario, item.precoUnitario)) ?? 0;
  const desconto = toNumber(item.desconto) ?? 0;
  const subtotal = toNumber(item.subtotal) ?? 0;
  const produtoId = toInteger(pickFirstDefined(item.produtoId, item.produto_id));

  return {
    ...item,
    preco_unitario: precoUnitario,
    precoUnitario: precoUnitario,
    desconto,
    subtotal,
    produtoId,
    produto_id: produtoId
  };
};

export const serializeVenda = (venda) => {
  const clienteId = toInteger(pickFirstDefined(venda.clienteId, venda.cliente_id));
  const usuarioId = toInteger(pickFirstDefined(venda.usuarioId, venda.usuario_id));
  const formaPagamento = pickFirstDefined(venda.formaPagamento, venda.forma_pagamento) ?? null;
  const dataVenda =
    pickFirstDefined(venda.dataVenda, venda.data_venda, venda.createdAt, venda.criado_em) ?? null;
  const itens = Array.isArray(venda.vendaItens)
    ? venda.vendaItens
    : Array.isArray(venda.venda_itens)
      ? venda.venda_itens
      : [];
  const vendaItens = itens.map(serializeVendaItem);

  return {
    ...venda,
    subtotal: toNumber(venda.subtotal) ?? 0,
    desconto: toNumber(venda.desconto) ?? 0,
    total: toNumber(venda.total) ?? 0,
    clienteId,
    cliente_id: clienteId,
    usuarioId,
    usuario_id: usuarioId,
    formaPagamento,
    forma_pagamento: formaPagamento,
    createdAt: dataVenda,
    dataVenda,
    data_venda: dataVenda,
    vendaItens,
    venda_itens: vendaItens
  };
};

export const serializeMovimentacao = (mov, estoqueAnterior = null, estoqueNovo = null) => {
  const produtoId = toInteger(pickFirstDefined(mov.produtoId, mov.produto_id));
  const usuarioId = toInteger(pickFirstDefined(mov.usuarioId, mov.usuario_id));
  const createdAt = pickFirstDefined(mov.createdAt, mov.criadoEm, mov.criado_em) ?? null;
  const estoqueAnteriorFinal =
    estoqueAnterior ?? pickFirstDefined(mov.estoqueAnterior, mov.estoque_anterior) ?? null;
  const estoqueNovoFinal = estoqueNovo ?? pickFirstDefined(mov.estoqueNovo, mov.estoque_novo) ?? null;

  return {
    ...mov,
    produtoId,
    produto_id: produtoId,
    usuarioId,
    usuario_id: usuarioId,
    createdAt,
    criado_em: createdAt,
    estoqueAnterior: estoqueAnteriorFinal,
    estoque_anterior: estoqueAnteriorFinal,
    estoqueNovo: estoqueNovoFinal,
    estoque_novo: estoqueNovoFinal
  };
};

export const serializeFornecedor = (fornecedor) => ({
  ...fornecedor,
  nome:
    fornecedor.nome ||
    fornecedor.nomeFantasia ||
    fornecedor.nome_fantasia ||
    fornecedor.razaoSocial ||
    fornecedor.razao_social
});

export const serializeSugestao = (sugestao) => {
  const score = toNumber(sugestao.score);
  const categoriaId = toInteger(pickFirstDefined(sugestao.categoriaId, sugestao.categoria_id));
  const produtoNome = pickFirstDefined(sugestao.produtoNome, sugestao.produto_nome) ?? null;
  const nivelTendencia =
    pickFirstDefined(sugestao.nivelTendencia, sugestao.nivel_tendencia) ?? null;
  const fonteDados = pickFirstDefined(sugestao.fonteDados, sugestao.fonte_dados) ?? null;
  const categoriaNome =
    typeof sugestao.categoria === 'string'
      ? sugestao.categoria
      : sugestao.categoria?.nome ??
        pickFirstDefined(sugestao.categoriaNome, sugestao.categoria_nome) ??
        null;
  const createdAt =
    pickFirstDefined(sugestao.createdAt, sugestao.criadoEm, sugestao.criado_em) ?? null;

  return {
    ...sugestao,
    score,
    categoria: categoriaNome,
    categoriaNome: categoriaNome,
    categoria_nome: categoriaNome,
    categoriaId,
    categoria_id: categoriaId,
    produtoNome,
    produto_nome: produtoNome,
    nivelTendencia,
    nivel_tendencia: nivelTendencia,
    fonteDados,
    fonte_dados: fonteDados,
    createdAt,
    criado_em: createdAt
  };
};
