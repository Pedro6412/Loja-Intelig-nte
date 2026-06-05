import { vendaService } from './vendaService.js';

const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';
const DEFAULT_TIMEOUT_MS = 20000;

const createValidationError = (message) => {
  const error = new Error(message);
  error.name = 'ValidationError';
  return error;
};

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    toNumber(value, 0)
  );

const isAiAssistantEnabled = () =>
  String(process.env.AI_ASSISTANT_ENABLED ?? 'true').toLowerCase() !== 'false';

const getOpenAIConfig = () => ({
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.OPENAI_MODEL || process.env.ASSISTANT_OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
  baseUrl: (process.env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL).replace(/\/+$/, ''),
  timeoutMs: Number(process.env.OPENAI_TIMEOUT_MS || DEFAULT_TIMEOUT_MS)
});

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const normalizeRole = (role) => {
  if (role === 'assistant') return 'assistant';
  return 'user';
};

const sanitizeHistory = (history, currentMessage = '') => {
  if (!Array.isArray(history)) return [];

  const cleaned = history
    .map((item) => ({
      role: normalizeRole(item?.role),
      content: String(item?.content || '').trim()
    }))
    .filter((item) => item.content.length > 0)
    .slice(-14);

  const currentNormalized = normalizeText(currentMessage);
  if (cleaned.length > 0) {
    const last = cleaned[cleaned.length - 1];
    if (last.role === 'user' && normalizeText(last.content) === currentNormalized) {
      cleaned.pop();
    }
  }

  return cleaned
    .map((item) => ({
      role: item.role,
      content: item.content.slice(0, 2000)
    }));
};

const normalizeRecentSales = (sales) =>
  (Array.isArray(sales) ? sales : []).slice(0, 5).map((sale) => ({
    id: sale.id,
    total: toNumber(sale.total, 0),
    local:
      sale?.regiao ||
      sale?.bairro ||
      sale?.cidade ||
      sale?.localVenda ||
      sale?.local_venda ||
      'Venda direta',
    data: sale.createdAt || sale.dataVenda || sale.data_venda || null
  }));

const getBusinessContext = async () => {
  const [dashboardStats, dailyStats, monthlyStats] = await Promise.all([
    vendaService.getDashboardStats(),
    vendaService.getDailyStats(),
    vendaService.getMonthlyStats()
  ]);

  const totalDia = toNumber(dailyStats?.total, 0);
  const quantidadeDia = toNumber(dailyStats?.quantidade, 0);
  const totalMes = toNumber(monthlyStats?.total, 0);
  const quantidadeMes = toNumber(monthlyStats?.quantidade, 0);
  const ticketMedioMes = quantidadeMes > 0 ? totalMes / quantidadeMes : 0;

  const topProdutos = (dashboardStats?.produtosMaisVendidos || []).slice(0, 5).map((produto) => ({
    nome: produto.nome || 'Produto sem nome',
    categoria: produto?.categoria?.nome || 'Sem categoria',
    totalVendido: toNumber(produto.totalVendido, 0)
  }));

  const baixoEstoque = (dashboardStats?.produtosBaixoEstoque || []).slice(0, 5).map((produto) => ({
    nome: produto.nome || 'Produto sem nome',
    estoqueAtual: toNumber(produto.estoqueAtual ?? produto.estoque_atual ?? produto.estoque, 0),
    estoqueMinimo: toNumber(produto.estoqueMinimo ?? produto.estoque_minimo, 0)
  }));

  const ultimasVendas = normalizeRecentSales(dashboardStats?.ultimasVendas);

  return {
    dataConsulta: new Date().toISOString(),
    totalDia,
    quantidadeDia,
    totalMes,
    quantidadeMes,
    ticketMedioMes,
    quantidadeVendasTotal: toNumber(dashboardStats?.quantidadeVendas, 0),
    topProdutos,
    baixoEstoque,
    ultimasVendas
  };
};

