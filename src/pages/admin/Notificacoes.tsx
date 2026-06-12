import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Bell, Send, X } from 'lucide-react'

interface Notificacao {
  id: number
  titulo: string
  corpo: string
  tipo: 'AVISO' | 'EVENTO' | 'COMUNICADO'
  criadoEm: string
}

const TIPOS = { AVISO: 'Aviso', EVENTO: 'Evento', COMUNICADO: 'Comunicado' }
const TIPO_COLORS: Record<string, string> = {
  AVISO: 'bg-yellow-500/20 text-yellow-400',
  EVENTO: 'bg-blue-500/20 text-blue-400',
  COMUNICADO: 'bg-purple-500/20 text-purple-400',
}

export default function Notificacoes() {
  const [items, setItems] = useState<Notificacao[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ titulo: '', corpo: '', tipo: 'AVISO' as const })
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<Notificacao[]>('/notificacoes')
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true); setError('')
    try {
      const novo = await api.post<Notificacao>('/notificacoes', form)
      setItems(prev => [novo, ...prev])
      setForm({ titulo: '', corpo: '', tipo: 'AVISO' })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar')
    } finally {
      setSending(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Remover esta notificação?')) return
    try {
      await api.delete(`/notificacoes/${id}`)
      setItems(prev => prev.filter(n => n.id !== id))
    } catch { alert('Erro ao remover.') }
  }

  return (
    <div className="px-4 py-5 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Notificações / Comunicados</h1>
        <p className="text-zinc-400 text-sm mt-1">Envie avisos e eventos para todos os associados</p>
      </div>

      <form onSubmit={handleSend} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-8 space-y-4">
        <h3 className="font-semibold flex items-center gap-2"><Bell size={16} className="text-yellow-400" /> Nova Mensagem</h3>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs text-zinc-400 mb-1">Título <span className="text-red-400">*</span></label>
            <input required value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
              placeholder="ex: Aviso de feriado"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Tipo</label>
            <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value as typeof form.tipo }))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
              {Object.entries(TIPOS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1">Mensagem <span className="text-red-400">*</span></label>
          <textarea required value={form.corpo} onChange={e => setForm(p => ({ ...p, corpo: e.target.value }))}
            rows={4} placeholder="Escreva o conteúdo do comunicado..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none" />
        </div>
        <button type="submit" disabled={sending}
          className="flex items-center gap-2 bg-yellow-400 text-zinc-900 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yellow-300 disabled:opacity-50">
          <Send size={15} /> {sending ? 'Enviando...' : 'Enviar para todos'}
        </button>
      </form>

      <h2 className="text-lg font-semibold mb-4">Histórico</h2>
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-20 bg-zinc-900 rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-zinc-500"><p>Nenhuma notificação enviada.</p></div>
      ) : (
        <div className="space-y-3">
          {items.map(n => (
            <div key={n.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIPO_COLORS[n.tipo]}`}>{TIPOS[n.tipo]}</span>
                    <p className="font-semibold text-sm">{n.titulo}</p>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{n.corpo}</p>
                  <p className="text-xs text-zinc-600 mt-2">{new Date(n.criadoEm).toLocaleString('pt-BR')}</p>
                </div>
                <button onClick={() => handleDelete(n.id)} className="text-zinc-600 hover:text-red-400 transition-colors shrink-0">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
