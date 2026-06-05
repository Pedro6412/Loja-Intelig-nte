import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Menu,
  MoreHorizontal,
  Globe,
  Cloud,
  Settings,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const Topbar = ({ onOpenSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();

  const initials = useMemo(() => {
    const nome = user?.nome?.trim();
    if (!nome) return 'U';

    const parts = nome.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }, [user?.nome]);

  const showVendasTitle = location.pathname === '/vendas';

  return (
    <header className="fixed top-0 left-0 right-0 md:left-44 h-[74px] bg-[#f3f3f3] border-b border-[#d8d8d8] z-30">
      <div className="h-full px-4 md:px-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="md:hidden w-9 h-9 rounded-md border border-[#d6d6d6] bg-white flex items-center justify-center text-slate-700"
            onClick={onOpenSidebar}
            title="Abrir menu"
          >
            <Menu size={18} />
          </button>
          {showVendasTitle && <h1 className="text-2xl sm:text-[38px] leading-none font-semibold text-slate-900">Vendas</h1>}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden sm:flex w-9 h-9 rounded-full hover:bg-white/80 items-center justify-center text-slate-700"
            title="Mais opcoes"
          >
            <MoreHorizontal size={18} />
          </button>

          <button
            type="button"
            className="hidden sm:flex w-9 h-9 rounded-full hover:bg-white/80 items-center justify-center text-slate-700"
            title="Idioma e regiao"
          >
            <Globe size={17} />
          </button>

          <button
            type="button"
            className="hidden lg:flex items-center gap-2 h-9 rounded-full px-3 border border-[#d5d5d5] bg-white text-sm text-slate-700"
            title="Plano"
          >
            <span>Plano Premium ate 24/04/2026</span>
            <ChevronDown size={15} />
          </button>

          <button
            type="button"
            className="hidden sm:flex w-9 h-9 rounded-full border border-[#d5d5d5] bg-white items-center justify-center text-slate-700"
            title="Nuvem"
          >
            <Cloud size={17} />
          </button>

          <div className="w-9 h-9 rounded-full border border-[#d5d5d5] bg-[#efefef] text-slate-800 text-sm font-medium flex items-center justify-center">
            {initials}
          </div>

          <button
            type="button"
            className="hidden sm:flex w-9 h-9 rounded-full border border-[#d5d5d5] bg-white items-center justify-center text-slate-700"
            title="Configuracoes"
          >
            <Settings size={17} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
