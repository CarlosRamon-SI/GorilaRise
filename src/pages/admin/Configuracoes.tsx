import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Save, MapPin, Phone, Clock, Share2, Mail, Bell, Info, Building2 } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface HorarioDia {
  aberto: boolean
  abertura: string
  fechamento: string
}

interface Configuracoes {
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidade: string
  estado: string
  cep: string
  telefone: string
  whatsapp: string
  email: string
  horarios: Record<string, HorarioDia>
  instagram: string
  facebook: string
  youtube: string
  tiktok: string

  // SMTP
  smtpHost: string
  smtpPort: number
  smtpUser: string
  smtpSenha: string
  smtpFromNome: string
  smtpFromEmail: string
  smtpTLS: boolean

  // Toggles de email
  emailBoasVindas: boolean
  emailUsuarioAtivado: boolean
  emailMatriculaAtivada: boolean
  emailMatriculaCancelada: boolean
  emailPagamentoConfirmado: boolean
  emailPlanoVencendo: boolean
  emailPlanoVencido: boolean
  exibirCategoriasPatrocinadores: boolean
}

const DIAS = [
  { key: 'segunda', label: 'Segunda-feira' },
  { key: 'terca',   label: 'Terça-feira' },
  { key: 'quarta',  label: 'Quarta-feira' },
  { key: 'quinta',  label: 'Quinta-feira' },
  { key: 'sexta',   label: 'Sexta-feira' },
  { key: 'sabado',  label: 'Sábado' },
  { key: 'domingo', label: 'Domingo' },
]

const DEFAULT_HORARIO: HorarioDia = { aberto: true, abertura: '06:00', fechamento: '22:00' }

const emptyConfig = (): Configuracoes => ({
  logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '',
  telefone: '', whatsapp: '', email: '',
  horarios: Object.fromEntries(DIAS.map(d => [d.key, { ...DEFAULT_HORARIO }])),
  instagram: '', facebook: '', youtube: '', tiktok: '',
  smtpHost: '', smtpPort: 587, smtpUser: '', smtpSenha: '', smtpFromNome: 'Gorila Rise', smtpFromEmail: '', smtpTLS: true,
  emailBoasVindas: true, emailUsuarioAtivado: true, emailMatriculaAtivada: true,
  emailMatriculaCancelada: true, emailPagamentoConfirmado: true, emailPlanoVencendo: true, emailPlanoVencido: false,
  exibirCategoriasPatrocinadores: false,
})

function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-800">
      <Icon size={18} className="text-yellow-400" />
      <h2 className="text-base font-semibold text-white">{title}</h2>
    </div>
  )
}

