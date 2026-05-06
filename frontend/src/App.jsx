import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Layout from './components/Layout/Layout';
import Usuarios from './pages/Usuarios/Usuarios';
import Categorias from './pages/Categorias/Categorias';
import Fornecedores from './pages/Fornecedores/Fornecedores';
import Clientes from './pages/Clientes/Clientes';
import Produtos from './pages/Produtos/Produtos';
import Estoque from './pages/Estoque/Estoque';
import Vendas from './pages/Vendas/Vendas';
import SugestoesIA from './pages/SugestoesIA/SugestoesIA';
import AssistenteIA from './pages/AssistenteIA/AssistenteIA';
import CatalogoOnline from './pages/CatalogoOnline/CatalogoOnline';
import NotaFiscal from './pages/NotaFiscal/NotaFiscal';
import Relatorios from './pages/Relatorios/Relatorios';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="categorias" element={<Categorias />} />
          <Route path="fornecedores" element={<Fornecedores />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="estoque" element={<Estoque />} />
          <Route path="vendas" element={<Vendas />} />
          <Route path="sugestoes-ia" element={<SugestoesIA />} />
          <Route path="assistente-ia" element={<AssistenteIA />} />
          <Route path="catalogo-online" element={<CatalogoOnline />} />
          <Route path="nota-fiscal" element={<NotaFiscal />} />
          <Route path="relatorios" element={<Relatorios />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
