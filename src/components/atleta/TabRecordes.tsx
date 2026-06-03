import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trophy, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface Recorde {
  id: number
  exercicio: string
  carga: string
  data: string
}

export default function TabRecordes() {
  const [items, setItems] = useState<Recorde[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ exercicio: '', carga: '', data: new Date().toISOString().slice(0, 10) })
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    api.get<Recorde[]>('/recordes')
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const novo = await api.post<Recorde>('/recordes', form)
      setItems(prev => [novo, ...prev])
      setShowForm(false)
      setForm({ exercicio: '', carga: '', data: new Date().toISOString().slice(0, 10) })
      toast.success('Recorde registrado!')
    } catch {
      toast.error('Erro ao salvar recorde.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      await api.delete(`/recordes/${id}`)
      setItems(prev => prev.filter(r => r.id !== id))
      toast.success('Recorde removido.')
    } catch {
      toast.error('Erro ao remover.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
              <Trophy size={17} /> Recordes Pessoais (PRs)
            </CardTitle>
            <Button size="sm" onClick={() => setShowForm(v => !v)}
              className="bg-gorila-primary hover:bg-gorila-dark text-white text-xs gap-1.5">
              <Plus size={14} /> Novo PR
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <form onSubmit={handleSave} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3 border border-gray-200">
              <h4 className="text-sm font-semibold text-gorila-primary">Registrar PR</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Exercício <span className="text-red-500">*</span></label>
                  <input required value={form.exercicio} onChange={e => setForm(p => ({ ...p, exercicio: e.target.value }))}
                    placeholder="ex: Supino reto"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gorila-primary" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Carga / Tempo <span className="text-red-500">*</span></label>
                  <input required value={form.carga} onChange={e => setForm(p => ({ ...p, carga: e.target.value }))}
                    placeholder="ex: 80kg ou 3:45"
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gorila-primary" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Data</label>
                  <input type="date" value={form.data} onChange={e => setForm(p => ({ ...p, data: e.target.value }))}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gorila-primary" />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
                <Button type="submit" size="sm" disabled={saving} className="bg-gorila-primary hover:bg-gorila-dark text-white">
                  {saving ? 'Salvando...' : 'Salvar PR'}
                </Button>
              </div>
            </form>
          )}

          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <Trophy size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhum recorde registrado ainda.</p>
              <button onClick={() => setShowForm(true)} className="mt-2 text-gorila-primary text-sm font-semibold hover:underline">
                Registrar meu primeiro PR →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 px-2 text-xs text-gray-400 font-medium">Exercício</th>
                    <th className="text-left py-2 px-2 text-xs text-gray-400 font-medium">Carga / Tempo</th>
                    <th className="text-left py-2 px-2 text-xs text-gray-400 font-medium">Data</th>
                    <th className="py-2 px-2" />
                  </tr>
                </thead>
                <tbody>
                  {items.map(r => (
                    <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-2.5 px-2 font-medium">{r.exercicio}</td>
                      <td className="py-2.5 px-2">
                        <span className="bg-gorila-yellow/20 text-gorila-primary font-bold text-xs px-2 py-0.5 rounded-full">{r.carga}</span>
                      </td>
                      <td className="py-2.5 px-2 text-gray-500 text-xs">
                        {new Date(r.data).toLocaleDateString('pt-BR')}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <button onClick={() => handleDelete(r.id)} disabled={deletingId === r.id}
                          className="text-gray-300 hover:text-red-400 transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
