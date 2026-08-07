import { useEffect, useMemo, useRef, useState } from 'react'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { Plus, Pencil, Check, X, Trash2, Download, Upload, Search, ArrowRight } from 'lucide-react'

interface Alimento {
  id: number
  nome: string
  categoria: string | null
  caloriasKcal: string | number
  carboidratosG: string | number
  proteinasG: string | number
  gordurasG: string | number
}

interface ImportResultado {
  criados: number
  total: number
  erros: { linha: number; erro: string }[]
}

type CampoAlimento = 'nome' | 'categoria' | 'caloriasKcal' | 'carboidratosG' | 'proteinasG' | 'gordurasG'

interface CampoConfig {
  chave: CampoAlimento
  label: string
  obrigatorio: boolean
  sinonimos: string[]
}

const CAMPOS: CampoConfig[] = [
  { chave: 'nome', label: 'Nome do alimento', obrigatorio: true, sinonimos: ['nome do alimento', 'nome', 'alimento', 'descricao'] },
  { chave: 'categoria', label: 'Categoria', obrigatorio: false, sinonimos: ['categoria', 'grupo', 'classe'] },
  { chave: 'caloriasKcal', label: 'Calorias (kcal)', obrigatorio: true, sinonimos: ['calorias', 'kcal', 'energia'] },
  { chave: 'carboidratosG', label: 'Carboidratos (g)', obrigatorio: true, sinonimos: ['carboidratos', 'carboidrato', 'carb'] },
  { chave: 'proteinasG', label: 'Proteínas (g)', obrigatorio: true, sinonimos: ['proteinas', 'proteina', 'prot'] },
  { chave: 'gordurasG', label: 'Gorduras (g)', obrigatorio: true, sinonimos: ['gorduras', 'gordura', 'lipidios', 'lipideos', 'gord'] },
]

const blank = () => ({ nome: '', categoria: '', caloriasKcal: '', carboidratosG: '', proteinasG: '', gordurasG: '' })
const mapeamentoVazio = (): Record<CampoAlimento, number | ''> => ({
  nome: '', categoria: '', caloriasKcal: '', carboidratosG: '', proteinasG: '', gordurasG: '',
})

const COLUNAS_MODELO = ['Nome', 'Categoria', 'Calorias (kcal) por 100g', 'Carboidratos (g) por 100g', 'Proteínas (g) por 100g', 'Gorduras (g) por 100g']
const LINHA_EXEMPLO = ['Arroz branco cozido', 'Cereais', 128, 28.1, 2.5, 0.2]

