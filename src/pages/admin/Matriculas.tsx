import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Loader2 } from 'lucide-react'

interface Matricula {
  id: number
  status: string
  criadoEm: string
  usuario: { id: number; nome: string; email: string }
  modalidade: { id: number; nome: string }
  plano: { id: number; nome: string; valor: string }
}

interface Modalidade { id: number; nome: string }
interface Plano { id: number; nome: string; valor: string }
interface Usuario { id: number; nome: string; email: string; role?: string }

const STATUS_CYCLE: Record<string, string> = { ATIVA: 'INATIVA', INATIVA: 'ATIVA', PENDENTE: 'ATIVA' }
const STATUS_COLOR: Record<string, string> = {
  ATIVA:    'bg-green-500/20 text-green-400 border-green-500/30',
  INATIVA:  'bg-zinc-700 text-zinc-400 border-zinc-600',
  PENDENTE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
}

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
    Promise.all([
      api.get<Usuario[]>('/admin/usuarios?role=ATLETA&ativo=true'),
      api.get<Modalidade[]>('/modalidades'),
      api.get<Plano[]>('/planos'),
      api.get<Usuario[]>('/admin/usuarios?role=TREINADOR&ativo=true'),
    ]).then(([u, m, p, t]) => { setUsuarios(u); setModalidades(m); setPlanos(p); setTreinadores(t) }).catch(() => {})
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!form.usuarioId || !form.modalidadeId || !form.planoId) return setErro('Preencha todos os campos.')
    setSaving(true)
    try {
      const m = await api.post<Matricula>('/admin/matriculas', {
        usuarioId:     Number(form.usuarioId),
        modalidadeId:  Number(form.modalidadeId),
        planoId:       Number(form.planoId),
        responsavelId: form.responsavelId ? Number(form.responsavelId) : null,
        status:        form.status,
      })
      onCriada(m)
      onClose()
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao criar matrícula.')
    } finally {
      setSaving(false)
    }
  }

  const sel = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gorila-yellow'

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
            <label className="text-xs text-zinc-400 mb-1 block">Atleta</label>
            <select value={form.usuarioId} onChange={e => setForm(f => ({ ...f, usuarioId: e.target.value }))} className={sel} required autoFocus>
              <option value="">Selecione o atleta…</option>
              {usuarios.map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Modalidade</label>
            <select value={form.modalidadeId} onChange={e => setForm(f => ({ ...f, modalidadeId: e.target.value }))} className={sel} required>
              <option value="">Selecione a modalidade…</option>
              {modalidades.map(m => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Plano</label>
            <select value={form.planoId} onChange={e => setForm(f => ({ ...f, planoId: e.target.value }))} className={sel} required>
              <option value="">Selecione o plano…</option>
              {planos.map(p => <option key={p.id} value={p.id}>{p.nome} — R$ {Number(p.valor).toFixed(2)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Treinador Responsável (opcional)</label>
            <select value={form.responsavelId} onChange={e => setForm(f => ({ ...f, responsavelId: e.target.value }))} className={sel}>
              <option value="">Sem responsável definido</option>
              {treinadores.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Status inicial</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={sel}>
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

export default function Matriculas() {
  const [matriculas, setMatriculas] = useState<Matricula[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [novaModal, setNovaModal] = useState(false)
  const [toggling, setToggling] = useState<number | null>(null)

  useEffect(() => {
    api.get<Matricula[]>('/admin/matriculas')
      .then(setMatriculas)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function toggleStatus(m: Matricula) {
    const novoStatus = STATUS_CYCLE[m.status] ?? 'ATIVA'
    setToggling(m.id)
    try {
      const updated = await api.patch<Matricula>(`/admin/matriculas/${m.id}`, { status: novoStatus })
      setMatriculas(prev => prev.map(x => x.id === m.id ? { ...x, ...updated } : x))
    } catch (e: any) {
      alert(e.message)
    } finally {
      setToggling(null)
    }
  }

  return (
    <div className="px-4 py-5 md:p-8">
      {novaModal && (
        <ModalNovaMatricula
          onClose={() => setNovaModal(false)}
          onCriada={(m) => setMatriculas(prev => [m, ...prev])}
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
          <table className="w-full text-sm min-w-[600px]">
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
                    <span className="text-zinc-500 ml-1 text-xs">R$ {Number(m.plano.valor).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled={toggling === m.id}
                      onClick={() => toggleStatus(m)}
                      className={`text-xs px-2 py-0.5 rounded-full border transition-colors hover:opacity-80 disabled:opacity-50 ${STATUS_COLOR[m.status] ?? STATUS_COLOR.INATIVA}`}>
                      {toggling === m.id ? '…' : m.status}
                    </button>
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
