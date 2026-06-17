import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { calcForca, validarCPF } from '@/lib/validators'
import { fmt } from '@/lib/masks'
import { KeyRound, Loader2, UserPlus, Pencil, X } from 'lucide-react'

interface Usuario {
  id: number
  nome: string
  email: string
  cpf: string
  telefone: string
  cidade: string
  role: 'ATLETA' | 'TREINADOR' | 'ADMIN'
  funcao?: 'PROFESSOR' | 'NUTRICIONISTA' | 'FISIOTERAPEUTA' | null
  ativo: boolean
  criadoEm: string
}

// ── Modal: Alterar Senha ───────────────────────────────────────────────────────

function ModalSenha({ usuario, onClose }: { usuario: Pick<Usuario, 'id' | 'nome'>; onClose: () => void }) {
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    if (!ok) return
    const id = setTimeout(onClose, 1200)
    return () => clearTimeout(id)
  }, [ok, onClose])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (senha.length < 8) return setErro('Mínimo 8 caracteres.')
    if (senha !== confirmar) return setErro('As senhas não coincidem.')
    setSaving(true)
    try {
      await api.patch(`/admin/usuarios/${usuario.id}/senha`, { senha })
      setOk(true)
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao alterar senha.')
    } finally {
      setSaving(false)
    }
  }

  const forca = calcForca(senha)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-labelledby="modal-senha-title"
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-sm shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="modal-senha-title" className="text-lg font-bold mb-1">Alterar Senha</h2>
        <p className="text-zinc-400 text-sm mb-5">{usuario.nome}</p>
        {ok ? (
          <p className="text-green-400 text-sm font-medium text-center py-4">Senha alterada com sucesso!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block" htmlFor="modal-nova-senha">Nova senha</label>
              <input
                id="modal-nova-senha" type="password" value={senha}
                onChange={e => setSenha(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gorila-yellow"
                placeholder="Mínimo 8 caracteres" autoFocus
              />
              {senha && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= forca.nivel ? forca.cor : 'bg-zinc-700'}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${forca.nivel <= 2 ? 'text-red-400' : forca.nivel <= 3 ? 'text-yellow-500' : 'text-green-400'}`}>
                    Senha {forca.label}
                  </p>
                </div>
              )}
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block" htmlFor="modal-confirmar-senha">Confirmar senha</label>
              <input
                id="modal-confirmar-senha" type="password" value={confirmar}
                onChange={e => setConfirmar(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gorila-yellow"
                placeholder="Repita a senha"
              />
            </div>
            {erro && <p className="text-red-400 text-xs">{erro}</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 py-2 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2 rounded-lg bg-gorila-yellow text-gorila-primary font-bold text-sm hover:bg-yellow-300 transition-colors flex items-center justify-center gap-1 disabled:opacity-60">
                {saving ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                Salvar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

// ── Modal: Editar Perfil ──────────────────────────────────────────────────────

function ModalEditarUsuario({ usuario, onClose, onSalvo }: { usuario: Usuario; onClose: () => void; onSalvo: (u: Usuario) => void }) {
  const [form, setForm] = useState({
    nome: usuario.nome, email: usuario.email, cpf: usuario.cpf,
    telefone: usuario.telefone, cidade: usuario.cidade,
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => document.removeEventListener('keydown', esc)
  }, [onClose])

  const setField = (field: keyof typeof form, value: string) => {
    const formatted = field === 'cpf' ? fmt.cpf(value)
      : field === 'telefone' ? fmt.telefone(value)
      : value
    setForm(prev => ({ ...prev, [field]: formatted }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setSaving(true)
    try {
      const updated = await api.patch<Usuario>(`/admin/usuarios/${usuario.id}`, {
        nome: form.nome, email: form.email, cpf: form.cpf,
        telefone: form.telefone, cidade: form.cidade,
      })
      onSalvo(updated)
      onClose()
    } catch (e: any) {
      setErro(e.message ?? 'Erro ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  const inp = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gorila-yellow'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true"
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md shadow-2xl"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Pencil size={18} className="text-gorila-yellow" /> Editar Perfil
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Nome</label>
              <input type="text" value={form.nome} onChange={e => setField('nome', e.target.value)} className={inp} required autoFocus />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">E-mail</label>
              <input type="email" value={form.email} onChange={e => setField('email', e.target.value)} className={inp} required />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">CPF</label>
              <input type="text" value={form.cpf} onChange={e => setField('cpf', e.target.value)} className={inp} maxLength={14} />
            </div>
            <div>
              <label className="text-xs text-zinc-400 mb-1 block">Telefone</label>
              <input type="text" value={form.telefone} onChange={e => setField('telefone', e.target.value)} className={inp} maxLength={15} />
            </div>
          </div>
          <div>
            <label className="text-xs text-zinc-400 mb-1 block">Cidade</label>
            <input type="text" value={form.cidade} onChange={e => setField('cidade', e.target.value)} className={inp} />
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

// ── Modal: Novo Usuário ────────────────────────────────────────────────────────

const BLANK_FORM = { nome: '', email: '', cpf: '', telefone: '', cidade: '', role: 'ATLETA' as Usuario['role'], funcao: '' as string, senha: '', confirmarSenha: '' }

function ModalNovoUsuario({ onClose, onCriado }: { onClose: () => void; onCriado: (u: Usuario) => void }) {
  const [form, setForm] = useState(BLANK_FORM)
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [ok, setOk] = useState(false)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    if (!ok) return
    const id = setTimeout(onClose, 1000)
    return () => clearTimeout(id)
  }, [ok, onClose])

  const setField = (field: keyof typeof BLANK_FORM, value: string) => {
    const formatted = field === 'cpf' ? fmt.cpf(value)
      : field === 'telefone' ? fmt.telefone(value)
      : value
    setForm(prev => ({ ...prev, [field]: formatted }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (!validarCPF(form.cpf))            return setErro('CPF inválido.')
    if (form.senha.length < 8)            return setErro('Senha deve ter mínimo 8 caracteres.')
    if (form.senha !== form.confirmarSenha) return setErro('As senhas não coincidem.')

    setSaving(true)
    try {
      const novo = await api.post<Usuario>('/admin/usuarios', {
        nome: form.nome, email: form.email, cpf: form.cpf,
        telefone: form.telefone, cidade: form.cidade,
        role: form.role, senha: form.senha,
        ...(form.role === 'TREINADOR' && form.funcao ? { funcao: form.funcao } : {}),
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
  const inputCls = 'w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gorila-yellow'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        role="dialog" aria-modal="true" aria-labelledby="modal-novo-usuario-title"
        className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="modal-novo-usuario-title" className="text-lg font-bold mb-5 flex items-center gap-2">
          <UserPlus size={18} className="text-gorila-yellow" />
          Novo Usuário
        </h2>

        {ok ? (
          <p className="text-green-400 text-sm font-medium text-center py-6">Usuário criado com sucesso!</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Nome e E-mail */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block" htmlFor="novo-nome">Nome Completo</label>
                <input id="novo-nome" type="text" value={form.nome}
                  onChange={e => setField('nome', e.target.value)}
                  className={inputCls} placeholder="Nome completo" required autoFocus />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block" htmlFor="novo-email">E-mail</label>
                <input id="novo-email" type="email" value={form.email}
                  onChange={e => setField('email', e.target.value)}
                  className={inputCls} placeholder="email@exemplo.com" required />
              </div>
            </div>

            {/* CPF e Telefone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block" htmlFor="novo-cpf">CPF</label>
                <input id="novo-cpf" type="text" value={form.cpf}
                  onChange={e => setField('cpf', e.target.value)}
                  className={inputCls} placeholder="000.000.000-00" maxLength={14} required />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block" htmlFor="novo-telefone">Telefone</label>
                <input id="novo-telefone" type="text" value={form.telefone}
                  onChange={e => setField('telefone', e.target.value)}
                  className={inputCls} placeholder="(51) 99999-9999" maxLength={15} />
              </div>
            </div>

            {/* Cidade e Role */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block" htmlFor="novo-cidade">Cidade</label>
                <input id="novo-cidade" type="text" value={form.cidade}
                  onChange={e => setField('cidade', e.target.value)}
                  className={inputCls} placeholder="Cidade" />
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block" htmlFor="novo-role">Perfil</label>
                <select id="novo-role" value={form.role}
                  onChange={e => setField('role', e.target.value)}
                  className={inputCls}>
                  <option value="ATLETA">Atleta</option>
                  <option value="TREINADOR">Treinador / Staff</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            {form.role === 'TREINADOR' && (
              <div>
                <label className="text-xs text-zinc-400 mb-1 block" htmlFor="novo-funcao">Especialidade</label>
                <select id="novo-funcao" value={form.funcao}
                  onChange={e => setForm(prev => ({ ...prev, funcao: e.target.value }))}
                  className={inputCls}>
                  <option value="">— sem especialidade —</option>
                  <option value="PROFESSOR">Professor / Treinador</option>
                  <option value="NUTRICIONISTA">Nutricionista</option>
                  <option value="FISIOTERAPEUTA">Fisioterapeuta</option>
                </select>
              </div>
            )}

            {/* Senha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 mb-1 block" htmlFor="novo-senha">Senha</label>
                <input id="novo-senha" type="password" value={form.senha}
                  onChange={e => setField('senha', e.target.value)}
                  className={inputCls} placeholder="Mínimo 8 caracteres" required />
                {form.senha && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= forca.nivel ? forca.cor : 'bg-zinc-700'}`} />
                      ))}
                    </div>
                    <p className={`text-xs ${forca.nivel <= 2 ? 'text-red-400' : forca.nivel <= 3 ? 'text-yellow-500' : 'text-green-400'}`}>
                      Senha {forca.label}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs text-zinc-400 mb-1 block" htmlFor="novo-confirmar">Confirmar Senha</label>
                <input id="novo-confirmar" type="password" value={form.confirmarSenha}
                  onChange={e => setField('confirmarSenha', e.target.value)}
                  className={inputCls} placeholder="Repita a senha" required />
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

