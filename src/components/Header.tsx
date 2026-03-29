import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, ChevronDown, Heart, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogout?: () => void;
}

const Header = (_props: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [projetosOpen, setProjetosOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { user, isLoggedIn, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLink = (to: string, label: string) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors hover:text-gorila-yellow ${
        pathname === to ? 'text-gorila-yellow' : 'text-white'
      }`}
    >
      {label}
    </Link>
  );

  const projetosActive = pathname.startsWith('/rise-kids') || pathname.startsWith('/o-teste');

  return (
    <header className="bg-gorila-primary text-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-md overflow-hidden" style={{ backgroundColor: '#1a1718' }}>
              <img
                src="/lovable-uploads/b1d0c406-fb12-494e-ad8c-a0ad4760dda0.png"
                alt="Gorila Rise"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-white tracking-wide hidden sm:block">Gorila Rise</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-7">
            {navLink('/', 'Início')}
            {navLink('/loja', 'Loja')}

            {/* Projetos Dropdown */}
            <div className="relative" onMouseEnter={() => setProjetosOpen(true)} onMouseLeave={() => setProjetosOpen(false)}>
              <button className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-gorila-yellow outline-none ${projetosActive ? 'text-gorila-yellow' : 'text-white'}`}>
                Projetos
                <ChevronDown size={14} className={`transition-transform duration-200 ${projetosOpen ? 'rotate-180' : ''}`} />
              </button>

              {projetosOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
                  {/* Arrow */}
                  <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-gorila-dark rotate-45 border-l border-t border-white/10 z-10" />
                  <div className="relative bg-gorila-dark border border-white/10 rounded-xl shadow-2xl p-3 w-72 flex flex-col gap-2 z-20">

                    {/* Rise Kids */}
                    <Link
                      to="/rise-kids"
                      onClick={() => setProjetosOpen(false)}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0 group-hover:bg-purple-500/30 transition-colors">
                        <Heart size={18} className="text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">Rise Kids</p>
                        <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">Esporte e cultura para crianças e jovens da comunidade</p>
                      </div>
                    </Link>

                    {/* Divider */}
                    <div className="h-px bg-white/10 mx-1" />

                    {/* O Teste — destaque */}
                    <Link
                      to="/o-teste"
                      onClick={() => setProjetosOpen(false)}
                      className="relative flex items-start gap-3 p-3 rounded-lg bg-gorila-yellow/10 hover:bg-gorila-yellow/20 border border-gorila-yellow/30 transition-colors group overflow-hidden"
                    >
                      {/* Glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-gorila-yellow/5 to-transparent pointer-events-none" />
                      <div className="w-9 h-9 rounded-lg bg-gorila-yellow flex items-center justify-center shrink-0">
                        <Zap size={18} className="text-gorila-primary" fill="currentColor" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-gorila-yellow font-bold text-sm">O Teste</p>
                          <span className="text-[10px] font-bold bg-gorila-yellow text-gorila-primary px-1.5 py-0.5 rounded-full uppercase tracking-wide">Inscrições abertas</span>
                        </div>
                        <p className="text-gray-300 text-xs mt-0.5 leading-relaxed">Seleção para equipes competitivas — LPO, Futebol, Basquete e mais</p>
                      </div>
                    </Link>

                  </div>
                </div>
              )}
            </div>

            {navLink('/clube-vantagens', 'Clube de Vantagens')}
            {navLink('/a-associacao', 'A Associação')}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link to="/painel" className="flex items-center gap-1.5 text-sm hover:text-gorila-yellow transition-colors">
                  <User size={16} />
                  <span>{user?.nome || 'Atleta'}</span>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:text-gorila-yellow hover:bg-transparent p-1">
                  <LogOut size={16} />
                </Button>
              </>
            ) : (
              <>
                <Link to="/cadastro">
                  <Button className="bg-gorila-yellow text-gorila-primary hover:bg-yellow-400 font-bold text-sm px-4">
                    Entre para o Bando
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="bg-transparent border-white text-white hover:bg-white hover:text-gorila-primary font-semibold text-sm px-4 flex items-center gap-1.5">
                    <User size={15} />
                    Área do Atleta
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-1" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 flex flex-col gap-4">
            <nav className="flex flex-col gap-1">
              {['/', '/loja', '/clube-vantagens', '/institucional'].map((to) => {
                const labels: Record<string, string> = { '/': 'Início', '/loja': 'Loja', '/clube-vantagens': 'Clube de Vantagens', '/a-associacao': 'A Associação' };
                return (
                  <Link key={to} to={to} onClick={() => setIsMenuOpen(false)}
                    className={`text-sm font-medium py-2 transition-colors hover:text-gorila-yellow ${pathname === to ? 'text-gorila-yellow' : 'text-white'}`}>
                    {labels[to]}
                  </Link>
                );
              })}

              {/* Projetos no mobile */}
              <div className="mt-1 mb-1">
                <p className="text-xs text-gray-500 uppercase tracking-widest mb-2 mt-1">Projetos</p>
                <Link to="/rise-kids" onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-2 text-sm font-medium py-2 transition-colors hover:text-gorila-yellow ${pathname === '/rise-kids' ? 'text-gorila-yellow' : 'text-white'}`}>
                  <Heart size={14} className="text-purple-400" /> Rise Kids
                </Link>
                <Link to="/o-teste" onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-2 text-sm font-bold py-2 transition-colors ${pathname === '/o-teste' ? 'text-gorila-yellow' : 'text-gorila-yellow/90'}`}>
                  <Zap size={14} fill="currentColor" /> O Teste
                  <span className="text-[10px] font-bold bg-gorila-yellow text-gorila-primary px-1.5 py-0.5 rounded-full uppercase">Abertas</span>
                </Link>
              </div>
            </nav>

            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <Link to="/painel" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-sm hover:text-gorila-yellow transition-colors">
                    <User size={16} /><span>{user?.nome || 'Painel do Atleta'}</span>
                  </Link>
                  <button onClick={handleLogout} className="flex items-center gap-2 text-sm hover:text-gorila-yellow transition-colors text-left">
                    <LogOut size={16} />Sair
                  </button>
                </>
              ) : (
                <>
                  <Link to="/cadastro" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-gorila-yellow text-gorila-primary hover:bg-yellow-400 font-bold text-sm">Entre para o Bando</Button>
                  </Link>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full bg-transparent border-white text-white hover:bg-white hover:text-gorila-primary font-semibold text-sm flex items-center gap-1.5">
                      <User size={15} />Área do Atleta
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
