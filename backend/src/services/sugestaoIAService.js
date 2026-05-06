import prisma from '../config/database.js';
import { sugestaoIARepository } from '../repositories/sugestaoIARepository.js';

const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
const DEFAULT_TIMEOUT_MS = 20000;

const createValidationError = (message) => {
  const error = new Error(message);
  error.name = 'ValidationError';
  return error;
};

const normalizeText = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const normalizeTrendLevel = (value) => {
  const normalized = normalizeText(value);
  if (['alta', 'high', 'forte', 'quente'].includes(normalized)) return 'alta';
  if (['media', 'medio', 'média', 'moderada', 'medium'].includes(normalized)) return 'media';
  return 'baixa';
};

const toScore = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0.5;
  if (parsed < 0) return 0;
  if (parsed > 1) return 1;
  return parsed;
};

const isAiSuggestionsEnabled = () =>
  String(process.env.AI_SUGGESTIONS_ENABLED ?? 'true').toLowerCase() !== 'false';

const getOpenAIConfig = () => ({
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
  baseUrl: (process.env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL).replace(/\/+$/, ''),
  timeoutMs: Number(process.env.OPENAI_TIMEOUT_MS || DEFAULT_TIMEOUT_MS)
});

const validatePayload = (data) => {
  if (!data || !String(data.produtoNome || data.produto_nome || '').trim()) {
    throw createValidationError('Nome do produto sugerido e obrigatorio');
  }

  if (!String(data.nivelTendencia || data.nivel_tendencia || '').trim()) {
    throw createValidationError('Nivel de tendencia e obrigatorio');
  }

  if (!String(data.justificativa || '').trim()) {
    throw createValidationError('Justificativa e obrigatoria');
  }

  if (data.score !== undefined && data.score !== null && data.score !== '') {
    const parsed = Number(data.score);
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1) {
      throw createValidationError('Score deve estar entre 0 e 1');
    }
  }
};

const loadAiContext = async () => {
  const [categorias, produtos, sugestoesExistentes] = await Promise.all([
    prisma.categoria.findMany({
      select: { id: true, nome: true },
      orderBy: { nome: 'asc' }
    }),
    prisma.produto.findMany({
      where: { status: 'ativo' },
      select: {
        nome: true,
        categoria: { select: { nome: true } },
        estoqueAtual: true,
        estoqueMinimo: true,
        precoVenda: true
      },
      take: 80,
      orderBy: { criadoEm: 'desc' }
    }),
    prisma.sugestaoIA.findMany({
      select: {
        id: true,
        produtoNome: true,
        status: true,
        criadoEm: true
      },
      orderBy: { criadoEm: 'desc' }
    })
  ]);

  const categoriaPorNome = new Map(
    categorias.map((categoria) => [normalizeText(categoria.nome), categoria.id])
  );

  const categoriaNomePorId = new Map(categorias.map((categoria) => [categoria.id, categoria.nome]));

  const sugestaoPorProduto = new Map();
  for (const sugestao of sugestoesExistentes) {
    const key = normalizeText(sugestao.produtoNome);
    if (!sugestaoPorProduto.has(key)) {
      sugestaoPorProduto.set(key, sugestao);
    }
  }

  return { categorias, categoriaPorNome, categoriaNomePorId, produtos, sugestaoPorProduto };
};

const parseJsonContent = (text) => {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch (_error) {
    const cleaned = text.replace(/```json|```/gi, '').trim();
    try {
      return JSON.parse(cleaned);
    } catch (_ignored) {
      return null;
    }
  }
};

