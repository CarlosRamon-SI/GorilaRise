import { useState, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Check, Loader2, XCircle, CheckCircle2, MapPin } from 'lucide-react';
import { api } from '@/lib/api';
import { validarCPF, calcForca } from '@/lib/validators';
import { fmt } from '@/lib/masks';
import { useAuth } from '@/contexts/AuthContext';

interface Modalidade { id: number; nome: string; categoria: string }
interface Plano { id: number; nome: string; valor: string }

type CpfStatus    = 'idle' | 'checking' | 'ok' | 'invalid' | 'taken'
type EmailStatus  = 'idle' | 'checking' | 'ok' | 'taken'

function renderCpfIcon(status: CpfStatus) {
  if (status === 'checking')                    return <Loader2    size={15} className="animate-spin text-zinc-400" />
  if (status === 'ok')                          return <CheckCircle2 size={15} className="text-green-500" />
  if (status === 'invalid' || status === 'taken') return <XCircle  size={15} className="text-red-500" />
  return null
}

function renderEmailIcon(status: EmailStatus) {
  if (status === 'checking') return <Loader2    size={15} className="animate-spin text-zinc-400" />
  if (status === 'ok')       return <CheckCircle2 size={15} className="text-green-500" />
  if (status === 'taken')    return <XCircle    size={15} className="text-red-500" />
  return null
}

