import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { X, Pencil, Check } from 'lucide-react'

interface AnamneseData {
  id: number
  profissao: string
  contatoEmergenciaNome: string
  contatoEmergenciaTel: string
  objetivos: string[]
  doencas: string
  medicamentos: string
  cirurgias: string
  problemasArticulares: string
  historicoCardio: boolean
  fumante: boolean
  frequenciaSemanal: string
  qualidadeSono: string
  consumoAlcool: string
  termoAssinado: boolean
  criadoEm: string
}

interface AtletaAnamnese {
  id: number
  nome: string
  email: string
  nascimento?: string
  telefone: string
  anamnese: AnamneseData | null
}

function ModalAnamnese({ atleta, onClose }: { atleta: AtletaAnamnese; onClose: () => void }) {
  const a = atleta.anamnese!

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])

  const Row = ({ label, value }: { label: string; value?: string | boolean | string[] }) => {
    if (!value && value !== false) return null
    const display = typeof value === 'boolean' ? (value ? 'Sim' : 'Não')
      : Array.isArray(value) ? value.join(', ')
      : value
    return (
      <div className="py-2 border-b border-zinc-800/60 grid grid-cols-[160px_1fr] gap-2">
        <span className="text-zinc-500 text-xs">{label}</span>
        <span className="text-sm text-zinc-200">{display || '—'}</span>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true"
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold">{atleta.nome}</h2>
            <p className="text-zinc-500 text-xs">{atleta.email}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={18} /></button>
        </div>
        <div className="space-y-0">
          <Row label="Profissão" value={a.profissao} />
          <Row label="Nasc." value={atleta.nascimento ? new Date(atleta.nascimento).toLocaleDateString('pt-BR') : undefined} />
          <Row label="Objetivos" value={a.objetivos} />
          <Row label="Doenças" value={a.doencas} />
          <Row label="Medicamentos" value={a.medicamentos} />
          <Row label="Cirurgias" value={a.cirurgias} />
          <Row label="Prob. articulares" value={a.problemasArticulares} />
          <Row label="Histórico cardíaco" value={a.historicoCardio} />
          <Row label="Fumante" value={a.fumante} />
          <Row label="Freq. semanal" value={a.frequenciaSemanal} />
          <Row label="Qualidade do sono" value={a.qualidadeSono} />
          <Row label="Álcool" value={a.consumoAlcool} />
          <Row label="Contato emergência" value={a.contatoEmergenciaNome ? `${a.contatoEmergenciaNome} — ${a.contatoEmergenciaTel}` : undefined} />
          <Row label="Termo assinado" value={a.termoAssinado} />
          <Row label="Preenchida em" value={new Date(a.criadoEm).toLocaleDateString('pt-BR')} />
        </div>
      </div>
    </div>
  )
}

