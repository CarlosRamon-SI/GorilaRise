import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Loader2, X, CheckCircle, XCircle, Users, Trash2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

type StatusTurma = 'PROPOSTA' | 'PENDENTE_APROVACAO' | 'ATIVA' | 'INATIVA'

interface Ambiente { id: number; nome: string; capacidade: number; ativo: boolean }
interface Treinador { id: number; nome: string }

interface Turma {
  id: number
  codigo: string
  horario: string
  dias: string[]
  tipo: string
  descricao?: string
  faixaIdade?: string
  capacidade: number
  status: StatusTurma
  ambienteId?: number | null
  treinadorId?: number | null
  ambiente?: Ambiente | null
  treinador?: Treinador | null
}

const STATUS_LABEL: Record<StatusTurma, string> = {
  PROPOSTA: 'Proposta',
  PENDENTE_APROVACAO: 'Aguardando aprovação',
  ATIVA: 'Ativa',
  INATIVA: 'Inativa',
}
const STATUS_COLOR: Record<StatusTurma, string> = {
  PROPOSTA: 'bg-zinc-600 text-zinc-300 border-zinc-500',
  PENDENTE_APROVACAO: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ATIVA: 'bg-green-500/20 text-green-400 border-green-500/30',
  INATIVA: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const DIAS_SEMANA = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']
const BLANK = {
  codigo: '', horario: '', dias: [] as string[], tipo: 'regular',
  descricao: '', faixaIdade: '', capacidade: 6,
  ambienteId: '' as string | number, treinadorId: '' as string | number,
  status: 'ATIVA' as StatusTurma,
}

function ModalTurma({
  turma, ambientes, treinadores, onClose, onSalvo,
}: {
  turma?: Turma
  ambientes: Ambiente[]
  treinadores: Treinador[]
  onClose: () => void
  onSalvo: (t: Turma) => void
}) {
  const [form, setForm] = useState(turma ? {
    codigo: turma.codigo,
    horario: turma.horario,
    dias: turma.dias,
    tipo: turma.tipo,
    descricao: turma.descricao ?? '',
    faixaIdade: turma.faixaIdade ?? '',
    capacidade: turma.capacidade,
    ambienteId: turma.ambienteId ?? '' as string | number,
    treinadorId: turma.treinadorId ?? '' as string | number,
    status: turma.status,
  } : BLANK)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])

  function toggleDia(dia: string) {
    setForm(f => ({ ...f, dias: f.dias.includes(dia) ? f.dias.filter(d => d !== dia) : [...f.dias, dia] }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (form.dias.length === 0) return setErro('Selecione pelo menos um dia.')
    setSaving(true)
    try {
      const payload = {
        horario: form.horario, dias: form.dias, tipo: form.tipo,
        descricao: form.descricao, faixaIdade: form.faixaIdade,
        capacidade: Number(form.capacidade),
        ambienteId: form.ambienteId !== '' ? Number(form.ambienteId) : null,
        treinadorId: form.treinadorId !== '' ? Number(form.treinadorId) : null,
        status: form.status,
      }
      let t: Turma
      if (turma) {
        t = await api.patch<Turma>(`/admin/turmas/${turma.id}`, payload)
      } else {
        t = await api.post<Turma>('/admin/turmas', { ...payload, codigo: form.codigo })
      }
      onSalvo(t)
      onClose()
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao salvar turma.')
    } finally {
      setSaving(false)
    }
  }

  const inp = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gorila-yellow'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true"
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            {turma ? <Pencil size={18} className="text-gorila-yellow" /> : <Plus size={18} className="text-gorila-yellow" />}
            {turma ? 'Editar Turma' : 'Nova Turma'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Código</label>
              <input type="text" value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))}
                className={inp} required autoFocus disabled={!!turma} placeholder="Ex: BJJM1" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Horário</label>
              <input type="text" value={form.horario} onChange={e => setForm(f => ({ ...f, horario: e.target.value }))}
                className={inp} required placeholder="Ex: 07:00 – 08:00" />
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-2 block">Dias da semana</label>
            <div className="flex flex-wrap gap-2">
              {DIAS_SEMANA.map(d => (
                <button key={d} type="button" onClick={() => toggleDia(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
                    form.dias.includes(d)
                      ? 'bg-gorila-yellow/20 text-gorila-yellow border-gorila-yellow/40'
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-600'
                  }`}>{d}</button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Tipo</label>
              <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))} className={inp}>
                <option value="regular">Regular</option>
                <option value="kids">Kids</option>
                <option value="competicao">Competição</option>
                <option value="open">Open</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Capacidade</label>
              <input type="number" min={1} value={form.capacidade}
                onChange={e => setForm(f => ({ ...f, capacidade: Number(e.target.value) }))}
                className={inp} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Ambiente</label>
              <select value={form.ambienteId} onChange={e => setForm(f => ({ ...f, ambienteId: e.target.value }))} className={inp}>
                <option value="">Sem ambiente</option>
                {ambientes.filter(a => a.ativo).map(a => (
                  <option key={a.id} value={a.id}>{a.nome} ({a.capacidade})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Treinador</label>
              <select value={form.treinadorId} onChange={e => setForm(f => ({ ...f, treinadorId: e.target.value }))} className={inp}>
                <option value="">Sem treinador</option>
                {treinadores.map(t => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as StatusTurma }))} className={inp}>
              <option value="ATIVA">Ativa</option>
              <option value="PROPOSTA">Proposta (aguarda aceite do treinador)</option>
              <option value="INATIVA">Inativa</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Faixa etária</label>
            <input type="text" value={form.faixaIdade} onChange={e => setForm(f => ({ ...f, faixaIdade: e.target.value }))}
              className={inp} placeholder="Ex: 6–12 anos" />
          </div>

          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Descrição</label>
            <textarea value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              className={`${inp} resize-none h-20`} placeholder="Descrição da turma…" />
          </div>

          {erro && <p className="text-red-400 text-xs">{erro}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 rounded-lg bg-gorila-yellow text-gorila-primary font-bold text-sm hover:bg-yellow-300 transition-colors flex items-center justify-center gap-1 disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : turma ? <Pencil size={14} /> : <Plus size={14} />}
              {turma ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

interface AtletaItem { id: number; nome: string; email: string }

function ModalAtletas({ turma, onClose }: { turma: Turma; onClose: () => void }) {
  const [inscritos, setInscritos] = useState<AtletaItem[]>([])
  const [disponiveis, setDisponiveis] = useState<AtletaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selecionado, setSelecionado] = useState('')
  const [adding, setAdding] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])

  useEffect(() => {
    Promise.all([
      api.get<AtletaItem[]>(`/admin/turmas/${turma.id}/atletas`),
      api.get<AtletaItem[]>('/admin/usuarios?role=ATLETA&ativo=true&comMatriculaAtiva=true').catch(() => [] as AtletaItem[]),
    ]).then(([ins, disp]) => {
      setInscritos(ins)
      setDisponiveis(disp)
    }).catch(e => setErro(e.message))
      .finally(() => setLoading(false))
  }, [turma.id])

  const naoInscritos = disponiveis.filter(d => !inscritos.some(i => i.id === d.id))

  async function handleAdd() {
    if (!selecionado) return
    setAdding(true); setErro('')
    try {
      await api.post(`/admin/turmas/${turma.id}/atletas`, { atletaId: Number(selecionado) })
      const novo = disponiveis.find(d => d.id === Number(selecionado))!
      setInscritos(prev => [...prev, novo])
      setSelecionado('')
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao adicionar atleta.')
    } finally {
      setAdding(false)
    }
  }

  async function handleRemove(atletaId: number) {
    setRemovingId(atletaId); setErro('')
    try {
      await api.delete(`/admin/turmas/${turma.id}/atletas/${atletaId}`)
      setInscritos(prev => prev.filter(a => a.id !== atletaId))
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao remover atleta.')
    } finally {
      setRemovingId(null)
    }
  }

  const inp = 'flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gorila-yellow'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true"
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Users size={18} className="text-gorila-yellow" />
            Atletas — {turma.codigo}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={18} /></button>
        </div>

        {/* Adicionar */}
        <div className="flex gap-2 mb-4">
          <select value={selecionado} onChange={e => setSelecionado(e.target.value)} className={inp}>
            <option value="">Selecionar atleta...</option>
            {naoInscritos.map(a => (
              <option key={a.id} value={a.id}>{a.nome}</option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            disabled={adding || !selecionado}
            className="flex items-center gap-1 bg-gorila-yellow text-zinc-900 px-3 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 disabled:opacity-50 transition-colors whitespace-nowrap">
            {adding ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
            Adicionar
          </button>
        </div>

        {erro && <p className="text-red-400 text-xs mb-3">{erro}</p>}

        {/* Lista inscritos */}
        <div className="flex-1 overflow-y-auto space-y-1">
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-10 bg-zinc-800 rounded-lg animate-pulse" />)}
            </div>
          ) : inscritos.length === 0 ? (
            <p className="text-center text-zinc-500 text-sm py-8">Nenhum atleta inscrito nesta turma.</p>
          ) : (
            inscritos.map(a => (
              <div key={a.id} className="flex items-center justify-between bg-zinc-800/60 border border-zinc-700/50 rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm font-medium text-zinc-200">{a.nome}</p>
                  <p className="text-xs text-zinc-500">{a.email}</p>
                </div>
                <button
                  onClick={() => handleRemove(a.id)}
                  disabled={removingId === a.id}
                  className="text-zinc-500 hover:text-red-400 transition-colors p-1 rounded disabled:opacity-50"
                  title="Remover atleta">
                  {removingId === a.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                </button>
              </div>
            ))
          )}
        </div>

        <p className="text-xs text-zinc-600 mt-3 text-right">
          {inscritos.length} / {turma.capacidade} atleta(s)
        </p>
      </div>
    </div>
  )
}

export default function Turmas() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [turmas, setTurmas] = useState<Turma[]>([])
  const [ambientes, setAmbientes] = useState<Ambiente[]>([])
  const [treinadores, setTreinadores] = useState<Treinador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [novaModal, setNovaModal] = useState(false)
  const [editando, setEditando] = useState<Turma | null>(null)
  const [statusLoading, setStatusLoading] = useState<number | null>(null)
  const [atletasModal, setAtletasModal] = useState<Turma | null>(null)

  useEffect(() => {
    Promise.all([
      api.get<Turma[]>('/admin/turmas'),
      api.get<Ambiente[]>('/admin/ambientes').catch(() => [] as Ambiente[]),
      api.get<Treinador[]>('/admin/usuarios?role=TREINADOR&ativo=true').catch(() => [] as Treinador[]),
    ]).then(([t, a, tr]) => {
      setTurmas(t)
      setAmbientes(a)
      setTreinadores(tr)
    }).catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleStatusChange(t: Turma, novoStatus: StatusTurma) {
    if (!isAdmin) return
    setStatusLoading(t.id)
    try {
      const updated = await api.patch<Turma>(`/admin/turmas/${t.id}/status`, { status: novoStatus })
      setTurmas(prev => prev.map(x => x.id === t.id ? { ...x, ...updated } : x))
    } catch (e: any) {
      alert(e.message)
    } finally {
      setStatusLoading(null)
    }
  }

  function onSalvo(t: Turma) {
    setTurmas(prev => {
      const idx = prev.findIndex(x => x.id === t.id)
      if (idx >= 0) return prev.map(x => x.id === t.id ? t : x)
      return [...prev, t]
    })
  }

  return (
    <div className="px-4 py-5 md:p-8">
      {atletasModal && (
        <ModalAtletas turma={atletasModal} onClose={() => setAtletasModal(null)} />
      )}
      {novaModal && (
        <ModalTurma
          ambientes={ambientes} treinadores={treinadores}
          onClose={() => setNovaModal(false)} onSalvo={onSalvo}
        />
      )}
      {editando && (
        <ModalTurma
          turma={editando} ambientes={ambientes} treinadores={treinadores}
          onClose={() => setEditando(null)} onSalvo={onSalvo}
        />
      )}

      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold">Turmas</h1>
        {isAdmin && (
          <button onClick={() => setNovaModal(true)}
            className="flex items-center gap-1.5 bg-gorila-yellow text-gorila-primary font-bold text-sm px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors">
            <Plus size={15} /> Nova Turma
          </button>
        )}
      </div>
      <p className="text-zinc-400 text-sm mb-8">{turmas.length} turma(s) cadastrada(s)</p>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="bg-zinc-900 rounded-lg h-14 animate-pulse" />)}</div>
      ) : turmas.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center text-zinc-400">
          Nenhuma turma cadastrada.
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-left">
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Horário</th>
                <th className="px-4 py-3 font-medium">Dias</th>
                <th className="px-4 py-3 font-medium">Ambiente</th>
                <th className="px-4 py-3 font-medium">Treinador</th>
                <th className="px-4 py-3 font-medium">Cap.</th>
                <th className="px-4 py-3 font-medium">Status</th>
                {isAdmin && <th className="px-4 py-3 font-medium">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {turmas.map((t) => (
                <tr key={t.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono font-medium">{t.codigo}</td>
                  <td className="px-4 py-3 text-zinc-300">{t.horario}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(t.dias) ? t.dias : []).map(d => (
                        <span key={d} className="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 px-1.5 py-0.5 rounded">{d}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{t.ambiente?.nome ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{t.treinador?.nome ?? '—'}</td>
                  <td className="px-4 py-3 text-zinc-400">{t.capacidade}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLOR[t.status]}`}>
                      {STATUS_LABEL[t.status]}
                    </span>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        <button onClick={() => setEditando(t)}
                          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-gorila-yellow transition-colors px-2 py-1 rounded hover:bg-zinc-800">
                          <Pencil size={12} /> Editar
                        </button>
                        <button onClick={() => setAtletasModal(t)}
                          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-blue-400 transition-colors px-2 py-1 rounded hover:bg-zinc-800">
                          <Users size={12} /> Atletas
                        </button>
                        {t.status === 'PENDENTE_APROVACAO' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(t, 'ATIVA')}
                              disabled={statusLoading === t.id}
                              className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300 px-2 py-1 rounded hover:bg-zinc-800 disabled:opacity-50 transition-colors">
                              <CheckCircle size={12} />
                              {statusLoading === t.id ? '…' : 'Aprovar'}
                            </button>
                            <button
                              onClick={() => handleStatusChange(t, 'INATIVA')}
                              disabled={statusLoading === t.id}
                              className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded hover:bg-zinc-800 disabled:opacity-50 transition-colors">
                              <XCircle size={12} />
                              {statusLoading === t.id ? '…' : 'Rejeitar'}
                            </button>
                          </>
                        )}
                        {t.status !== 'PENDENTE_APROVACAO' && (
                          <button
                            onClick={() => handleStatusChange(t, t.status === 'ATIVA' ? 'INATIVA' : 'ATIVA')}
                            disabled={statusLoading === t.id}
                            className={`flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-zinc-800 disabled:opacity-50 transition-colors ${
                              t.status === 'ATIVA' ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'
                            }`}>
                            {statusLoading === t.id ? '…' : t.status === 'ATIVA' ? 'Desativar' : 'Ativar'}
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