const Cadastro = () => {
  const navigate       = useNavigate()
  const location       = useLocation()
  const planoIdInicial = String((location.state as any)?.planoId ?? '')

  const [formData, setFormData] = useState({
    nome: '', email: '', cpf: '', telefone: '', nascimento: '',
    endereco: '', cidade: '', cep: '', modalidadeId: '', planoId: planoIdInicial,
    senha: '', confirmarSenha: '',
  })
  const [termos, setTermos]       = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()

  const [cpfStatus, setCpfStatus]     = useState<CpfStatus>('idle')
  const [emailStatus, setEmailStatus] = useState<EmailStatus>('idle')
  const [cepLoading, setCepLoading]   = useState(false)
  const [cepOk, setCepOk]             = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const cpfAbortRef   = useRef<AbortController | null>(null)
  const emailAbortRef = useRef<AbortController | null>(null)

  const { data: modalidades = [] } = useQuery<Modalidade[]>({
    queryKey: ['modalidades'],
    queryFn: () => api.get('/modalidades'),
  })
  const { data: planos = [] } = useQuery<Plano[]>({
    queryKey: ['planos'],
    queryFn: () => api.get('/planos'),
  })

  const setField = (field: string, value: string) => {
    const formatted = field in fmt ? fmt[field as keyof typeof fmt](value) : value
    setFormData(prev => ({ ...prev, [field]: formatted }))
    setFieldErrors(prev => ({ ...prev, [field]: '' }))
  }

  // ── Validação CPF no blur ─────────────────────────────────────────
  const handleCpfBlur = useCallback(async () => {
    const cpf = formData.cpf
    if (!cpf || cpf.replace(/\D/g, '').length < 11) return
    if (!validarCPF(cpf)) { setCpfStatus('invalid'); return }

    cpfAbortRef.current?.abort()
    cpfAbortRef.current = new AbortController()
    setCpfStatus('checking')
    try {
      const data = await api.get<{ disponivel: boolean }>(
        `/auth/check?cpf=${encodeURIComponent(cpf)}`,
        cpfAbortRef.current.signal,
      )
      setCpfStatus(data.disponivel ? 'ok' : 'taken')
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') setCpfStatus('ok')
    }
  }, [formData.cpf])

  // ── Verificação e-mail no blur ────────────────────────────────────
  const handleEmailBlur = useCallback(async () => {
    const email = formData.email
    if (!email || !email.includes('@')) return

    emailAbortRef.current?.abort()
    emailAbortRef.current = new AbortController()
    setEmailStatus('checking')
    try {
      const data = await api.get<{ disponivel: boolean }>(
        `/auth/check?email=${encodeURIComponent(email)}`,
        emailAbortRef.current.signal,
      )
      setEmailStatus(data.disponivel ? 'ok' : 'taken')
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') setEmailStatus('ok')
    }
  }, [formData.email])

  // ── Busca CEP ─────────────────────────────────────────────────────
  const handleCepBlur = useCallback(async () => {
    const cep = formData.cep.replace(/\D/g, '')
    if (cep.length !== 8) return
    setCepLoading(true)
    setCepOk(false)
    try {
      const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          endereco: data.logradouro
            ? `${data.logradouro}${data.bairro ? ', ' + data.bairro : ''}`
            : prev.endereco,
          cidade: data.localidade ?? prev.cidade,
        }))
        setCepOk(true)
      } else {
        setFieldErrors(prev => ({ ...prev, cep: 'CEP não encontrado.' }))
      }
    } catch { /* silencia */ } finally { setCepLoading(false) }
  }, [formData.cep])

  const forca = calcForca(formData.senha)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!validarCPF(formData.cpf)) return setError('CPF inválido.')

    // Se o blur do CPF ainda não foi disparado, força a verificação agora
    if (cpfStatus === 'idle') {
      await handleCpfBlur()
    }
    if (cpfStatus === 'taken')   return setError('CPF já cadastrado.')
    if (emailStatus === 'taken') return setError('E-mail já cadastrado.')
    if (!termos)                 return setError('Aceite os termos e condições.')
    if (formData.senha !== formData.confirmarSenha) return setError('As senhas não coincidem.')
    if (formData.senha.length < 8) return setError('Senha deve ter mínimo 8 caracteres.')

    setIsLoading(true)
    try {
      const res = await api.post<{
        usuario: { id: number; nome: string; email: string; role: 'USUARIO' | 'TREINADOR' | 'ADMIN' }
        token: string
      }>('/auth/cadastro', {
        nome: formData.nome, email: formData.email, cpf: formData.cpf,
        telefone: formData.telefone, nascimento: formData.nascimento,
        endereco: formData.endereco, cidade: formData.cidade, cep: formData.cep,
        senha: formData.senha,
        modalidadeId: Number(formData.modalidadeId),
        planoId: Number(formData.planoId),
      })
      login(res.token, res.usuario)
      setSuccess(true)
      setTimeout(() => navigate('/painel'), 2500)
    } catch (err: any) {
      setError(err.message ?? 'Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardContent className="pt-8 pb-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="text-green-600" size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gorila-primary mb-3">Bem-vindo ao Bando!</h2>
                <p className="text-gray-600">Sua conta foi criada. Redirecionando para o painel...</p>
                <div className="mt-6 w-full bg-gorila-yellow h-1.5 rounded-full animate-pulse" />
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gorila-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="text-gorila-primary" size={32} />
              </div>
              <CardTitle className="text-2xl text-gorila-primary">Entre para o Bando</CardTitle>
              <CardDescription>Preencha seus dados e comece sua jornada no Gorila Rise</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Dados Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gorila-primary border-b pb-2">Dados Pessoais</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input id="nome" value={formData.nome}
                        onChange={e => setField('nome', e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <div className="relative">
                        <Input id="email" type="email" value={formData.email}
                          onChange={e => { setField('email', e.target.value); setEmailStatus('idle') }}
                          onBlur={handleEmailBlur}
                          className={emailStatus === 'taken' ? 'border-red-400 pr-8' : 'pr-8'}
                          required />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                          {renderEmailIcon(emailStatus)}
                        </span>
                      </div>
                      {emailStatus === 'taken' && (
                        <p className="text-red-500 text-xs mt-1">E-mail já cadastrado.</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cpf">CPF</Label>
                      <div className="relative">
                        <Input id="cpf" value={formData.cpf}
                          onChange={e => { setField('cpf', e.target.value); setCpfStatus('idle') }}
                          onBlur={handleCpfBlur}
                          maxLength={14} placeholder="000.000.000-00"
                          className={['invalid', 'taken'].includes(cpfStatus) ? 'border-red-400 pr-8' : 'pr-8'}
                          required />
                        <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                          {renderCpfIcon(cpfStatus)}
                        </span>
                      </div>
                      {cpfStatus === 'invalid' && <p className="text-red-500 text-xs mt-1">CPF inválido.</p>}
                      {cpfStatus === 'taken'   && <p className="text-red-500 text-xs mt-1">CPF já cadastrado.</p>}
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input id="telefone" value={formData.telefone}
                        onChange={e => setField('telefone', e.target.value)}
                        maxLength={15} placeholder="(51) 99999-9999" required />
                    </div>
                    <div>
                      <Label htmlFor="nascimento">Data de Nascimento</Label>
                      <Input id="nascimento" type="date" value={formData.nascimento}
                        onChange={e => setField('nascimento', e.target.value)} required />
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gorila-primary border-b pb-2">Endereço</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      <div className="relative">
                        <Input id="cep" value={formData.cep}
                          onChange={e => { setField('cep', e.target.value); setCepOk(false) }}
                          onBlur={handleCepBlur}
                          maxLength={9} placeholder="00000-000" required />
                        {cepLoading && (
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                            <Loader2 size={15} className="animate-spin text-zinc-400" />
                          </span>
                        )}
                        {!cepLoading && cepOk && (
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                            <MapPin size={15} className="text-green-500" />
                          </span>
                        )}
                      </div>
                      {fieldErrors.cep && <p className="text-red-500 text-xs mt-1">{fieldErrors.cep}</p>}
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input id="endereco" value={formData.endereco}
                        onChange={e => setField('endereco', e.target.value)}
                        placeholder="Preenchido pelo CEP" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" value={formData.cidade}
                      onChange={e => setField('cidade', e.target.value)}
                      placeholder="Preenchida pelo CEP" required />
                  </div>
                </div>

                {/* Plano e Modalidade */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gorila-primary border-b pb-2">Escolha seu Treino</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Modalidade Principal</Label>
                      <Select onValueChange={v => setField('modalidadeId', v)} required>
                        <SelectTrigger>
                          <SelectValue placeholder={modalidades.length ? 'Selecione' : 'Carregando...'} />
                        </SelectTrigger>
                        <SelectContent>
                          {modalidades.map(m => (
                            <SelectItem key={m.id} value={String(m.id)}>{m.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Plano</Label>
                      <Select value={formData.planoId} onValueChange={v => setField('planoId', v)} required>
                        <SelectTrigger>
                          <SelectValue placeholder={planos.length ? 'Selecione' : 'Carregando...'} />
                        </SelectTrigger>
                        <SelectContent>
                          {planos.map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.nome} — R$ {Number(p.valor).toFixed(2).replace('.', ',')}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {planos.length > 0 && (
                        <Link to="/planos" className="text-xs text-gorila-primary hover:underline mt-1 inline-block">
                          Ver detalhes dos planos →
                        </Link>
                      )}
                    </div>
                  </div>
                </div>

                {/* Senha */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gorila-primary border-b pb-2">Crie sua Senha</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="senha">Senha</Label>
                      <Input id="senha" type="password" value={formData.senha}
                        onChange={e => setField('senha', e.target.value)} required />
                      {formData.senha && (
                        <div className="mt-2 space-y-1">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= forca.nivel ? forca.cor : 'bg-gray-200'}`} />
                            ))}
                          </div>
                          <p className={`text-xs ${forca.nivel <= 2 ? 'text-red-500' : forca.nivel <= 3 ? 'text-yellow-600' : 'text-green-600'}`}>
                            Senha {forca.label}
                          </p>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                      <Input id="confirmarSenha" type="password" value={formData.confirmarSenha}
                        onChange={e => setField('confirmarSenha', e.target.value)} required />
                      {formData.confirmarSenha && formData.senha !== formData.confirmarSenha && (
                        <p className="text-red-500 text-xs mt-1">As senhas não coincidem.</p>
                      )}
                      {formData.confirmarSenha && formData.senha === formData.confirmarSenha && (
                        <p className="text-green-600 text-xs mt-1 flex items-center gap-1">
                          <CheckCircle2 size={12} /> Senhas conferem.
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Termos */}
                <div className="flex items-center space-x-2">
                  <Checkbox id="termos" checked={termos} onCheckedChange={c => setTermos(c === true)} />
                  <Label htmlFor="termos" className="text-sm cursor-pointer">
                    Aceito os <Link to="/termos" className="text-gorila-primary hover:underline">termos e condições</Link> e a{' '}
                    <Link to="/privacidade" className="text-gorila-primary hover:underline">política de privacidade</Link>
                  </Label>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-gorila-primary hover:bg-gorila-dark" disabled={isLoading}>
                  {isLoading
                    ? <><Loader2 size={16} className="animate-spin mr-2" />Criando conta...</>
                    : 'Entrar para o Bando'
                  }
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Já tem uma conta?{' '}
                  <Link to="/login" className="text-gorila-primary hover:underline font-semibold">Faça login</Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default Cadastro
