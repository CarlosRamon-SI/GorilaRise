export const fmt = {
  cpf: (v: string) =>
    v.replace(/\D/g, '').slice(0, 11)
     .replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4')
     .replace(/-$/, ''),

  telefone: (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 11)
    if (d.length <= 6)  return d.replace(/(\d{0,2})(\d{0,4})/, (_, a, b) => b ? `(${a}) ${b}` : a ? `(${a}` : a)
    if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').replace(/-$/, '')
  },

  cep: (v: string) =>
    v.replace(/\D/g, '').slice(0, 8)
     .replace(/(\d{5})(\d{0,3})/, '$1-$2')
     .replace(/-$/, ''),
}
