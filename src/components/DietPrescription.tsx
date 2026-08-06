
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { User, Calculator, Target, Save, Check, Info, Plus, X, ChevronLeft, ChevronRight, BookmarkPlus, FolderOpen, Utensils, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface DietPrescriptionProps {
  userName?: string;
  atletaId?: number;
}

interface DadosAtleta {
  idade: number | null;
  sexo: string | null;
  sexoAtualizadoEm: string | null;
  peso: string | null;
  altura: string | null;
  biometriaAtualizadoEm: string | null;
  modalidadeEsportiva: string | null;
  matriculaDesde: string | null;
  objetivos: string[];
  objetivoDescricao: string | null;
  alergiasIntolerancias: string | null;
  restricoesAlimentares: string | null;
  preferenciasAlimentares: string | null;
  rotinaAlimentar: string | null;
  anamneseAtualizadoEm: string | null;
}

interface Alimento {
  id: number;
  nome: string;
  categoria: string | null;
  caloriasKcal: string | number;
  carboidratosG: string | number;
  proteinasG: string | number;
  gordurasG: string | number;
}

interface ItemRefeicao {
  alimentoId: number;
  nome: string;
  caloriasKcal: number;
  carboidratosG: number;
  proteinasG: number;
  gordurasG: number;
  quantidadeGramas: number;
}

interface Refeicao {
  nome: string;
  horario: string;
  itens: ItemRefeicao[];
}

interface ModeloDietaResumo {
  id: number;
  titulo: string;
  descricao: string | null;
  categoria: string | null;
  calorias: number | null;
}

interface ModeloDietaCompleto extends ModeloDietaResumo {
  estrutura: { nome: string; horario?: string; itens: { alimentoId: number; quantidadeGramas: number }[] }[];
}

const SEXO_MAP: Record<string, string> = { Masculino: 'masculino', Feminino: 'feminino' };

// "75,5" ou "75.5kg" -> "75.5". Retorna '' se não achar número.
function toNumberString(v?: string | null): string {
  if (!v) return '';
  const n = parseFloat(v.replace(',', '.'));
  return isNaN(n) ? '' : String(n);
}

function formatData(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString('pt-BR') : '';
}

function arred(n: number): number {
  return Math.round(n * 10) / 10;
}

function calcularMacrosItem(item: ItemRefeicao) {
  const fator = item.quantidadeGramas / 100;
  return {
    calorias: arred(item.caloriasKcal * fator),
    carboidratos: arred(item.carboidratosG * fator),
    proteinas: arred(item.proteinasG * fator),
    gorduras: arred(item.gordurasG * fator),
  };
}

function somaMacros(lista: { calorias: number; carboidratos: number; proteinas: number; gorduras: number }[]) {
  return lista.reduce(
    (acc, m) => ({
      calorias: arred(acc.calorias + m.calorias),
      carboidratos: arred(acc.carboidratos + m.carboidratos),
      proteinas: arred(acc.proteinas + m.proteinas),
      gorduras: arred(acc.gorduras + m.gorduras),
    }),
    { calorias: 0, carboidratos: 0, proteinas: 0, gorduras: 0 }
  );
}

const FATORES_ATIVIDADE: Record<string, number> = {
  sedentario: 1.2, leve: 1.375, moderado: 1.55, intenso: 1.725, muitoIntenso: 1.9,
};

const MULTIPLICADORES_OBJETIVO: Record<string, number> = {
  manutencao: 1, 'perda-peso': 0.8, cutting: 0.75, 'ganho-massa': 1.15, performance: 1.1,
};

const SPLITS_OBJETIVO: Record<string, { p: number; c: number; g: number }> = {
  manutencao: { p: 0.25, c: 0.45, g: 0.30 },
  'perda-peso': { p: 0.35, c: 0.35, g: 0.30 },
  cutting: { p: 0.40, c: 0.30, g: 0.30 },
  'ganho-massa': { p: 0.30, c: 0.45, g: 0.25 },
  performance: { p: 0.28, c: 0.47, g: 0.25 },
};

const REFEICOES_PADRAO: Refeicao[] = [
  { nome: 'Café da Manhã', horario: '', itens: [] },
  { nome: 'Almoço', horario: '', itens: [] },
  { nome: 'Lanche', horario: '', itens: [] },
  { nome: 'Jantar', horario: '', itens: [] },
];

function BuscaAlimento({ onSelect }: { onSelect: (a: Alimento) => void }) {
  const [open, setOpen] = useState(false);
  const [busca, setBusca] = useState('');
  const { data: alimentos = [], isFetching } = useQuery<Alimento[]>({
    queryKey: ['alimentos-busca', busca],
    queryFn: () => api.get(`/alimentos?busca=${encodeURIComponent(busca)}`),
    enabled: open,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" size="sm" className="gap-1 text-gorila-primary border-gorila-primary/40">
          <Plus size={14} /> Adicionar alimento
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-80" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Buscar alimento..." value={busca} onValueChange={setBusca} />
          <CommandList>
            <CommandEmpty>
              {isFetching ? 'Buscando...' : busca ? 'Nenhum alimento encontrado.' : 'Digite para buscar no banco de alimentos.'}
            </CommandEmpty>
            {alimentos.map(a => (
              <CommandItem
                key={a.id}
                value={String(a.id)}
                onSelect={() => { onSelect(a); setOpen(false); setBusca(''); }}
                className="cursor-pointer"
              >
                <div className="flex flex-col py-0.5">
                  <span className="text-sm">{a.nome}</span>
                  <span className="text-[11px] text-gray-400">
                    {Number(a.caloriasKcal)} kcal · {Number(a.proteinasG)}g P · {Number(a.carboidratosG)}g C · {Number(a.gordurasG)}g G (por 100g)
                  </span>
                </div>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

const DietPrescription = ({ userName, atletaId }: DietPrescriptionProps) => {
  const qc = useQueryClient();
  const [step, setStep] = useState<1 | 2>(1);

  const [formData, setFormData] = useState({
    peso: '',
    altura: '',
    idade: '',
    sexo: '',
    nivelAtividade: '',
    formula: 'mifflin' as 'mifflin' | 'harris',
    modalidadeEsportiva: '',
    objetivo: '',
    restricoes: '',
    calorias: '',
    proteinas: '',
    carboidratos: '',
    gorduras: '',
  });
  const [resultado, setResultado] = useState<{ tmb: number; get: number } | null>(null);

  const [refeicoes, setRefeicoes] = useState<Refeicao[]>(REFEICOES_PADRAO);
  const [observacoes, setObservacoes] = useState('');
  const [novaRefeicaoNome, setNovaRefeicaoNome] = useState('');

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dadosAtleta, setDadosAtleta] = useState<DadosAtleta | null>(null);
  const [loadingDados, setLoadingDados] = useState(false);

  const modalidadesEsportivas = [
    'Atletismo', 'Boxe', 'Futebol', 'Vôlei', 'Basquete', 'Natação',
    'Musculação', 'CrossFit', 'Ciclismo', 'Corrida', 'Outro'
  ];

  const opcoesModalidade = dadosAtleta?.modalidadeEsportiva && !modalidadesEsportivas.includes(dadosAtleta.modalidadeEsportiva)
    ? [dadosAtleta.modalidadeEsportiva, ...modalidadesEsportivas]
    : modalidadesEsportivas;

  useEffect(() => {
    if (!atletaId) { setDadosAtleta(null); return; }
    setLoadingDados(true);
    api.get<DadosAtleta>(`/dieta/dados-atleta/${atletaId}`)
      .then(dados => {
        setDadosAtleta(dados);
        setFormData(prev => ({
          ...prev,
          idade: dados.idade != null ? String(dados.idade) : prev.idade,
          sexo: dados.sexo ? (SEXO_MAP[dados.sexo] ?? prev.sexo) : prev.sexo,
          peso: toNumberString(dados.peso) || prev.peso,
          altura: toNumberString(dados.altura) || prev.altura,
          modalidadeEsportiva: dados.modalidadeEsportiva ?? prev.modalidadeEsportiva,
          restricoes: dados.restricoesAlimentares || prev.restricoes,
        }));
      })
      .catch(() => setDadosAtleta(null))
      .finally(() => setLoadingDados(false));
  }, [atletaId]);

  // ── Passo 1: Calculadora TMB/GET ────────────────────────────────────────────

  const calcularTMBGET = () => {
    const peso = parseFloat(formData.peso);
    const altura = parseFloat(formData.altura);
    const idade = parseInt(formData.idade, 10);
    if (!peso || !altura || !idade || !formData.sexo || !formData.nivelAtividade || !formData.objetivo) return;

    const tmb = formData.formula === 'mifflin'
      ? (formData.sexo === 'masculino' ? 10 * peso + 6.25 * altura - 5 * idade + 5 : 10 * peso + 6.25 * altura - 5 * idade - 161)
      : (formData.sexo === 'masculino'
        ? 88.362 + 13.397 * peso + 4.799 * altura - 5.677 * idade
        : 447.593 + 9.247 * peso + 3.098 * altura - 4.330 * idade);

    const fatorAtividade = FATORES_ATIVIDADE[formData.nivelAtividade] ?? 1.2;
    const get = tmb * fatorAtividade;
    const metaCalorica = Math.round(get * (MULTIPLICADORES_OBJETIVO[formData.objetivo] ?? 1));
    const split = SPLITS_OBJETIVO[formData.objetivo] ?? SPLITS_OBJETIVO.manutencao;

    setResultado({ tmb: Math.round(tmb), get: Math.round(get) });
    setFormData(prev => ({
      ...prev,
      calorias: String(metaCalorica),
      proteinas: String(Math.round((metaCalorica * split.p) / 4)),
      carboidratos: String(Math.round((metaCalorica * split.c) / 4)),
      gorduras: String(Math.round((metaCalorica * split.g) / 9)),
    }));
  };

  // ── Passo 2: Montagem por refeições ─────────────────────────────────────────

  const { data: modelos = [] } = useQuery<ModeloDietaResumo[]>({
    queryKey: ['dieta-modelos'],
    queryFn: () => api.get('/dieta/modelos'),
  });

  const [modeloSelecionadoId, setModeloSelecionadoId] = useState('');

  const carregarModelo = async (id: string) => {
    try {
      const modelo = await api.get<ModeloDietaCompleto>(`/dieta/modelos/${id}`);
      const todosAlimentos = await api.get<Alimento[]>('/alimentos');
      const mapa = new Map(todosAlimentos.map(a => [a.id, a]));
      const novasRefeicoes: Refeicao[] = modelo.estrutura.map(r => ({
        nome: r.nome,
        horario: r.horario ?? '',
        itens: r.itens
          .map(i => {
            const a = mapa.get(i.alimentoId);
            if (!a) return null;
            return {
              alimentoId: a.id,
              nome: a.nome,
              caloriasKcal: Number(a.caloriasKcal),
              carboidratosG: Number(a.carboidratosG),
              proteinasG: Number(a.proteinasG),
              gordurasG: Number(a.gordurasG),
              quantidadeGramas: i.quantidadeGramas,
            };
          })
          .filter((i): i is ItemRefeicao => i !== null),
      }));
      setRefeicoes(novasRefeicoes.length ? novasRefeicoes : REFEICOES_PADRAO);
      toast.success(`Modelo "${modelo.titulo}" carregado`);
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao carregar modelo.');
    }
  };

  const [tituloModelo, setTituloModelo] = useState('');
  const salvarModelo = useMutation({
    mutationFn: () => api.post('/dieta/modelos', {
      titulo: tituloModelo,
      calorias: formData.calorias ? Math.round(Number(formData.calorias)) : undefined,
      estrutura: refeicoes.map(r => ({
        nome: r.nome,
        horario: r.horario || undefined,
        itens: r.itens.map(i => ({ alimentoId: i.alimentoId, quantidadeGramas: i.quantidadeGramas })),
      })),
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dieta-modelos'] });
      setTituloModelo('');
      toast.success('Modelo salvo na biblioteca!');
    },
    onError: (e: any) => toast.error(e.message ?? 'Erro ao salvar modelo.'),
  });

  const prescreverDeModelo = useMutation({
    mutationFn: (modeloId: string) => api.post(`/dieta/modelos/${modeloId}/prescrever`, {
      atletaId,
      peso: parseFloat(formData.peso),
      altura: parseFloat(formData.altura),
      idade: parseInt(formData.idade, 10),
      sexo: formData.sexo,
      nivelAtividade: formData.nivelAtividade,
      modalidadeEsportiva: formData.modalidadeEsportiva || undefined,
      objetivo: formData.objetivo,
      restricoes: formData.restricoes || undefined,
      calorias: Math.round(Number(formData.calorias)),
      proteinas: Math.round(Number(formData.proteinas)),
      carboidratos: Math.round(Number(formData.carboidratos)),
      gorduras: Math.round(Number(formData.gorduras)),
      agua: Math.round((parseFloat(formData.peso) || 0) * 35),
      recomendacao: observacoes || undefined,
    }),
    onSuccess: () => {
      setSaved(true);
      toast.success('Prescrição criada a partir do modelo! O atleta já pode ver no painel dele.');
    },
    onError: (e: any) => toast.error(e.message ?? 'Erro ao prescrever a partir do modelo.'),
  });

  const adicionarItem = (mealIndex: number, alimento: Alimento) => {
    setRefeicoes(prev => prev.map((r, idx) => idx !== mealIndex ? r : {
      ...r,
      itens: [...r.itens, {
        alimentoId: alimento.id,
        nome: alimento.nome,
        caloriasKcal: Number(alimento.caloriasKcal),
        carboidratosG: Number(alimento.carboidratosG),
        proteinasG: Number(alimento.proteinasG),
        gordurasG: Number(alimento.gordurasG),
        quantidadeGramas: 100,
      }],
    }));
  };

  const removerItem = (mealIndex: number, itemIndex: number) => {
    setRefeicoes(prev => prev.map((r, idx) => idx !== mealIndex ? r : {
      ...r, itens: r.itens.filter((_, i) => i !== itemIndex),
    }));
  };

  const atualizarQuantidade = (mealIndex: number, itemIndex: number, quantidade: number) => {
    setRefeicoes(prev => prev.map((r, idx) => idx !== mealIndex ? r : {
      ...r, itens: r.itens.map((it, i) => i !== itemIndex ? it : { ...it, quantidadeGramas: quantidade }),
    }));
  };

  const atualizarRefeicao = (mealIndex: number, campo: 'nome' | 'horario', valor: string) => {
    setRefeicoes(prev => prev.map((r, idx) => idx !== mealIndex ? r : { ...r, [campo]: valor }));
  };

  const removerRefeicao = (mealIndex: number) => {
    setRefeicoes(prev => prev.filter((_, idx) => idx !== mealIndex));
  };

  const adicionarRefeicao = () => {
    if (!novaRefeicaoNome.trim()) return;
    setRefeicoes(prev => [...prev, { nome: novaRefeicaoNome.trim(), horario: '', itens: [] }]);
    setNovaRefeicaoNome('');
  };

  const totaisPorRefeicao = refeicoes.map(r => somaMacros(r.itens.map(calcularMacrosItem)));
  const totalDia = somaMacros(totaisPorRefeicao);

  const salvarPrescricao = async () => {
    if (!atletaId) return;
    setSaving(true);
    try {
      await api.post('/dieta/completa', {
        atletaId,
        peso: parseFloat(formData.peso),
        altura: parseFloat(formData.altura),
        idade: parseInt(formData.idade, 10),
        sexo: formData.sexo,
        nivelAtividade: formData.nivelAtividade,
        modalidadeEsportiva: formData.modalidadeEsportiva || undefined,
        objetivo: formData.objetivo,
        restricoes: formData.restricoes || undefined,
        calorias: Math.round(Number(formData.calorias)),
        proteinas: Math.round(Number(formData.proteinas)),
        carboidratos: Math.round(Number(formData.carboidratos)),
        gorduras: Math.round(Number(formData.gorduras)),
        agua: Math.round((parseFloat(formData.peso) || 0) * 35),
        recomendacao: observacoes || undefined,
        refeicoes: refeicoes.map((r, idx) => ({
          nome: r.nome,
          horario: r.horario || undefined,
          ordem: idx,
          itens: r.itens.map((i, iidx) => ({ alimentoId: i.alimentoId, quantidadeGramas: i.quantidadeGramas, ordem: iidx })),
        })),
      });
      setSaved(true);
      toast.success('Prescrição salva! O atleta já pode ver no painel dele.');
    } catch (e: any) {
      toast.error(e.message ?? 'Erro ao salvar prescrição.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="text-gorila-primary" size={24} />
            <CardTitle className="text-gorila-primary">Sistema de Prescrição de Dieta</CardTitle>
          </div>
          <CardDescription>
            {userName ? `Prescrição personalizada para ${userName}` : 'Crie sua prescrição nutricional personalizada'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {atletaId && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded p-2.5 text-xs text-blue-800">
              <Info size={14} className="mt-0.5 shrink-0" />
              {loadingDados ? (
                <span>Carregando dados já cadastrados do atleta...</span>
              ) : dadosAtleta ? (
                <div className="space-y-0.5">
                  <p>Dados pré-preenchidos a partir da ficha do atleta — confira antes de gerar.</p>
                  <ul className="text-[11px] text-blue-700 space-y-0.5">
                    {dadosAtleta.biometriaAtualizadoEm ? (
                      <li>Peso/altura (biometria): atualizado em {formatData(dadosAtleta.biometriaAtualizadoEm)}</li>
                    ) : (
                      <li>Peso/altura: não cadastrado na biometria — preencha manualmente</li>
                    )}
                    {dadosAtleta.sexoAtualizadoEm ? (
                      <li>Sexo (anamnese): atualizado em {formatData(dadosAtleta.sexoAtualizadoEm)}</li>
                    ) : (
                      <li>Sexo: não informado na anamnese — preencha manualmente</li>
                    )}
                    {dadosAtleta.modalidadeEsportiva && dadosAtleta.matriculaDesde && (
                      <li>Modalidade (matrícula ativa desde {formatData(dadosAtleta.matriculaDesde)}): {dadosAtleta.modalidadeEsportiva}</li>
                    )}
                    <li>
                      Objetivo (anamnese): {dadosAtleta.objetivos?.length ? dadosAtleta.objetivos.join(', ') : '—'}
                      {dadosAtleta.objetivoDescricao ? ` — "${dadosAtleta.objetivoDescricao}"` : ''}
                      {!dadosAtleta.objetivos?.length && !dadosAtleta.objetivoDescricao && ' não informado na anamnese'}
                    </li>
                    <li>Alergias/intolerâncias: {dadosAtleta.alergiasIntolerancias || 'não informado na anamnese'}</li>
                    <li>Restrições alimentares: {dadosAtleta.restricoesAlimentares || 'não informado na anamnese'}</li>
                    <li>Preferências alimentares: {dadosAtleta.preferenciasAlimentares || 'não informado na anamnese'}</li>
                    <li>Rotina/horários das refeições: {dadosAtleta.rotinaAlimentar || 'não informado na anamnese'}</li>
                  </ul>
                </div>
              ) : (
                <span>Não foi possível carregar dados cadastrados do atleta — preencha manualmente.</span>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 text-xs font-medium">
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${step === 1 ? 'bg-gorila-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
              <Calculator size={13} /> 1. Calculadora TMB/GET
            </span>
            <div className="flex-1 h-px bg-gray-200" />
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${step === 2 ? 'bg-gorila-primary text-white' : 'bg-gray-100 text-gray-500'}`}>
              <Utensils size={13} /> 2. Montagem da Dieta
            </span>
          </div>

          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gorila-primary">Dados Pessoais</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input id="peso" type="number" value={formData.peso} onChange={(e) => setFormData({ ...formData, peso: e.target.value })} placeholder="70" />
                  </div>
                  <div>
                    <Label htmlFor="altura">Altura (cm)</Label>
                    <Input id="altura" type="number" value={formData.altura} onChange={(e) => setFormData({ ...formData, altura: e.target.value })} placeholder="175" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="idade">Idade</Label>
                    <Input id="idade" type="number" value={formData.idade} onChange={(e) => setFormData({ ...formData, idade: e.target.value })} placeholder="25" />
                  </div>
                  <div>
                    <Label htmlFor="sexo">Sexo</Label>
                    <Select value={formData.sexo} onValueChange={(value) => setFormData({ ...formData, sexo: value })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="atividade">Fator de Atividade</Label>
                    <Select value={formData.nivelAtividade} onValueChange={(value) => setFormData({ ...formData, nivelAtividade: value })}>
                      <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentario">Sedentário</SelectItem>
                        <SelectItem value="leve">Atividade Leve</SelectItem>
                        <SelectItem value="moderado">Atividade Moderada</SelectItem>
                        <SelectItem value="intenso">Atividade Intensa</SelectItem>
                        <SelectItem value="muitoIntenso">Muito Intenso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="formula">Fórmula</Label>
                    <Select value={formData.formula} onValueChange={(value: 'mifflin' | 'harris') => setFormData({ ...formData, formula: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mifflin">Mifflin-St Jeor</SelectItem>
                        <SelectItem value="harris">Harris-Benedict</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="modalidade">Modalidade Esportiva</Label>
                  <Select value={formData.modalidadeEsportiva} onValueChange={(value) => setFormData({ ...formData, modalidadeEsportiva: value })}>
                    <SelectTrigger><SelectValue placeholder="Selecione sua modalidade" /></SelectTrigger>
                    <SelectContent>
                      {opcoesModalidade.map((modalidade) => (
                        <SelectItem key={modalidade} value={modalidade}>{modalidade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="objetivo">Objetivo</Label>
                  <Select value={formData.objetivo} onValueChange={(value) => setFormData({ ...formData, objetivo: value })}>
                    <SelectTrigger><SelectValue placeholder="Selecione o objetivo" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manutencao">Manutenção de Peso</SelectItem>
                      <SelectItem value="perda-peso">Perda de Peso</SelectItem>
                      <SelectItem value="ganho-massa">Ganho de Massa Muscular</SelectItem>
                      <SelectItem value="cutting">Cutting (Definição)</SelectItem>
                      <SelectItem value="performance">Melhora de Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="restricoes">Restrições Alimentares</Label>
                  <Textarea id="restricoes" value={formData.restricoes} onChange={(e) => setFormData({ ...formData, restricoes: e.target.value })} placeholder="Ex: Intolerância à lactose, vegetariano..." />
                </div>
                <Button
                  type="button"
                  onClick={calcularTMBGET}
                  className="w-full bg-gorila-primary hover:bg-gorila-dark text-white gap-2"
                  disabled={!formData.peso || !formData.altura || !formData.idade || !formData.sexo || !formData.nivelAtividade || !formData.objetivo}
                >
                  <Calculator size={16} /> Calcular TMB / GET
                </Button>
              </div>

              <div className="space-y-4">
                {resultado ? (
                  <div className="bg-gorila-primary/5 p-6 rounded-lg space-y-4">
                    <h3 className="text-lg font-semibold text-gorila-primary flex items-center">
                      <Target className="mr-2" size={20} /> Metas Calóricas
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded border text-center">
                        <p className="text-xs text-gray-500">TMB (Taxa Metabólica Basal)</p>
                        <p className="text-gorila-primary font-bold text-lg">{resultado.tmb} kcal</p>
                      </div>
                      <div className="p-3 bg-white rounded border text-center">
                        <p className="text-xs text-gray-500">GET (Gasto Energético Total)</p>
                        <p className="text-gorila-primary font-bold text-lg">{resultado.get} kcal</p>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="metaCalorica">Meta calórica diária (editável)</Label>
                      <Input id="metaCalorica" type="number" value={formData.calorias} onChange={(e) => setFormData({ ...formData, calorias: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="metaProt" className="text-xs">Proteínas (g)</Label>
                        <Input id="metaProt" type="number" value={formData.proteinas} onChange={(e) => setFormData({ ...formData, proteinas: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="metaCarbo" className="text-xs">Carboidratos (g)</Label>
                        <Input id="metaCarbo" type="number" value={formData.carboidratos} onChange={(e) => setFormData({ ...formData, carboidratos: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor="metaGord" className="text-xs">Gorduras (g)</Label>
                        <Input id="metaGord" type="number" value={formData.gorduras} onChange={(e) => setFormData({ ...formData, gorduras: e.target.value })} />
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full bg-gorila-primary hover:bg-gorila-dark text-white gap-2"
                      disabled={!atletaId}
                    >
                      Avançar para Montagem da Dieta <ChevronRight size={16} />
                    </Button>
                    {!atletaId && <p className="text-xs text-gray-400 text-center">Selecione um atleta para montar a dieta.</p>}
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <Calculator className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-600">Preencha os dados e clique em "Calcular TMB / GET"</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Button type="button" variant="outline" size="sm" onClick={() => setStep(1)} className="gap-1">
                  <ChevronLeft size={14} /> Voltar para metas
                </Button>
                <div className="text-xs text-gray-500">
                  Meta: <strong>{formData.calorias || 0} kcal</strong> · Montado: <strong className={Math.abs(totalDia.calorias - Number(formData.calorias || 0)) > 150 ? 'text-amber-600' : 'text-green-600'}>{totalDia.calorias} kcal</strong>
                </div>
              </div>

              <div className="flex flex-wrap items-end gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-xs flex items-center gap-1"><FolderOpen size={13} /> Carregar modelo</Label>
                  <Select onValueChange={(id) => { setModeloSelecionadoId(id); carregarModelo(id); }}>
                    <SelectTrigger><SelectValue placeholder="Selecione um modelo salvo" /></SelectTrigger>
                    <SelectContent>
                      {modelos.map(m => (
                        <SelectItem key={m.id} value={String(m.id)}>{m.titulo}{m.calorias ? ` (${m.calorias}kcal)` : ''}</SelectItem>
                      ))}
                      {modelos.length === 0 && <div className="px-2 py-1.5 text-xs text-gray-400">Nenhum modelo salvo ainda</div>}
                    </SelectContent>
                  </Select>
                  {modeloSelecionadoId && atletaId && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="gap-1 mt-2 w-full text-gorila-primary border-gorila-primary/40"
                      disabled={prescreverDeModelo.isPending || saved}
                      onClick={() => prescreverDeModelo.mutate(modeloSelecionadoId)}
                    >
                      <Zap size={14} /> {prescreverDeModelo.isPending ? 'Prescrevendo...' : 'Prescrever direto com este modelo'}
                    </Button>
                  )}
                </div>
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-xs">Salvar dieta atual como modelo</Label>
                  <div className="flex gap-2">
                    <Input value={tituloModelo} onChange={(e) => setTituloModelo(e.target.value)} placeholder='Ex: "Dieta Hipertrofia 2500kcal"' />
                    <Button type="button" size="sm" variant="outline" className="gap-1 shrink-0" disabled={!tituloModelo.trim() || salvarModelo.isPending} onClick={() => salvarModelo.mutate()}>
                      <BookmarkPlus size={14} /> Salvar
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {refeicoes.map((refeicao, mealIndex) => {
                  const totais = totaisPorRefeicao[mealIndex];
                  return (
                    <Card key={mealIndex} className="border-gray-200">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <Input
                            value={refeicao.nome}
                            onChange={(e) => atualizarRefeicao(mealIndex, 'nome', e.target.value)}
                            className="font-semibold text-gorila-primary border-none px-0 h-auto text-base focus-visible:ring-0"
                          />
                          <Input
                            type="time"
                            value={refeicao.horario}
                            onChange={(e) => atualizarRefeicao(mealIndex, 'horario', e.target.value)}
                            className="w-32"
                          />
                          <Button type="button" variant="ghost" size="icon" className="ml-auto text-gray-400 hover:text-red-500" onClick={() => removerRefeicao(mealIndex)}>
                            <X size={16} />
                          </Button>
                        </div>

                        {refeicao.itens.length > 0 && (
                          <div className="space-y-1.5">
                            {refeicao.itens.map((item, itemIndex) => {
                              const macros = calcularMacrosItem(item);
                              return (
                                <div key={itemIndex} className="flex items-center gap-2 text-sm bg-gray-50 rounded px-2 py-1.5">
                                  <span className="flex-1 truncate">{item.nome}</span>
                                  <Input
                                    type="number"
                                    value={item.quantidadeGramas}
                                    onChange={(e) => atualizarQuantidade(mealIndex, itemIndex, Number(e.target.value) || 0)}
                                    className="w-20 h-7 text-xs"
                                  />
                                  <span className="text-[11px] text-gray-500 w-8">g</span>
                                  <span className="text-[11px] text-gray-500 w-44 shrink-0">
                                    {macros.calorias}kcal · {macros.proteinas}P · {macros.carboidratos}C · {macros.gorduras}G
                                  </span>
                                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-500" onClick={() => removerItem(mealIndex, itemIndex)}>
                                    <X size={13} />
                                  </Button>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-1">
                          <BuscaAlimento onSelect={(a) => adicionarItem(mealIndex, a)} />
                          <span className="text-xs font-medium text-gray-600">
                            Total: {totais.calorias}kcal · {totais.proteinas}g P · {totais.carboidratos}g C · {totais.gorduras}g G
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex items-center gap-2">
                <Input value={novaRefeicaoNome} onChange={(e) => setNovaRefeicaoNome(e.target.value)} placeholder="Nome da refeição (ex: Ceia)" onKeyDown={(e) => e.key === 'Enter' && adicionarRefeicao()} />
                <Button type="button" variant="outline" size="sm" className="gap-1 shrink-0" onClick={adicionarRefeicao} disabled={!novaRefeicaoNome.trim()}>
                  <Plus size={14} /> Adicionar refeição
                </Button>
              </div>

              <div className="bg-gorila-primary/5 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gorila-primary mb-2">Total do Dia</h4>
                <div className="grid grid-cols-4 gap-3">
                  <div className="p-2 bg-white rounded border text-center">
                    <p className="text-[11px] text-gray-500">Calorias</p>
                    <p className="font-bold text-gorila-primary">{totalDia.calorias} kcal</p>
                  </div>
                  <div className="p-2 bg-white rounded border text-center">
                    <p className="text-[11px] text-gray-500">Proteínas</p>
                    <p className="font-bold text-gorila-primary">{totalDia.proteinas}g</p>
                  </div>
                  <div className="p-2 bg-white rounded border text-center">
                    <p className="text-[11px] text-gray-500">Carboidratos</p>
                    <p className="font-bold text-gorila-primary">{totalDia.carboidratos}g</p>
                  </div>
                  <div className="p-2 bg-white rounded border text-center">
                    <p className="text-[11px] text-gray-500">Gorduras</p>
                    <p className="font-bold text-gorila-primary">{totalDia.gorduras}g</p>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="observacoes">Observações e Orientações Gerais</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Ex: orientações sobre suplementação, hidratação, substituições permitidas..."
                  rows={3}
                />
              </div>

              {atletaId && (
                <Button
                  type="button"
                  onClick={salvarPrescricao}
                  disabled={saving || saved}
                  className="w-full bg-gorila-primary hover:bg-gorila-dark text-white gap-2"
                >
                  {saved ? <><Check size={16} /> Salvo — atleta já pode ver no painel</> : <><Save size={16} /> {saving ? 'Salvando...' : 'Salvar Prescrição Completa'}</>}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DietPrescription;