export default function Configuracoes() {
  const [config, setConfig] = useState<Configuracoes>(emptyConfig())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [testEmail, setTestEmail] = useState('')
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)

  useEffect(() => {
    api.get<Configuracoes>('/configuracoes')
      .then(data => setConfig(prev => ({
        ...prev,
        ...data,
        smtpSenha: '',
        horarios: { ...emptyConfig().horarios, ...data.horarios },
      })))
      .catch(err => setError(err.message ?? 'Erro ao carregar configurações.'))
      .finally(() => setLoading(false))
  }, [])

  // Auto-clear success banner after 3s without leaking a timer
  useEffect(() => {
    if (!success) return
    const id = setTimeout(() => setSuccess(false), 3000)
    return () => clearTimeout(id)
  }, [success])

  function set<K extends keyof Configuracoes>(field: K, value: Configuracoes[K]) {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  function setHorario(dia: string, patch: Partial<HorarioDia>) {
    setConfig(prev => ({
      ...prev,
      horarios: { ...prev.horarios, [dia]: { ...prev.horarios[dia], ...patch } },
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    setSuccess(false)
    try {
      const payload = { ...config }
      if (!payload.smtpSenha) delete (payload as Partial<Configuracoes>).smtpSenha
      await api.patch('/admin/configuracoes', payload)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message ?? 'Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  async function handleEmailTest() {
    if (!testEmail) return
    setTesting(true)
    setTestResult(null)
    try {
      await api.post('/admin/configuracoes/email-teste', { destinatario: testEmail })
      setTestResult({ ok: true, msg: `Email enviado para ${testEmail}` })
    } catch (err: any) {
      setTestResult({ ok: false, msg: err.message ?? 'Falha ao enviar' })
    } finally {
      setTesting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-zinc-900 rounded-xl p-6 animate-pulse h-56" />
        ))}
      </div>
    )
  }

  const inp = "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-yellow-400 transition-colors"

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Configurações Gerais</h1>
          <p className="text-zinc-400 text-sm">Endereço, contato, horários e redes sociais do estabelecimento</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-yellow-400 text-zinc-900 font-semibold rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
        >
          <Save size={16} />
          {saving ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg p-4 text-sm">{error}</div>
      )}
      {success && (
        <div className="bg-green-900/30 border border-green-700 text-green-400 rounded-lg p-4 text-sm">Configurações salvas com sucesso!</div>
      )}

      {/* Grid 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Coluna esquerda */}
        <div className="space-y-6">

          {/* Endereço */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <SectionTitle icon={MapPin} title="Endereço" />
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Logradouro</label>
                <input type="text" value={config.logradouro} onChange={e => set('logradouro', e.target.value)} placeholder="Rua, Avenida..." className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Número</label>
                  <input type="text" value={config.numero} onChange={e => set('numero', e.target.value)} placeholder="123" className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Complemento</label>
                  <input type="text" value={config.complemento} onChange={e => set('complemento', e.target.value)} placeholder="Sala, Bloco..." className={inp} />
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Bairro</label>
                <input type="text" value={config.bairro} onChange={e => set('bairro', e.target.value)} placeholder="Bairro" className={inp} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Cidade</label>
                  <input type="text" value={config.cidade} onChange={e => set('cidade', e.target.value)} placeholder="São Paulo" className={inp} />
                </div>
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">Estado</label>
                  <input type="text" value={config.estado} onChange={e => set('estado', e.target.value)} placeholder="SP" className={inp} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-zinc-400 mb-1">CEP</label>
                  <input type="text" value={config.cep} onChange={e => set('cep', e.target.value)} placeholder="00000-000" className={inp} />
                </div>
              </div>
            </div>
          </section>

          {/* Contato */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <SectionTitle icon={Phone} title="Contato" />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-zinc-400 mb-1">Telefone</label>
                <input type="tel" value={config.telefone} onChange={e => set('telefone', e.target.value)} placeholder="(11) 1234-5678" className={inp} />
              </div>
              <div>
                <label className="block text-xs text-zinc-400 mb-1">WhatsApp</label>
                <input type="tel" value={config.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="(11) 99999-0000" className={inp} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-zinc-400 mb-1">E-mail</label>
                <input type="email" value={config.email} onChange={e => set('email', e.target.value)} placeholder="contato@gorila.com" className={inp} />
              </div>
            </div>
          </section>

        </div>

        {/* Coluna direita */}
        <div className="space-y-6">

          {/* Horários */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <SectionTitle icon={Clock} title="Horário de Funcionamento" />
            <div className="space-y-1">
              {DIAS.map(({ key, label }) => {
                const h = config.horarios[key]
                return (
                  <div key={key} className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-2.5 border-b border-zinc-800/60 last:border-0">
                    <button
                      type="button"
                      onClick={() => setHorario(key, { aberto: !h.aberto })}
                      className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 relative ${h.aberto ? 'bg-yellow-400' : 'bg-zinc-700'}`}
                    >
                      <span className={`absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${h.aberto ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
                    </button>
                    <span className={`text-sm flex-1 ${h.aberto ? 'text-white' : 'text-zinc-500'}`}>{label}</span>
                    {h.aberto ? (
                      <div className="flex items-center gap-1.5 w-full sm:w-auto sm:ml-auto pl-12 sm:pl-0">
                        <input
                          type="time"
                          value={h.abertura}
                          onChange={e => setHorario(key, { abertura: e.target.value })}
                          className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-yellow-400 transition-colors"
                        />
                        <span className="text-zinc-500 text-xs">às</span>
                        <input
                          type="time"
                          value={h.fechamento}
                          onChange={e => setHorario(key, { fechamento: e.target.value })}
                          className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-yellow-400 transition-colors"
                        />
                      </div>
                    ) : (
                      <span className="ml-auto text-sm text-zinc-600 italic">Fechado</span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          {/* Redes sociais */}
          <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
            <SectionTitle icon={Share2} title="Redes Sociais" />
            <div className="grid grid-cols-2 gap-3">
              {([
                { field: 'instagram' as const, label: 'Instagram', placeholder: 'https://instagram.com/gorila' },
                { field: 'facebook'  as const, label: 'Facebook',  placeholder: 'https://facebook.com/gorila' },
                { field: 'youtube'   as const, label: 'YouTube',   placeholder: 'https://youtube.com/@gorila' },
                { field: 'tiktok'    as const, label: 'TikTok',    placeholder: 'https://tiktok.com/@gorila' },
              ]).map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="block text-xs text-zinc-400 mb-1">{label}</label>
                  <input
                    type="url"
                    value={config[field]}
                    onChange={e => set(field, e.target.value)}
                    placeholder={placeholder}
                    className={inp}
                  />
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      {/* SMTP */}
      <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-zinc-800">
          <Mail size={18} className="text-yellow-400" />
          <h2 className="text-base font-semibold text-white flex-1">Configuração de E-mail (SMTP)</h2>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                <Info size={15} />
              </button>
            </TooltipTrigger>
            <TooltipContent side="left" className="max-w-xs text-xs leading-relaxed bg-zinc-800 border-zinc-700 text-zinc-200 p-3">
              <p className="font-semibold text-white mb-1">Como obter as configurações SMTP</p>
              <p className="mb-2">Você precisa de uma conta de e-mail com envio SMTP habilitado. Exemplos comuns:</p>
              <ul className="space-y-1 text-zinc-400">
                <li><span className="text-zinc-200 font-medium">Gmail:</span> smtp.gmail.com · porta 587 · ative "Senhas de app" nas configurações de segurança da conta Google.</li>
                <li><span className="text-zinc-200 font-medium">Outlook/Hotmail:</span> smtp.office365.com · porta 587.</li>
                <li><span className="text-zinc-200 font-medium">Hostinger/cPanel:</span> use o host e credenciais do seu painel de hospedagem em "Contas de E-mail".</li>
              </ul>
              <p className="mt-2 text-zinc-500">Dica: prefira criar um e-mail dedicado para envios automáticos, ex: noreply@gorilarise.com.br</p>
            </TooltipContent>
          </Tooltip>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <label className="block text-xs text-zinc-400 mb-1">Servidor SMTP (Host)</label>
            <input type="text" value={config.smtpHost} onChange={e => set('smtpHost', e.target.value)} placeholder="smtp.gmail.com" className={inp} />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Porta</label>
            <input type="number" value={config.smtpPort} onChange={e => set('smtpPort', Number(e.target.value))} placeholder="587" className={inp} />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Usuário / E-mail</label>
            <input type="email" value={config.smtpUser} onChange={e => set('smtpUser', e.target.value)} placeholder="envio@gorilarise.com.br" className={inp} />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Senha</label>
            <input type="password" value={config.smtpSenha} onChange={e => set('smtpSenha', e.target.value)} placeholder="••••••••" className={inp} />
          </div>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-xs text-zinc-400 mb-1">TLS</label>
              <button
                type="button"
                onClick={() => set('smtpTLS', !config.smtpTLS)}
                className={`w-9 h-5 rounded-full transition-colors relative ${config.smtpTLS ? 'bg-yellow-400' : 'bg-zinc-700'}`}
              >
                <span className={`absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${config.smtpTLS ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Nome do remetente</label>
            <input type="text" value={config.smtpFromNome} onChange={e => set('smtpFromNome', e.target.value)} placeholder="Gorila Rise" className={inp} />
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">E-mail remetente (From)</label>
            <input type="email" value={config.smtpFromEmail} onChange={e => set('smtpFromEmail', e.target.value)} placeholder="noreply@gorilarise.com.br" className={inp} />
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-400 mb-2 font-medium">Teste de envio</p>
          <div className="flex gap-2 items-center">
            <input
              type="email"
              value={testEmail}
              onChange={e => { setTestEmail(e.target.value); setTestResult(null) }}
              placeholder="seu@email.com"
              className={inp + ' max-w-xs'}
            />
            <button
              type="button"
              onClick={handleEmailTest}
              disabled={testing || !testEmail}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-700 text-white text-sm font-semibold rounded-lg hover:bg-zinc-600 transition-colors disabled:opacity-40"
            >
              <Mail size={14} />
              {testing ? 'Enviando...' : 'Testar'}
            </button>
          </div>
          {testResult && (
            <p className={`mt-2 text-xs ${testResult.ok ? 'text-green-400' : 'text-red-400'}`}>
              {testResult.ok ? '✓ ' : '✗ '}{testResult.msg}
            </p>
          )}
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          Deixe o host em branco para desabilitar o envio de emails. A senha não é exibida após salvar por segurança.
        </p>
      </section>

      {/* Exibição Pública */}
      <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <SectionTitle icon={Building2} title="Exibição Pública" />
        <p className="text-xs text-zinc-500 mb-4">Controle o que é exibido para visitantes e associados no site.</p>
        <div className="flex items-start gap-3 p-3 bg-zinc-800/60 rounded-lg border border-zinc-700/50 max-w-sm">
          <button
            type="button"
            onClick={() => set('exibirCategoriasPatrocinadores', !config.exibirCategoriasPatrocinadores)}
            className={`mt-0.5 w-9 h-5 rounded-full flex-shrink-0 transition-colors relative ${config.exibirCategoriasPatrocinadores ? 'bg-yellow-400' : 'bg-zinc-700'}`}
          >
            <span className={`absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${config.exibirCategoriasPatrocinadores ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
          </button>
          <div>
            <p className={`text-sm font-medium ${config.exibirCategoriasPatrocinadores ? 'text-white' : 'text-zinc-500'}`}>Exibir categorias de patrocinadores</p>
            <p className="text-xs text-zinc-600">Mostra os rótulos Platina, Ouro, Prata e Bronze na home e na página institucional</p>
          </div>
        </div>
      </section>

      {/* Notificações por Email */}
      <section className="bg-zinc-900 rounded-xl p-6 border border-zinc-800">
        <SectionTitle icon={Bell} title="Notificações por E-mail" />
        <p className="text-xs text-zinc-500 mb-4">Ative ou desative cada tipo de email enviado automaticamente pelo sistema.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            { field: 'emailBoasVindas'          as const, label: 'Boas-vindas',          desc: 'Enviado ao atleta ao se cadastrar no portal' },
            { field: 'emailUsuarioAtivado'       as const, label: 'Conta ativada',         desc: 'Enviado quando o admin ativa a conta do atleta' },
            { field: 'emailMatriculaAtivada'     as const, label: 'Matrícula ativada',     desc: 'Enviado quando uma matrícula é criada ou reativada' },
            { field: 'emailMatriculaCancelada'   as const, label: 'Matrícula cancelada',   desc: 'Enviado quando uma matrícula é inativada' },
            { field: 'emailPagamentoConfirmado'  as const, label: 'Pagamento confirmado',  desc: 'Enviado ao registrar um pagamento no financeiro' },
            { field: 'emailPlanoVencendo'        as const, label: 'Plano vencendo',        desc: 'Lembrete enviado dias antes do vencimento' },
            { field: 'emailPlanoVencido'         as const, label: 'Plano vencido',         desc: 'Aviso enviado quando o plano expira' },
          ]).map(({ field, label, desc }) => (
            <div key={field} className="flex items-start gap-3 p-3 bg-zinc-800/60 rounded-lg border border-zinc-700/50">
              <button
                type="button"
                onClick={() => set(field, !config[field])}
                className={`mt-0.5 w-9 h-5 rounded-full flex-shrink-0 transition-colors relative ${config[field] ? 'bg-yellow-400' : 'bg-zinc-700'}`}
              >
                <span className={`absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full shadow transition-transform ${config[field] ? 'translate-x-[18px]' : 'translate-x-[2px]'}`} />
              </button>
              <div>
                <p className={`text-sm font-medium ${config[field] ? 'text-white' : 'text-zinc-500'}`}>{label}</p>
                <p className="text-xs text-zinc-600">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </form>
  )
}
