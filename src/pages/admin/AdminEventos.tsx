import { useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Trash2, X, Check, Upload, CalendarDays } from 'lucide-react'

interface Evento {
  id: number
  titulo: string
  descricao: string
  data: string
  local: string
  imagemUrl: string | null
  ativo: boolean
  totalIngressos: number
}

const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://pressticket.adtecnologia.com.br'
const blank = () => ({ titulo: '', descricao: '', data: '', local: '', imagemUrl: '' })

export default function AdminEventos() {
  const [items, setItems] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank())
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    api.get<Evento[]>('/eventos')
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  function startEdit(e: Evento) {
    setEditId(e.id)
    setForm({ titulo: e.titulo, descricao: e.descricao, data: e.data.slice(0, 16), local: e.local, imagemUrl: e.imagemUrl ?? '' })
    setShowForm(true); setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() { setShowForm(false); setEditId(null); setForm(blank()); setError('') }

  async function uploadImagem(file: File) {
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('file', file)
      const res = await api.upload<{ url: string }>('/upload', fd)
      setForm(p => ({ ...p, imagemUrl: res.url }))
    } finally { setUploading(false) }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setError('')
    try {
      if (editId) {
        const updated = await api.patch<Evento>(`/eventos/${editId}`, form)
        setItems(prev => prev.map(ev => ev.id === editId ? { ...updated, totalIngressos: ev.totalIngressos } : ev))
      } else {
        const novo = await api.post<Evento>('/eventos', form)
        setItems(prev => [{ ...novo, totalIngressos: 0 }, ...prev])
      }
      cancelForm()
    } catch (err: any) {
      setError(err.message ?? 'Erro ao salvar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover este evento e todos os ingressos?')) return
    try {
      await api.delete(`/eventos/${id}`)
      setItems(prev => prev.filter(e => e.id !== id))
    } catch { alert('Erro ao remover.') }
  }

  async function toggleAtivo(ev: Evento) {
    const updated = await api.patch<Evento>(`/eventos/${ev.id}`, { ativo: !ev.ativo })
    setItems(prev => prev.map(e => e.id === ev.id ? { ...updated, totalIngressos: ev.totalIngressos } : e))
  }

  const inp = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400'

  return (
    <div className="px-4 py-5 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Eventos / Jogos</h1>
          <p className="text-zinc-400 text-sm mt-1">Gerencie os eventos disponíveis para sócios torcedores</p>
        </div>
        <button onClick={() => { cancelForm(); setShowForm(true) }}
          className="flex items-center gap-2 bg-yellow-400 text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300">
          <Plus size={16} /> Novo Evento
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-6 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold">{editId ? 'Editar' : 'Novo'} Evento</h3>
            <button type="button" onClick={cancelForm}><X size={18} className="text-zinc-400 hover:text-white" /></button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Título <span className="text-red-400">*</span></label>
              <input required value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
                placeholder="ex: Final do Campeonato Estadual"
                className={inp} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Data e Hora <span className="text-red-400">*</span></label>
              <input required type="datetime-local" value={form.data}
                onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                className={inp} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Local</label>
              <input value={form.local} onChange={e => setForm(p => ({ ...p, local: e.target.value }))}
                placeholder="ex: Arena Gorila Rise"
                className={inp} />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Imagem</label>
              <div className="flex gap-2">
                <input value={form.imagemUrl} onChange={e => setForm(p => ({ ...p, imagemUrl: e.target.value }))}
                  placeholder="URL ou upload"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none" />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="bg-zinc-700 hover:bg-zinc-600 px-3 py-2 rounded-lg text-zinc-300">
                  <Upload size={15} />
                </button>
                <input ref={fileRef} type="file" className="hidden" accept="image/*"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadImagem(f) }} />
              </div>
              {form.imagemUrl && (
                <img src={`${BASE_URL}${form.imagemUrl}`} alt="" className="mt-2 h-20 rounded-lg object-cover"
                  onError={e => (e.currentTarget.style.display = 'none')} />
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Descrição</label>
            <textarea value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))}
              rows={3} placeholder="Detalhes do evento..."
              className={`${inp} resize-none`} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 bg-yellow-400 text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 disabled:opacity-50">
              <Check size={15} /> {saving ? 'Salvando...' : 'Salvar'}
            </button>
            <button type="button" onClick={cancelForm} className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800">Cancelar</button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-zinc-500">
          <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nenhum evento cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(ev => {
            const dataEvento = new Date(ev.data)
            const passou = dataEvento < new Date()
            return (
              <div key={ev.id} className={`bg-zinc-900 border rounded-xl overflow-hidden flex ${ev.ativo ? 'border-zinc-800' : 'border-zinc-800/40 opacity-60'}`}>
                {ev.imagemUrl && (
                  <img src={`${BASE_URL}${ev.imagemUrl}`} alt={ev.titulo}
                    className="w-24 h-24 object-cover shrink-0"
                    onError={e => (e.currentTarget.style.display = 'none')} />
                )}
                <div className="flex-1 p-4 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{ev.titulo}</p>
                      <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
                        <CalendarDays size={11} />
                        {dataEvento.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        {ev.local && <> · {ev.local}</>}
                        {passou && <span className="text-orange-400 font-medium">· encerrado</span>}
                      </p>
                      {ev.descricao && <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{ev.descricao}</p>}
                      <p className="text-xs text-gorila-yellow mt-1">{ev.totalIngressos} ingresso{ev.totalIngressos !== 1 ? 's' : ''} reservado{ev.totalIngressos !== 1 ? 's' : ''}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => toggleAtivo(ev)}
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors ${
                          ev.ativo ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                                   : 'bg-zinc-700 text-zinc-400 border-zinc-600 hover:bg-zinc-600'}`}>
                        {ev.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                      <button onClick={() => startEdit(ev)} className="text-zinc-500 hover:text-yellow-400 transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(ev.id)} className="text-zinc-500 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
