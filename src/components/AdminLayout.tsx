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
  LogOut,
} from 'lucide-react'

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/usuarios', label: 'Usuários', icon: Users },
  { to: '/admin/modalidades', label: 'Modalidades', icon: Layers },
  { to: '/admin/planos', label: 'Planos', icon: CreditCard },
  { to: '/admin/matriculas', label: 'Matrículas', icon: ClipboardList },
  { to: '/admin/leads', label: 'Leads', icon: UserPlus },
  { to: '/admin/projetos', label: 'Proj. Sociais', icon: Heart },
]

export default function AdminLayout() {
  const { user, isLoggedIn, logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login', { replace: true })
      return
    }
    if (user?.role === 'USUARIO') {
      navigate('/painel', { replace: true })
    }
  }, [isLoggedIn, user, navigate])

  if (!isLoggedIn || user?.role === 'USUARIO') return null

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <span className="text-xl font-black tracking-tight text-yellow-400">GORILA RISE</span>
          <p className="text-xs text-zinc-500 mt-1">Painel Administrativo</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-yellow-400 text-zinc-900'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`
              }
            >
              <Icon size={18} />
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
            <LogOut size={18} />
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
