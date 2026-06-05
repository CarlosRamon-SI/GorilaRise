import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

export interface HorarioDia {
  aberto: boolean
  abertura: string
  fechamento: string
}

export interface Configuracoes {
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

// Valores padrão (fallback enquanto o backend não responde ou não tem dados)
export const configPadrao: Configuracoes = {
  logradouro: 'Rua Leopoldina',
  numero: '12',
  complemento: '',
  bairro: 'Jardim União',
  cidade: 'Várzea Grande',
  estado: 'MT',
  cep: '',
  telefone: '(65) 9.9914-3831',
  whatsapp: '(65) 9.9914-3831',
  email: 'contato@gorilarise.com.br',
  horarios: {
    segunda: { aberto: true,  abertura: '05:30', fechamento: '21:00' },
    terca:   { aberto: true,  abertura: '05:30', fechamento: '21:00' },
    quarta:  { aberto: true,  abertura: '05:30', fechamento: '21:00' },
    quinta:  { aberto: true,  abertura: '05:30', fechamento: '21:00' },
    sexta:   { aberto: true,  abertura: '05:30', fechamento: '21:00' },
    sabado:  { aberto: true,  abertura: '16:00', fechamento: '19:00' },
    domingo: { aberto: false, abertura: '',      fechamento: ''      },
  },
  instagram: 'https://instagram.com/gorilarise',
  facebook:  'https://facebook.com/gorilarise',
  youtube:   'https://youtube.com/gorilarise',
  tiktok:    '',
}

export function useConfiguracoes() {
  const [config, setConfig] = useState<Configuracoes>(configPadrao)

  useEffect(() => {
    api.get<Configuracoes>('/configuracoes')
      .then(data => setConfig(prev => ({
        ...prev,
        ...data,
        horarios: { ...prev.horarios, ...(data.horarios ?? {}) },
      })))
      .catch(() => {/* mantém o padrão */})
  }, [])

  return config
}