const buildPrompt = (categorias, produtos) => {
  const categoriasList = categorias.map((categoria) => categoria.nome).join(', ');
  const produtosList = produtos
    .slice(0, 30)
    .map((produto) => `${produto.nome} (${produto.categoria?.nome || 'Sem categoria'})`)
    .join('; ');

  return `
Voce e um analista de varejo brasileiro.
Gere 5 sugestoes de produtos com potencial de venda para os proximos 30 dias.

Categorias permitidas:
${categoriasList}

Produtos ja existentes no catalogo (evite repetir os mesmos nomes):
${produtosList}

Retorne obrigatoriamente JSON valido no formato:
{
  "sugestoes": [
    {
      "produtoNome": "string",
      "categoria": "string",
      "nivelTendencia": "alta|media|baixa",
      "justificativa": "string curta e objetiva",
      "score": 0.0,
      "fonteDados": "string"
    }
  ]
}

Regras:
- Use score entre 0 e 1.
- Nao invente categorias fora da lista permitida.
- Responda somente JSON, sem markdown.
`.trim();
};

const buildPromptWithHistory = (context) => {
  const base = buildPrompt(context.categorias, context.produtos);
  const historico = [...context.sugestaoPorProduto.values()]
    .slice(0, 60)
    .map((sugestao) => `${sugestao.produtoNome} (${sugestao.status})`)
    .join('; ');

  if (!historico) return base;

  return `
${base}

Produtos ja sugeridos anteriormente (evite repetir):
${historico}
`.trim();
};

