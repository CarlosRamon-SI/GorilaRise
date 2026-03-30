import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Plus, Pencil, Check, X, Upload, Trash2, FileText, ExternalLink } from 'lucide-react'

interface Documento {
  id: number
  titulo: string
  descricao?: string
  fileUrl: string
  ativo: boolean
  criadoEm: string
}

const blank = () => ({ titulo: '', descricao: '', fileUrl: '' })

const BASE_API = import.meta.env.VITE_API_URL ?? 'https://pressticket.adtecnologia.com.br'

export default function AdminDocumentos() {
  const [items, setItems] = useState<Documento[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank())
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Documento[]>('/documentos')
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  async function uploadArquivo(file: File) {
    setUploading(true)
    setError('')
    const formData = new FormData()
    formData.append('file', file)
    try {
      const token = localStorage.getItem('gorila_token')
      const res = await fetch(`${BASE_API}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error ?? 'Erro no upload')
      setForm(f => ({ ...f, fileUrl: `${BASE_API}${data.url}` }))
      // Auto-preenche título se ainda estiver vazio
      if (!form.titulo) {
        const nome = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
        setForm(f => ({ ...f, fileUrl: `${BASE_API}${data.url}`, titulo: nome }))
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setUploading(false)
    }
  }

  function startEdit(d: Documento) {
    setEditId(d.id)
    setForm({ titulo: d.titulo, descricao: d.descricao ?? '', fileUrl: d.fileUrl })
    setShowForm(true)
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function cancelForm() {
    setShowForm(false)
    setEditId(null)
    setForm(blank())
    setError('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.fileUrl) { setError('Faça o upload do arquivo primeiro.'); return }
    setSaving(true)
    setError('')
    const payload = { ...form, descricao: form.descricao || undefined }
    try {
      if (editId) {
        const updated = await api.patch<Documento>(`/documentos/${editId}`, payload)
        setItems(prev => prev.map(x => x.id === editId ? updated : x))
      } else {
        const created = await api.post<Documento>('/documentos', payload)
        setItems(prev => [...prev, created])
      }
      cancelForm()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleAtivo(d: Documento) {
    try {
      const updated = await api.patch<Documento>(`/documentos/${d.id}`, { ativo: !d.ativo })
      setItems(prev => prev.map(x => x.id === d.id ? updated : x))
    } catch (e: any) {
      alert(e.message)
    }
  }

  const isPdf = (url: string) => url.toLowerCase().includes('.pdf') || url.includes('application/pdf')

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Documentos Oficiais</h1>
          <p className="text-zinc-400 text-sm">{items.length} documento(s)</p>
        </div>
        {!showForm && (
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors">
            <Plus size={16} /> Novo documento
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submit} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-8 space-y-4">
          <h2 className="font-semibold text-sm text-zinc-300 uppercase tracking-wider">
            {editId ? 'Editar documento' : 'Novo documento'}
          </h2>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Upload de arquivo */}
          <div>
            <label className="text-xs text-zinc-400 block mb-1">
              Arquivo <span className="text-zinc-600">(PDF, máx 5MB)</span>
            </label>
            {form.fileUrl ? (
              <div className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3">
                <FileText size={20} className="text-yellow-400 shrink-0" />
                <span className="text-sm text-white truncate flex-1">
                  {form.fileUrl.split('/').pop()}
                </span>
                <a href={form.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-white transition-colors">
                  <ExternalLink size={15} />
                </a>
                <button type="button" onClick={() => setForm(f => ({ ...f, fileUrl: '' }))}
                  className="text-zinc-400 hover:text-red-400 transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            ) : (
              <label className={`flex items-center gap-3 w-full border-2 border-dashed rounded-lg px-4 py-5 cursor-pointer transition-colors ${uploading ? 'border-yellow-400/50 bg-yellow-400/5' : 'border-zinc-700 hover:border-zinc-500'}`}>
                <Upload size={18} className={uploading ? 'text-yellow-400 animate-bounce' : 'text-zinc-500'} />
                <span className="text-sm text-zinc-400">
                  {uploading ? 'Enviando...' : 'Clique para selecionar o arquivo'}
                </span>
                <input type="file" accept=".pdf,application/pdf" className="hidden"
                  disabled={uploading}
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadArquivo(f) }} />
              </label>
            )}
          </div>

          {/* Título */}
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Título</label>
            <input required value={form.titulo}
              onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
              placeholder="Ex: Estatuto Social" />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-xs text-zinc-400 block mb-1">Descrição <span className="text-zinc-600">(opcional)</span></label>
            <input value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
              placeholder="Ex: Documento fundador da associação." />
          </div>

          <div className="flex gap-3 justify-end pt-1">
            <button type="button" onClick={cancelForm}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">
              <X size={15} /> Cancelar
            </button>
            <button type="submit" disabled={saving || uploading}
              className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-zinc-900 font-semibold text-sm px-5 py-2 rounded-lg transition-colors">
              <Check size={15} />
              {saving ? 'Salvando...' : editId ? 'Salvar alterações' : 'Publicar documento'}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <p className="text-zinc-400">Nenhum documento publicado ainda.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(d => (
            <div key={d.id}
              className={`bg-zinc-900 rounded-xl border p-5 flex items-center gap-4 ${d.ativo ? 'border-zinc-800' : 'border-zinc-800/40 opacity-60'}`}>
              <div className="w-10 h-10 rounded-lg bg-yellow-400/10 flex items-center justify-center shrink-0">
                <FileText size={18} className="text-yellow-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{d.titulo}</p>
                {d.descricao && <p className="text-zinc-400 text-xs mt-0.5">{d.descricao}</p>}
                <p className="text-zinc-600 text-xs mt-0.5">
                  {new Date(d.criadoEm).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={d.fileUrl} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 text-zinc-400 hover:text-yellow-400 hover:bg-zinc-800 rounded-lg transition-colors" title="Abrir arquivo">
                  <ExternalLink size={15} />
                </a>
                <button onClick={() => toggleAtivo(d)}
                  className={`text-xs px-2 py-0.5 rounded-full border transition-colors cursor-pointer ${
                    d.ativo
                      ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                      : 'bg-zinc-700 text-zinc-400 border-zinc-600 hover:bg-zinc-600'
                  }`}>
                  {d.ativo ? 'Público' : 'Oculto'}
                </button>
                <button onClick={() => startEdit(d)}
                  className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors">
                  <Pencil size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
