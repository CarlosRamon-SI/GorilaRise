import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import DietPrescription from '@/components/DietPrescription'
import {
  LayoutDashboard, Users, Dumbbell, CheckCircle, FileText,
  LogOut, ChevronRight, Target, BarChart3, Shield, Plus, Trash2,
  Calendar, Trophy, AlertCircle, Salad, Pencil, Camera, GraduationCap, XCircle, Loader2,
} from 'lucide-react'
import { format } from 'date-fns'

// ── Types ──────────────────────────────────────────────────────────────────
interface Atleta {
  id: number
  nome: string
  email: string
  matriculas?: { status: string }[]
}

interface Treino {
  id: number
  atletaNome: string
  titulo: string
  exercicios?: string
  criadoEm: string
}

interface WOD {
  id: number
  titulo: string
  descricao?: string
  exercicios?: string
  data: string
}


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

interface AnamneseAtleta {
  id: number
  nome: string
  email: string
  nascimento: string | null
  telefone: string
  anamnese: AnamneseData | null
}

interface Recorde {
  id: number
  exercicio: string
  carga: string
  data: string
}

// ── Helpers ────────────────────────────────────────────────────────────────
function iniciais(nome?: string) {
  if (!nome) return '?'
  return nome.trim().split(/\s+/).slice(0, 2).map(n => n[0] ?? '').join('').toUpperCase() || '?'
}

function todayStr() {
  return format(new Date(), 'yyyy-MM-dd')
}

function startOfWeekStr() {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  const mon = new Date(d.setDate(diff))
  return mon.toISOString().slice(0, 10)
}

// ── MENU ────────────────────────────────────────────────────────────────────
const MENU = [
  { id: 'dashboard',  label: 'Dashboard',         short: 'Home',      icon: LayoutDashboard },
  { id: 'atletas',    label: 'Meus Atletas',       short: 'Atletas',   icon: Users },
  { id: 'prescricao', label: 'Prescrever Treino',  short: 'Treinos',   icon: Dumbbell },
  { id: 'checkin',    label: 'Check-in / Turmas',  short: 'Check-in',  icon: CheckCircle },
  { id: 'minhas-turmas', label: 'Minhas Turmas',   short: 'Turmas',    icon: GraduationCap },
  { id: 'anamneses',  label: 'Fichas de Anamnese', short: 'Anamnese',  icon: FileText },
  { id: 'desempenho', label: 'Desempenho',         short: 'Desempen.', icon: BarChart3 },
  { id: 'escalacao',  label: 'Escalação',          short: 'Escalação', icon: Target },
  { id: 'dieta',      label: 'Calculadora de Dieta', short: 'Dieta',   icon: Salad, funcoes: ['PROFESSOR', 'NUTRICIONISTA'] },
]

