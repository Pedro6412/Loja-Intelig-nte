import { NavLink } from 'react-router-dom';
import {
  Menu,
  ShoppingBag,
  Tag,
  Package,
  Map,
  LayoutDashboard,
  Truck,
  Users,
  BarChart3,
  Receipt,
  Grid2x2,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const mainItems = [
  { path: '/vendas', icon: ShoppingBag, label: 'Vendas' },
  { path: '/produtos', icon: Tag, label: 'Produtos' },
  { path: '/estoque', icon: Package, label: 'Estoque' },
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/categorias', icon: Grid2x2, label: 'Categorias' },
  { path: '/fornecedores', icon: Truck, label: 'Fornecedores' },
  { path: '/usuarios', icon: Users, label: 'Usuarios' },
  { path: '/mapa-regioes', icon: Map, label: 'Mapa Regioes' }
];

const extraItems = [
  { path: '/nota-fiscal', icon: Receipt, label: 'Nota Fiscal' },
  { path: '/relatorios', icon: BarChart3, label: 'Relatorios' }
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const visibleMainItems = mainItems.filter((item) => item.path !== '/usuarios' || user?.perfil === 'admin');

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/30 z-40 md:hidden transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-44 bg-[#ededed] border-r border-[#d3d3d3] flex flex-col transition-transform duration-200 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="h-20 flex items-center px-5 border-b border-[#d3d3d3]">
          <button
            type="button"
            className="w-9 h-9 rounded-md flex items-center justify-center text-slate-700 hover:bg-white/80"
            onClick={onClose}
            title="Fechar menu"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-3">
          <ul className="space-y-1 px-2">
            {visibleMainItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] transition-colors ${
                        isActive
                          ? 'bg-white text-slate-900 font-semibold shadow-sm'
                          : 'text-slate-700 hover:bg-white/70'
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>

          <div className="mt-5 px-2">
            <ul className="space-y-1">
              {extraItems.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.label}>
                    <NavLink
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-md text-[14px] transition-colors ${
                          isActive
                            ? 'bg-white text-slate-900 font-semibold shadow-sm'
                            : 'text-slate-700 hover:bg-white/70'
                        }`
                      }
                    >
                      <Icon size={18} />
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        <div className="border-t border-[#d3d3d3] px-3 py-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="min-w-0">
              <p className="text-xs text-slate-500 uppercase tracking-wide">{user?.perfil || 'usuario'}</p>
              <p className="text-sm font-medium text-slate-800 truncate">{user?.nome || 'Conta'}</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="w-8 h-8 rounded-md border border-[#cfcfcf] bg-white text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              title="Sair"
            >
              <LogOut size={16} />
            </button>
          </div>
          <div className="text-[11px] text-slate-500">Interface inspirada em PDV</div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