const buildContextText = (context) => {
  const topProdutosText =
    context.topProdutos.length > 0
      ? context.topProdutos
          .map(
            (produto, index) =>
              `${index + 1}. ${produto.nome} (${produto.categoria}) - ${produto.totalVendido} un`
          )
          .join('\n')
      : 'Nenhum produto vendido ainda.';

  const baixoEstoqueText =
    context.baixoEstoque.length > 0
      ? context.baixoEstoque
          .map(
            (produto, index) =>
              `${index + 1}. ${produto.nome} - estoque ${produto.estoqueAtual} (min ${produto.estoqueMinimo})`
          )
          .join('\n')
      : 'Nao ha alertas de baixo estoque.';

  const ultimasVendasText =
    context.ultimasVendas.length > 0
      ? context.ultimasVendas
          .map(
            (venda) =>
              `Venda #${venda.id} - ${formatCurrency(venda.total)} - ${venda.local} - ${new Date(
                venda.data || Date.now()
              ).toLocaleDateString('pt-BR')}`
          )
          .join('\n')
      : 'Nenhuma venda recente registrada.';

  return `
Contexto atualizado da loja:
- Data da consulta: ${new Date(context.dataConsulta).toLocaleString('pt-BR')}
- Vendas do dia: ${formatCurrency(context.totalDia)} (${context.quantidadeDia} vendas)
- Vendas do mes: ${formatCurrency(context.totalMes)} (${context.quantidadeMes} vendas)
- Ticket medio do mes: ${formatCurrency(context.ticketMedioMes)}
- Total de vendas registradas: ${context.quantidadeVendasTotal}

Top produtos:
${topProdutosText}

Produtos com baixo estoque:
${baixoEstoqueText}

Ultimas vendas:
${ultimasVendasText}
`.trim();
};

const buildSystemPrompt = (contextText) =>
  `
Voce e o Assistente IA da Loja Inteligente.
Responda sempre em portugues do Brasil, de forma clara, pratica e amigavel.

Objetivo:
- Conversar como um chat geral e natural.
- Quando o assunto for loja, vendas, estoque ou operacao, usar os dados de negocio para orientar a resposta.

Regras importantes:
- Se a pergunta NAO for sobre negocio, responda normalmente como conversa livre.
- Se a pergunta for de negocio, use o contexto abaixo como fonte principal.
- Nao invente numeros ou fatos fora do contexto.
- Quando nao houver dado suficiente, diga isso de forma direta.
- Sugira proximos passos objetivos quando fizer sentido.
- Evite respostas longas demais.

${contextText}
`.trim();

const requestOpenAIResponse = async ({ message, history, contextText }) => {
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
        temperature: 0.4,
        messages: [
          {
            role: 'system',
            content: buildSystemPrompt(contextText)
          },
          ...history,
          {
            role: 'user',
            content: message
          }
        ]
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const apiMessage = data?.error?.message || `HTTP ${response.status}`;
      throw new Error(`Falha na API OpenAI: ${apiMessage}`);
    }

    const content = String(data?.choices?.[0]?.message?.content || '').trim();
    if (!content) {
      throw new Error('Resposta vazia da IA');
    }

    return content;
  } finally {
    clearTimeout(timeoutId);
  }
};

const includesAny = (text, terms) => terms.some((term) => text.includes(term));

const FREE_MODE_TERMS = [
  'modo livre',
  'conversa livre',
  'trocar ideia',
  'troca uma ideia',
  'bate papo',
  'bater papo',
  'papo livre',
  'so conversar'
];

const SALES_TERMS = [
  'venda',
  'faturamento',
  'ticket',
  'estoque',
  'produto',
  'margem',
  'lucro',
  'meta',
  'desempenho',
  'performance',
  'ruptura'
];

const BUSINESS_HINT_TERMS = [
  'resumo',
  'vendem mais',
  'vende mais',
  'mais vendido',
  'top produto',
  'estoque baixo',
  'reposicao',
  'repor',
  'aumentar ticket',
  'aumentar venda',
  'estrategia'
];

const hasSalesIntent = (normalizedText) => includesAny(normalizedText, SALES_TERMS);

const pickVariant = (seed, variants) => {
  if (!Array.isArray(variants) || variants.length === 0) return '';
  const total = String(seed || '')
    .split('')
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return variants[total % variants.length];
};

const wasFreeModeRecently = (history) => {
  if (!Array.isArray(history)) return false;
  const recentUserMessages = history
    .filter((item) => item?.role === 'user')
    .slice(-8)
    .map((item) => normalizeText(item.content));

  return recentUserMessages.some((content) => includesAny(content, FREE_MODE_TERMS));
};

const buildShortSummary = (context) =>
  `Hoje: ${context.quantidadeDia} vendas (${formatCurrency(context.totalDia)}). Mes: ${context.quantidadeMes} vendas (${formatCurrency(context.totalMes)}). Ticket medio: ${formatCurrency(context.ticketMedioMes)}.`;

const inferConversationMode = (message, context) => {
  const normalized = normalizeText(message);
  const mentionsKnownProduct = (context.topProdutos || []).some((produto) =>
    normalized.includes(normalizeText(produto.nome))
  );

  const isBusiness =
    hasSalesIntent(normalized) || includesAny(normalized, BUSINESS_HINT_TERMS) || mentionsKnownProduct;

  return isBusiness ? 'negocio' : 'livre';
};

