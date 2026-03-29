import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface Usuario {
  id: number
  nome: string
  email: string
  cpf: string
  telefone: string
  cidade: string
  role: 'USUARIO' | 'TREINADOR' | 'ADMIN'
  ativo: boolean
  criadoEm: string
}

export default function Usuarios() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState<number | null>(null)

  useEffect(() => {
    api.get<Usuario[]>('/admin/usuarios')
      .then(setUsuarios)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function toggle(u: Usuario, field: 'ativo' | 'role', value: boolean | string) {
    if (!isAdmin) return
    setSaving(u.id)
    try {
      const updated = await api.patch<Usuario>(`/admin/usuarios/${u.id}`, { [field]: value })
      setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, ...updated } : x))
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(null)
    }
  }

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      ADMIN: 'bg-red-500/20 text-red-400 border-red-500/30',
      TREINADOR: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      USUARIO: 'bg-zinc-700 text-zinc-300 border-zinc-600',
    }
    return map[role] ?? map.USUARIO
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">Usuários</h1>
      <p className="text-zinc-400 text-sm mb-8">{usuarios.length} cadastrado(s)</p>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-lg h-14 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-left">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Cidade</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Desde</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => (
                <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.nome}</td>
                  <td className="px-4 py-3 text-zinc-400">{u.email}</td>
                  <td className="px-4 py-3 text-zinc-400">{u.cidade}</td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <select
                        value={u.role}
                        disabled={saving === u.id}
                        onChange={(e) => toggle(u, 'role', e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="USUARIO">USUARIO</option>
                        <option value="TREINADOR">TREINADOR</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    ) : (
                      <span className={`text-xs border px-2 py-0.5 rounded-full ${roleBadge(u.role)}`}>
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <button
                        disabled={saving === u.id}
                        onClick={() => toggle(u, 'ativo', !u.ativo)}
                        className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                          u.ativo
                            ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                            : 'bg-zinc-700 text-zinc-400 border-zinc-600 hover:bg-zinc-600'
                        }`}
                      >
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${u.ativo ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-zinc-700 text-zinc-400 border-zinc-600'}`}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {new Date(u.criadoEm).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
