import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'
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
  GraduationCap,
  ClipboardCheck,
  TrendingUp,
  Menu,
  X,
  CalendarDays,
  MapPin,
} from 'lucide-react'

function iniciais(nome: string) {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const NAV_GROUPS = [
  {
    label: 'Visão Geral',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    ],
  },
  {
    label: 'Pessoas',
    items: [
      { to: '/admin/usuarios', label: 'Usuários', icon: Users },
      { to: '/admin/funcionarios', label: 'Funcionários', icon: Users2 },
      { to: '/admin/leads', label: 'Leads', icon: UserPlus },
      { to: '/admin/anamneses', label: 'Anamneses', icon: ClipboardCheck },
      { to: '/admin/desempenho', label: 'Desempenho', icon: TrendingUp },
    ],
  },
  {
    label: 'Operação',
    items: [
      { to: '/admin/modalidades', label: 'Modalidades', icon: Layers },
      { to: '/admin/planos', label: 'Planos', icon: CreditCard },
      { to: '/admin/matriculas', label: 'Matrículas', icon: ClipboardList },
      { to: '/admin/turmas', label: 'Turmas', icon: GraduationCap },
      { to: '/admin/ambientes', label: 'Ambientes', icon: MapPin },
      { to: '/admin/treinos', label: 'Treinos', icon: Dumbbell },
      { to: '/admin/checkin', label: 'Check-in', icon: CalendarCheck },
    ],
  },
  {
    label: 'Financeiro & Comunicação',
    items: [
      { to: '/admin/financeiro', label: 'Financeiro', icon: DollarSign },
      { to: '/admin/notificacoes', label: 'Notificações', icon: Bell },
      { to: '/admin/eventos', label: 'Eventos / Jogos', icon: CalendarDays },
    ],
  },
  {
    label: 'Clube',
    items: [
      { to: '/admin/premiacoes', label: 'Premiações', icon: Medal },
      { to: '/admin/patrocinadores', label: 'Patrocinadores', icon: Building2 },
      { to: '/admin/projetos', label: 'Proj. Sociais', icon: Heart },
      { to: '/admin/documentos', label: 'Documentos', icon: FileText },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
    ],
  },
]

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <>
      {/* Logo */}
      <div className="px-5 py-5 border-b border-zinc-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded overflow-hidden shrink-0" style={{ backgroundColor: '#1a1718' }}>
            <img
              src="/lovable-uploads/b1d0c406-fb12-494e-ad8c-a0ad4760dda0.png"
              className="w-full h-full object-contain"
              alt="logo"
            />
          </div>
          <div>
            <span className="text-[13px] font-black tracking-[0.15em] text-white uppercase leading-none">
              Gorila Rise
            </span>
            <p className="text-[10px] text-zinc-500 tracking-widest uppercase leading-none mt-0.5">Admin</p>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="px-2 mb-1.5 text-[10px] font-bold tracking-[0.18em] uppercase text-zinc-600">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2 rounded-md text-[13px] font-medium transition-all duration-150 ${
                      isActive
                        ? 'bg-gorila-yellow/10 text-gorila-yellow border border-gorila-yellow/20'
                        : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-zinc-100 border border-transparent'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon size={15} className={`shrink-0 transition-transform duration-150 ${isActive ? '' : 'group-hover:scale-105'}`} />
                      <span className="flex-1">{label}</span>
                      {isActive && (
                        <span className="w-1 h-1 rounded-full bg-gorila-yellow shrink-0" />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-zinc-800">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-zinc-800/60 mb-1.5">
          <div className="w-7 h-7 rounded-md bg-gorila-yellow flex items-center justify-center text-gorila-primary text-[11px] font-black shrink-0">
            {iniciais(user?.nome ?? '')}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white truncate leading-tight">{user?.nome}</p>
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{user?.role?.toLowerCase()}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate('/') }}
          className="flex items-center gap-2 w-full px-2 py-1.5 rounded-md text-[12px] text-zinc-500
                     hover:text-red-400 hover:bg-red-400/5 transition-colors duration-150"
        >
          <LogOut size={13} />
          Sair da conta
        </button>
      </div>
    </>
  )
}

export default function AdminLayout() {
  const { user, isLoggedIn, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (loading) return
    if (!isLoggedIn) {
      navigate('/login', { replace: true })
      return
    }
    if (user?.role === 'ATLETA') navigate('/painel', { replace: true })
    if (user?.role === 'SOCIO_TORCEDOR') navigate('/painel-socio', { replace: true })
  }, [loading, isLoggedIn, user, navigate])

  // Close mobile drawer on route change
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  if (loading) return null
  if (!isLoggedIn || user?.role === 'ATLETA' || user?.role === 'SOCIO_TORCEDOR') return null

  return (
    <div className="flex min-h-screen bg-zinc-950 text-white">

      {/* ── Mobile top bar ─────────────────────────────────────────────── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 h-12 bg-zinc-900 border-b border-zinc-800 flex items-center px-4 gap-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          aria-label="Abrir menu"
        >
          <Menu size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded overflow-hidden" style={{ backgroundColor: '#1a1718' }}>
            <img src="/lovable-uploads/b1d0c406-fb12-494e-ad8c-a0ad4760dda0.png" className="w-full h-full object-contain" alt="logo" />
          </div>
          <span className="text-[13px] font-black tracking-[0.12em] text-white uppercase">Gorila Rise</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Admin</span>
        </div>
      </div>

      {/* ── Mobile drawer overlay ───────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Mobile drawer ──────────────────────────────────────────────── */}
      <div className={`
        lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors z-10"
          aria-label="Fechar menu"
        >
          <X size={15} />
        </button>
        <SidebarContent onNavigate={() => setSidebarOpen(false)} />
      </div>

      {/* ── Desktop sidebar (always visible on lg+) ────────────────────── */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 bg-zinc-900 border-r border-zinc-800 flex-col relative">
        <div className="absolute inset-y-0 left-0 w-0.5 bg-gorila-yellow opacity-60" />
        <SidebarContent />
      </aside>

      {/* ── Main content ───────────────────────────────────────────────── */}
      <main className="flex-1 overflow-auto pt-12 lg:pt-0 min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