const requestOpenAISuggestions = async (context) => {
  const config = getOpenAIConfig();
  if (!config.apiKey) {
    throw new Error('OPENAI_API_KEY nao configurada');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(`${config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model,
        temperature: 0.5,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Voce gera sugestoes de produtos para varejo. Responda apenas JSON valido.'
          },
          {
            role: 'user',
            content: buildPromptWithHistory(context)
          }
        ]
      })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const apiMessage = data?.error?.message || `HTTP ${response.status}`;
      throw new Error(`Falha na API OpenAI: ${apiMessage}`);
    }

    const content = data?.choices?.[0]?.message?.content;
    const parsed = parseJsonContent(content);
    if (!parsed || !Array.isArray(parsed.sugestoes)) {
      throw new Error('Resposta da IA em formato invalido');
    }

    return parsed.sugestoes;
  } finally {
    clearTimeout(timeoutId);
  }
};

const mapCategoriaId = (categoriaNome, categoriaPorNome, categoriaNomePorId) => {
  const normalized = normalizeText(categoriaNome);
  if (!normalized) {
    return { categoriaId: null, categoria: null };
  }

  let categoriaId = categoriaPorNome.get(normalized) || null;

  if (!categoriaId) {
    for (const [nomeNormalizado, id] of categoriaPorNome.entries()) {
      if (normalized.includes(nomeNormalizado) || nomeNormalizado.includes(normalized)) {
        categoriaId = id;
        break;
      }
    }
  }

  const categoria = categoriaId ? categoriaNomePorId.get(categoriaId) : null;
  return { categoriaId, categoria };
};

const saveGeneratedSuggestions = async (rawSuggestions, context, fonteFallback = null) => {
  const unique = new Map();
  for (const item of rawSuggestions || []) {
    const produtoNome = String(item?.produtoNome || item?.produto_nome || '').trim();
    if (!produtoNome) continue;
    unique.set(normalizeText(produtoNome), item);
  }

  const sugestoesCriadas = [];
  for (const item of unique.values()) {
    const produtoNome = String(item.produtoNome || item.produto_nome || '').trim();
    const justificativa = String(item.justificativa || '').trim();
    const nivelTendencia = normalizeTrendLevel(item.nivelTendencia || item.nivel_tendencia);
    const score = toScore(item.score);
    const fonteDados = fonteFallback || String(item.fonteDados || item.fonte_dados || 'OpenAI').trim();
    const categoriaRaw = item.categoria || item.categoriaNome || item.categoria_nome || '';

    const { categoriaId, categoria } = mapCategoriaId(
      categoriaRaw,
      context.categoriaPorNome,
      context.categoriaNomePorId
    );

    const payload = {
      produtoNome,
      categoriaId,
      categoria,
      nivelTendencia,
      justificativa,
      score,
      fonteDados,
      status: 'pendente'
    };

    validatePayload(payload);
    const existing = context.sugestaoPorProduto.get(normalizeText(produtoNome));

    if (existing?.status === 'pendente') {
      const updated = await sugestaoIARepository.update(existing.id, {
        ...payload,
        status: 'pendente'
      });
      sugestoesCriadas.push(updated);
      continue;
    }

    const saved = await sugestaoIARepository.create(payload);
    context.sugestaoPorProduto.set(normalizeText(produtoNome), {
      id: saved.id,
      produtoNome: saved.produtoNome || saved.produto_nome || produtoNome,
      status: saved.status || 'pendente'
    });
    sugestoesCriadas.push(saved);
  }

  return sugestoesCriadas;
};

const getSimulatedSuggestions = () => [
  {
    produtoNome: 'Fone de Bluetooth Premium',
    categoria: 'Eletronicos',
    nivelTendencia: 'alta',
    justificativa: 'Aumento de 150% nas buscas por fones sem fio nos ultimos 30 dias',
    score: 0.92
  },
  {
    produtoNome: 'Carregador Solar Portatil',
    categoria: 'Eletronicos',
    nivelTendencia: 'alta',
    justificativa: 'Tendencia de produtos sustentaveis em ascensao',
    score: 0.88
  },
  {
    produtoNome: 'Smartwatch Fitness',
    categoria: 'Eletronicos',
    nivelTendencia: 'media',
    justificativa: 'Demanda estavel com crescimento sazonal esperado',
    score: 0.75
  },
  {
    produtoNome: 'Kit Organizacao Escritorio',
    categoria: 'Casa e Escritorio',
    nivelTendencia: 'media',
    justificativa: 'Trabalho remoto impulsionando demanda por organizacao',
    score: 0.71
  },
  {
    produtoNome: 'Luminaria LED Inteligente',
    categoria: 'Iluminacao',
    nivelTendencia: 'baixa',
    justificativa: 'Mercado saturado, baixa margem de crescimento',
    score: 0.45
  }
];

export const sugestaoIAService = {
  getAll: async () => {
    return sugestaoIARepository.findAll();
  },

  getByStatus: async (status) => {
    return sugestaoIARepository.findByStatus(status);
  },

  getById: async (id) => {
    const sugestao = await sugestaoIARepository.findById(id);
    if (!sugestao) throw new Error('Sugestao nao encontrada');
    return sugestao;
  },

  create: async (data) => {
    validatePayload(data);
    return sugestaoIARepository.create(data);
  },

  aprovar: async (id) => {
    const sugestao = await sugestaoIARepository.findById(id);
    if (!sugestao) throw new Error('Sugestao nao encontrada');
    return sugestaoIARepository.aprovar(id);
  },

  rejeitar: async (id) => {
    const sugestao = await sugestaoIARepository.findById(id);
    if (!sugestao) throw new Error('Sugestao nao encontrada');
    return sugestaoIARepository.rejeitar(id);
  },

  gerarSugestoes: async () => {
    const context = await loadAiContext();

    if (!isAiSuggestionsEnabled()) {
      return saveGeneratedSuggestions(
        getSimulatedSuggestions(),
        context,
        'Simulacao local (AI_SUGGESTIONS_ENABLED=false)'
      );
    }

    try {
      const rawSuggestions = await requestOpenAISuggestions(context);
      return await saveGeneratedSuggestions(rawSuggestions, context);
    } catch (error) {
      console.error('Falha ao gerar sugestoes com IA real. Usando fallback simulado.', error);
      return saveGeneratedSuggestions(
        getSimulatedSuggestions(),
        context,
        'Simulacao local (fallback por erro na IA)'
      );
    }
  },

  gerarSugestoesSimuladas: async () => {
    const context = await loadAiContext();
    return saveGeneratedSuggestions(getSimulatedSuggestions(), context, 'Simulacao local manual');
  }
};
