import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '@/lib/api'
import {
  Users, ClipboardList, Layers, CreditCard, UserPlus, Heart,
  FileText, Users2, Bell, Building2
} from 'lucide-react'

interface Stats {
  usuarios: number
  matriculas: number
  modalidades: number
  planos: number
  leads: number
  projetos: number
  documentos: number
  funcionarios?: number
  notificacoes?: number
  patrocinadores?: number
}

const statCards = (s: Stats) => [
  { label: 'Usuários ativos',    value: s.usuarios,      icon: Users,       color: 'text-blue-400',   to: '/admin/usuarios' },
  { label: 'Matrículas ativas',  value: s.matriculas,    icon: ClipboardList, color: 'text-green-400', to: '/admin/matriculas' },
  { label: 'Funcionários',       value: s.funcionarios ?? 0, icon: Users2,  color: 'text-indigo-400', to: '/admin/funcionarios' },
  { label: 'Modalidades',        value: s.modalidades,   icon: Layers,      color: 'text-purple-400', to: '/admin/modalidades' },
  { label: 'Planos',             value: s.planos,        icon: CreditCard,  color: 'text-orange-400', to: '/admin/planos' },
  { label: 'Notificações env.',  value: s.notificacoes ?? 0, icon: Bell,   color: 'text-yellow-400', to: '/admin/notificacoes' },
  { label: 'Patrocinadores',     value: s.patrocinadores ?? 0, icon: Building2, color: 'text-rose-400', to: '/admin/patrocinadores' },
  { label: 'Leads',              value: s.leads,         icon: UserPlus,    color: 'text-yellow-400', to: '/admin/leads' },
  { label: 'Projetos Sociais',   value: s.projetos,      icon: Heart,       color: 'text-pink-400',   to: '/admin/projetos' },
  { label: 'Documentos',         value: s.documentos,    icon: FileText,    color: 'text-cyan-400',   to: '/admin/documentos' },
]

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Stats>('/admin/stats')
      .then(setStats)
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-zinc-400 text-sm mb-8">Visão geral do sistema</p>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg p-4 mb-6 text-sm">
          {error}
        </div>
      )}

      {!stats && !error && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl p-6 animate-pulse h-28" />
          ))}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {statCards(stats).map(({ label, value, icon: Icon, color, to }) => (
            <Link key={label} to={to}
              className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 hover:border-zinc-600 transition-colors group">
              <Icon size={20} className={`${color} mb-3 group-hover:scale-110 transition-transform`} />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-zinc-400 text-xs mt-1 leading-tight">{label}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
