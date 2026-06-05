import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bot,
  SendHorizontal,
  Trash2,
  Sparkles,
  Copy,
  RefreshCw,
  Check,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const STORAGE_KEY = 'assistente_ia_historico_v2';
const MAX_MESSAGES = 40;

const quickQuestions = [
  'Me da um resumo das vendas de hoje',
  'Quais produtos estao vendendo mais?',
  'Tem risco de ruptura de estoque?',
  'Hoje quero so bater papo livre'
];

const getInitialAssistantMessage = () => ({
  id: `assistant-${Date.now()}`,
  role: 'assistant',
  content:
    'Oi! Eu sou seu assistente em modo chat. Pode perguntar qualquer coisa. Se for sobre negocio, eu tambem uso os dados da loja.',
  source: 'system',
  mode: 'livre',
  actionPlan: [],
  statusIA: 'info',
  fallbackReason: null,
  createdAt: new Date().toISOString()
});

const parseStoredMessages = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [getInitialAssistantMessage()];

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [getInitialAssistantMessage()];
    }

    return parsed
      .filter((item) => item && (item.role === 'user' || item.role === 'assistant'))
      .map((item) => ({
        id: String(item.id || `${item.role}-${Date.now()}`),
        role: item.role,
        content: String(item.content || ''),
        source: item.source ? String(item.source) : null,
        mode: item.mode ? String(item.mode) : null,
        actionPlan: Array.isArray(item.actionPlan) ? item.actionPlan : [],
        statusIA: item.statusIA ? String(item.statusIA) : null,
        fallbackReason: item.fallbackReason ? String(item.fallbackReason) : null,
        createdAt: item.createdAt || new Date().toISOString()
      }))
      .filter((item) => item.content.trim().length > 0)
      .slice(-MAX_MESSAGES);
  } catch (_error) {
    return [getInitialAssistantMessage()];
  }
};

const formatTime = (value) => {
  const date = new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
};

const toApiHistory = (messages) =>
  messages
    .filter((item) => item.role === 'user' || item.role === 'assistant')
    .slice(-14)
    .map((item) => ({ role: item.role, content: item.content }));

const getLastUserMessage = (messages) => {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].role === 'user') return messages[index].content;
  }
  return '';
};

const getConversationStatus = (lastAssistantMessage) => {
  if (!lastAssistantMessage) {
    return {
      title: 'Pronto para conversar',
      description: 'Fale livremente ou pergunte sobre vendas',
      className: 'bg-slate-100 text-slate-700 border-slate-200'
    };
  }

  if (lastAssistantMessage.source === 'openai' && lastAssistantMessage.statusIA === 'ativa') {
    return {
      title: 'IA online',
      description: 'Respostas em IA real',
      className: 'bg-green-100 text-green-700 border-green-200'
    };
  }

  if (lastAssistantMessage.source === 'fallback-local') {
    return {
      title: 'Modo local ativo',
      description: 'Respostas continuam funcionando',
      className: 'bg-amber-100 text-amber-800 border-amber-200'
    };
  }

  if (lastAssistantMessage.source === 'erro') {
    return {
      title: 'Erro temporario',
      description: 'Tente novamente em alguns segundos',
      className: 'bg-red-100 text-red-700 border-red-200'
    };
  }

  return {
    title: 'Chat ativo',
    description: 'Conversa em andamento',
    className: 'bg-slate-100 text-slate-700 border-slate-200'
  };
};

