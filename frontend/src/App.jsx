import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Layout from './components/Layout/Layout';
import Usuarios from './pages/Usuarios/Usuarios';
import Categorias from './pages/Categorias/Categorias';
import Fornecedores from './pages/Fornecedores/Fornecedores';
import Produtos from './pages/Produtos/Produtos';
import Estoque from './pages/Estoque/Estoque';
import Vendas from './pages/Vendas/Vendas';
import MapaRegioes from './pages/MapaRegioes/MapaRegioes';
import NotaFiscal from './pages/NotaFiscal/NotaFiscal';
import Relatorios from './pages/Relatorios/Relatorios';
import { useAuth } from './contexts/AuthContext';

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center py-8">Carregando...</div>;
  if (user?.perfil !== 'admin') return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="usuarios" element={<AdminRoute><Usuarios /></AdminRoute>} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="fornecedores" element={<Fornecedores />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="estoque" element={<Estoque />} />
          <Route path="vendas" element={<Vendas />} />
          <Route path="mapa-regioes" element={<MapaRegioes />} />
          <Route path="nota-fiscal" element={<NotaFiscal />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="*" element={<Navigate to="/vendas" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
