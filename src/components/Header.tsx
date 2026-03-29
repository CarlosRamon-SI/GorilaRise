import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut } from 'lucide-react';

interface HeaderProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogout?: () => void;
}

const Header = ({ isLoggedIn = false, userName, onLogout }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    if (onLogout) onLogout();
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
            {navLink('/loja', 'Loja')}
            {navLink('/clube-vantagens', 'Clube de Vantagens')}
            {navLink('/institucional', 'Institucional')}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <Link
                  to="/painel"
                  className="flex items-center gap-1.5 text-sm hover:text-gorila-yellow transition-colors"
                >
                  <User size={16} />
                  <span>{userName || 'Atleta'}</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white hover:text-gorila-yellow hover:bg-transparent p-1"
                >
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
            <nav className="flex flex-col gap-3">
              {[
                ['/loja', 'Loja'],
                ['/clube-vantagens', 'Clube de Vantagens'],
                ['/institucional', 'Institucional'],
              ].map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsMenuOpen(false)}
                  className={`text-sm font-medium transition-colors hover:text-gorila-yellow ${
                    pathname === to ? 'text-gorila-yellow' : 'text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  <Link
                    to="/painel"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 text-sm hover:text-gorila-yellow transition-colors"
                  >
                    <User size={16} />
                    <span>{userName || 'Painel do Atleta'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-sm hover:text-gorila-yellow transition-colors text-left"
                  >
                    <LogOut size={16} />
                    Sair
                  </button>
                </>
              ) : (
                <>
                  <Link to="/cadastro" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full bg-gorila-yellow text-gorila-primary hover:bg-yellow-400 font-bold text-sm">
                      Entre para o Bando
                    </Button>
                  </Link>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full bg-transparent border-white text-white hover:bg-white hover:text-gorila-primary font-semibold text-sm flex items-center gap-1.5">
                      <User size={15} />
                      Área do Atleta
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
