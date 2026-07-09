import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { api } from '@/lib/api'
import { ArrowLeft, Mail } from 'lucide-react'

export default function RecuperarSenha() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/recuperar-senha', { email })
      setSucesso(true)
    } catch (err: any) {
      setError(err.message ?? 'Erro ao processar solicitação.')
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
                <Mail size={28} className="text-gorila-primary" />
              </div>
              <CardTitle className="text-2xl text-gorila-primary">Recuperar senha</CardTitle>
              <CardDescription>
                Informe seu e-mail cadastrado e enviaremos um link para redefinir sua senha.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sucesso ? (
                <div className="text-center space-y-4">
                  <Alert className="border-green-300 bg-green-50">
                    <AlertDescription className="text-green-700">
                      Se o e-mail estiver cadastrado, você receberá as instruções em breve. Verifique também sua caixa de spam.
                    </AlertDescription>
                  </Alert>
                  <Link to="/login">
                    <Button variant="outline" className="w-full border-gorila-primary text-gorila-primary hover:bg-gorila-primary hover:text-white">
                      Voltar para o login
                    </Button>
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" disabled={loading} className="w-full bg-gorila-primary hover:bg-gorila-dark">
                    {loading ? 'Enviando...' : 'Enviar link de recuperação'}
                  </Button>
                  <Link to="/login" className="flex items-center justify-center gap-1 text-sm text-gray-500 hover:text-gorila-primary transition-colors">
                    <ArrowLeft size={14} /> Voltar para o login
                  </Link>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  )
}
