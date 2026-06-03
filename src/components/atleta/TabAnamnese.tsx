import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, CheckCircle } from 'lucide-react'

interface AnamneseData {
  id?: number
  nomeCompleto: string
  dataNascimento: string
  sexo: string
  telefone: string
  profissao: string
  contatoEmergenciaNome: string
  contatoEmergenciaTelefone: string
  objetivos: string[]
  doencas: string
  medicamentos: string
  cirurgias: string
  problemasArticulares: string
  historicoCv: boolean
  tabagismo: boolean
  frequenciaBanheiro: string
  historicoAtividades: string
  frequenciaSemanal: string
  qualidadeSono: string
  consumoAlcool: string
  termoacceito: boolean
}

const OBJETIVOS_OPTS = [
  'Emagrecimento',
  'Hipertrofia (ganho de massa muscular)',
  'Condicionamento físico / Saúde',
  'Reabilitação de lesão',
  'Lazer / Redução de estresse',
]

const blank = (): AnamneseData => ({
  nomeCompleto: '', dataNascimento: '', sexo: '', telefone: '',
  profissao: '', contatoEmergenciaNome: '', contatoEmergenciaTelefone: '',
  objetivos: [], doencas: '', medicamentos: '', cirurgias: '',
  problemasArticulares: '', historicoCv: false, tabagismo: false,
  frequenciaBanheiro: '', historicoAtividades: '', frequenciaSemanal: '',
  qualidadeSono: '', consumoAlcool: '', termoacceito: false,
})

function Field({ label, value }: { label: string; value: string | boolean }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium">{typeof value === 'boolean' ? (value ? 'Sim' : 'Não') : value || '—'}</p>
    </div>
  )
}

function InputText({ label, value, onChange, required }: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}{required && <span className="text-red-500"> *</span>}</label>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gorila-primary"
      />
    </div>
  )
}

function Select({ label, value, onChange, options, required }: {
  label: string; value: string; onChange: (v: string) => void
  options: string[]; required?: boolean
}) {
  return (
    <div>
      <label className="block text-xs text-gray-600 mb-1">{label}{required && <span className="text-red-500"> *</span>}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        required={required}
        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gorila-primary bg-white"
      >
        <option value="">Selecione...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )
}

