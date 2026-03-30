import { useState } from 'react';
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
import { UserPlus, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface Modalidade { id: number; nome: string; categoria: string }
interface Plano { id: number; nome: string; valor: string }

const Cadastro = () => {
  const [formData, setFormData] = useState({
    nome: '', email: '', cpf: '', telefone: '', nascimento: '',
    endereco: '', cidade: '', cep: '', modalidadeId: '', planoId: planoIdInicial,
    senha: '', confirmarSenha: '',
  });
  const [termos, setTermos] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const planoIdInicial = String((location.state as any)?.planoId ?? '');
  const { login } = useAuth();

  const { data: modalidades = [] } = useQuery<Modalidade[]>({
    queryKey: ['modalidades'],
    queryFn: () => api.get('/modalidades'),
  });

  const { data: planos = [] } = useQuery<Plano[]>({
    queryKey: ['planos'],
    queryFn: () => api.get('/planos'),
  });

  const fmt = {
    cpf: (v: string) => v.replace(/\D/g, '').replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
    telefone: (v: string) => v.replace(/\D/g, '').replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'),
    cep: (v: string) => v.replace(/\D/g, '').replace(/(\d{5})(\d{3})/, '$1-$2'),
  };

  const handleChange = (field: string, value: string) => {
    const formatted = field in fmt ? fmt[field as keyof typeof fmt](value) : value;
    setFormData(prev => ({ ...prev, [field]: formatted }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!termos) return setError('Você deve aceitar os termos e condições');
    if (formData.senha !== formData.confirmarSenha) return setError('As senhas não coincidem');
    if (formData.senha.length < 8) return setError('A senha deve ter pelo menos 8 caracteres');

    setIsLoading(true);
    try {
      const res = await api.post<{ usuario: { id: number; nome: string; email: string; role: 'MEMBRO' | 'ADMIN' }; token: string }>(
        '/auth/cadastro',
        {
          nome: formData.nome,
          email: formData.email,
          cpf: formData.cpf,
          telefone: formData.telefone,
          nascimento: formData.nascimento,
          endereco: formData.endereco,
          cidade: formData.cidade,
          cep: formData.cep,
          senha: formData.senha,
          modalidadeId: Number(formData.modalidadeId),
          planoId: Number(formData.planoId),
        }
      );
      login(res.token, res.usuario);
      setSuccess(true);
      setTimeout(() => navigate('/painel'), 2500);
    } catch (err: any) {
      setError(err.message ?? 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

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
    );
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

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gorila-primary">Dados Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="nome">Nome Completo</Label>
                      <Input id="nome" value={formData.nome} onChange={e => handleChange('nome', e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="email">E-mail</Label>
                      <Input id="email" type="email" value={formData.email} onChange={e => handleChange('email', e.target.value)} required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="cpf">CPF</Label>
                      <Input id="cpf" value={formData.cpf} onChange={e => handleChange('cpf', e.target.value)} maxLength={14} required />
                    </div>
                    <div>
                      <Label htmlFor="telefone">Telefone</Label>
                      <Input id="telefone" value={formData.telefone} onChange={e => handleChange('telefone', e.target.value)} maxLength={15} required />
                    </div>
                    <div>
                      <Label htmlFor="nascimento">Data de Nascimento</Label>
                      <Input id="nascimento" type="date" value={formData.nascimento} onChange={e => handleChange('nascimento', e.target.value)} required />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gorila-primary">Endereço</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="endereco">Endereço</Label>
                      <Input id="endereco" value={formData.endereco} onChange={e => handleChange('endereco', e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="cep">CEP</Label>
                      <Input id="cep" value={formData.cep} onChange={e => handleChange('cep', e.target.value)} maxLength={9} required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" value={formData.cidade} onChange={e => handleChange('cidade', e.target.value)} required />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gorila-primary">Escolha seu Treino</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Modalidade Principal</Label>
                      <Select onValueChange={v => handleChange('modalidadeId', v)} required>
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
                      <Select value={formData.planoId} onValueChange={v => handleChange('planoId', v)} required>
                        <SelectTrigger>
                          <SelectValue placeholder={planos.length ? 'Selecione' : 'Carregando...'} />
                        </SelectTrigger>
                        <SelectContent>
                          {planos.map(p => (
                            <SelectItem key={p.id} value={String(p.id)}>
                              {p.nome} — R$ {Number(p.valor).toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gorila-primary">Crie sua Senha</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="senha">Senha <span className="text-gray-400 font-normal text-xs">(mín. 8 caracteres)</span></Label>
                      <Input id="senha" type="password" value={formData.senha} onChange={e => handleChange('senha', e.target.value)} required />
                    </div>
                    <div>
                      <Label htmlFor="confirmarSenha">Confirmar Senha</Label>
                      <Input id="confirmarSenha" type="password" value={formData.confirmarSenha} onChange={e => handleChange('confirmarSenha', e.target.value)} required />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox id="termos" checked={termos} onCheckedChange={c => setTermos(c === true)} />
                  <Label htmlFor="termos" className="text-sm">
                    Aceito os <Link to="/termos" className="text-gorila-primary hover:underline">termos e condições</Link> e a <Link to="/privacidade" className="text-gorila-primary hover:underline">política de privacidade</Link>
                  </Label>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-gorila-primary hover:bg-gorila-dark" disabled={isLoading}>
                  {isLoading ? 'Criando conta...' : 'Entrar para o Bando'}
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
  );
};

export default Cadastro;
