import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Dumbbell, Plus, Trash2, X, Check, Zap } from 'lucide-react'

interface WOD {
  id: number
  titulo: string
  descricao: string
  data: string
  exercicios: string
  autorNome: string | null
}

interface TreinoPrescrito {
  id: number
  atletaId: number | null
  atletaNome: string
  titulo: string
  exercicios: string
  criadoEm: string
}

interface Atleta {
  id: number
  nome: string
}

const blankWOD = () => ({ titulo: '', descricao: '', data: new Date().toISOString().slice(0, 10), exercicios: '' })
const blankTreino = () => ({ atletaId: '', titulo: '', exercicios: '' })

export default function Treinos() {
  const [wods, setWods] = useState<WOD[]>([])
  const [treinos, setTreinos] = useState<TreinoPrescrito[]>([])
  const [atletas, setAtletas] = useState<Atleta[]>([])
  const [loadingWod, setLoadingWod] = useState(true)
  const [loadingTreinos, setLoadingTreinos] = useState(true)
  const [showWodForm, setShowWodForm] = useState(false)
  const [showTreinoForm, setShowTreinoForm] = useState(false)
  const [wodForm, setWodForm] = useState(blankWOD())
  const [treinoForm, setTreinoForm] = useState(blankTreino())
  const [savingWod, setSavingWod] = useState(false)
  const [savingTreino, setSavingTreino] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<WOD[]>('/treinos/wod').then(setWods).catch(() => {}).finally(() => setLoadingWod(false))
    api.get<TreinoPrescrito[]>('/treinos').then(setTreinos).catch(() => {}).finally(() => setLoadingTreinos(false))
    api.get<Atleta[]>('/admin/usuarios?role=ATLETA').then(setAtletas).catch(() => {})
  }, [])

  async function saveWOD(e: React.FormEvent) {
    e.preventDefault(); setSavingWod(true); setError('')
    try {
      const novo = await api.post<WOD>('/treinos/wod', wodForm)
      setWods(prev => [novo, ...prev])
      setWodForm(blankWOD()); setShowWodForm(false)
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erro') }
    finally { setSavingWod(false) }
  }

  async function saveTreino(e: React.FormEvent) {
    e.preventDefault(); setSavingTreino(true); setError('')
    if (!treinoForm.atletaId) { setError('Selecione um atleta.'); setSavingTreino(false); return }
    try {
      const novo = await api.post<TreinoPrescrito>('/treinos', {
        atletaId:   Number(treinoForm.atletaId),
        titulo:     treinoForm.titulo,
        exercicios: treinoForm.exercicios,
      })
      setTreinos(prev => [novo, ...prev])
      setTreinoForm(blankTreino()); setShowTreinoForm(false)
    } catch (err: unknown) { setError(err instanceof Error ? err.message : 'Erro') }
    finally { setSavingTreino(false) }
  }

  async function deleteWOD(id: number) {
    if (!confirm('Remover WOD?')) return
    await api.delete(`/treinos/wod/${id}`)
    setWods(prev => prev.filter(w => w.id !== id))
  }

  async function deleteTreino(id: number) {
    if (!confirm('Remover treino?')) return
    await api.delete(`/treinos/${id}`)
    setTreinos(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Treinos</h1>
        <p className="text-zinc-400 text-sm mt-1">WOD diário e fichas individuais prescritas</p>
      </div>

      {/* WOD */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Zap size={18} className="text-yellow-400" /> WOD — Treino do Dia
          </h2>
          <button onClick={() => setShowWodForm(v => !v)}
            className="flex items-center gap-2 bg-yellow-400 text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-300">
            <Plus size={14} /> Novo WOD
          </button>
        </div>

        {showWodForm && (
          <form onSubmit={saveWOD} className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 mb-4 space-y-3">
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Título <span className="text-red-400">*</span></label>
                <input required value={wodForm.titulo} onChange={e => setWodForm(p => ({ ...p, titulo: e.target.value }))}
                  placeholder="ex: AMRAP 20min"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Data</label>
                <input type="date" value={wodForm.data} onChange={e => setWodForm(p => ({ ...p, data: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Exercícios</label>
              <textarea value={wodForm.exercicios} onChange={e => setWodForm(p => ({ ...p, exercicios: e.target.value }))}
                rows={3} placeholder="ex: 10 burpees, 15 squats, 20 push-ups..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none" />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Descrição</label>
              <textarea value={wodForm.descricao} onChange={e => setWodForm(p => ({ ...p, descricao: e.target.value }))}
                rows={2} placeholder="Instruções adicionais..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={savingWod}
                className="flex items-center gap-1.5 bg-yellow-400 text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-300 disabled:opacity-50">
                <Check size={13} /> {savingWod ? 'Publicando...' : 'Publicar WOD'}
              </button>
              <button type="button" onClick={() => setShowWodForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:bg-zinc-800"><X size={13} /></button>
            </div>
          </form>
        )}

        {loadingWod ? (
          <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-20 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
        ) : wods.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 text-sm bg-zinc-900 rounded-xl">Nenhum WOD publicado.</div>
        ) : (
          <div className="space-y-3">
            {wods.map(w => (
              <div key={w.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Zap size={14} className="text-yellow-400" />
                    <p className="font-semibold text-sm">{w.titulo}</p>
                    <span className="text-xs text-zinc-500">{new Date(w.data).toLocaleDateString('pt-BR')}</span>
                    {w.autorNome && (
                      <span className="text-xs text-zinc-600">por {w.autorNome}</span>
                    )}
                  </div>
                  {w.exercicios && <p className="text-xs text-zinc-400 mt-1 font-mono">{w.exercicios}</p>}
                  {w.descricao && <p className="text-xs text-zinc-500 mt-1">{w.descricao}</p>}
                </div>
                <button onClick={() => deleteWOD(w.id)} className="text-zinc-600 hover:text-red-400 shrink-0"><Trash2 size={14} /></button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Treinos Prescritos */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Dumbbell size={18} className="text-yellow-400" /> Fichas Individuais
          </h2>
          <button onClick={() => setShowTreinoForm(v => !v)}
            className="flex items-center gap-2 bg-yellow-400 text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-300">
            <Plus size={14} /> Prescrever
          </button>
        </div>

        {showTreinoForm && (
          <form onSubmit={saveTreino} className="bg-zinc-900 border border-zinc-700 rounded-xl p-5 mb-4 space-y-3">
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Atleta <span className="text-red-400">*</span></label>
                <select required value={treinoForm.atletaId}
                  onChange={e => setTreinoForm(p => ({ ...p, atletaId: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                  <option value="">— selecione o atleta —</option>
                  {atletas.map(a => (
                    <option key={a.id} value={a.id}>{a.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Título do Treino <span className="text-red-400">*</span></label>
                <input required value={treinoForm.titulo} onChange={e => setTreinoForm(p => ({ ...p, titulo: e.target.value }))}
                  placeholder="ex: Treino A – Peito e Tríceps"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Exercícios</label>
              <textarea value={treinoForm.exercicios} onChange={e => setTreinoForm(p => ({ ...p, exercicios: e.target.value }))}
                rows={4} placeholder="Ex: Supino 4x10, Crucifixo 3x12, Tríceps pulley 4x12..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={savingTreino}
                className="flex items-center gap-1.5 bg-yellow-400 text-zinc-900 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-yellow-300 disabled:opacity-50">
                <Check size={13} /> {savingTreino ? 'Salvando...' : 'Salvar Ficha'}
              </button>
              <button type="button" onClick={() => setShowTreinoForm(false)}
                className="px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:bg-zinc-800"><X size={13} /></button>
            </div>
          </form>
        )}

        {loadingTreinos ? (
          <div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
        ) : treinos.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 text-sm bg-zinc-900 rounded-xl">Nenhuma ficha prescrita.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['Atleta', 'Treino', 'Data', ''].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs text-zinc-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {treinos.map(t => (
                  <tr key={t.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                    <td className="py-3 px-4 font-medium">{t.atletaNome}</td>
                    <td className="py-3 px-4 text-zinc-300 text-sm">{t.titulo}</td>
                    <td className="py-3 px-4 text-zinc-500 text-xs">{new Date(t.criadoEm).toLocaleDateString('pt-BR')}</td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => deleteTreino(t.id)} className="text-zinc-600 hover:text-red-400"><Trash2 size={13} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
