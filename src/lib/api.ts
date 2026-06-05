const BASE_URL = import.meta.env.VITE_API_URL ?? 'https://pressticket.adtecnologia.com.br'

function getToken() {
  return localStorage.getItem('gorila_token')
}

function clearSession() {
  localStorage.removeItem('gorila_token')
  localStorage.removeItem('gorila_user')
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15_000)

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      signal: options.signal ?? controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })

    if (res.status === 204) return undefined as T

    const data = await res.json().catch(() => ({}))

    if (res.status === 401) {
      clearSession()
      window.location.href = '/login'
      throw new Error('Sessão expirada. Faça login novamente.')
    }

    if (!res.ok) {
      throw new Error(data?.error ?? `Erro ${res.status}`)
    }

    return data as T
  } finally {
    clearTimeout(timeoutId)
  }
}

export const api = {
  get: <T>(path: string, signal?: AbortSignal) => apiFetch<T>(path, { signal }),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(path: string) =>
    apiFetch<T>(path, { method: 'DELETE' }),
  upload: async <T>(path: string, formData: FormData): Promise<T> => {
    const token = getToken()
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30_000)
    try {
      const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        signal: controller.signal,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      })
      if (res.status === 204) return undefined as T
      const data = await res.json().catch(() => ({}))
      if (res.status === 401) { clearSession(); window.location.href = '/login'; throw new Error('Sessão expirada.') }
      if (!res.ok) throw new Error(data?.error ?? `Erro ${res.status}`)
      return data as T
    } finally {
      clearTimeout(timeoutId)
    }
  },
}
