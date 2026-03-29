import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface Matricula {
  id: number
  status: string
  criadoEm: string
  usuario: { id: number; nome: string; email: string }
  modalidade: { id: number; nome: string }
  plano: { id: number; nome: string; valor: string }
}

export default function Matriculas() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Matricula[]>('/admin/matriculas')
      .then(setMatriculas)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const statusColor: Record<string, string> = {
    ATIVA: 'bg-green-500/20 text-green-400 border-green-500/30',
    INATIVA: 'bg-zinc-700 text-zinc-400 border-zinc-600',
    PENDENTE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-1">Matrículas</h1>
      <p className="text-zinc-400 text-sm mb-8">{matriculas.length} registro(s)</p>

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
                <th className="px-4 py-3 font-medium">Atleta</th>
                <th className="px-4 py-3 font-medium">Modalidade</th>
                <th className="px-4 py-3 font-medium">Plano</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {matriculas.map((m) => (
                <tr key={m.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{m.usuario.nome}</p>
                    <p className="text-zinc-500 text-xs">{m.usuario.email}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{m.modalidade.nome}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {m.plano.nome}
                    <span className="text-zinc-500 ml-1 text-xs">
                      R$ {Number(m.plano.valor).toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor[m.status] ?? statusColor.INATIVA}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {new Date(m.criadoEm).toLocaleDateString('pt-BR')}
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
