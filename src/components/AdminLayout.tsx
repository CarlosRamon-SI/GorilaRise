import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'
import {
  LayoutDashboard,
  Users,
  Layers,
  CreditCard,
  ClipboardList,
  UserPlus,
  Heart,
  FileText,
  Settings,
  LogOut,
  Users2,
  Dumbbell,
  Bell,
  DollarSign,
  Medal,
  Building2,
  CalendarCheck,
} from 'lucide-react'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/admin/funcionarios', label: 'Funcionários', icon: Users2 },
  { to: '/admin/modalidades', label: 'Modalidades', icon: Layers },
  { to: '/admin/planos', label: 'Planos', icon: CreditCard },
  { to: '/admin/matriculas', label: 'Matrículas', icon: ClipboardList },
  { to: '/admin/treinos', label: 'Treinos', icon: Dumbbell },
  { to: '/admin/checkin', label: 'Check-in', icon: CalendarCheck },
  { to: '/admin/financeiro', label: 'Financeiro', icon: DollarSign },
  { to: '/admin/notificacoes', label: 'Notificações', icon: Bell },
  { to: '/admin/premiacoes', label: 'Premiações', icon: Medal },
  { to: '/admin/patrocinadores', label: 'Patrocinadores', icon: Building2 },
  { to: '/admin/leads', label: 'Leads', icon: UserPlus },
  { to: '/admin/projetos', label: 'Proj. Sociais', icon: Heart },
  { to: '/admin/documentos', label: 'Documentos', icon: FileText },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
]

export default function AdminLayout() {
  const { user, isLoggedIn, loading, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return
    if (!isLoggedIn) {
      navigate('/login', { replace: true })
      return
    }
    if (user?.role === 'USUARIO' || user?.role === 'SOCIO_TORCEDOR') {
      navigate('/painel', { replace: true })
    }
  }, [loading, isLoggedIn, user, navigate])

  if (loading) return null
  if (!isLoggedIn || user?.role === 'USUARIO' || user?.role === 'SOCIO_TORCEDOR') return null

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <span className="text-xl font-black tracking-tight text-yellow-400">GORILA RISE</span>
          <p className="text-xs text-zinc-500 mt-1">Painel Administrativo</p>
        </div>

        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-yellow-400 text-zinc-900'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <div className="px-3 py-2 mb-2">
            <p className="text-sm font-medium text-white truncate">{user?.nome}</p>
            <p className="text-xs text-zinc-500 capitalize">{user?.role.toLowerCase()}</p>
          </div>
          <button
            onClick={() => { logout(); navigate('/') }}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          >
            <LogOut size={17} />
            Sair
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
