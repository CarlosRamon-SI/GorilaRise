
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { User, Calculator, Target, Save, Check } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from 'sonner';

interface DietPrescriptionProps {
  userName?: string;
  atletaId?: number;
}

const DietPrescription = ({ userName, atletaId }: DietPrescriptionProps) => {
  const [formData, setFormData] = useState({
    peso: '',
    altura: '',
    idade: '',
    sexo: '',
    nivelAtividade: '',
    biotipo: '',
    modalidadeEsportiva: '',
    objetivo: '',
    restricoes: '',
    preferencias: ''
  });

  const [prescription, setPrescription] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const modalidadesEsportivas = [
    'Atletismo', 'Boxe', 'Futebol', 'Vôlei', 'Basquete', 'Natação', 
    'Musculação', 'CrossFit', 'Ciclismo', 'Corrida', 'Outro'
  ];

  const calculateDiet = () => {
    const peso = parseFloat(formData.peso);
    const altura = parseFloat(formData.altura);
    const idade = parseInt(formData.idade);

    // Cálculo básico do TMB
    let tmb = 0;
    if (formData.sexo === 'masculino') {
      tmb = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * idade);
    } else {
      tmb = 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * idade);
    }

    // Fator de atividade
    const fatores = {
      sedentario: 1.2,
      leve: 1.375,
      moderado: 1.55,
      intenso: 1.725,
      muitoIntenso: 1.9
    };

    const fatorAtividade = fatores[formData.nivelAtividade as keyof typeof fatores] || 1.2;
    let caloriasDiarias = Math.round(tmb * fatorAtividade);

    // Ajustes por modalidade esportiva
    const ajustesModalidade = {
      'Atletismo': 1.1,
      'Boxe': 1.15,
      'Futebol': 1.12,
      'Vôlei': 1.08,
      'Basquete': 1.1,
      'Natação': 1.2,
      'Musculação': 1.05,
      'CrossFit': 1.18,
      'Ciclismo': 1.15,
      'Corrida': 1.12
    };

    if (formData.modalidadeEsportiva && ajustesModalidade[formData.modalidadeEsportiva as keyof typeof ajustesModalidade]) {
      caloriasDiarias = Math.round(caloriasDiarias * ajustesModalidade[formData.modalidadeEsportiva as keyof typeof ajustesModalidade]);
    }

    // Ajuste por objetivo
    let caloriasObjetivo = caloriasDiarias;
    if (formData.objetivo === 'perda-peso') {
      caloriasObjetivo = Math.round(caloriasDiarias * 0.8);
    } else if (formData.objetivo === 'ganho-massa') {
      caloriasObjetivo = Math.round(caloriasDiarias * 1.2);
    } else if (formData.objetivo === 'cutting') {
      caloriasObjetivo = Math.round(caloriasDiarias * 0.75);
    } else if (formData.objetivo === 'performance') {
      caloriasObjetivo = Math.round(caloriasDiarias * 1.1);
    }

    // Distribuição de macronutrientes baseada no biotipo e objetivo
    let proteinasPorcentagem = 0.25;
    let carboidratosPorcentagem = 0.45;
    let gordurasPorcentagem = 0.30;

    // Ajustes por biotipo
    if (formData.biotipo === 'ectomorfo') {
      carboidratosPorcentagem = 0.50;
      proteinasPorcentagem = 0.25;
      gordurasPorcentagem = 0.25;
    } else if (formData.biotipo === 'endomorfo') {
      carboidratosPorcentagem = 0.35;
      proteinasPorcentagem = 0.30;
      gordurasPorcentagem = 0.35;
    } else if (formData.biotipo === 'mesomorfo') {
      carboidratosPorcentagem = 0.40;
      proteinasPorcentagem = 0.30;
      gordurasPorcentagem = 0.30;
    }

    // Ajustes específicos por objetivo
    if (formData.objetivo === 'ganho-massa' || formData.objetivo === 'performance') {
      proteinasPorcentagem = Math.min(proteinasPorcentagem + 0.05, 0.35);
    } else if (formData.objetivo === 'cutting') {
      proteinasPorcentagem = Math.min(proteinasPorcentagem + 0.10, 0.40);
      carboidratosPorcentagem = Math.max(carboidratosPorcentagem - 0.10, 0.25);
    }

    const proteinas = Math.round((caloriasObjetivo * proteinasPorcentagem) / 4);
    const carboidratos = Math.round((caloriasObjetivo * carboidratosPorcentagem) / 4);
    const gorduras = Math.round((caloriasObjetivo * gordurasPorcentagem) / 9);

    // Recomendações específicas por modalidade
    const recomendacoes = {
      'Atletismo': 'Foque em carboidratos complexos 2-3h antes do treino',
      'Boxe': 'Hidratação constante e proteínas pós-treino',
      'Futebol': 'Carboidratos durante jogos longos',
      'Natação': 'Maior necessidade calórica devido ao gasto energético',
      'Musculação': 'Proteínas distribuídas ao longo do dia',
      'CrossFit': 'Balance entre todos os macronutrientes',
      'Ciclismo': 'Carboidratos para energia sustentada',
      'Corrida': 'Hidratação e reposição de eletrólitos'
    };

    setSaved(false);
    setPrescription({
      calorias: caloriasObjetivo,
      proteinas,
      carboidratos,
      gorduras,
      agua: Math.round(peso * 35),
      recomendacao: recomendacoes[formData.modalidadeEsportiva as keyof typeof recomendacoes] || 'Mantenha uma alimentação equilibrada'
    });
  };

  const salvarPrescricao = async () => {
    if (!atletaId || !prescription) return;
    setSaving(true);
    try {
      await api.post('/dieta', {
        atletaId,
        peso: parseFloat(formData.peso),
        altura: parseFloat(formData.altura),
        idade: parseInt(formData.idade),
        sexo: formData.sexo,
        nivelAtividade: formData.nivelAtividade,
        biotipo: formData.biotipo,
        modalidadeEsportiva: formData.modalidadeEsportiva || undefined,
        objetivo: formData.objetivo,
        restricoes: formData.restricoes || undefined,
        calorias: prescription.calorias,
        proteinas: prescription.proteinas,
        carboidratos: prescription.carboidratos,
        gorduras: prescription.gorduras,
        agua: prescription.agua,
        recomendacao: prescription.recomendacao,
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
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gorila-primary">Dados Pessoais</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="peso">Peso (kg)</Label>
                  <Input
                    id="peso"
                    type="number"
                    value={formData.peso}
                    onChange={(e) => setFormData({...formData, peso: e.target.value})}
                    placeholder="70"
                  />
                </div>
                <div>
                  <Label htmlFor="altura">Altura (cm)</Label>
                  <Input
                    id="altura"
                    type="number"
                    value={formData.altura}
                    onChange={(e) => setFormData({...formData, altura: e.target.value})}
                    placeholder="175"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="idade">Idade</Label>
                  <Input
                    id="idade"
                    type="number"
                    value={formData.idade}
                    onChange={(e) => setFormData({...formData, idade: e.target.value})}
                    placeholder="25"
                  />
                </div>
                <div>
                  <Label htmlFor="sexo">Sexo</Label>
                  <Select value={formData.sexo} onValueChange={(value) => setFormData({...formData, sexo: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="feminino">Feminino</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="atividade">Nível de Atividade</Label>
                <Select value={formData.nivelAtividade} onValueChange={(value) => setFormData({...formData, nivelAtividade: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu nível" />
                  </SelectTrigger>
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
                <Label htmlFor="biotipo">Biotipo</Label>
                <Select value={formData.biotipo} onValueChange={(value) => setFormData({...formData, biotipo: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione seu biotipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ectomorfo">Ectomorfo (Magro, dificuldade para ganhar peso)</SelectItem>
                    <SelectItem value="mesomorfo">Mesomorfo (Atlético, ganha e perde peso facilmente)</SelectItem>
                    <SelectItem value="endomorfo">Endomorfo (Tendência a ganhar peso, metabolismo lento)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="modalidade">Modalidade Esportiva</Label>
                <Select value={formData.modalidadeEsportiva} onValueChange={(value) => setFormData({...formData, modalidadeEsportiva: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione sua modalidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {modalidadesEsportivas.map((modalidade) => (
                      <SelectItem key={modalidade} value={modalidade}>{modalidade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="objetivo">Objetivo</Label>
                <Select value={formData.objetivo} onValueChange={(value) => setFormData({...formData, objetivo: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seu objetivo" />
                  </SelectTrigger>
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
                <Textarea
                  id="restricoes"
                  value={formData.restricoes}
                  onChange={(e) => setFormData({...formData, restricoes: e.target.value})}
                  placeholder="Ex: Intolerância à lactose, vegetariano..."
                />
              </div>
            </div>

            <div className="space-y-4">
              {prescription ? (
                <div className="bg-gorila-primary/5 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gorila-primary mb-4 flex items-center">
                    <Target className="mr-2" size={20} />
                    Sua Prescrição Nutricional
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded border">
                      <span className="font-medium">Calorias Diárias:</span>
                      <span className="text-gorila-primary font-bold">{prescription.calorias} kcal</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded border">
                      <span className="font-medium">Proteínas:</span>
                      <span className="text-gorila-primary font-bold">{prescription.proteinas}g</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded border">
                      <span className="font-medium">Carboidratos:</span>
                      <span className="text-gorila-primary font-bold">{prescription.carboidratos}g</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded border">
                      <span className="font-medium">Gorduras:</span>
                      <span className="text-gorila-primary font-bold">{prescription.gorduras}g</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-white rounded border">
                      <span className="font-medium">Água:</span>
                      <span className="text-gorila-primary font-bold">{prescription.agua}ml</span>
                    </div>
                  </div>

                  {prescription.recomendacao && (
                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Recomendação Específica:</strong> {prescription.recomendacao}
                      </p>
                    </div>
                  )}

                  <div className="mt-4 p-3 bg-gorila-yellow/20 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Observação:</strong> Esta prescrição considera seu biotipo ({formData.biotipo}) e modalidade esportiva ({formData.modalidadeEsportiva}). Consulte um nutricionista para um plano detalhado.
                    </p>
                  </div>

                  {atletaId && (
                    <Button
                      onClick={salvarPrescricao}
                      disabled={saving || saved}
                      className="w-full mt-4 bg-gorila-primary hover:bg-gorila-dark text-white gap-2"
                    >
                      {saved ? <><Check size={16} /> Salvo — atleta já pode ver no painel</> : <><Save size={16} /> {saving ? 'Salvando...' : 'Salvar prescrição para o atleta'}</>}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="text-center p-8">
                  <Calculator className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">Preencha os dados para gerar sua prescrição</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button 
              onClick={calculateDiet}
              className="bg-gorila-primary hover:bg-gorila-dark text-white px-8"
              disabled={!formData.peso || !formData.altura || !formData.idade || !formData.sexo || !formData.biotipo || !formData.modalidadeEsportiva}
            >
              Gerar Prescrição
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DietPrescription;