const buildBusinessActionPlan = (context) => {
  const actions = [];

  const top = context.topProdutos?.[0];
  const stockRisk = context.baixoEstoque?.[0];

  if (top?.nome) {
    actions.push(`Criar oferta combinada com ${top.nome} para elevar ticket medio.`);
  }

  if (stockRisk?.nome) {
    actions.push(
      `Priorizar reposicao de ${stockRisk.nome} (estoque ${stockRisk.estoqueAtual}, minimo ${stockRisk.estoqueMinimo}).`
    );
  }

  actions.push('Revisar resultado no fim do dia e comparar com a media da semana.');
  return actions.slice(0, 3);
};

const buildTopProductsText = (context) => {
  if (context.topProdutos.length === 0) return 'Ainda nao houve vendas de produtos.';
  return context.topProdutos
    .slice(0, 5)
    .map((produto, index) => `${index + 1}. ${produto.nome} (${produto.totalVendido} un)`)
    .join('\n');
};

const buildLowStockText = (context) => {
  if (context.baixoEstoque.length === 0) return 'Sem alertas de baixo estoque agora.';
  return context.baixoEstoque
    .slice(0, 5)
    .map(
      (produto, index) =>
        `${index + 1}. ${produto.nome} - estoque ${produto.estoqueAtual} (min ${produto.estoqueMinimo})`
    )
    .join('\n');
};

const getLastAssistantMessage = (history) => {
  if (!Array.isArray(history)) return null;
  for (let index = history.length - 1; index >= 0; index -= 1) {
    if (history[index]?.role === 'assistant') {
      return String(history[index].content || '').trim();
    }
  }
  return null;
};

const buildGeneralFallbackResponse = (message, normalized, history = []) => {
  if (
    includesAny(normalized, [
      'engessad',
      'nao ta fluindo',
      'nao ta fluindo',
      'travado',
      'robot'
    ])
  ) {
    return 'Voce tem razao. Vou responder de forma mais solta a partir de agora. Pode mandar qualquer pergunta que eu sigo no estilo chat.';
  }

  if (includesAny(normalized, ['quem e voce', 'quem é voce', 'o que voce faz', 'o que vc faz'])) {
    return 'Sou seu assistente no sistema. Posso conversar livremente e, quando voce quiser, também analisar vendas e operacao da loja.';
  }

  if (
    includesAny(normalized, [
      'como vai',
      'como voce esta',
      'como vc esta',
      'tudo bem',
      'e ai',
      'oi',
      'ola'
    ])
  ) {
    return pickVariant(message, [
      'Estou bem por aqui. E voce, como esta?',
      'Tudo certo comigo. Quer bater papo sobre qualquer tema?',
      'Estou bem sim. Manda sua pergunta que eu te acompanho.'
    ]);
  }

  if (includesAny(normalized, FREE_MODE_TERMS)) {
    return 'Fechado. Modo chat livre ativado. Pode perguntar o que quiser.';
  }

  const lastAssistant = normalizeText(getLastAssistantMessage(history) || '');
  if (normalized.length <= 20 && includesAny(normalized, ['sim', 'nao', 'talvez'])) {
    if (lastAssistant.includes('?')) {
      return 'Perfeito. Continua, quero te ouvir melhor para te responder no ponto certo.';
    }
  }

  if (normalized.endsWith('?')) {
    return 'Boa pergunta. Te respondo no estilo chat, direto e sem roteiro. Se voce quiser, depois eu conecto essa conversa com os dados da loja.';
  }

  return 'Estou com voce. Pode continuar que eu vou respondendo de forma natural, sem formato engessado.';
};

