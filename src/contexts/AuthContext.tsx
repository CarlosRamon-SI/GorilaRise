import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'ATLETA' | 'TREINADOR' | 'ADMIN' | 'SOCIO_TORCEDOR'
export type FuncaoStaff = 'PROFESSOR' | 'NUTRICIONISTA' | 'FISIOTERAPEUTA'

interface AuthUser {
  id: number
  nome: string
  email: string
  role: UserRole
  funcao?: FuncaoStaff
}

interface AuthContextType {
  user: AuthUser | null
  isLoggedIn: boolean
  loading: boolean
  login: (token: string, user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('gorila_token')
    const stored = localStorage.getItem('gorila_user')
    if (token && stored && !isTokenExpired(token)) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('gorila_token')
        localStorage.removeItem('gorila_user')
      }
    } else if (token || stored) {
      localStorage.removeItem('gorila_token')
      localStorage.removeItem('gorila_user')
    }
    setLoading(false)
  }, [])

  // Check token expiry every minute while the app is open
  useEffect(() => {
    const id = setInterval(() => {
      const token = localStorage.getItem('gorila_token')
      if (token && isTokenExpired(token)) {
        localStorage.removeItem('gorila_token')
        localStorage.removeItem('gorila_user')
        setUser(null)
      }
    }, 60_000)
    return () => clearInterval(id)
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
