import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import { Save, MapPin, Phone, Clock, Share2 } from 'lucide-react'

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

  useEffect(() => {
    api.get<Configuracoes>('/configuracoes')
      .then(data => setConfig(prev => ({
        ...prev,
        ...data,
        horarios: { ...emptyConfig().horarios, ...data.horarios },
      })))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

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
      await api.patch('/admin/configuracoes', config)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message ?? 'Erro ao salvar configurações')
    } finally {
      setSaving(false)
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
                  <div key={key} className="flex items-center gap-3 py-2.5 border-b border-zinc-800/60 last:border-0">
                    <button
                      type="button"
                      onClick={() => setHorario(key, { aberto: !h.aberto })}
                      className={`w-9 h-5 rounded-full transition-colors flex-shrink-0 relative ${h.aberto ? 'bg-yellow-400' : 'bg-zinc-700'}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${h.aberto ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                    <span className={`text-sm w-28 flex-shrink-0 ${h.aberto ? 'text-white' : 'text-zinc-500'}`}>{label}</span>
                    {h.aberto ? (
                      <div className="flex items-center gap-1.5 ml-auto">
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



    </form>
  )
}
