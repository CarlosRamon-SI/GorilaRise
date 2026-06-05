export function validarCPF(cpf: string): boolean {
  const n = cpf.replace(/\D/g, '')
  if (n.length !== 11 || /^(\d)\1+$/.test(n)) return false
  const calc = (len: number) => {
    let sum = 0
    for (let i = 0; i < len; i++) sum += parseInt(n[i]) * (len + 1 - i)
    const r = 11 - (sum % 11)
    return r >= 10 ? 0 : r
  }
  return calc(9) === parseInt(n[9]) && calc(10) === parseInt(n[10])
}

export function calcForca(senha: string): { nivel: number; label: string; cor: string } {
  let pts = 0
  if (senha.length >= 8)           pts++
  if (senha.length >= 12)          pts++
  if (/[A-Z]/.test(senha))         pts++
  if (/[0-9]/.test(senha))         pts++
  if (/[^A-Za-z0-9]/.test(senha))  pts++
  if (pts <= 1) return { nivel: pts, label: 'Fraca',    cor: 'bg-red-500'    }
  if (pts <= 2) return { nivel: pts, label: 'Razoável', cor: 'bg-orange-400' }
  if (pts <= 3) return { nivel: pts, label: 'Boa',      cor: 'bg-yellow-400' }
  return           { nivel: pts, label: 'Forte',    cor: 'bg-green-500'  }
}
