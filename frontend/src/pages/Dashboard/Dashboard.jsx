import { useEffect, useState } from 'react';
import api from '../../services/api';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  TrendingUp,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>

      {/* Cards de Indicadores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <span className="text-sm text-gray-500">Hoje</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(stats?.totalDia || 0)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Total vendido hoje</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <span className="text-sm text-gray-500">Este mês</span>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(stats?.totalMes || 0)}
          </p>
          <p className="text-sm text-gray-600 mt-1">Total vendido no mês</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="text-purple-600" size={24} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {stats?.quantidadeVendas || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Total de vendas</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="text-orange-600" size={24} />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800">
            {stats?.produtosBaixoEstoque?.length || 0}
          </p>
          <p className="text-sm text-gray-600 mt-1">Produtos com estoque baixo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produtos Mais Vendidos */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Produtos Mais Vendidos</h2>
          {stats?.produtosMaisVendidos?.length > 0 ? (
            <div className="space-y-3">
              {stats.produtosMaisVendidos.slice(0, 5).map((produto, index) => (
                <div key={produto.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{produto.nome}</p>
                      <p className="text-sm text-gray-500">{produto.categoria?.nome || 'Sem categoria'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">{produto.totalVendido || 0} un.</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum produto vendido ainda</p>
          )}
        </div>

        {/* Últimas Vendas */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Últimas Vendas</h2>
            <button className="text-primary-500 hover:text-primary-600 flex items-center gap-1 text-sm">
              Ver todas
              <ArrowRight size={16} />
            </button>
          </div>
          {stats?.ultimasVendas?.length > 0 ? (
            <div className="space-y-3">
              {stats.ultimasVendas.slice(0, 5).map((venda) => (
                <div key={venda.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">Venda #{venda.id}</p>
                    <p className="text-sm text-gray-500">
                      {venda.cliente?.nome || 'Cliente não informado'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-800">{formatCurrency(venda.total)}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(venda.createdAt || venda.data_venda).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhuma venda realizada ainda</p>
          )}
        </div>

        {/* Produtos com Estoque Baixo */}
        <div className="bg-white rounded-xl shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-orange-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Produtos com Estoque Baixo</h2>
          </div>
          {stats?.produtosBaixoEstoque?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.produtosBaixoEstoque.map((produto) => (
                <div key={produto.id} className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="font-medium text-gray-800">{produto.nome}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Estoque atual: <span className="font-semibold text-orange-600">{produto.estoque ?? produto.estoque_atual}</span>
                    {' '} / Mínimo: {produto.estoque_minimo}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">Todos os produtos com estoque adequado</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
