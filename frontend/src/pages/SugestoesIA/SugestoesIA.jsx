import { useEffect, useMemo, useState } from 'react';
import api from '../../services/api';
import { Brain, Check, X, TrendingUp, Sparkles, RefreshCw } from 'lucide-react';

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const getProdutoNome = (sugestao) => sugestao.produto_nome || sugestao.produtoNome || 'Produto sem nome';

const getCategoriaNome = (sugestao) => {
  if (typeof sugestao.categoria === 'string') return sugestao.categoria;
  if (sugestao.categoria?.nome) return sugestao.categoria.nome;
  return sugestao.categoria_nome || sugestao.categoriaNome || 'Sem categoria';
};

const getNivelTendencia = (sugestao) =>
  sugestao.nivel_tendencia || sugestao.nivelTendencia || 'baixa';

const getFonteDados = (sugestao) => sugestao.fonte_dados || sugestao.fonteDados || 'Nao informado';

const getScore = (sugestao) => {
  const parsed = Number(sugestao.score);
  if (!Number.isFinite(parsed)) return 0;
  return parsed;
};

const isAnalisada = (status) => status === 'aprovada' || status === 'rejeitada';

const SugestaoCard = ({ sugestao, onAprovar, onRejeitar }) => {
  const score = getScore(sugestao);
  const nivel = getNivelTendencia(sugestao);

  const getNivelBadge = (nivelTendencia) => {
    switch (nivelTendencia) {
      case 'alta':
        return (
          <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            Alta
          </span>
        );
      case 'media':
        return (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            Media
          </span>
        );
      case 'baixa':
        return (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Baixa
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
            {nivelTendencia}
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'aprovada':
        return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">Aprovada</span>;
      case 'rejeitada':
        return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm">Rejeitada</span>;
      case 'pendente':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">Pendente</span>;
      default:
        return (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">{status}</span>
        );
    }
  };

  const getScoreColor = (scoreValue) => {
    if (scoreValue >= 0.8) return 'text-green-600';
    if (scoreValue >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-primary-500">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-800 text-lg">{getProdutoNome(sugestao)}</h3>
          <p className="text-sm text-gray-500">{getCategoriaNome(sugestao)}</p>
        </div>
        {getStatusBadge(sugestao.status)}
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Nivel de Tendencia</span>
          {getNivelBadge(nivel)}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">Score</span>
          <span className={`font-bold ${getScoreColor(score)}`}>{(score * 100).toFixed(0)}%</span>
        </div>

        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-gray-400" />
          <p className="text-sm text-gray-600">{sugestao.justificativa}</p>
        </div>

        <div className="text-xs text-gray-400">Fonte: {getFonteDados(sugestao)}</div>
      </div>

      {sugestao.status === 'pendente' && (
        <div className="flex gap-2 pt-4 border-t">
          <button
            onClick={() => onAprovar(sugestao.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600"
          >
            <Check size={18} />
            Aprovar
          </button>
          <button
            onClick={() => onRejeitar(sugestao.id)}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600"
          >
            <X size={18} />
            Rejeitar
          </button>
        </div>
      )}
    </div>
  );
};

const SugestoesIA = () => {
  const [sugestoes, setSugestoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gerando, setGerando] = useState(false);
  const [visao, setVisao] = useState('pendentes');

  useEffect(() => {
    fetchSugestoes();
  }, []);

  const fetchSugestoes = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/sugestoes-ia');
      setSugestoes(toArray(response.data));
    } catch (requestError) {
      const message =
        requestError.response?.data?.error ||
        requestError.message ||
        'Erro ao buscar sugestoes da IA';
      setError(message);
      setSugestoes([]);
    } finally {
      setLoading(false);
    }
  };

  const gerarNovasSugestoes = async () => {
    setGerando(true);
    setError(null);

    try {
      await api.post('/sugestoes-ia/gerar');
      await fetchSugestoes();
      setVisao('pendentes');
    } catch (requestError) {
      const message =
        requestError.response?.data?.error ||
        requestError.message ||
        'Erro ao gerar sugestoes';
      setError(message);
    } finally {
      setGerando(false);
    }
  };

  const aprovarSugestao = async (id) => {
    try {
      await api.put(`/sugestoes-ia/${id}/aprovar`);
      await fetchSugestoes();
    } catch (requestError) {
      const message =
        requestError.response?.data?.error ||
        requestError.message ||
        'Erro ao aprovar sugestao';
      setError(message);
    }
  };

  const rejeitarSugestao = async (id) => {
    try {
      await api.put(`/sugestoes-ia/${id}/rejeitar`);
      await fetchSugestoes();
    } catch (requestError) {
      const message =
        requestError.response?.data?.error ||
        requestError.message ||
        'Erro ao rejeitar sugestao';
      setError(message);
    }
  };

  const pendentes = useMemo(
    () => sugestoes.filter((sugestao) => sugestao.status === 'pendente'),
    [sugestoes]
  );

  const analisadas = useMemo(
    () => sugestoes.filter((sugestao) => isAnalisada(sugestao.status)),
    [sugestoes]
  );

  const renderGrid = (items) => {
    if (items.length === 0) {
      return (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Brain size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-2">Nenhuma sugestao encontrada nessa secao</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((sugestao) => (
          <SugestaoCard
            key={sugestao.id}
            sugestao={sugestao}
            onAprovar={aprovarSugestao}
            onRejeitar={rejeitarSugestao}
          />
        ))}
      </div>
    );
  };

  if (loading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Brain className="text-primary-600" size={32} />
          <h1 className="text-2xl font-bold text-gray-800">Sugestoes da IA</h1>
        </div>
        <button
          onClick={gerarNovasSugestoes}
          disabled={gerando}
          className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-70"
        >
          <Sparkles size={20} />
          {gerando ? 'Gerando...' : 'Gerar Novas Sugestoes'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">{error}</div>
      )}

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setVisao('pendentes')}
          className={`px-4 py-2 rounded-full text-sm font-medium border ${
            visao === 'pendentes'
              ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          Pendentes ({pendentes.length})
        </button>
        <button
          type="button"
          onClick={() => setVisao('analisadas')}
          className={`px-4 py-2 rounded-full text-sm font-medium border ${
            visao === 'analisadas'
              ? 'bg-green-100 text-green-800 border-green-200'
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          Analisadas ({analisadas.length})
        </button>
        <button
          type="button"
          onClick={() => setVisao('todas')}
          className={`px-4 py-2 rounded-full text-sm font-medium border ${
            visao === 'todas'
              ? 'bg-primary-100 text-primary-800 border-primary-200'
              : 'bg-white text-gray-700 border-gray-300'
          }`}
        >
          Todas ({sugestoes.length})
        </button>
      </div>

      {sugestoes.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Brain size={48} className="mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 mb-4">Nenhuma sugestao encontrada</p>
          <button
            onClick={gerarNovasSugestoes}
            disabled={gerando}
            className="flex items-center gap-2 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 mx-auto disabled:opacity-70"
          >
            <RefreshCw size={20} />
            {gerando ? 'Gerando...' : 'Gerar Sugestoes'}
          </button>
        </div>
      ) : (
        <>
          {visao === 'pendentes' && renderGrid(pendentes)}
          {visao === 'analisadas' && renderGrid(analisadas)}
          {visao === 'todas' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Pendentes</h2>
                {renderGrid(pendentes)}
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Analisadas</h2>
                {renderGrid(analisadas)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SugestoesIA;
