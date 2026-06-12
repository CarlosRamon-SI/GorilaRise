import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { MessageCircle, UserPlus, Loader2, X } from 'lucide-react'
import { calcForca, validarCPF } from '@/lib/validators'
import { fmt } from '@/lib/masks'

interface Lead {
  id: number
  nome: string
  email: string
  whatsapp?: string
  origem: string
  criadoEm: string
}

interface Usuario {
  id: number; nome: string; email: string; cpf: string;
  telefone: string; cidade: string; role: string; ativo: boolean; criadoEm: string;
}

const BLANK = { nome: '', email: '', cpf: '', telefone: '', cidade: '', role: 'ATLETA', senha: '', confirmarSenha: '' }

function ModalConverterLead({
  lead, onClose, onCriado,
}: { lead: Lead; onClose: () => void; onCriado: (u: Usuario) => void }) {
  const [form, setForm] = useState({ ...BLANK, nome: lead.nome, email: lead.email, telefone: lead.whatsapp ?? '' })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])

  useEffect(() => {
    if (!ok) return
    const t = setTimeout(onClose, 1200)
    return () => clearTimeout(t)
  }, [ok, onClose])

  const setField = (field: keyof typeof BLANK, value: string) => {
    const formatted = field === 'cpf' ? fmt.cpf(value)
      : field === 'telefone' ? fmt.telefone(value)
      : value
    setForm(prev => ({ ...prev, [field]: formatted }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!validarCPF(form.cpf))              return setErro('CPF inválido.')
    if (form.senha.length < 8)              return setErro('Senha deve ter mínimo 8 caracteres.')
    if (form.senha !== form.confirmarSenha) return setErro('As senhas não coincidem.')
    setSaving(true)
    try {
      const novo = await api.post<Usuario>('/admin/usuarios', {
        nome: form.nome, email: form.email, cpf: form.cpf,
        telefone: form.telefone, cidade: form.cidade, role: form.role, senha: form.senha,
      })
      onCriado(novo)
      setOk(true)
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao criar usuário.')
    } finally {
      setSaving(false)
    }
  }

  const forca = calcForca(form.senha)
  const inp = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gorila-yellow'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true"
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <UserPlus size={18} className="text-gorila-yellow" /> Converter Lead em Usuário
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={18} /></button>
        </div>

        {ok ? (
          <p className="text-green-400 text-sm font-medium text-center py-6">Usuário criado com sucesso!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Nome</label>
                <input type="text" value={form.nome} onChange={e => setField('nome', e.target.value)} className={inp} required autoFocus />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">E-mail</label>
                <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} className={inp} required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">CPF</label>
                <input type="text" value={form.cpf} onChange={e => setField('cpf', e.target.value)} className={inp} maxLength={14} required />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Telefone</label>
                <input type="text" value={form.telefone} onChange={e => setField('telefone', e.target.value)} className={inp} maxLength={15} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Cidade</label>
                <input type="text" value={form.cidade} onChange={e => setField('cidade', e.target.value)} className={inp} />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Perfil</label>
                <select value={form.role} onChange={e => setField('role', e.target.value)} className={inp}>
                  <option value="ATLETA">Atleta</option>
                  <option value="TREINADOR">Treinador / Staff</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Senha</label>
                <input type="password" value={form.senha} onChange={e => setField('senha', e.target.value)} className={inp} required />
                {form.senha && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map(i => <div key={i} className={`h-1 flex-1 rounded-full ${i <= forca.nivel ? forca.cor : 'bg-zinc-700'}`} />)}
                    </div>
                    <p className={`text-xs ${forca.nivel <= 2 ? 'text-red-400' : forca.nivel <= 3 ? 'text-yellow-500' : 'text-green-400'}`}>{forca.label}</p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block">Confirmar Senha</label>
                <input type="password" value={form.confirmarSenha} onChange={e => setField('confirmarSenha', e.target.value)} className={inp} required />
                {form.confirmarSenha && form.senha !== form.confirmarSenha && (
                  <p className="text-red-400 text-xs mt-1">Senhas não coincidem.</p>
                )}
              </div>
            </div>
            {erro && <p className="text-red-400 text-xs">{erro}</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2 rounded-lg bg-gorila-yellow text-gorila-primary font-bold text-sm hover:bg-yellow-300 transition-colors flex items-center justify-center gap-1 disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <UserPlus size={14} />}
                Criar Usuário
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [convertendo, setConvertendo] = useState<Lead | null>(null)

  useEffect(() => {
    api.get<Lead[]>('/admin/leads')
      .then(setLeads)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="px-4 py-5 md:p-8">
      {convertendo && (
        <ModalConverterLead
          lead={convertendo}
          onClose={() => setConvertendo(null)}
          onCriado={() => setConvertendo(null)}
        />
      )}

      <h1 className="text-2xl font-bold mb-1">Leads</h1>
      <p className="text-zinc-400 text-sm mb-8">{leads.length} lead(s) capturado(s)</p>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-zinc-900 rounded-lg h-14 animate-pulse" />)}
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <p className="text-zinc-400">Nenhum lead ainda.</p>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 text-left">
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">WhatsApp</th>
                <th className="px-4 py-3 font-medium">Origem</th>
                <th className="px-4 py-3 font-medium">Data</th>
                <th className="px-4 py-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{l.nome}</td>
                  <td className="px-4 py-3 text-zinc-400">{l.email}</td>
                  <td className="px-4 py-3">
                    {l.whatsapp ? (
                      <a
                        href={`https://wa.me/55${l.whatsapp.replace(/\D/g, '')}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors">
                        <MessageCircle size={13} />
                        {l.whatsapp}
                      </a>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-zinc-800 text-zinc-300 border border-zinc-700 px-2 py-0.5 rounded-full">
                      {l.origem}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {new Date(l.criadoEm).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setConvertendo(l)}
                      className="flex items-center gap-1 text-xs text-gorila-yellow hover:text-yellow-300 transition-colors px-2 py-1 rounded hover:bg-gorila-yellow/10">
                      <UserPlus size={12} />
                      Converter
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
