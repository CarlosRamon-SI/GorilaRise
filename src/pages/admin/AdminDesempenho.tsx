import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface AtletaItem { id: number; nome: string; email: string }

interface Recorde {
  id: number
  exercicio: string
  carga: string
  data: string
}

interface AtletaRecordes {
  nome: string
  recordes: Recorde[]
}

export default function AdminDesempenho() {
  const [atletas, setAtletas] = useState<AtletaItem[]>([])
  const [atletaId, setAtletaId] = useState('')
  const [dados, setDados] = useState<AtletaRecordes | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingRec, setLoadingRec] = useState(false)

  useEffect(() => {
    api.get<AtletaItem[]>('/admin/usuarios?role=USUARIO&ativo=true')
      .then(setAtletas)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!atletaId) { setDados(null); return }
    setLoadingRec(true)
    api.get<AtletaRecordes>(`/admin/usuarios/${atletaId}/recordes`)
      .then(setDados)
      .catch(() => setDados({ nome: '', recordes: [] }))
      .finally(() => setLoadingRec(false))
  }, [atletaId])

  return (
    <div className="px-4 py-5 md:p-8">
      <h1 className="text-2xl font-bold mb-1">Desempenho / Records</h1>
      <p className="text-zinc-400 text-sm mb-8">Consulte os records pessoais de cada atleta</p>

      <div className="mb-6 max-w-sm">
        <label className="text-xs text-zinc-400 mb-1 block">Atleta</label>
        {loading ? (
          <div className="h-10 bg-zinc-800 rounded-lg animate-pulse" />
        ) : (
          <select
            value={atletaId}
            onChange={e => setAtletaId(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gorila-yellow">
            <option value="">Selecione um atleta…</option>
            {atletas.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
        )}
      </div>

      {loadingRec && <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-12 bg-zinc-900 rounded-lg animate-pulse" />)}</div>}

      {dados && !loadingRec && (
        dados.recordes.length === 0 ? (
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center text-zinc-400">
            Nenhum record registrado para {dados.nome || 'este atleta'}.
          </div>
        ) : (
          <>
            <p className="text-sm text-zinc-400 mb-3">{dados.recordes.length} record(s) de <span className="text-white font-medium">{dados.nome}</span></p>
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-x-auto">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 text-left">
                    <th className="px-4 py-3 font-medium">Exercício</th>
                    <th className="px-4 py-3 font-medium">Carga / Mark</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.recordes.map(r => (
                    <tr key={r.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                      <td className="px-4 py-3 font-medium">{r.exercicio}</td>
                      <td className="px-4 py-3 text-gorila-yellow font-bold">{r.carga}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{new Date(r.data).toLocaleDateString('pt-BR')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )
      )}
    </div>
  )
}