const AssistenteIA = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState(() => parseStoredMessages());
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const bottomRef = useRef(null);

  const isAdmin = user?.perfil === 'admin';

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_MESSAGES)));
  }, [messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  useEffect(() => {
    if (!copiedMessageId) return undefined;
    const timer = setTimeout(() => setCopiedMessageId(null), 1400);
    return () => clearTimeout(timer);
  }, [copiedMessageId]);

  const canSend = useMemo(() => input.trim().length > 0 && !sending, [input, sending]);

  const lastUserMessage = useMemo(() => getLastUserMessage(messages), [messages]);

  const lastAssistantMessage = useMemo(() => {
    for (let index = messages.length - 1; index >= 0; index -= 1) {
      const message = messages[index];
      if (message.role === 'assistant' && message.source !== 'system') {
        return message;
      }
    }
    return null;
  }, [messages]);

  const status = useMemo(() => getConversationStatus(lastAssistantMessage), [lastAssistantMessage]);

  const appendMessage = (message) => {
    setMessages((prev) => [...prev, message].slice(-MAX_MESSAGES));
  };

  const handleCopy = async (id, text) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMessageId(id);
    } catch (_error) {
      setError('Nao consegui copiar agora.');
    }
  };

  const sendMessage = async (rawMessage, options = {}) => {
    const message = String(rawMessage || '').trim();
    const isRetry = Boolean(options.retry);
    if (!message || sending || !isAdmin) return;

    setSending(true);
    setError(null);

    let requestMessages = messages;

    if (!isRetry) {
      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message,
        createdAt: new Date().toISOString()
      };
      requestMessages = [...messages, userMessage].slice(-MAX_MESSAGES);
      setMessages(requestMessages);
      setInput('');
    }

    try {
      const response = await api.post('/assistant-ia/chat', {
        message,
        history: toApiHistory(requestMessages)
      });

      appendMessage({
        id: `assistant-${Date.now() + 1}`,
        role: 'assistant',
        content: String(response.data?.resposta || 'Nao consegui gerar a resposta agora.'),
        source: response.data?.fonte || null,
        mode: response.data?.modo || null,
        actionPlan: Array.isArray(response.data?.acoesSugeridas) ? response.data.acoesSugeridas : [],
        statusIA: response.data?.statusIA || null,
        fallbackReason: response.data?.motivoFallback || null,
        createdAt: new Date().toISOString()
      });
    } catch (requestError) {
      const requestMessage =
        requestError.response?.data?.error || requestError.message || 'Erro ao conversar com IA';
      setError(requestMessage);

      appendMessage({
        id: `assistant-error-${Date.now() + 2}`,
        role: 'assistant',
        content:
          'Nao consegui responder agora. Tente novamente em alguns segundos. Se persistir, me avise que eu ajusto.',
        source: 'erro',
        mode: null,
        actionPlan: [],
        statusIA: 'erro',
        fallbackReason: requestMessage,
        createdAt: new Date().toISOString()
      });
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canSend) return;
    await sendMessage(input);
  };

  const handleKeyDown = async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (canSend) {
        await sendMessage(input);
      }
    }
  };

  const handleRegenerate = async () => {
    if (!lastUserMessage || sending) return;
    await sendMessage(lastUserMessage, { retry: true });
  };

  const handleReset = () => {
    const initial = [getInitialAssistantMessage()];
    setMessages(initial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    setError(null);
    setInput('');
  };

  if (!isAdmin) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-6">
        <h1 className="text-xl font-semibold text-gray-800 mb-2">Assistente IA</h1>
        <p className="text-red-700">
          Essa area e exclusiva para usuarios com perfil administrador.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Assistente IA Chat</h1>
              <p className="text-sm text-gray-500">
                Pergunte qualquer coisa. Se for negocio, eu trago dados da loja.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs border px-3 py-1 rounded-full ${status.className}`}>
              {status.title}
            </span>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={sending || !lastUserMessage}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw size={16} />
              Regenerar
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Trash2 size={16} />
              Limpar
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3">{status.description}</p>
      </div>

      {lastAssistantMessage?.source === 'fallback-local' && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg text-sm flex items-start gap-2">
          <AlertTriangle size={16} className="mt-0.5" />
          <div>
            <p>A IA externa esta indisponivel no momento, mas o chat continua funcionando em modo local.</p>
            {lastAssistantMessage?.fallbackReason && (
              <p className="text-xs mt-1 opacity-80">{lastAssistantMessage.fallbackReason}</p>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {quickQuestions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => sendMessage(question)}
              disabled={sending}
              className="px-3 py-2 rounded-full text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-70"
            >
              <span className="inline-flex items-center gap-1">
                <Sparkles size={14} />
                {question}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-[55vh] overflow-y-auto p-4 space-y-3 bg-gray-50">
          {messages.map((message) => {
            const isAssistant = message.role === 'assistant';
            return (
              <div
                key={message.id}
                className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} items-end`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-3 ${
                    isAssistant
                      ? 'bg-white border border-gray-200 text-gray-800'
                      : 'bg-primary-600 text-white'
                  }`}
                >
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</p>

                  {isAssistant && Array.isArray(message.actionPlan) && message.actionPlan.length > 0 && (
                    <div className="mt-3 border-t border-gray-100 pt-3 space-y-1">
                      {message.actionPlan.map((action) => (
                        <div key={action} className="text-xs text-gray-600 flex items-start gap-2">
                          <CheckCircle2 size={12} className="mt-[2px] text-emerald-600" />
                          <span>{action}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    className={`mt-2 flex items-center justify-between gap-3 text-[11px] ${
                      isAssistant ? 'text-gray-500' : 'text-primary-100'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{formatTime(message.createdAt)}</span>
                      {isAssistant && message.source === 'openai' && <span className="uppercase">ia real</span>}
                      {isAssistant && message.mode === 'negocio' && <span className="uppercase">negocio</span>}
                    </div>

                    {isAssistant && (
                      <button
                        type="button"
                        onClick={() => handleCopy(message.id, message.content)}
                        className="inline-flex items-center gap-1 hover:text-gray-700"
                        title="Copiar resposta"
                      >
                        {copiedMessageId === message.id ? <Check size={12} /> : <Copy size={12} />}
                        <span>{copiedMessageId === message.id ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-600">
                Pensando na melhor resposta...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSubmit} className="border-t border-gray-200 p-3 bg-white">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              placeholder="Digite sua pergunta (livre ou sobre o negocio)..."
              className="flex-1 resize-none rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!canSend}
              className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
              title="Enviar"
            >
              <SendHorizontal size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssistenteIA;
