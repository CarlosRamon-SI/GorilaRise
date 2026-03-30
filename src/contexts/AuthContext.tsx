import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface AuthUser {
  id: number
  nome: string
  email: string
  role: 'USUARIO' | 'TREINADOR' | 'ADMIN'
}

interface AuthContextType {
  user: AuthUser | null
  isLoggedIn: boolean
  loading: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('gorila_token')
    const stored = localStorage.getItem('gorila_user')
    if (token && stored) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('gorila_token')
        localStorage.removeItem('gorila_user')
      }
    }
    setLoading(false)
  }, [])

  const login = (token: string, userData: AuthUser) => {
    localStorage.setItem('gorila_token', token)
    localStorage.setItem('gorila_user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('gorila_token')
    localStorage.removeItem('gorila_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
