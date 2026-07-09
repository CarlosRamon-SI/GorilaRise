import { useState } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { api } from '@/lib/api'
import { Eye, EyeOff, Lock } from 'lucide-react'

export default function RedefinirSenha() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') ?? ''

  const [novaSenha, setNovaSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [showSenha, setShowSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 max-w-md">
          <Card>
            <CardContent className="pt-6 text-center space-y-4">
              <p className="text-gray-600">Link inválido. Solicite um novo e-mail de recuperação.</p>
              <Link to="/recuperar-senha">
                <Button className="bg-gorila-primary hover:bg-gorila-dark">Solicitar link</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (novaSenha !== confirmar) { setError('As senhas não coincidem.'); return }
    if (novaSenha.length < 8) { setError('A senha deve ter pelo menos 8 caracteres.'); return }
    setLoading(true)
    try {
      await api.post('/auth/redefinir-senha', { token, novaSenha })
      navigate('/login?senha_redefinida=1')
    } catch (err: any) {
      setError(err.message ?? 'Erro ao redefinir senha.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-gorila-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={28} className="text-gorila-primary" />
              </div>
              <CardTitle className="text-2xl text-gorila-primary">Nova senha</CardTitle>
              <CardDescription>Digite e confirme sua nova senha abaixo.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="novaSenha">Nova senha</Label>
                  <div className="relative">
                    <Input
                      id="novaSenha"
                      type={showSenha ? 'text' : 'password'}
                      placeholder="Mínimo 8 caracteres"
                      value={novaSenha}
                      onChange={e => setNovaSenha(e.target.value)}
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
                <div>
                  <Label htmlFor="confirmar">Confirmar nova senha</Label>
                  <Input
                    id="confirmar"
                    type={showSenha ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    value={confirmar}
                    onChange={e => setConfirmar(e.target.value)}
                    required
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" disabled={loading} className="w-full bg-gorila-primary hover:bg-gorila-dark">
                  {loading ? 'Salvando...' : 'Salvar nova senha'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