function ModalEditarAnamnese({ atleta, onClose, onSaved }: { atleta: AtletaAnamnese; onClose: () => void; onSaved: (a: AtletaAnamnese) => void }) {
  const a = atleta.anamnese!
  const [form, setForm] = useState({
    profissao:             a.profissao,
    doencas:               a.doencas,
    medicamentos:          a.medicamentos,
    cirurgias:             a.cirurgias,
    problemasArticulares:  a.problemasArticulares,
    frequenciaSemanal:     a.frequenciaSemanal,
    qualidadeSono:         a.qualidadeSono,
    consumoAlcool:         a.consumoAlcool,
    contatoEmergenciaNome: a.contatoEmergenciaNome,
    contatoEmergenciaTel:  a.contatoEmergenciaTel,
    historicoCardio:       a.historicoCardio,
    fumante:               a.fumante,
    termoAssinado:         a.termoAssinado,
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])

  const inp = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400'

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setErro('')
    try {
      await api.patch(`/admin/anamneses/${atleta.id}`, form)
      onSaved({ ...atleta, anamnese: { ...a, ...form } })
      onClose()
    } catch (err: any) {
      setErro(err.message ?? 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[85vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold">Editar Anamnese — {atleta.nome}</h2>
          <button onClick={onClose}><X size={18} className="text-zinc-400 hover:text-white" /></button>
        </div>
        <form onSubmit={handleSave} className="space-y-3">
          {erro && <p className="text-red-400 text-xs">{erro}</p>}
          {([
            ['profissao', 'Profissão'],
            ['doencas', 'Doenças / Condições'],
            ['medicamentos', 'Medicamentos'],
            ['cirurgias', 'Cirurgias'],
            ['problemasArticulares', 'Problemas Articulares'],
            ['frequenciaSemanal', 'Freq. Semanal'],
            ['qualidadeSono', 'Qualidade do Sono'],
            ['consumoAlcool', 'Consumo de Álcool'],
            ['contatoEmergenciaNome', 'Contato Emergência (nome)'],
            ['contatoEmergenciaTel', 'Contato Emergência (tel)'],
          ] as [keyof typeof form, string][]).map(([field, label]) => (
            <div key={field}>
              <label className="text-xs text-zinc-400 mb-1 block">{label}</label>
              <input className={inp} value={String(form[field] ?? '')}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
            </div>
          ))}
          <div className="grid grid-cols-3 gap-3">
            {([
              ['historicoCardio', 'Histórico Cardíaco'],
              ['fumante', 'Fumante'],
              ['termoAssinado', 'Termo Assinado'],
            ] as [keyof typeof form, string][]).map(([field, label]) => (
              <label key={field} className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input type="checkbox" checked={Boolean(form[field])}
                  onChange={e => setForm(f => ({ ...f, [field]: e.target.checked }))}
                  className="accent-yellow-400" />
                {label}
              </label>
            ))}
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800">
              Cancelar
            </button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2 rounded-lg bg-yellow-400 text-zinc-900 font-bold text-sm hover:bg-yellow-300 flex items-center justify-center gap-1 disabled:opacity-60">
              <Check size={14} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function AdminAnamneses() {
  const [atletas, setAtletas] = useState<AtletaAnamnese[]>([])
  const [loading, setLoading] = useState(true)
  const [verModal, setVerModal] = useState<AtletaAnamnese | null>(null)
  const [editModal, setEditModal] = useState<AtletaAnamnese | null>(null)

  useEffect(() => {
    api.get<AtletaAnamnese[]>('/admin/anamneses')
      .then(setAtletas)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const preenchidas = atletas.filter(a => a.anamnese)
  const pendentes   = atletas.filter(a => !a.anamnese)

  return (
    <div className="px-4 py-5 md:p-8">
      {verModal && <ModalAnamnese atleta={verModal} onClose={() => setVerModal(null)} />}
      {editModal && (
        <ModalEditarAnamnese
          atleta={editModal}
          onClose={() => setEditModal(null)}
          onSaved={updated => setAtletas(prev => prev.map(a => a.id === updated.id ? updated : a))}
        />
      )}

      <h1 className="text-2xl font-bold mb-1">Fichas de Anamnese</h1>
      <p className="text-zinc-400 text-sm mb-8">
        {preenchidas.length} preenchida(s) · {pendentes.length} pendente(s)
      </p>

      {loading ? (
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-zinc-900 rounded-lg h-14 animate-pulse" />)}</div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-left">
                <th className="px-4 py-3 font-medium">Atleta</th>
                <th className="px-4 py-3 font-medium">Telefone</th>
                <th className="px-4 py-3 font-medium">Situação</th>
                <th className="px-4 py-3 font-medium">Preenchida em</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {atletas.map((a) => (
                <tr key={a.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium">{a.nome}</p>
                    <p className="text-zinc-500 text-xs">{a.email}</p>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">{a.telefone || '—'}</td>
                  <td className="px-4 py-3">
                    {a.anamnese ? (
                      <button onClick={() => setVerModal(a)}
                        className="text-xs px-2 py-0.5 rounded-full border bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30 transition-colors">
                        Preenchida
                      </button>
                    ) : (
                      <span className="text-xs px-2 py-0.5 rounded-full border bg-zinc-700 text-zinc-400 border-zinc-600">
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {a.anamnese ? new Date(a.anamnese.criadoEm).toLocaleDateString('pt-BR') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {a.anamnese && (
                      <button onClick={() => setEditModal(a)}
                        className="text-zinc-500 hover:text-yellow-400 transition-colors">
                        <Pencil size={14} />
                      </button>
                    )}
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
