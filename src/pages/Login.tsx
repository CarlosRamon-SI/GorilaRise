import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, user, loading } = useAuth();

  // Redirect already-authenticated users to their dashboard
  useEffect(() => {
    if (loading || !user) return
    const dest = user.role === 'ADMIN' ? '/admin'
               : user.role === 'TREINADOR' ? '/painel-professor'
               : user.role === 'SOCIO_TORCEDOR' ? '/painel-socio'
               : '/painel'
    navigate(dest, { replace: true })
  }, [user, loading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await api.post<{ usuario: { id: number; nome: string; email: string; role: 'ATLETA' | 'TREINADOR' | 'ADMIN' | 'SOCIO_TORCEDOR'; funcao?: 'PROFESSOR' | 'NUTRICIONISTA' | 'FISIOTERAPEUTA' }; token: string }>(
        '/auth/login',
        { email, senha }
      );
      login(res.token, res.usuario);
      const dest = res.usuario.role === 'ADMIN' ? '/admin'
                 : res.usuario.role === 'TREINADOR' ? '/painel-professor'
                 : res.usuario.role === 'SOCIO_TORCEDOR' ? '/painel-socio'
                 : '/painel'
      navigate(dest)
    } catch (err: any) {
      setError(err.message ?? 'Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gorila-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gorila-primary font-bold text-2xl">🦍</span>
              </div>
              <CardTitle className="text-2xl text-gorila-primary">Área do Atleta</CardTitle>
              <CardDescription>Acesse sua conta do Gorila Rise</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="senha">Senha</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={showSenha ? 'text' : 'password'}
                      placeholder="Digite sua senha"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowSenha(!showSenha)}
                    >
                      {showSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full bg-gorila-primary hover:bg-gorila-dark" disabled={isLoading}>
                  {isLoading ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>

              <div className="mt-6 text-center space-y-4">
                <div className="border-t pt-4">
                  <p className="text-gray-600 mb-2">Ainda não é membro?</p>
                  <Link to="/cadastro">
                    <Button variant="outline" className="w-full border-gorila-primary text-gorila-primary hover:bg-gorila-primary hover:text-white">
                      Entre para o Bando
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