async function baixarModelo() {
  const XLSX = await import('xlsx')
  const ws = XLSX.utils.aoa_to_sheet([COLUNAS_MODELO, LINHA_EXEMPLO])
  ws['!cols'] = [{ wch: 30 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Alimentos')
  XLSX.writeFile(wb, 'modelo-alimentos.xlsx')
}

const DIACRITICOS = new RegExp('[\\u0300-\\u036f]', 'g')

function normalizarTexto(s: unknown): string {
  return String(s ?? '')
    .normalize('NFD').replace(DIACRITICOS, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

// Nem toda planilha começa com o cabeçalho na linha 1 (pode ter título/observação acima) — testamos
// as primeiras linhas e escolhemos a que mais "parece" cabeçalho, mas o usuário pode corrigir na tela.
function detectarLinhaCabecalho(linhas: any[][]): number {
  const limite = Math.min(linhas.length, 10)
  let melhorIdx = 0
  let melhorScore = -1
  for (let i = 0; i < limite; i++) {
    const normalizados = (linhas[i] ?? []).map(normalizarTexto)
    const score = CAMPOS.reduce(
      (acc, campo) => acc + (normalizados.some(h => campo.sinonimos.some(s => h.includes(s))) ? 1 : 0),
      0,
    )
    if (score > melhorScore) { melhorScore = score; melhorIdx = i }
  }
  return melhorIdx
}

// Sugere, por texto do cabeçalho, qual coluna corresponde a cada campo — o usuário confirma/ajusta antes de importar.
function sugerirMapeamento(cabecalho: string[]): Record<CampoAlimento, number | ''> {
  const normalizados = cabecalho.map(normalizarTexto)
  const usados = new Set<number>()
  const resultado = mapeamentoVazio()
  for (const campo of CAMPOS) {
    let achou: number | '' = ''
    for (const sinonimo of campo.sinonimos) {
      const idx = normalizados.findIndex((h, i) => !usados.has(i) && h.includes(sinonimo))
      if (idx !== -1) { achou = idx; break }
    }
    resultado[campo.chave] = achou
    if (achou !== '') usados.add(achou)
  }
  return resultado
}

function construirItem(linha: number, r: any[], mapeamento: Record<CampoAlimento, number | ''>) {
  const valorDe = (chave: CampoAlimento) => {
    const idx = mapeamento[chave]
    return idx === '' ? undefined : r[idx]
  }
  const categoria = valorDe('categoria')
  return {
    linha,
    nome: String(valorDe('nome') ?? '').trim(),
    categoria: categoria ? String(categoria).trim() : undefined,
    caloriasKcal: Number(valorDe('caloriasKcal')) || 0,
    carboidratosG: Number(valorDe('carboidratosG')) || 0,
    proteinasG: Number(valorDe('proteinasG')) || 0,
    gordurasG: Number(valorDe('gordurasG')) || 0,
  }
}

export default function AdminAlimentos() {
  const [items, setItems] = useState<Alimento[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(blank())
  const [editId, setEditId] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Etapa de importação: a planilha inteira (sem assumir qual linha é o cabeçalho) fica em memória
  // até o usuário confirmar qual linha é o cabeçalho e o mapeamento de colunas.
  const [mapeando, setMapeando] = useState(false)
  const [linhasCompletas, setLinhasCompletas] = useState<any[][]>([])
  const [linhaCabecalhoIdx, setLinhaCabecalhoIdx] = useState(0) // índice 0-based dentro de linhasCompletas
  const [mapeamento, setMapeamento] = useState<Record<CampoAlimento, number | ''>>(mapeamentoVazio())
  const [importando, setImportando] = useState(false)
  const [importResult, setImportResult] = useState<ImportResultado | null>(null)

  function carregar(termo?: string) {
    setLoading(true)
    api.get<Alimento[]>(`/alimentos${termo ? `?busca=${encodeURIComponent(termo)}` : ''}`)
      .then(setItems)
      .finally(() => setLoading(false))
  }

  useEffect(() => { carregar() }, [])

  useEffect(() => {
    const t = setTimeout(() => carregar(busca), 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busca])

  function startEdit(a: Alimento) {
    setEditId(a.id)
    setForm({
      nome: a.nome,
      categoria: a.categoria ?? '',
      caloriasKcal: String(a.caloriasKcal),
      carboidratosG: String(a.carboidratosG),
      proteinasG: String(a.proteinasG),
      gordurasG: String(a.gordurasG),
    })
    setShowForm(true)
    setError('')
  }

  function cancelForm() {
    setShowForm(false)
    setEditId(null)
    setForm(blank())
    setError('')
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        nome: form.nome,
        categoria: form.categoria.trim() || undefined,
        caloriasKcal: Number(form.caloriasKcal) || 0,
        carboidratosG: Number(form.carboidratosG) || 0,
        proteinasG: Number(form.proteinasG) || 0,
        gordurasG: Number(form.gordurasG) || 0,
      }
      if (editId) {
        const updated = await api.patch<Alimento>(`/alimentos/${editId}`, payload)
        setItems(prev => prev.map(x => x.id === editId ? updated : x))
      } else {
        const created = await api.post<Alimento>('/alimentos', payload)
        setItems(prev => [...prev, created].sort((a, b) => a.nome.localeCompare(b.nome)))
      }
      cancelForm()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  async function remover(a: Alimento) {
    if (!confirm(`Excluir "${a.nome}"?`)) return
    try {
      await api.delete(`/alimentos/${a.id}`)
      setItems(prev => prev.filter(x => x.id !== a.id))
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao excluir alimento.')
    }
  }

  async function selecionarArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    try {
      const XLSX = await import('xlsx')
      const buf = await file.arrayBuffer()
      const wb = XLSX.read(buf, { type: 'array' })
      const sheet = wb.Sheets[wb.SheetNames[0]]
      const linhas = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 })
      if (linhas.length < 2) {
        toast.error('A planilha precisa ter uma linha de cabeçalho e ao menos uma linha de dados.')
        return
      }
      const headerIdx = detectarLinhaCabecalho(linhas)
      setLinhasCompletas(linhas)
      setLinhaCabecalhoIdx(headerIdx)
      setMapeamento(sugerirMapeamento((linhas[headerIdx] ?? []).map(c => String(c ?? '').trim())))
      setImportResult(null)
      setMapeando(true)
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao ler a planilha.')
    }
  }

  function selecionarLinhaCabecalho(idx: number) {
    setLinhaCabecalhoIdx(idx)
    setMapeamento(sugerirMapeamento((linhasCompletas[idx] ?? []).map(c => String(c ?? '').trim())))
  }

  function cancelarMapeamento() {
    setMapeando(false)
    setLinhasCompletas([])
    setLinhaCabecalhoIdx(0)
    setMapeamento(mapeamentoVazio())
  }

  const cabecalhoAtual = linhasCompletas[linhaCabecalhoIdx] ?? []
  const linhasDados = useMemo(
    () => linhasCompletas.slice(linhaCabecalhoIdx + 1),
    [linhasCompletas, linhaCabecalhoIdx],
  )

  // Linhas em branco descartadas depois de calcular a linha real da planilha — preserva o número
  // correto mesmo com buracos no meio ou quando o cabeçalho não está na linha 1.
  const itensImportacao = useMemo(() => {
    return linhasDados
      .map((r, k) => ({ linha: linhaCabecalhoIdx + k + 2, r }))
      .filter(({ r }) => r.some(c => c !== undefined && String(c).trim() !== ''))
      .map(({ linha, r }) => construirItem(linha, r, mapeamento))
  }, [linhasDados, linhaCabecalhoIdx, mapeamento])

  const mapeamentoCompleto = CAMPOS.filter(c => c.obrigatorio).every(c => mapeamento[c.chave] !== '')

  // Mostra o texto do cabeçalho + um valor de exemplo da primeira linha de dado — assim o usuário
  // identifica a coluna certa mesmo se o texto do cabeçalho for ambíguo, vazio ou não for cabeçalho de verdade.
  function opcoesColuna(campoAtual: CampoAlimento) {
    const primeiraLinhaComDado = linhasDados.find(r => r.some(c => c !== undefined && String(c).trim() !== '')) ?? []
    return cabecalhoAtual.map((h, i) => {
      const rotulo = String(h ?? '').trim() || `Coluna ${i + 1}`
      const amostra = primeiraLinhaComDado[i]
      const temAmostra = amostra !== undefined && String(amostra).trim() !== ''
      return {
        valor: i,
        label: temAmostra ? `${rotulo} — ex: "${String(amostra).trim()}"` : rotulo,
        usadaPorOutro: Object.entries(mapeamento).some(([k, v]) => k !== campoAtual && v === i),
      }
    })
  }

  async function confirmarImportacao() {
    if (!mapeamentoCompleto) {
      toast.error('Selecione a coluna de todos os campos obrigatórios antes de importar.')
      return
    }
    if (itensImportacao.length === 0) {
      toast.error('Nenhuma linha de dado encontrada na planilha.')
      return
    }
    setImportando(true)
    try {
      const resultado = await api.post<ImportResultado>('/alimentos/importar', { itens: itensImportacao })
      setImportResult(resultado)
      if (resultado.criados > 0) carregar(busca)
      cancelarMapeamento()

      if (resultado.erros.length === 0) {
        toast.success(`${resultado.criados} alimento(s) importado(s) com sucesso!`)
      } else {
        toast.warning(`${resultado.criados} de ${resultado.total} importados — ${resultado.erros.length} com erro.`)
      }
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao importar planilha.')
    } finally {
      setImportando(false)
    }
  }

  return (
    <div className="px-4 py-5 md:p-8">
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold mb-1">Alimentos</h1>
          <p className="text-zinc-400 text-sm">{items.length} cadastrado(s) · valores por 100g</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={baixarModelo}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm px-3.5 py-2 rounded-lg transition-colors"
          >
            <Download size={15} /> Modelo .xlsx
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-medium text-sm px-3.5 py-2 rounded-lg transition-colors"
          >
            <Upload size={15} /> Importar planilha
          </button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={selecionarArquivo} />
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-zinc-900 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} /> Novo alimento
            </button>
          )}
        </div>
      </div>

      {/* Etapa de mapeamento de colunas, antes de importar de verdade */}
      {mapeando && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-6 space-y-5">
          <div>
            <h2 className="font-semibold text-sm text-zinc-200 uppercase tracking-wider">Confira o mapeamento de colunas</h2>
            <p className="text-xs text-zinc-500 mt-1">
              Sugerimos automaticamente pelo texto do cabeçalho — confira ou ajuste cada campo antes de importar.
            </p>
          </div>

          <div>
            <label className="text-xs text-zinc-400 block mb-1">Qual linha da planilha é o cabeçalho?</label>
            <select
              value={linhaCabecalhoIdx}
              onChange={e => selecionarLinhaCabecalho(Number(e.target.value))}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
            >
              {linhasCompletas.slice(0, 10).map((r, i) => {
                const resumo = r.filter(c => c !== undefined && String(c).trim() !== '').slice(0, 5).map(c => String(c).trim()).join(' | ')
                return (
                  <option key={i} value={i}>
                    Linha {i + 1}: {resumo || '(vazia)'}
                  </option>
                )
              })}
            </select>
            <p className="text-[11px] text-zinc-500 mt-1">
              Escolha a linha com os nomes das colunas (ex: "Categoria", "Alimento", "Calorias"...). Linhas de título ou observação acima dela são ignoradas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {CAMPOS.map(campo => (
              <div key={campo.chave}>
                <label className="text-xs text-zinc-400 block mb-1">
                  {campo.label}{campo.obrigatorio && <span className="text-red-400"> *</span>}
                </label>
                <select
                  value={mapeamento[campo.chave]}
                  onChange={e => setMapeamento(m => ({ ...m, [campo.chave]: e.target.value === '' ? '' : Number(e.target.value) }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                >
                  <option value="">— Não mapear —</option>
                  {opcoesColuna(campo.chave).map(op => (
                    <option key={op.valor} value={op.valor}>
                      {op.label}{op.usadaPorOutro ? ' (já usada em outro campo)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          <div>
            <p className="text-xs text-zinc-500 mb-2">
              Pré-visualização ({itensImportacao.length} linha{itensImportacao.length === 1 ? '' : 's'} encontrada{itensImportacao.length === 1 ? '' : 's'} na planilha)
            </p>
            <div className="border border-zinc-800 rounded-lg overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase tracking-wider">
                    <th className="text-left font-medium px-3 py-2">Linha</th>
                    <th className="text-left font-medium px-3 py-2">Nome</th>
                    <th className="text-left font-medium px-3 py-2">Categoria</th>
                    <th className="text-right font-medium px-3 py-2">Kcal</th>
                    <th className="text-right font-medium px-3 py-2">Carb</th>
                    <th className="text-right font-medium px-3 py-2">Prot</th>
                    <th className="text-right font-medium px-3 py-2">Gord</th>
                  </tr>
                </thead>
                <tbody>
                  {itensImportacao.slice(0, 5).map(it => (
                    <tr key={it.linha} className="border-b border-zinc-800/60 last:border-0">
                      <td className="px-3 py-1.5 text-zinc-500">{it.linha}</td>
                      <td className="px-3 py-1.5 text-zinc-100">{it.nome || <span className="text-red-400">(vazio)</span>}</td>
                      <td className="px-3 py-1.5 text-zinc-400">{it.categoria || '—'}</td>
                      <td className="px-3 py-1.5 text-right text-zinc-300">{it.caloriasKcal}</td>
                      <td className="px-3 py-1.5 text-right text-zinc-300">{it.carboidratosG}</td>
                      <td className="px-3 py-1.5 text-right text-zinc-300">{it.proteinasG}</td>
                      <td className="px-3 py-1.5 text-right text-zinc-300">{it.gordurasG}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {itensImportacao.length > 5 && (
                <p className="text-[11px] text-zinc-500 px-3 py-1.5">
                  + {itensImportacao.length - 5} linha(s) restante(s) não mostrada(s) aqui.
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={cancelarMapeamento}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <X size={15} /> Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarImportacao}
              disabled={!mapeamentoCompleto || importando || itensImportacao.length === 0}
              className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-zinc-900 font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
            >
              <ArrowRight size={15} />
              {importando ? 'Importando...' : `Confirmar e importar ${itensImportacao.length} alimento(s)`}
            </button>
          </div>
        </div>
      )}

      {importResult && (
        <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 mb-6 text-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="text-zinc-200">
              Importação: <strong className="text-green-400">{importResult.criados}</strong> de {importResult.total} linha(s) importada(s)
              {importResult.erros.length > 0 && <> · <strong className="text-red-400">{importResult.erros.length}</strong> com erro</>}
            </p>
            <button onClick={() => setImportResult(null)} className="text-zinc-500 hover:text-white">
              <X size={15} />
            </button>
          </div>
          {importResult.erros.length > 0 && (
            <ul className="text-xs text-red-300 space-y-0.5 max-h-32 overflow-y-auto">
              {importResult.erros.map((er, i) => (
                <li key={i}>Linha {er.linha}: {er.erro}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="relative mb-6 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          value={busca}
          onChange={e => setBusca(e.target.value)}
          placeholder="Buscar alimento..."
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
        />
      </div>

      {/* Formulário */}
      {showForm && (
        <form onSubmit={submit} className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-6 space-y-4">
          <h2 className="font-semibold text-sm text-zinc-300 uppercase tracking-wider">
            {editId ? 'Editar alimento' : 'Novo alimento'}
          </h2>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Nome</label>
              <input
                required
                value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                placeholder="Ex: Arroz branco cozido"
              />
            </div>
            <div>
              <label className="text-xs text-zinc-400 block mb-1">Categoria</label>
              <input
                value={form.categoria}
                onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                placeholder="Ex: Cereais"
              />
            </div>
          </div>

          <div>
            <p className="text-xs text-zinc-500 mb-1">Valores nutricionais por 100g</p>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Calorias (kcal)</label>
                <input
                  required type="number" step="0.01" min="0"
                  value={form.caloriasKcal}
                  onChange={e => setForm(f => ({ ...f, caloriasKcal: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Carboidratos (g)</label>
                <input
                  required type="number" step="0.01" min="0"
                  value={form.carboidratosG}
                  onChange={e => setForm(f => ({ ...f, carboidratosG: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Proteínas (g)</label>
                <input
                  required type="number" step="0.01" min="0"
                  value={form.proteinasG}
                  onChange={e => setForm(f => ({ ...f, proteinasG: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
              <div>
                <label className="text-xs text-zinc-400 block mb-1">Gorduras (g)</label>
                <input
                  required type="number" step="0.01" min="0"
                  value={form.gordurasG}
                  onChange={e => setForm(f => ({ ...f, gordurasG: e.target.value }))}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-yellow-400"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={cancelForm}
              className="flex items-center gap-1.5 px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <X size={15} /> Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-zinc-900 font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
            >
              <Check size={15} />
              {saving ? 'Salvando...' : editId ? 'Salvar alterações' : 'Criar alimento'}
            </button>
          </div>
        </form>
      )}

      {/* Lista */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-12 text-center">
          <p className="text-zinc-400">
            {busca ? 'Nenhum alimento encontrado para essa busca.' : 'Nenhum alimento cadastrado ainda. Crie o primeiro ou importe uma planilha!'}
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                  <th className="text-left font-medium px-4 py-3">Nome</th>
                  <th className="text-left font-medium px-4 py-3">Categoria</th>
                  <th className="text-right font-medium px-4 py-3">Kcal</th>
                  <th className="text-right font-medium px-4 py-3">Carb (g)</th>
                  <th className="text-right font-medium px-4 py-3">Prot (g)</th>
                  <th className="text-right font-medium px-4 py-3">Gord (g)</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {items.map(a => (
                  <tr key={a.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-zinc-100">{a.nome}</td>
                    <td className="px-4 py-3 text-zinc-400">{a.categoria || '—'}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">{Number(a.caloriasKcal)}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">{Number(a.carboidratosG)}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">{Number(a.proteinasG)}</td>
                    <td className="px-4 py-3 text-right text-zinc-300">{Number(a.gordurasG)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => startEdit(a)}
                          className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => remover(a)}
                          className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
