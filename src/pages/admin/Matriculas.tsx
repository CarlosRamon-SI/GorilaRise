import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Loader2, Pencil } from 'lucide-react'

interface Matricula {
  id: number
  status: string
  criadoEm: string
  usuario:    { id: number; nome: string; email: string }
  modalidade: { id: number; nome: string }
  plano:      { id: number; nome: string; valor: string }
  responsavel:{ id: number; nome: string } | null
}

interface Modalidade { id: number; nome: string }
interface Plano { id: number; nome: string; valor: string }
interface Usuario { id: number; nome: string; email: string; role?: string }

const STATUS_COLOR: Record<string, string> = {
  ATIVA:    'bg-green-500/20 text-green-400 border-green-500/30',
  INATIVA:  'bg-zinc-700 text-zinc-400 border-zinc-600',
  PENDENTE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
}

const SEL = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gorila-yellow'

// ── Dados compartilhados ──────────────────────────────────────────────────
async function fetchSelects() {
  const [usuarios, modalidades, planos, treinadores] = await Promise.all([
    api.get<Usuario[]>('/admin/usuarios?role=ATLETA&ativo=true'),
    api.get<Modalidade[]>('/modalidades'),
    api.get<Plano[]>('/planos'),
    api.get<Usuario[]>('/admin/usuarios?role=TREINADOR&ativo=true'),
  ])
  return { usuarios, modalidades, planos, treinadores }
}