const generateFallbackResponse = (message, context, history = []) => {
  const normalized = normalizeText(message);
  const topProdutosText = buildTopProductsText(context);
  const baixoEstoqueText = buildLowStockText(context);
  const resumoCurto = buildShortSummary(context);

  const buscaTop = includesAny(normalized, [
    'mais vendido',
    'vendendo mais',
    'vendem mais',
    'vende mais',
    'top produto',
    'top produtos',
    'produto vende',
    'melhor desempenho',
    'mais sai'
  ]);

  const buscaEstoque = includesAny(normalized, [
    'estoque',
    'ruptura',
    'falta',
    'baixo estoque',
    'reposicao',
    'repor'
  ]);

  const buscaResumoVendas = includesAny(normalized, [
    'resumo',
    'vendas',
    'faturamento',
    'ticket medio',
    'hoje',
    'mes'
  ]);

  const buscaEstrategia = includesAny(normalized, [
    'aumentar venda',
    'aumentar ticket',
    'estrategia',
    'melhorar',
    'plano',
    'sugestao'
  ]);

  const buscaAnalise = includesAny(normalized, [
    'analisa',
    'analise',
    'desempenho',
    'performance'
  ]);

  const saudacao = includesAny(normalized, [
    'oi',
    'ola',
    'bom dia',
    'boa tarde',
    'boa noite',
    'tudo bem'
  ]);

  const buscaModoLivre = includesAny(normalized, FREE_MODE_TERMS);
  const modoLivreAtivo = buscaModoLivre || (wasFreeModeRecently(history) && !hasSalesIntent(normalized));
  const businessIntent =
    hasSalesIntent(normalized) ||
    buscaTop ||
    buscaEstoque ||
    buscaResumoVendas ||
    buscaEstrategia ||
    buscaAnalise;

  const produtoMencionado = context.topProdutos.find((produto) =>
    normalized.includes(normalizeText(produto.nome))
  );

  if (modoLivreAtivo || !businessIntent) {
    return buildGeneralFallbackResponse(message, normalized, history);
  }

  if (produtoMencionado) {
    return `${produtoMencionado.nome} aparece entre os destaques com ${produtoMencionado.totalVendido} unidades vendidas. ${resumoCurto}`;
  }

  if (buscaEstoque) {
    return `Alertas de estoque:\n${baixoEstoqueText}\n\n${resumoCurto}`;
  }

  if (buscaTop) {
    return `Produtos com melhor desempenho:\n${topProdutosText}\n\n${resumoCurto}`;
  }

  if (buscaEstrategia) {
    const foco = context.baixoEstoque[0]?.nome
      ? `Priorize reposicao de ${context.baixoEstoque[0].nome} para evitar perda de venda.`
      : 'No momento nao ha ruptura critica de estoque.';
    const destaque = context.topProdutos[0]?.nome
      ? `Use ${context.topProdutos[0].nome} como produto ancora para vender itens complementares.`
      : 'Assim que houver mais vendas, eu monto uma estrategia por produto.';

    return `Plano rapido para aumentar resultado:\n1. ${destaque}\n2. Crie oferta com combo para elevar ticket medio.\n3. Acompanhe vendas por dia e compare horario de pico.\n4. ${foco}\n\n${resumoCurto}`;
  }

  if (buscaAnalise) {
    const destaque = context.topProdutos[0]
      ? `Produto destaque atual: ${context.topProdutos[0].nome} (${context.topProdutos[0].totalVendido} un).`
      : 'Ainda nao ha produto destaque no periodo.';

    return `Analise rapida do desempenho:\n${resumoCurto}\n${destaque}\n\nSe quiser, eu monto um plano de acao em cima dessa analise.`;
  }

  if (buscaResumoVendas) {
    return `Resumo de vendas:\n${resumoCurto}\n\nTop produtos:\n${topProdutosText}`;
  }

  if (saudacao) {
    return 'Tudo certo por aqui. Se voce quiser, podemos conversar livremente ou eu te trago uma analise comercial agora.';
  }

  const trecho = String(message || '').trim().slice(0, 180);
  if (!hasSalesIntent(normalized)) {
    return `Entendi: "${trecho}". Posso continuar em conversa livre com voce, sem formato engessado.`;
  }

  return `Perfeito, vamos nessa. Sobre "${trecho}", segue um resumo rapido:\n${resumoCurto}\n\nSe quiser, eu aprofundo no foco que voce escolher (estoque, top produtos ou estrategia).`;
};

export const assistantIAService = {
  chat: async ({ message, history = [] }) => {
    const cleanMessage = String(message || '').trim();
    if (!cleanMessage) {
      throw createValidationError('Mensagem e obrigatoria');
    }

    if (cleanMessage.length > 4000) {
      throw createValidationError('Mensagem muito longa. Limite de 4000 caracteres.');
    }

    const context = await getBusinessContext();
    const contextText = buildContextText(context);
    const safeHistory = sanitizeHistory(history, cleanMessage);
    const modo = inferConversationMode(cleanMessage, context);
    const acoesSugeridas = modo === 'negocio' ? buildBusinessActionPlan(context) : [];

    if (!isAiAssistantEnabled()) {
      return {
        resposta: generateFallbackResponse(cleanMessage, context, safeHistory),
        fonte: 'fallback-local',
        statusIA: 'desativada',
        motivoFallback: 'AI_ASSISTANT_ENABLED=false',
        modo,
        acoesSugeridas,
        contexto: context
      };
    }

    try {
      const resposta = await requestOpenAIResponse({
        message: cleanMessage,
        history: safeHistory,
        contextText
      });

      return {
        resposta,
        fonte: 'openai',
        statusIA: 'ativa',
        motivoFallback: null,
        modo,
        acoesSugeridas,
        contexto: context
      };
    } catch (error) {
      console.error('Falha no Assistente IA com OpenAI. Usando fallback local.', error);
      return {
        resposta: generateFallbackResponse(cleanMessage, context, safeHistory),
        fonte: 'fallback-local',
        statusIA: 'indisponivel',
        motivoFallback: error?.message || 'Falha desconhecida na IA',
        modo,
        acoesSugeridas,
        contexto: context
      };
    }
  }
};
