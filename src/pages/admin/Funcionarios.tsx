import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Trash2, X, Check } from 'lucide-react'

interface Funcionario {
  id: number
  nome: string
  email: string
  cref: string
  funcao: 'PROFESSOR' | 'NUTRICIONISTA' | 'FISIOTERAPEUTA'
  ativo: boolean
}

const blank = () => ({ nome: '', email: '', cref: '', funcao: 'PROFESSOR' as const })

export default function Funcionarios() {
  const [items, setItems] = useState<Funcionario[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank())
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Funcionario[]>('/funcionarios')
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function startEdit(f: Funcionario) {
    setEditId(f.id)
    setForm({ nome: f.nome, email: f.email, cref: f.cref, funcao: f.funcao })
    setShowForm(true)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() {
    setShowForm(false); setEditId(null); setForm(blank()); setError('')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      if (editId) {
        const updated = await api.patch<Funcionario>(`/funcionarios/${editId}`, form)
        setItems(prev => prev.map(f => f.id === editId ? updated : f))
      } else {
        const novo = await api.post<Funcionario>('/funcionarios', form)
        setItems(prev => [novo, ...prev])
      }
      cancelForm()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover este funcionário?')) return
    try {
      await api.delete(`/funcionarios/${id}`)
      setItems(prev => prev.filter(f => f.id !== id))
    } catch {
      alert('Erro ao remover.')
    }
  }

  async function toggleAtivo(f: Funcionario) {
    const updated = await api.patch<Funcionario>(`/funcionarios/${f.id}`, { ativo: !f.ativo })
    setItems(prev => prev.map(item => item.id === f.id ? updated : item))
  }

  const FUNCOES = { PROFESSOR: 'Professor', NUTRICIONISTA: 'Nutricionista', FISIOTERAPEUTA: 'Fisioterapeuta' }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Funcionários</h1>
          <p className="text-zinc-400 text-sm mt-1">Professores, nutricionistas e fisioterapeutas</p>
        </div>
        <button onClick={() => { cancelForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-yellow-400 text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 transition-colors">
          <Plus size={16} /> Novo Funcionário
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{editId ? 'Editar' : 'Novo'} Funcionário</h3>
            <button type="button" onClick={cancelForm}><X size={18} className="text-zinc-400 hover:text-white" /></button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              { label: 'Nome completo', key: 'nome', type: 'text', placeholder: 'Nome do funcionário' },
              { label: 'E-mail', key: 'email', type: 'email', placeholder: 'email@exemplo.com' },
              { label: 'CREF / CRN / CREFITO', key: 'cref', type: 'text', placeholder: 'ex: 00000-G/MT' },
            ] as const).map(({ label, key, type, placeholder }) => (
              <div key={key}>
                <label className="block text-xs text-zinc-400 mb-1">{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder} required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
              </div>
            ))}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Função</label>
              <select value={form.funcao} onChange={e => setForm(p => ({ ...p, funcao: e.target.value as typeof form.funcao }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
                {Object.entries(FUNCOES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-yellow-400 text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 disabled:opacity-50">
              <Check size={15} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={cancelForm}
              className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <p>Nenhum funcionário cadastrado.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Nome', 'E-mail', 'CREF/CRN', 'Função', 'Status', ''].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs text-zinc-500 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map(f => (
                <tr key={f.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/50 transition-colors">
                  <td className="py-3 px-4 font-medium">{f.nome}</td>
                  <td className="py-3 px-4 text-zinc-400 text-sm">{f.email}</td>
                  <td className="py-3 px-4 text-sm font-mono text-zinc-300">{f.cref}</td>
                  <td className="py-3 px-4">
                    <span className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-full">{FUNCOES[f.funcao]}</span>
                  </td>
                  <td className="py-3 px-4">
                    <button onClick={() => toggleAtivo(f)}
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-colors ${
                        f.ativo ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                      }`}>
                      {f.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(f)} className="text-zinc-500 hover:text-yellow-400 transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(f.id)} className="text-zinc-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
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