// ── Tab: Prescrever Treino ─────────────────────────────────────────────────
function TabPrescricao({ atletas }: { atletas: Atleta[] }) {
  const qc = useQueryClient()
  const [sub, setSub] = useState<'fichas' | 'wod'>('fichas')

  // Fichas
  const { data: fichas = [] } = useQuery<Treino[]>({
    queryKey: ['treinos'],
    queryFn: () => api.get('/treinos'),
  })
  const [fichaForm, setFichaForm] = useState({ atletaId: '', titulo: '', exercicios: '' })
  const createFicha = useMutation({
    mutationFn: () => api.post('/treinos', {
      atletaId: Number(fichaForm.atletaId),
      titulo: fichaForm.titulo,
      exercicios: fichaForm.exercicios,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['treinos'] })
      setFichaForm({ atletaId: '', titulo: '', exercicios: '' })
      toast.success('Treino prescrito com sucesso!')
    },
    onError: (e: any) => toast.error(e.message),
  })
  const deleteFicha = useMutation({
    mutationFn: (id: number) => api.delete(`/treinos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['treinos'] }),
    onError: (e: any) => toast.error(e.message),
  })

  const [editingFicha, setEditingFicha] = useState<Treino | null>(null)
  const [editForm, setEditForm] = useState({ titulo: '', exercicios: '' })
  const editFicha = useMutation({
    mutationFn: () => {
      if (!editingFicha) return Promise.reject(new Error('Nenhuma ficha selecionada'))
      return api.patch(`/treinos/${editingFicha.id}`, {
        titulo: editForm.titulo,
        exercicios: editForm.exercicios,
      })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['treinos'] })
      setEditingFicha(null)
      toast.success('Ficha atualizada!')
    },
    onError: (e: any) => toast.error(e.message),
  })

  // WODs
  const { data: wods = [] } = useQuery<WOD[]>({
    queryKey: ['treinos-wod'],
    queryFn: () => api.get('/treinos/wod'),
  })
  const [wodForm, setWodForm] = useState({ titulo: '', descricao: '', exercicios: '', data: todayStr() })
  const createWod = useMutation({
    mutationFn: () => api.post('/treinos/wod', wodForm),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['treinos-wod'] })
      setWodForm({ titulo: '', descricao: '', exercicios: '', data: todayStr() })
      toast.success('WOD criado!')
    },
    onError: (e: any) => toast.error(e.message),
  })
  const deleteWod = useMutation({
    mutationFn: (id: number) => api.delete(`/treinos/wod/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['treinos-wod'] }),
    onError: (e: any) => toast.error(e.message),
  })

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setSub('fichas')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${sub === 'fichas' ? 'bg-gorila-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gorila-primary'}`}>
          Fichas Individuais
        </button>
        <button onClick={() => setSub('wod')}
          className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${sub === 'wod' ? 'bg-gorila-primary text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gorila-primary'}`}>
          WODs
        </button>
      </div>

      {sub === 'fichas' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-gorila-primary flex items-center gap-2 text-sm">
                <Plus size={15} /> Nova Ficha de Treino
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Atleta</label>
                  <select
                    value={fichaForm.atletaId}
                    onChange={e => setFichaForm(f => ({ ...f, atletaId: e.target.value }))}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gorila-primary">
                    <option value="">Selecione o atleta</option>
                    {atletas.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Título do Treino</label>
                  <Input
                    placeholder="Ex: Treino A – Força"
                    value={fichaForm.titulo}
                    onChange={e => setFichaForm(f => ({ ...f, titulo: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Exercícios / Descrição</label>
                <Textarea
                  placeholder="Descreva os exercícios, séries, repetições..."
                  value={fichaForm.exercicios}
                  onChange={e => setFichaForm(f => ({ ...f, exercicios: e.target.value }))}
                  rows={4}
                />
              </div>
              <Button
                onClick={() => createFicha.mutate()}
                disabled={!fichaForm.atletaId || !fichaForm.titulo || createFicha.isPending}
                size="sm"
                className="bg-gorila-primary text-white hover:bg-gorila-primary/90">
                {createFicha.isPending ? 'Salvando...' : 'Prescrever Treino'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-gorila-primary text-sm">Treinos Prescritos ({fichas.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {fichas.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Nenhum treino prescrito ainda.</p>
              ) : (
                <div className="space-y-2">
                  {fichas.map(t => (
                    <div key={t.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-gorila-primary/30">
                      <div className="w-8 h-8 rounded-full bg-gorila-yellow/20 flex items-center justify-center font-bold text-gorila-primary text-xs shrink-0 mt-0.5">
                        {iniciais(t.atletaNome)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gorila-primary">{t.titulo}</p>
                        <p className="text-xs text-gray-400">{t.atletaNome} · {t.criadoEm?.slice(0, 10)}</p>
                        {t.exercicios && (
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{t.exercicios}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 shrink-0 mt-0.5">
                        <button
                          onClick={() => { setEditingFicha(t); setEditForm({ titulo: t.titulo, exercicios: t.exercicios ?? '' }) }}
                          className="text-gray-300 hover:text-gorila-primary transition-colors">
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => { if (window.confirm('Excluir esta ficha de treino?')) deleteFicha.mutate(t.id) }}
                          className="text-gray-300 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={!!editingFicha} onOpenChange={open => !open && setEditingFicha(null)}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-gorila-primary">Editar Ficha — {editingFicha?.atletaNome}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Título do Treino</label>
                  <Input value={editForm.titulo} onChange={e => setEditForm(f => ({ ...f, titulo: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Exercícios / Descrição</label>
                  <Textarea value={editForm.exercicios} onChange={e => setEditForm(f => ({ ...f, exercicios: e.target.value }))} rows={5} />
                </div>
                <Button
                  onClick={() => editFicha.mutate()}
                  disabled={!editForm.titulo || editFicha.isPending}
                  className="w-full bg-gorila-primary text-white hover:bg-gorila-primary/90">
                  {editFicha.isPending ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {sub === 'wod' && (
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-gorila-primary flex items-center gap-2 text-sm">
                <Plus size={15} /> Novo WOD
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Título</label>
                  <Input
                    placeholder="Ex: WOD Terça-feira"
                    value={wodForm.titulo}
                    onChange={e => setWodForm(f => ({ ...f, titulo: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Data</label>
                  <Input
                    type="date"
                    value={wodForm.data}
                    onChange={e => setWodForm(f => ({ ...f, data: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Descrição</label>
                <Input
                  placeholder="Breve descrição do WOD"
                  value={wodForm.descricao}
                  onChange={e => setWodForm(f => ({ ...f, descricao: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Exercícios</label>
                <Textarea
                  placeholder="3x400m corrida&#10;21-15-9 Thruster + Pull-up"
                  value={wodForm.exercicios}
                  onChange={e => setWodForm(f => ({ ...f, exercicios: e.target.value }))}
                  rows={4}
                />
              </div>
              <Button
                onClick={() => createWod.mutate()}
                disabled={!wodForm.titulo || !wodForm.data || createWod.isPending}
                size="sm"
                className="bg-gorila-primary text-white hover:bg-gorila-primary/90">
                {createWod.isPending ? 'Salvando...' : 'Criar WOD'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-gorila-primary text-sm">WODs Cadastrados ({wods.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {wods.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">Nenhum WOD cadastrado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {wods.map(w => (
                    <div key={w.id} className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg hover:border-gorila-primary/30">
                      <div className="w-8 h-8 rounded-md bg-gorila-yellow flex items-center justify-center shrink-0 mt-0.5">
                        <Dumbbell size={14} className="text-gorila-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gorila-primary">{w.titulo}</p>
                        <p className="text-xs text-gray-400">{w.data}</p>
                        {w.descricao && <p className="text-xs text-gray-500 mt-0.5">{w.descricao}</p>}
                        {w.exercicios && (
                          <pre className="text-xs text-gray-600 mt-1 whitespace-pre-wrap font-sans line-clamp-3">{w.exercicios}</pre>
                        )}
                      </div>
                      <button
                        onClick={() => { if (window.confirm('Excluir este WOD?')) deleteWod.mutate(w.id) }}
                        className="text-gray-300 hover:text-red-500 transition-colors shrink-0 mt-0.5">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

// ── Tab: Check-in / Turmas ─────────────────────────────────────────────────
interface CheckinItem { id: number; atletaNome: string; atletaEmail: string }
interface TurmaCheckin {
  id: number
  codigo: string
  horario: string
  descricao: string
  capacidade: number
  checkins: CheckinItem[]
}

// ── Tab: Minhas Turmas (professor) ─────────────────────────────────────────
type StatusTurma = 'PROPOSTA' | 'PENDENTE_APROVACAO' | 'ATIVA' | 'INATIVA'
interface TurmaProfessor {
  id: number
  codigo: string
  horario: string
  dias: string | string[]
  tipo: string
  descricao?: string
  faixaIdade?: string
  capacidade: number
  status: StatusTurma
  ambiente?: { id: number; nome: string } | null
}

const STATUS_LABEL_PROF: Record<StatusTurma, string> = {
  PROPOSTA: 'Proposta pelo admin',
  PENDENTE_APROVACAO: 'Aguardando aprovação',
  ATIVA: 'Ativa',
  INATIVA: 'Inativa',
}
const STATUS_COLOR_PROF: Record<StatusTurma, string> = {
  PROPOSTA: 'bg-zinc-600/30 text-zinc-300 border-zinc-500',
  PENDENTE_APROVACAO: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  ATIVA: 'bg-green-500/20 text-green-400 border-green-500/30',
  INATIVA: 'bg-red-500/10 text-red-400 border-red-500/20',
}
const DIAS_SEMANA_PROF = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab', 'Dom']

function formatDiasTurma(dias: string | string[]): string {
  if (Array.isArray(dias)) return dias.join(', ')
  return dias
}

function TabTurmasProfessor() {
  const [turmas, setTurmas] = useState<TurmaProfessor[]>([])
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ codigo: '', horario: '', dias: [] as string[], tipo: 'regular', descricao: '', faixaIdade: '', capacidade: 6 })
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)

  function fetchTurmas() {
    setLoading(true)
    api.get<TurmaProfessor[]>('/professor/turmas')
      .then(setTurmas)
      .catch((e: any) => toast.error(e.message ?? 'Erro ao carregar turmas.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchTurmas() }, [])

  async function handleAceitar(id: number) {
    setActionId(id)
    try {
      await api.patch(`/professor/turmas/${id}/aceitar`, {})
      fetchTurmas()
      toast.success('Turma aceita!')
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao aceitar.')
    } finally {
      setActionId(null)
    }
  }

  async function handleRejeitar(id: number) {
    setActionId(id)
    try {
      await api.patch(`/professor/turmas/${id}/rejeitar`, {})
      fetchTurmas()
      toast.success('Turma rejeitada.')
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao rejeitar.')
    } finally {
      setActionId(null)
    }
  }

  function toggleDia(dia: string) {
    setForm(f => ({ ...f, dias: f.dias.includes(dia) ? f.dias.filter(d => d !== dia) : [...f.dias, dia] }))
  }

  async function handleNovaTurma(e: React.FormEvent) {
    e.preventDefault()
    if (form.dias.length === 0) return setFormError('Selecione pelo menos um dia.')
    setSaving(true); setFormError('')
    try {
      await api.post('/professor/turmas', { ...form, capacidade: Number(form.capacidade) })
      fetchTurmas()
      setShowForm(false)
      toast.success('Turma criada e enviada para aprovação.')
    } catch (err: any) {
      setFormError(err.message ?? 'Erro ao criar turma.')
    } finally {
      setSaving(false)
    }
  }

  const inp = 'w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gorila-yellow'

  return (
    <div className="space-y-5">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-gorila-yellow text-sm font-semibold flex items-center gap-2">
            <GraduationCap size={16} /> Minhas Turmas
          </CardTitle>
          <button onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-1.5 text-xs bg-gorila-yellow text-gorila-primary font-semibold px-3 py-1.5 rounded-lg hover:bg-yellow-300 transition-colors">
            <Plus size={13} /> Nova Turma
          </button>
        </CardHeader>
        {showForm && (
          <div className="px-6 pb-5">
            <form onSubmit={handleNovaTurma} className="space-y-3 border-t border-zinc-800 pt-4">
              <p className="text-xs text-zinc-400">Nova turma será enviada para aprovação do admin.</p>
              {formError && <p className="text-red-400 text-xs">{formError}</p>}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Código *</label>
                  <input required value={form.codigo} onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))} className={inp} placeholder="Ex: BJJ-T1" />
                </div>
                <div>
                  <label className="text-xs text-zinc-400 mb-1 block">Horário *</label>
                  <input required value={form.horario} onChange={e => setForm(f => ({ ...f, horario: e.target.value }))} className={inp} placeholder="Ex: 07:00–08:00" />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1.5 block">Dias *</label>
                <div className="flex flex-wrap gap-1.5">
                  {DIAS_SEMANA_PROF.map(d => (
                    <button key={d} type="button" onClick={() => toggleDia(d)}
                      className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                        form.dias.includes(d)
                          ? 'bg-gorila-yellow/20 text-gorila-yellow border-gorila-yellow/40'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
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
                  <input type="number" min={1} value={form.capacidade} onChange={e => setForm(f => ({ ...f, capacidade: Number(e.target.value) }))} className={inp} />
                </div>
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Descrição</label>
                <input value={form.descricao} onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} className={inp} placeholder="Opcional" />
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" disabled={saving}
                  className="bg-gorila-yellow text-gorila-primary text-xs font-bold px-4 py-2 rounded-lg hover:bg-yellow-300 disabled:opacity-50">
                  {saving ? 'Enviando...' : 'Enviar para aprovação'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="text-xs text-zinc-400 px-4 py-2 rounded-lg border border-zinc-700 hover:border-zinc-500">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}
      </Card>

      {loading ? (
        <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-16 bg-zinc-900 rounded-lg animate-pulse" />)}</div>
      ) : turmas.length === 0 ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <div className="py-10 text-center text-zinc-500 text-sm">Você não está vinculado a nenhuma turma.</div>
        </Card>
      ) : turmas.map(t => (
        <Card key={t.id} className="bg-zinc-900 border-zinc-800">
          <CardContent className="py-4 px-4 flex items-center justify-between gap-3 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="font-mono text-sm font-bold text-white">{t.codigo}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full border ${STATUS_COLOR_PROF[t.status]}`}>
                  {STATUS_LABEL_PROF[t.status]}
                </span>
              </div>
              <p className="text-xs text-zinc-400">{t.horario} · {formatDiasTurma(t.dias)}</p>
              {t.ambiente && <p className="text-xs text-zinc-500 mt-0.5">{t.ambiente.nome}</p>}
            </div>
            {t.status === 'PROPOSTA' && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAceitar(t.id)}
                  disabled={actionId === t.id}
                  className="flex items-center gap-1 text-xs bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1.5 rounded-lg hover:bg-green-500/30 disabled:opacity-50 transition-colors">
                  <CheckCircle size={12} /> {actionId === t.id ? '...' : 'Aceitar'}
                </button>
                <button
                  onClick={() => handleRejeitar(t.id)}
                  disabled={actionId === t.id}
                  className="flex items-center gap-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1.5 rounded-lg hover:bg-red-500/20 disabled:opacity-50 transition-colors">
                  <XCircle size={12} /> {actionId === t.id ? '...' : 'Rejeitar'}
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function TabCheckin({ atletas }: { atletas: Atleta[] }) {
  const queryClient = useQueryClient()
  const [data, setData] = useState(todayStr())
  const [addingTo, setAddingTo] = useState<number | null>(null)
  const [addAtletaId, setAddAtletaId] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [removingId, setRemovingId] = useState<number | null>(null)

  const { data: turmas = [], isLoading, refetch } = useQuery<TurmaCheckin[]>({
    queryKey: ['checkin-turmas', data],
    queryFn: () => api.get(`/admin/checkin?data=${data}`),
    refetchInterval: 60_000,
  })

  const totalPresentes = turmas.reduce((s, t) => s + t.checkins.length, 0)

  // G-C7: add check-in manually
  async function handleAddCheckin(turmaId: number) {
    if (!addAtletaId) return
    setAddLoading(true)
    try {
      const novo = await api.post<CheckinItem>('/admin/checkin', {
        turmaId,
        atletaId: Number(addAtletaId),
      })
      queryClient.setQueryData<TurmaCheckin[]>(['checkin-turmas', data], prev =>
        prev?.map(t => t.id === turmaId ? { ...t, checkins: [...t.checkins, novo] } : t)
      )
      setAddingTo(null)
      setAddAtletaId('')
      toast.success('Check-in registrado.')
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao registrar check-in.')
    } finally {
      setAddLoading(false)
    }
  }

  // G-C7: remove check-in
  async function handleRemoveCheckin(checkinId: number, turmaId: number) {
    setRemovingId(checkinId)
    try {
      await api.delete(`/admin/checkin/${checkinId}`)
      queryClient.setQueryData<TurmaCheckin[]>(['checkin-turmas', data], prev =>
        prev?.map(t => t.id === turmaId
          ? { ...t, checkins: t.checkins.filter(c => c.id !== checkinId) }
          : t
        )
      )
      toast.success('Check-in removido.')
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao remover check-in.')
    } finally {
      setRemovingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
              <Calendar size={17} /> Presenças por Turma
            </CardTitle>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                value={data}
                onChange={e => setData(e.target.value)}
                className="w-auto text-sm"
              />
              <button
                onClick={() => refetch()}
                className="text-xs text-gorila-primary hover:underline px-2 py-1 rounded border border-gorila-primary/20 hover:bg-gorila-primary/5 transition-colors"
              >
                ↻ Atualizar
              </button>
            </div>
          </div>
          {!isLoading && (
            <p className="text-xs text-gray-400 mt-1">
              {totalPresentes} presença{totalPresentes !== 1 ? 's' : ''} · {turmas.length} turma{turmas.length !== 1 ? 's' : ''} · atualiza a cada 60s
            </p>
          )}
        </CardHeader>
      </Card>

      {/* Cards por turma */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : turmas.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-gray-400 text-sm">
            <CheckCircle size={28} className="mx-auto mb-2 opacity-30" />
            Nenhuma turma sua encontrada para este dia.
          </CardContent>
        </Card>
      ) : (
        turmas.map(t => {
          const n = t.checkins.length
          const vagas = Math.max(0, t.capacidade - n)
          const pct = t.capacidade > 0 ? Math.round((n / t.capacidade) * 100) : 0
          const cheia = vagas === 0
          // atletas que ainda não estão na lista de check-in desta turma
          const atletasDisponiveis = atletas.filter(a =>
            !t.checkins.some(c => c.atletaEmail.toLowerCase() === a.email.toLowerCase())
          )

          return (
            <Card key={t.id} className={cheia ? 'border-orange-200' : ''}>
              <CardContent className="pt-4 pb-4">
                {/* Cabeçalho da turma */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold bg-gorila-primary text-white px-2 py-0.5 rounded">
                        {t.codigo}
                      </span>
                      <p className="text-sm font-semibold text-gorila-primary">{t.descricao}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                      <Trophy size={10} /> {t.horario}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${cheia ? 'text-orange-500' : 'text-gorila-primary'}`}>
                      {n}/{t.capacidade}
                    </p>
                    <p className="text-[10px] text-gray-400">{cheia ? 'turma cheia' : `${vagas} vaga${vagas !== 1 ? 's' : ''}`}</p>
                  </div>
                </div>

                {/* Barra de ocupação */}
                <div className="h-1.5 bg-gray-100 rounded-full mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${cheia ? 'bg-orange-400' : 'bg-gorila-yellow'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Lista de atletas */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {t.checkins.map(c => (
                    <div key={c.id} className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-2.5 py-1.5">
                      <div className="w-6 h-6 rounded-full bg-gorila-yellow/30 flex items-center justify-center text-gorila-primary text-[10px] font-bold shrink-0">
                        {iniciais(c.atletaNome)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gorila-primary truncate">{c.atletaNome}</p>
                        <p className="text-[10px] text-gray-400 truncate">{c.atletaEmail}</p>
                      </div>
                      {/* G-C7: botão remover check-in */}
                      <button
                        disabled={removingId === c.id}
                        onClick={() => handleRemoveCheckin(c.id, t.id)}
                        title="Remover check-in"
                        className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-40 ml-1 shrink-0">
                        {removingId === c.id
                          ? <Loader2 size={11} className="animate-spin" />
                          : <XCircle size={13} />}
                      </button>
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, vagas) }).map((_, i) => (
                    <div key={`vaga-${i}`} className="flex items-center gap-2 border border-dashed border-gray-200 rounded-lg px-2.5 py-1.5">
                      <div className="w-6 h-6 rounded-full bg-gray-100 shrink-0" />
                      <p className="text-[10px] text-gray-400">Aguardando check-in</p>
                    </div>
                  ))}
                </div>

                {/* G-C7: adicionar check-in manual */}
                {addingTo === t.id ? (
                  <div className="mt-3 flex items-center gap-2">
                    <select
                      value={addAtletaId}
                      onChange={e => setAddAtletaId(e.target.value)}
                      className="flex-1 text-xs bg-white border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-gorila-primary"
                    >
                      <option value="">Selecione o atleta…</option>
                      {atletasDisponiveis.map(a => (
                        <option key={a.id} value={a.id}>{a.nome}</option>
                      ))}
                    </select>
                    <button
                      disabled={!addAtletaId || addLoading}
                      onClick={() => handleAddCheckin(t.id)}
                      className="text-xs bg-gorila-primary text-white px-3 py-1.5 rounded hover:bg-gorila-dark transition-colors disabled:opacity-50 flex items-center gap-1">
                      {addLoading ? <Loader2 size={11} className="animate-spin" /> : null}
                      OK
                    </button>
                    <button
                      onClick={() => { setAddingTo(null); setAddAtletaId('') }}
                      className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1.5">
                      Cancelar
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setAddingTo(t.id); setAddAtletaId('') }}
                    className="mt-3 text-[11px] text-gorila-primary hover:underline flex items-center gap-1">
                    <Plus size={12} /> Registrar check-in manual
                  </button>
                )}
              </CardContent>
            </Card>
          )
        })
      )}
    </div>
  )
}

// ── Tab: Fichas de Anamnese ────────────────────────────────────────────────
function TabAnamneses() {
  const { data: atletas = [], isLoading } = useQuery<AnamneseAtleta[]>({
    queryKey: ['professor-anamneses'],
    queryFn: () => api.get('/professor/anamneses'),
  })
  const [selected, setSelected] = useState<AnamneseAtleta | null>(null)

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
            <FileText size={17} /> Fichas de Anamnese
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-gray-400 text-center py-8">Carregando...</p>
          ) : atletas.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Nenhum atleta cadastrado.</p>
          ) : (
            <div className="space-y-2">
              {atletas.map(a => (
                <div
                  key={a.id}
                  onClick={() => a.anamnese && setSelected(a)}
                  className={`flex items-center gap-3 p-3 border rounded-lg transition-colors ${
                    a.anamnese
                      ? 'cursor-pointer hover:border-gorila-primary/40 hover:bg-gorila-primary/5 border-gray-200'
                      : 'border-gray-100 opacity-60'
                  }`}>
                  <div className="w-9 h-9 rounded-full bg-gorila-yellow/20 flex items-center justify-center font-bold text-gorila-primary text-sm shrink-0">
                    {iniciais(a.nome)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{a.nome}</p>
                    <p className="text-xs text-gray-400">{a.email}</p>
                  </div>
                  {a.anamnese ? (
                    <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-100 border-0">
                      Preenchida
                    </Badge>
                  ) : (
                    <Badge className="text-xs bg-gray-100 text-gray-500 hover:bg-gray-100 border-0">
                      Pendente
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={open => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-gorila-primary">
              Ficha de Anamnese — {selected?.nome}
            </DialogTitle>
          </DialogHeader>
          {selected?.anamnese && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                <InfoRow label="Profissão" value={selected.anamnese.profissao} />
                <InfoRow label="Nascimento" value={selected.nascimento ?? '—'} />
                <InfoRow label="Telefone" value={selected.telefone} />
                <InfoRow label="Freq. Semanal" value={selected.anamnese.frequenciaSemanal} />
                <InfoRow label="Qualidade do Sono" value={selected.anamnese.qualidadeSono} />
                <InfoRow label="Consumo de Álcool" value={selected.anamnese.consumoAlcool} />
                <InfoRow label="Histórico Cardíaco" value={selected.anamnese.historicoCardio ? 'Sim' : 'Não'} />
                <InfoRow label="Fumante" value={selected.anamnese.fumante ? 'Sim' : 'Não'} />
                <InfoRow label="Termo assinado" value={selected.anamnese.termoAssinado ? `Sim (${selected.anamnese.criadoEm})` : 'Não'} />
              </div>
              {selected.anamnese.contatoEmergenciaNome && (
                <div className="bg-amber-50 rounded-lg p-3">
                  <p className="text-xs font-semibold text-amber-700 mb-1">Contato de Emergência</p>
                  <p>{selected.anamnese.contatoEmergenciaNome} · {selected.anamnese.contatoEmergenciaTel}</p>
                </div>
              )}
              {(selected.anamnese.objetivos ?? []).length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-1">Objetivos</p>
                  <div className="flex flex-wrap gap-1">
                    {(selected.anamnese.objetivos ?? []).map((o, i) => (
                      <span key={i} className="text-xs bg-gorila-yellow/20 text-gorila-primary px-2 py-0.5 rounded-full font-medium">{o}</span>
                    ))}
                  </div>
                </div>
              )}
              {[
                { label: 'Doenças / Condições', value: selected.anamnese.doencas },
                { label: 'Medicamentos', value: selected.anamnese.medicamentos },
                { label: 'Cirurgias', value: selected.anamnese.cirurgias },
                { label: 'Problemas Articulares', value: selected.anamnese.problemasArticulares },
              ].filter(f => f.value).map(f => (
                <div key={f.label}>
                  <p className="text-xs font-semibold text-gray-500 mb-1">{f.label}</p>
                  <p className="text-gray-700 bg-gray-50 rounded p-2">{f.value}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium text-gray-800">{value || '—'}</p>
    </div>
  )
}

interface FotoProgresso {
  id: number; url: string; tipo: string; criadoEm: string
}

// ── Tab: Desempenho ────────────────────────────────────────────────────────
function TabDesempenho({ atletas }: { atletas: Atleta[] }) {
  const [atletaId, setAtletaId] = useState<number | null>(null)
  const [subTab, setSubTab] = useState<'recordes' | 'fotos'>('recordes')

  const { data: recordes = [], isLoading } = useQuery<Recorde[]>({
    queryKey: ['professor-recordes', atletaId],
    queryFn: () => api.get(`/professor/atletas/${atletaId}/recordes`),
    enabled: !!atletaId && subTab === 'recordes',
  })

  const { data: fotos = [], isLoading: fotosLoading } = useQuery<FotoProgresso[]>({
    queryKey: ['professor-fotos', atletaId],
    queryFn: () => api.get(`/fotos-progresso/${atletaId}`),
    enabled: !!atletaId && subTab === 'fotos',
    retry: false,
  })

  const atletaSelected = atletas.find(a => a.id === atletaId)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
              <BarChart3 size={17} /> Desempenho do Atleta
            </CardTitle>
            <select
              value={atletaId ?? ''}
              onChange={e => setAtletaId(e.target.value ? Number(e.target.value) : null)}
              className="border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gorila-primary">
              <option value="">Selecione o atleta</option>
              {atletas.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
          </div>
          {atletaId && (
            <div className="flex gap-2 mt-3">
              <button onClick={() => setSubTab('recordes')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${subTab === 'recordes' ? 'bg-gorila-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <Trophy size={11} className="inline mr-1" />Records
              </button>
              <button onClick={() => setSubTab('fotos')}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${subTab === 'fotos' ? 'bg-gorila-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                <Camera size={11} className="inline mr-1" />Fotos de Progresso
              </button>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {!atletaId ? (
            <div className="text-center py-10 text-gray-400">
              <BarChart3 size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Selecione um atleta para ver o desempenho.</p>
            </div>
          ) : subTab === 'recordes' ? (
            isLoading ? (
              <p className="text-sm text-gray-400 text-center py-8">Carregando records...</p>
            ) : recordes.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle size={28} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">{atletaSelected?.nome} ainda não tem records registrados.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <p className="text-xs text-gray-500 mb-3">{recordes.length} record{recordes.length !== 1 ? 's' : ''} de <strong>{atletaSelected?.nome}</strong></p>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Exercício</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Carga / Marca</th>
                      <th className="text-left py-2 px-3 text-xs font-semibold text-gray-500">Data</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recordes.map(r => (
                      <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2.5 px-3 font-medium text-gorila-primary">{r.exercicio}</td>
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-gorila-yellow bg-gorila-primary px-2 py-0.5 rounded text-xs">{r.carga}</span>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-gray-500">{r.data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : (
            fotosLoading ? (
              <p className="text-sm text-gray-400 text-center py-8">Carregando fotos...</p>
            ) : fotos.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Camera size={32} className="mx-auto mb-2 opacity-30" />
                <p className="text-sm">{atletaSelected?.nome} ainda não enviou fotos de progresso.</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-gray-500 mb-3">{fotos.length} foto{fotos.length !== 1 ? 's' : ''} de <strong>{atletaSelected?.nome}</strong></p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {fotos.map(f => (
                    <div key={f.id} className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                      <img src={f.url} alt={f.tipo} className="w-full aspect-[3/4] object-cover" />
                      <div className="px-2 py-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${f.tipo === 'INICIAL' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                          {f.tipo === 'INICIAL' ? 'Foto Inicial' : '24 Semanas'}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-0.5">{new Date(f.criadoEm).toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ── TabEscalacao ───────────────────────────────────────────────────────────
interface EscalacaoAtleta { atletaId: number; posicao: string | null; nome: string }
interface Escalacao {
  id: number; titulo: string; descricao?: string | null; data: string
  atletas: EscalacaoAtleta[]
}

function TabEscalacao({ atletas }: { atletas: Atleta[] }) {
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [titulo, setTitulo] = useState('')
  const [data, setData] = useState('')
  const [descricao, setDescricao] = useState('')
  const [selecionados, setSelecionados] = useState<{ atletaId: number; posicao: string }[]>([])
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const { data: escalacoes = [], isLoading } = useQuery<Escalacao[]>({
    queryKey: ['escalacoes'],
    queryFn: () => api.get('/escalacoes'),
  })

  function toggleAtleta(id: number) {
    setSelecionados(prev =>
      prev.some(a => a.atletaId === id)
        ? prev.filter(a => a.atletaId !== id)
        : [...prev, { atletaId: id, posicao: '' }]
    )
  }

  function setPosicao(atletaId: number, posicao: string) {
    setSelecionados(prev => prev.map(a => a.atletaId === atletaId ? { ...a, posicao } : a))
  }

  function resetModal() {
    setTitulo(''); setData(''); setDescricao(''); setSelecionados([])
  }

  async function handleSalvar() {
    if (!titulo.trim() || !data) return toast.error('Título e data são obrigatórios.')
    setSaving(true)
    try {
      await api.post('/escalacoes', {
        titulo: titulo.trim(), data, descricao: descricao.trim() || undefined,
        atletasIds: selecionados,
      })
      queryClient.invalidateQueries({ queryKey: ['escalacoes'] })
      toast.success('Escalação criada!')
      setModalOpen(false)
      resetModal()
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao criar escalação.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeletar(id: number) {
    if (!window.confirm('Excluir esta escalação?')) return
    setDeletingId(id)
    try {
      await api.delete(`/escalacoes/${id}`)
      queryClient.invalidateQueries({ queryKey: ['escalacoes'] })
      toast.success('Escalação removida.')
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao remover.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2"><Target size={18} className="text-gorila-yellow" /> Escalação de Times</h2>
        <Button size="sm" onClick={() => setModalOpen(true)} className="bg-gorila-yellow text-gorila-primary hover:bg-yellow-300 font-bold">
          <Plus size={14} className="mr-1" /> Nova Escalação
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12"><Loader2 size={28} className="animate-spin text-gorila-yellow" /></div>
      )}

      {!isLoading && escalacoes.length === 0 && (
        <Card><CardContent className="py-14 text-center text-zinc-400 text-sm">Nenhuma escalação criada ainda.</CardContent></Card>
      )}

      <div className="space-y-3">
        {escalacoes.map(e => (
          <Card key={e.id} className="border-zinc-800">
            <CardContent className="py-4 px-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{e.titulo}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {new Date(e.data).toLocaleDateString('pt-BR')}
                    {e.descricao && <span className="ml-2 text-zinc-500">— {e.descricao}</span>}
                  </p>
                  {e.atletas.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {e.atletas.map(a => (
                        <span key={a.atletaId} className="text-xs bg-zinc-800 border border-zinc-700 rounded-full px-2 py-0.5 text-zinc-300">
                          {a.nome}{a.posicao ? ` · ${a.posicao}` : ''}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  disabled={deletingId === e.id}
                  onClick={() => handleDeletar(e.id)}
                  className="text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-40 mt-0.5 shrink-0">
                  {deletingId === e.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={modalOpen} onOpenChange={open => { setModalOpen(open); if (!open) resetModal() }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Nova Escalação</DialogTitle></DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Título *</label>
              <Input value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Equipe WOD Sábado" />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Data *</label>
              <Input type="date" value={data} onChange={e => setData(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Descrição (opcional)</label>
              <Textarea value={descricao} onChange={e => setDescricao(e.target.value)} placeholder="Observações…" rows={2} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-2 block">Atletas</label>
              {atletas.length === 0 && <p className="text-xs text-zinc-500">Nenhum atleta vinculado.</p>}
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {atletas.map(a => {
                  const sel = selecionados.find(s => s.atletaId === a.id)
                  return (
                    <div key={a.id} className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleAtleta(a.id)}
                        className={`flex-1 text-left text-sm px-3 py-1.5 rounded-lg border transition-colors ${sel ? 'border-gorila-yellow bg-gorila-yellow/10 text-white' : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'}`}>
                        {a.nome}
                      </button>
                      {sel && (
                        <Input
                          value={sel.posicao}
                          onChange={e => setPosicao(a.id, e.target.value)}
                          placeholder="Posição"
                          className="w-28 text-xs h-8"
                        />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => { setModalOpen(false); resetModal() }}>Cancelar</Button>
              <Button disabled={saving} onClick={handleSalvar} className="flex-1 bg-gorila-yellow text-gorila-primary hover:bg-yellow-300 font-bold">
                {saving ? <Loader2 size={14} className="animate-spin mr-1" /> : <Plus size={14} className="mr-1" />} Salvar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────────────
export default function PainelProfessor() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('dashboard')

  const { data: atletas = [] } = useQuery<Atleta[]>({
    queryKey: ['professor-atletas'],
    queryFn: () => api.get('/professor/atletas'),
    enabled: !!user,
  })

  const { data: fichas = [] } = useQuery<Treino[]>({
    queryKey: ['treinos'],
    queryFn: () => api.get('/treinos'),
    enabled: !!user,
  })

  const hoje = todayStr()
  const { data: checkinHoje = [] } = useQuery<TurmaCheckin[]>({
    queryKey: ['checkin-turmas', hoje],
    queryFn: () => api.get(`/admin/checkin?data=${hoje}`),
    enabled: !!user,
  })
  const totalCheckinHoje = checkinHoje.reduce((s, t) => s + t.checkins.length, 0)

  useEffect(() => {
    if (!user) {
      navigate('/login', { replace: true })
      return
    }
    if (user.role !== 'TREINADOR' && user.role !== 'ADMIN') {
      navigate('/painel', { replace: true })
    }
  }, [user, navigate])

  if (!user) return null

  const visibleMenu = MENU.filter(item =>
    !(item as any).funcoes || (item as any).funcoes.includes(user.funcao ?? '')
  )

  const treinosEstaSemana = fichas.filter(t => {
    const criado = t.criadoEm?.slice(0, 10)
    return criado && criado >= startOfWeekStr()
  }).length

  return (
    <div className="min-h-screen bg-[#f4f4f4]">
      <header className="bg-gorila-primary text-white shadow-xl border-b border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-4">
              <Link to="/" className="shrink-0">
                <div className="w-8 h-8 rounded-md overflow-hidden opacity-90 hover:opacity-100 transition-opacity" style={{ backgroundColor: '#1a1718' }}>
                  <img src="/lovable-uploads/b1d0c406-fb12-494e-ad8c-a0ad4760dda0.png" alt="Gorila Rise" className="w-full h-full object-contain" />
                </div>
              </Link>
              <div className="w-px h-6 bg-white/15" />
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gorila-yellow flex items-center justify-center font-black text-gorila-primary text-xs shrink-0 shadow-sm">
                  {iniciais(user.nome)}
                </div>
                <div className="hidden sm:block">
                  <p className="text-[13px] font-bold leading-tight">{user.nome}</p>
                  <p className="text-gorila-yellow text-[10px] font-semibold tracking-wide">Professor / Treinador</p>
                </div>
              </div>
            </div>
            <Button onClick={() => { logout(); navigate('/') }} variant="ghost" size="sm" className="text-white/60 hover:text-white hover:bg-white/5 gap-1.5 text-[12px] transition-all">
              <LogOut size={14} /><span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Mobile tab bar ─────────────────────────────────────────────── */}
      <div className="lg:hidden sticky top-0 z-20 bg-gorila-primary border-b border-white/10 shadow-md">
        <div className="overflow-x-auto scrollbar-none">
          <div className="flex min-w-max px-2 py-1.5 gap-0.5">
            {visibleMenu.map(item => (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-150 min-w-[60px] ${
                  tab === item.id
                    ? 'bg-gorila-yellow text-gorila-primary'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={15} className="shrink-0" />
                <span className="text-[9px] font-bold whitespace-nowrap leading-tight">{item.short}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar — desktop only */}
          <div className="hidden lg:block lg:col-span-1 space-y-4">
            <div className="bg-gorila-primary rounded-xl overflow-hidden shadow-lg">
              <div className="px-4 py-3 border-b border-white/8">
                <p className="text-[10px] font-bold tracking-[0.18em] uppercase text-gorila-yellow/70">Menu do Professor</p>
              </div>
              <nav className="flex flex-col py-1">
                {visibleMenu.map(item => (
                  <button key={item.id} onClick={() => setTab(item.id)}
                    className={`flex items-center gap-3 px-4 py-2.5 text-[13px] transition-all duration-150 ${
                      tab === item.id ? 'bg-gorila-yellow text-gorila-primary font-bold' : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}>
                    <item.icon size={14} className="shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {tab === item.id && <ChevronRight size={12} className="opacity-60 shrink-0" />}
                  </button>
                ))}
              </nav>
            </div>
            {user.role === 'ADMIN' && (
              <Link to="/admin">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gorila-yellow/40 text-gorila-primary bg-gorila-yellow/90 hover:bg-gorila-yellow font-bold text-[12px] tracking-wide transition-colors duration-150">
                  <LayoutDashboard size={13} />
                  Ir para o Admin
                </button>
              </Link>
            )}
          </div>

          {/* Content */}
          <div className="lg:col-span-3">

            {tab === 'dashboard' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Users size={16} className="text-gorila-yellow" /> Atletas Vinculados
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-gorila-primary">{atletas.length || '—'}</p>
                      <p className="text-xs text-gray-500 mt-1">atletas sob sua supervisão</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Dumbbell size={16} className="text-gorila-yellow" /> Treinos Prescritos
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-gorila-primary">{treinosEstaSemana}</p>
                      <p className="text-xs text-gray-500 mt-1">esta semana</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                        <Shield size={16} className="text-gorila-yellow" /> Check-ins Hoje
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-gorila-primary">{totalCheckinHoje}</p>
                      <p className="text-xs text-gray-500 mt-1">presença confirmada</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick list of atletas */}
                {atletas.length > 0 && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-gorila-primary text-sm flex items-center justify-between">
                        <span>Atletas Recentes</span>
                        <button onClick={() => setTab('atletas')} className="text-xs text-gorila-yellow hover:underline">ver todos</button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1.5">
                        {atletas.slice(0, 5).map(a => (
                          <div key={a.id} className="flex items-center gap-2 py-1">
                            <div className="w-7 h-7 rounded-full bg-gorila-yellow/20 flex items-center justify-center font-bold text-gorila-primary text-xs shrink-0">
                              {iniciais(a.nome)}
                            </div>
                            <span className="text-sm text-gray-700 flex-1">{a.nome}</span>
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                              a.matriculas?.some(m => m.status === 'ATIVA') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {a.matriculas?.some(m => m.status === 'ATIVA') ? 'Matriculado' : 'Pendente'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {tab === 'atletas' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
                    <Users size={17} /> Meus Atletas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {atletas.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Users size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Nenhum atleta vinculado.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {atletas.map(a => (
                        <div key={a.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gorila-primary/30 transition-colors">
                          <div className="w-9 h-9 rounded-full bg-gorila-yellow/20 flex items-center justify-center font-bold text-gorila-primary text-sm shrink-0">
                            {iniciais(a.nome)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{a.nome}</p>
                            <p className="text-xs text-gray-400 truncate">{a.email}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            a.matriculas?.some(m => m.status === 'ATIVA') ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {a.matriculas?.some(m => m.status === 'ATIVA') ? 'Matriculado' : 'Pendente'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {tab === 'prescricao'    && <TabPrescricao atletas={atletas} />}
            {tab === 'checkin'       && <TabCheckin atletas={atletas} />}
            {tab === 'minhas-turmas' && <TabTurmasProfessor />}
            {tab === 'anamneses'  && <TabAnamneses />}
            {tab === 'desempenho' && <TabDesempenho atletas={atletas} />}
            {tab === 'dieta'      && <DietPrescription userName={user.nome} />}

            {tab === 'escalacao' && <TabEscalacao atletas={atletas} />}
          </div>
        </div>
      </div>
    </div>
  )
}