export default function TabAnamnese() {
  const [saved, setSaved] = useState<AnamneseData | null>(null)
  const [form, setForm] = useState<AnamneseData>(blank())
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get<AnamneseData>('/anamnese')
      .then(d => { setSaved(d); setForm(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const set = (field: keyof AnamneseData, value: unknown) =>
    setForm(prev => ({ ...prev, [field]: value }))

  const toggleObjetivo = (obj: string) =>
    set('objetivos', form.objetivos.includes(obj)
      ? form.objetivos.filter(o => o !== obj)
      : [...form.objetivos, obj])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.termoacceito) { setError('É necessário aceitar o termo de responsabilidade.'); return }
    setSaving(true); setError('')
    try {
      const result = await api.post<AnamneseData>('/anamnese', form)
      setSaved(result)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao salvar'
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <Card><CardContent className="py-12 text-center text-gray-400 text-sm">Carregando...</CardContent></Card>
  )

  if (saved?.id) return (
    <Card>
      <CardHeader>
        <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
          <CheckCircle size={17} className="text-green-500" /> Ficha de Anamnese
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700">
          Anamnese preenchida. Somente leitura.
        </div>
        <div className="space-y-6">
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Dados Pessoais</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Nome completo" value={saved.nomeCompleto} />
              <Field label="Data de nascimento" value={saved.dataNascimento} />
              <Field label="Sexo" value={saved.sexo} />
              <Field label="Telefone/WhatsApp" value={saved.telefone} />
              <Field label="Profissão" value={saved.profissao} />
              <Field label="Contato de emergência" value={`${saved.contatoEmergenciaNome} — ${saved.contatoEmergenciaTelefone}`} />
            </div>
          </section>
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Objetivos</h3>
            <div className="flex flex-wrap gap-2">
              {(saved.objetivos || []).map(o => (
                <span key={o} className="bg-gorila-yellow/20 text-gorila-primary text-xs font-medium px-3 py-1 rounded-full">{o}</span>
              ))}
            </div>
          </section>
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Histórico Clínico</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Doenças diagnosticadas" value={saved.doencas} />
              <Field label="Medicamentos de uso contínuo" value={saved.medicamentos} />
              <Field label="Cirurgias anteriores" value={saved.cirurgias} />
              <Field label="Problemas articulares/ósseos" value={saved.problemasArticulares} />
              <Field label="Histórico familiar cardiovascular" value={saved.historicoCv} />
              <Field label="Tabagismo" value={saved.tabagismo} />
              <Field label="Frequência ao banheiro/dia" value={saved.frequenciaBanheiro} />
            </div>
          </section>
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wide text-gray-400 mb-3">Hábitos de Vida</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Field label="Histórico de atividades físicas" value={saved.historicoAtividades} />
              <Field label="Frequência semanal pretendida" value={saved.frequenciaSemanal} />
              <Field label="Qualidade do sono" value={saved.qualidadeSono} />
              <Field label="Consumo de álcool" value={saved.consumoAlcool} />
            </div>
          </section>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-gorila-primary flex items-center gap-2 text-base">
          <FileText size={17} /> Ficha de Anamnese
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-500 mb-6">Esta ficha será preenchida uma única vez e ficará disponível para seu treinador e nutricionista.</p>

        <div className="flex gap-1 mb-8">
          {[1,2,3,4,5].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? 'bg-gorila-primary' : 'bg-gray-200'}`} />
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gorila-primary">Seção 1 — Dados Pessoais</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputText label="Nome completo" value={form.nomeCompleto} onChange={v => set('nomeCompleto', v)} required />
                <InputText label="Data de nascimento" value={form.dataNascimento} onChange={v => set('dataNascimento', v)} required />
                <Select label="Sexo" value={form.sexo} onChange={v => set('sexo', v)} options={['Masculino','Feminino','Outro']} required />
                <InputText label="Telefone / WhatsApp" value={form.telefone} onChange={v => set('telefone', v)} required />
                <InputText label="Profissão" value={form.profissao} onChange={v => set('profissao', v)} />
                <InputText label="Contato de emergência (nome)" value={form.contatoEmergenciaNome} onChange={v => set('contatoEmergenciaNome', v)} required />
                <InputText label="Telefone do contato de emergência" value={form.contatoEmergenciaTelefone} onChange={v => set('contatoEmergenciaTelefone', v)} required />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gorila-primary">Seção 2 — Objetivos</h3>
              <p className="text-xs text-gray-500">Selecione todos os que se aplicam.</p>
              <div className="space-y-2">
                {OBJETIVOS_OPTS.map(o => (
                  <label key={o} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-gorila-primary transition-colors">
                    <input
                      type="checkbox"
                      checked={form.objetivos.includes(o)}
                      onChange={() => toggleObjetivo(o)}
                      className="w-4 h-4 accent-gorila-primary"
                    />
                    <span className="text-sm">{o}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gorila-primary">Seção 3 — Histórico Clínico</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputText label="Doenças diagnosticadas" value={form.doencas} onChange={v => set('doencas', v)} />
                <InputText label="Medicamentos de uso contínuo" value={form.medicamentos} onChange={v => set('medicamentos', v)} />
                <InputText label="Cirurgias anteriores" value={form.cirurgias} onChange={v => set('cirurgias', v)} />
                <InputText label="Problemas articulares ou ósseos" value={form.problemasArticulares} onChange={v => set('problemasArticulares', v)} />
                <InputText label="Frequência ao banheiro por dia" value={form.frequenciaBanheiro} onChange={v => set('frequenciaBanheiro', v)} />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={form.historicoCv} onChange={e => set('historicoCv', e.target.checked)} className="w-4 h-4 accent-gorila-primary" />
                  Histórico familiar cardiovascular
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input type="checkbox" checked={form.tabagismo} onChange={e => set('tabagismo', e.target.checked)} className="w-4 h-4 accent-gorila-primary" />
                  Tabagista
                </label>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gorila-primary">Seção 4 — Hábitos de Vida</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputText label="Histórico de atividades físicas" value={form.historicoAtividades} onChange={v => set('historicoAtividades', v)} />
                <Select label="Frequência semanal pretendida" value={form.frequenciaSemanal} onChange={v => set('frequenciaSemanal', v)}
                  options={['1x/semana','2x/semana','3x/semana','4x/semana','5x ou mais/semana']} />
                <Select label="Qualidade do sono" value={form.qualidadeSono} onChange={v => set('qualidadeSono', v)}
                  options={['Ótima','Boa','Regular','Ruim']} />
                <Select label="Consumo de álcool" value={form.consumoAlcool} onChange={v => set('consumoAlcool', v)}
                  options={['Nunca','Raramente','1–2x por semana','3x ou mais por semana']} />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gorila-primary">Seção 5 — Termo de Responsabilidade</h3>
              <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 leading-relaxed border border-gray-200">
                Declaro que as informações prestadas nesta ficha de anamnese são verdadeiras e assumo total responsabilidade por elas. Estou ciente de que a prática de atividade física envolve riscos, e que a Gorila Rise recomenda a avaliação médica prévia. Autorizo o uso das informações para fins de prescrição de treino e acompanhamento nutricional, de forma confidencial.
              </div>
              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-gray-200 hover:border-gorila-primary transition-colors">
                <input
                  type="checkbox"
                  checked={form.termoacceito}
                  onChange={e => set('termoacceito', e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-gorila-primary"
                />
                <span className="text-sm">Li e aceito o Termo de Responsabilidade acima.</span>
              </label>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
          )}

          <div className="flex justify-between pt-2">
            {step > 1
              ? <Button type="button" variant="outline" onClick={() => setStep(s => s - 1)}>Anterior</Button>
              : <div />
            }
            {step < 5
              ? <Button type="button" onClick={() => setStep(s => s + 1)} className="bg-gorila-primary hover:bg-gorila-dark text-white">Próximo</Button>
              : <Button type="submit" disabled={saving} className="bg-gorila-primary hover:bg-gorila-dark text-white">
                  {saving ? 'Salvando...' : 'Enviar Anamnese'}
                </Button>
            }
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