// ── Modal Nova Matrícula ──────────────────────────────────────────────────
function ModalNovaMatricula({
  onClose, onCriada,
}: { onClose: () => void; onCriada: (m: Matricula) => void }) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [treinadores, setTreinadores] = useState<Usuario[]>([])
  const [modalidades, setModalidades] = useState<Modalidade[]>([])
  const [planos, setPlanos] = useState<Plano[]>([])
  const [form, setForm] = useState({ usuarioId: '', modalidadeId: '', planoId: '', responsavelId: '', status: 'ATIVA' })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetchSelects().then(({ usuarios, modalidades, planos, treinadores }) => {
      setUsuarios(usuarios); setModalidades(modalidades); setPlanos(planos); setTreinadores(treinadores)
    }).catch(() => {})
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!form.usuarioId || !form.modalidadeId || !form.planoId || !form.responsavelId)
      return setErro('Todos os campos são obrigatórios.')
    setSaving(true)
    try {
      const m = await api.post<Matricula>('/admin/matriculas', {
        usuarioId:    Number(form.usuarioId),
        modalidadeId: Number(form.modalidadeId),
        planoId:      Number(form.planoId),
        responsavelId: Number(form.responsavelId),
        status:       form.status,
      })
      onCriada(m)
      onClose()
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao criar matrícula.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true"
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
          <Plus size={18} className="text-gorila-yellow" /> Nova Matrícula
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block" htmlFor="mat-atleta">Atleta *</label>
            <select id="mat-atleta" value={form.usuarioId} onChange={e => setForm(f => ({ ...f, usuarioId: e.target.value }))} className={SEL} required autoFocus>
              <option value="">Selecione o atleta…</option>
              {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block" htmlFor="mat-modalidade">Modalidade *</label>
            <select id="mat-modalidade" value={form.modalidadeId} onChange={e => setForm(f => ({ ...f, modalidadeId: e.target.value }))} className={SEL} required>
              <option value="">Selecione a modalidade…</option>
              {modalidades.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block" htmlFor="mat-plano">Plano *</label>
            <select id="mat-plano" value={form.planoId} onChange={e => setForm(f => ({ ...f, planoId: e.target.value }))} className={SEL} required>
              <option value="">Selecione o plano…</option>
              {planos.map(p => <option key={p.id} value={p.id}>{p.nome} — R$ {Number(p.valor).toFixed(2)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block" htmlFor="mat-treinador">Treinador Responsável *</label>
            <select id="mat-treinador" value={form.responsavelId} onChange={e => setForm(f => ({ ...f, responsavelId: e.target.value }))} className={SEL} required>
              <option value="">Selecione o treinador…</option>
              {treinadores.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block" htmlFor="mat-status">Status inicial</label>
            <select id="mat-status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={SEL}>
              <option value="ATIVA">ATIVA</option>
              <option value="PENDENTE">PENDENTE</option>
            </select>
          </div>
          {erro && <p className="text-red-400 text-xs">{erro}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 rounded-lg bg-gorila-yellow text-gorila-primary font-bold text-sm hover:bg-yellow-300 transition-colors flex items-center justify-center gap-1 disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Matricular
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal Editar Matrícula ────────────────────────────────────────────────
function ModalEditarMatricula({
  matricula, onClose, onSalva,
}: { matricula: Matricula; onClose: () => void; onSalva: (m: Matricula) => void }) {
  const [treinadores, setTreinadores] = useState<Usuario[]>([])
  const [modalidades, setModalidades] = useState<Modalidade[]>([])
  const [planos, setPlanos] = useState<Plano[]>([])
  const [form, setForm] = useState({
    modalidadeId:  String(matricula.modalidade.id),
    planoId:       String(matricula.plano.id),
    responsavelId: String(matricula.responsavel?.id ?? ''),
    status:        matricula.status,
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    fetchSelects().then(({ modalidades, planos, treinadores }) => {
      setModalidades(modalidades); setPlanos(planos); setTreinadores(treinadores)
    }).catch(() => {})
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!form.responsavelId) return setErro('Selecione um treinador responsável.')
    setSaving(true)
    try {
      const updated = await api.patch<Matricula>(`/admin/matriculas/${matricula.id}`, {
        modalidadeId:  Number(form.modalidadeId),
        planoId:       Number(form.planoId),
        responsavelId: Number(form.responsavelId),
        status:        form.status,
      })
      onSalva(updated)
      onClose()
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true"
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <h2 className="text-lg font-bold mb-1 flex items-center gap-2">
          <Pencil size={16} className="text-gorila-yellow" /> Editar Matrícula
        </h2>
        <p className="text-zinc-400 text-xs mb-5">{matricula.usuario.nome}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Modalidade *</label>
            <select value={form.modalidadeId} onChange={e => setForm(f => ({ ...f, modalidadeId: e.target.value }))} className={SEL} required>
              {modalidades.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Plano *</label>
            <select value={form.planoId} onChange={e => setForm(f => ({ ...f, planoId: e.target.value }))} className={SEL} required>
              {planos.map(p => <option key={p.id} value={p.id}>{p.nome} — R$ {Number(p.valor).toFixed(2)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Treinador Responsável *</label>
            <select value={form.responsavelId} onChange={e => setForm(f => ({ ...f, responsavelId: e.target.value }))} className={SEL} required>
              <option value="">Selecione o treinador…</option>
              {treinadores.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={SEL}>
              <option value="ATIVA">ATIVA</option>
              <option value="INATIVA">INATIVA</option>
              <option value="PENDENTE">PENDENTE</option>
            </select>
          </div>
          {erro && <p className="text-red-400 text-xs">{erro}</p>}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 rounded-lg bg-gorila-yellow text-gorila-primary font-bold text-sm hover:bg-yellow-300 transition-colors flex items-center justify-center gap-1 disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Pencil size={14} />}
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Página principal ──────────────────────────────────────────────────────
export default function Matriculas() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [novaModal, setNovaModal] = useState(false)
  const [editando, setEditando] = useState<Matricula | null>(null)

  useEffect(() => {
    api.get<Matricula[]>('/admin/matriculas')
      .then(setMatriculas)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  function atualizar(updated: Matricula) {
    setMatriculas(prev => prev.map(x => x.id === updated.id ? updated : x))
  }

  return (
    <div className="px-4 py-5 md:p-8">
      {novaModal && (
        <ModalNovaMatricula
          onClose={() => setNovaModal(false)}
          onCriada={(m) => setMatriculas(prev => [m, ...prev])}
        />
      )}
      {editando && (
        <ModalEditarMatricula
          matricula={editando}
          onClose={() => setEditando(null)}
          onSalva={atualizar}
        />
      )}

      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold">Matrículas</h1>
        <button
          onClick={() => setNovaModal(true)}
          className="flex items-center gap-1.5 bg-gorila-yellow text-gorila-primary font-bold text-sm px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors">
          <Plus size={15} /> Nova Matrícula
        </button>
      </div>
      <p className="text-zinc-400 text-sm mb-8">{matriculas.length} registro(s)</p>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-lg h-14 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-left">
                <th className="px-4 py-3 font-medium">Atleta</th>
                <th className="px-4 py-3 font-medium">Treinador</th>
                <th className="px-4 py-3 font-medium">Modalidade</th>
                <th className="px-4 py-3 font-medium">Plano</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {matriculas.map((m) => (
                <tr key={m.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{m.usuario.nome}</p>
                    <p className="text-zinc-500 text-xs">{m.usuario.email}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-300 text-xs">
                    {m.responsavel?.nome ?? <span className="text-zinc-600 italic">não definido</span>}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">{m.modalidade.nome}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {m.plano.nome}
                    <span className="text-zinc-500 ml-1 text-xs">R$ {Number(m.plano.valor).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${STATUS_COLOR[m.status] ?? STATUS_COLOR.INATIVA}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {new Date(m.criadoEm).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditando(m)}
                      title="Editar matrícula"
                      className="p-1.5 rounded-md text-zinc-500 hover:text-gorila-yellow hover:bg-zinc-800 transition-colors">
                      <Pencil size={14} />
                    </button>
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