// ── Página principal ───────────────────────────────────────────────────────────

export default function Usuarios() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState<number | null>(null)
  const [search, setSearch] = useState('')
  const [senhaModal, setSenhaModal] = useState<Pick<Usuario, 'id' | 'nome'> | null>(null)
  const [novoModal, setNovoModal] = useState(false)
  const [editarModal, setEditarModal] = useState<Usuario | null>(null)

  useEffect(() => {
    api.get<Usuario[]>('/admin/usuarios')
      .then(setUsuarios)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function toggle(u: Usuario, field: 'ativo' | 'role', value: boolean | string) {
    if (!isAdmin) return
    setSaving(u.id)
    try {
      const updated = await api.patch<Usuario>(`/admin/usuarios/${u.id}`, { [field]: value })
      setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, ...updated } : x))
    } catch (e: any) {
      alert(e.message)
    } finally {
      setSaving(null)
    }
  }

  const roleBadge = (role: string) => {
    const map: Record<string, string> = {
      ADMIN:     'bg-red-500/20 text-red-400 border-red-500/30',
      TREINADOR: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      ATLETA:    'bg-zinc-700 text-zinc-300 border-zinc-600',
    }
    return map[role] ?? map.ATLETA
  }

  const roleLabel = (u: Usuario) => {
    if (u.role === 'TREINADOR' && u.funcao) {
      const labels: Record<string, string> = { PROFESSOR: 'Professor', NUTRICIONISTA: 'Nutricionista', FISIOTERAPEUTA: 'Fisioterapeuta' }
      return `Treinador · ${labels[u.funcao] ?? u.funcao}`
    }
    return u.role === 'ATLETA' ? 'Atleta' : u.role === 'ADMIN' ? 'Admin' : 'Treinador'
  }

  const filteredUsuarios = search.trim()
    ? usuarios.filter(u =>
        u.nome.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.cidade.toLowerCase().includes(search.toLowerCase())
      )
    : usuarios

  return (
    <div className="px-4 py-5 md:p-8">
      {senhaModal && <ModalSenha usuario={senhaModal} onClose={() => setSenhaModal(null)} />}
      {novoModal && (
        <ModalNovoUsuario
          onClose={() => setNovoModal(false)}
          onCriado={(u) => setUsuarios(prev => [u, ...prev])}
        />
      )}
      {editarModal && (
        <ModalEditarUsuario
          usuario={editarModal}
          onClose={() => setEditarModal(null)}
          onSalvo={(u) => setUsuarios(prev => prev.map(x => x.id === u.id ? { ...x, ...u } : x))}
        />
      )}

      <div className="flex items-start justify-between mb-1">
        <h1 className="text-2xl font-bold">Usuários</h1>
        {isAdmin && (
          <button
            onClick={() => setNovoModal(true)}
            className="flex items-center gap-1.5 bg-gorila-yellow text-gorila-primary font-bold text-sm px-4 py-2 rounded-lg hover:bg-yellow-300 transition-colors"
          >
            <UserPlus size={15} />
            Novo Usuário
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 mb-6">
        <p className="text-zinc-400 text-sm shrink-0">
          {search ? `${filteredUsuarios.length} de ${usuarios.length}` : `${usuarios.length}`} cadastrado(s)
        </p>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou cidade…"
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-gorila-yellow"
        />
        {search && (
          <button onClick={() => setSearch('')} className="text-zinc-500 hover:text-white text-xs shrink-0">
            Limpar
          </button>
        )}
      </div>

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
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Cidade</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Desde</th>
                {isAdmin && <th className="px-4 py-3 font-medium">Ações</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsuarios.map((u) => (
                <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.nome}</td>
                  <td className="px-4 py-3 text-zinc-400">{u.email}</td>
                  <td className="px-4 py-3 text-zinc-400">{u.cidade}</td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <select
                        value={u.role} disabled={saving === u.id}
                        onChange={(e) => toggle(u, 'role', e.target.value)}
                        className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs text-white"
                      >
                        <option value="ATLETA">Atleta</option>
                        <option value="TREINADOR">Treinador / Staff</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    ) : (
                      <span className={`text-xs border px-2 py-0.5 rounded-full ${roleBadge(u.role)}`}>
                        {roleLabel(u)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isAdmin ? (
                      <button
                        disabled={saving === u.id}
                        onClick={() => toggle(u, 'ativo', !u.ativo)}
                        className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                          u.ativo
                            ? 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                            : 'bg-zinc-700 text-zinc-400 border-zinc-600 hover:bg-zinc-600'
                        }`}
                      >
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </button>
                    ) : (
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${u.ativo ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-zinc-700 text-zinc-400 border-zinc-600'}`}>
                        {u.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-500 text-xs">
                    {new Date(u.criadoEm).toLocaleDateString('pt-BR')}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setEditarModal(u)}
                          title="Editar perfil"
                          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-gorila-yellow transition-colors px-2 py-1 rounded hover:bg-zinc-800">
                          <Pencil size={13} />
                          Editar
                        </button>
                        <button
                          onClick={() => setSenhaModal(u)}
                          title="Alterar senha"
                          className="flex items-center gap-1 text-xs text-zinc-400 hover:text-gorila-yellow transition-colors px-2 py-1 rounded hover:bg-zinc-800">
                          <KeyRound size={13} />
                          Senha
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
