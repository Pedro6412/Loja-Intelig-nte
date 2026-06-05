import { produtoRepository } from '../repositories/produtoRepository.js';

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);
const hasAny = (obj, keys) => keys.some((key) => hasOwn(obj, key));

const createValidationError = (message) => {
  const error = new Error(message);
  error.name = 'ValidationError';
  return error;
};

const getField = (data, keys) => {
  for (const key of keys) {
    if (hasOwn(data, key)) return data[key];
  }
  return undefined;
};

const validateNumber = (value, label, { required = false, integer = false, min = null } = {}) => {
  if (value === undefined || value === null || value === '') {
    if (required) throw createValidationError(`${label} e obrigatorio`);
    return;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw createValidationError(`${label} invalido`);
  }

  if (integer && !Number.isInteger(parsed)) {
    throw createValidationError(`${label} deve ser um numero inteiro`);
  }

  if (min !== null && parsed < min) {
    throw createValidationError(`${label} nao pode ser menor que ${min}`);
  }
};

const validateCreatePayload = (data) => {
  if (!data || !String(data.nome || '').trim()) {
    throw createValidationError('Nome do produto e obrigatorio');
  }

  const categoriaId = getField(data, ['categoriaId', 'categoria_id']);
  validateNumber(categoriaId, 'Categoria', { required: false, integer: true, min: 1 });

  validateNumber(getField(data, ['preco_venda', 'precoVenda']), 'Preco de venda', {
    required: true,
    min: 0
  });

  validateNumber(getField(data, ['preco_custo', 'precoCusto']), 'Preco de custo', {
    required: false,
    min: 0
  });

  validateNumber(getField(data, ['estoque_atual', 'estoqueAtual', 'estoque']), 'Estoque atual', {
    required: true,
    integer: true,
    min: 0
  });

  validateNumber(getField(data, ['estoque_minimo', 'estoqueMinimo']), 'Estoque minimo', {
    required: false,
    integer: true,
    min: 0
  });

  const fornecedorId = getField(data, ['fornecedorId', 'fornecedor_id']);
  validateNumber(fornecedorId, 'Fornecedor', { required: false, integer: true, min: 1 });
};

const validateUpdatePayload = (data) => {
  if (!data || Object.keys(data).length === 0) {
    throw createValidationError('Nenhum dado informado para atualizacao');
  }

  if (hasOwn(data, 'nome') && !String(data.nome || '').trim()) {
    throw createValidationError('Nome do produto e obrigatorio');
  }

  if (hasAny(data, ['categoriaId', 'categoria_id'])) {
    const categoriaId = getField(data, ['categoriaId', 'categoria_id']);
    validateNumber(categoriaId, 'Categoria', { required: true, integer: true, min: 1 });
  }

  if (hasAny(data, ['fornecedorId', 'fornecedor_id'])) {
    const fornecedorId = getField(data, ['fornecedorId', 'fornecedor_id']);
    validateNumber(fornecedorId, 'Fornecedor', { required: false, integer: true, min: 1 });
  }

  if (hasAny(data, ['preco_venda', 'precoVenda'])) {
    validateNumber(getField(data, ['preco_venda', 'precoVenda']), 'Preco de venda', { min: 0 });
  }

  if (hasAny(data, ['preco_custo', 'precoCusto'])) {
    validateNumber(getField(data, ['preco_custo', 'precoCusto']), 'Preco de custo', { min: 0 });
  }

  if (hasAny(data, ['estoque_atual', 'estoqueAtual', 'estoque'])) {
    validateNumber(getField(data, ['estoque_atual', 'estoqueAtual', 'estoque']), 'Estoque atual', {
      integer: true,
      min: 0
    });
  }

  if (hasAny(data, ['estoque_minimo', 'estoqueMinimo'])) {
    validateNumber(getField(data, ['estoque_minimo', 'estoqueMinimo']), 'Estoque minimo', {
      integer: true,
      min: 0
    });
  }
};

export const produtoService = {
  getAll: async () => {
    return produtoRepository.findAll();
  },

  getById: async (id) => {
    const produto = await produtoRepository.findById(id);
    if (!produto) throw new Error('Produto nao encontrado');
    return produto;
  },

  getLowStock: async () => {
    return produtoRepository.findLowStock();
  },

  getTopSelling: async (limit = 10) => {
    const parsedLimit = Number(limit);
    const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.trunc(parsedLimit) : 10;
    return produtoRepository.findTopSelling(safeLimit);
  },

  create: async (data) => {
    validateCreatePayload(data);
    return produtoRepository.create(data);
  },

  update: async (id, data) => {
    const produto = await produtoRepository.findById(id);
    if (!produto) throw new Error('Produto nao encontrado');
    validateUpdatePayload(data);
    return produtoRepository.update(id, data);
  },

  updateStock: async (id, quantidade) => {
    const produto = await produtoRepository.findById(id);
    if (!produto) throw new Error('Produto nao encontrado');
    validateNumber(quantidade, 'Quantidade de estoque', { required: true, integer: true, min: 0 });
    return produtoRepository.updateStock(id, quantidade);
  },

  delete: async (id) => {
    const produto = await produtoRepository.findById(id);
    if (!produto) throw new Error('Produto nao encontrado');
    return produtoRepository.softDelete(id);
  }
};
