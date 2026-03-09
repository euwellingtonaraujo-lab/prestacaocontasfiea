import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projects, pcScheduleStages, PCScheduleStage, pcStageStatusLabels, formatCurrency } from '@/data/mockData';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Calendar, Play, Eye, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { expenses as allExpenses, travelDeclarations, personnelDeclarations } from '@/data/mockData';

const PCSchedule = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === projectId);
  const [stages, setStages] = useState<PCScheduleStage[]>(pcScheduleStages);
  const [editForecastId, setEditForecastId] = useState<string | null>(null);
  const [forecastInput, setForecastInput] = useState('');

  const projectStages = useMemo(
    () => stages.filter((s) => s.projectId === projectId),
    [stages, projectId]
  );

  // Check if there's an in-progress stage
  const hasInProgress = projectStages.some(s => s.status === 'em_andamento');

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
      </div>
    );
  }

  const getStageTotal = (stage: PCScheduleStage) => {
    const expTotal = allExpenses
      .filter((e) => stage.selectedExpenseIds.includes(e.id))
      .reduce((sum, e) => sum + (e.usedValue ?? e.value), 0);
    const travelTotal = travelDeclarations
      .filter((d) => stage.selectedTravelDeclIds.includes(d.id))
      .reduce((sum, d) => {
        return sum + allExpenses.filter(e => d.expenseIds.includes(e.id)).reduce((s, e) => s + e.value, 0);
      }, 0);
    const persTotal = personnelDeclarations
      .filter((d) => stage.selectedPersonnelDeclIds.includes(d.id))
      .reduce((sum, d) => {
        return sum + allExpenses.filter(e => d.expenseIds.includes(e.id)).reduce((s, e) => s + e.value, 0);
      }, 0);
    return expTotal + travelTotal + persTotal;
  };

  const handleStartPC = (stageId: string) => {
    if (hasInProgress) {
      toast.error('Finalize a PC em andamento antes de iniciar uma nova.');
      return;
    }
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, status: 'em_andamento' } : s));
    toast.success('PC iniciada!');
    navigate(`/projeto/${projectId}/pc/${stageId}`);
  };

  const handleContinuePC = (stageId: string) => {
    navigate(`/projeto/${projectId}/pc/${stageId}`);
  };

  const handleViewPC = (stageId: string) => {
    navigate(`/projeto/${projectId}/pc/${stageId}`);
  };

  const saveForecast = (stageId: string) => {
    const val = parseFloat(forecastInput);
    if (!isNaN(val) && val >= 0) {
      setStages(prev => prev.map(s => s.id === stageId ? { ...s, forecastValue: val } : s));
      toast.success('Valor previsto atualizado.');
    }
    setEditForecastId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <PageHeader
          title="Cronograma de Prestação de Contas"
          subtitle={`${project.name} · ${project.code}`}
          backTo="/"
        />

        {/* Stages list */}
        <div className="grid gap-4 mb-8">
          {projectStages.map((stage) => {
            const total = getStageTotal(stage);
            const pct = stage.forecastValue > 0 ? Math.min((total / stage.forecastValue) * 100, 999) : 0;
            const faltante = Math.max(0, stage.forecastValue - total);
            const excedente = Math.max(0, total - stage.forecastValue);
            const canStart = !hasInProgress && stage.status === 'nao_iniciada';

            return (
              <Card key={stage.id} className="animate-fade-in">
                <CardContent className="py-5 px-6">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-[240px]">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-foreground">{stage.name}</h3>
                      </div>

                      {/* Forecast & progress */}
                      <div className="space-y-2 mt-3">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Valor previsto:</span>
                          {editForecastId === stage.id ? (
                            <div className="flex items-center gap-1">
                              <Input
                                type="number"
                                step="0.01"
                                className="h-7 w-36 text-sm"
                                value={forecastInput}
                                onChange={(e) => setForecastInput(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && saveForecast(stage.id)}
                              />
                              <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => saveForecast(stage.id)}>OK</Button>
                            </div>
                          ) : (
                            <button
                              className="font-medium tabular-nums hover:text-primary transition-colors"
                              onClick={() => { setEditForecastId(stage.id); setForecastInput(String(stage.forecastValue)); }}
                            >
                              {formatCurrency(stage.forecastValue)}
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-muted-foreground">Selecionado:</span>
                          <span className="font-medium tabular-nums">{formatCurrency(total)}</span>
                          <span className="text-muted-foreground">({pct.toFixed(1)}%)</span>
                        </div>
                        <Progress value={Math.min(pct, 100)} className="h-2" />
                        <div className="flex items-center gap-4 text-xs">
                          {faltante > 0 && (
                            <span className="text-muted-foreground">
                              Faltante: <span className="font-medium tabular-nums text-warning-foreground">{formatCurrency(faltante)}</span>
                            </span>
                          )}
                          {excedente > 0 && (
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <AlertTriangle className="h-3 w-3 text-warning" />
                              Excedente: <span className="font-medium tabular-nums text-destructive">{formatCurrency(excedente)}</span>
                            </span>
                          )}
                          {faltante === 0 && excedente === 0 && stage.forecastValue > 0 && (
                            <span className="flex items-center gap-1 text-success">
                              <CheckCircle className="h-3 w-3" />
                              Valor previsto atingido
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {stage.status === 'concluida' && project.approvalStatus === 'aprovada' && (
                        <Button variant="outline" size="sm" onClick={() => handleViewPC(stage.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar PC
                        </Button>
                      )}
                      {stage.status === 'concluida' && project.approvalStatus !== 'aprovada' && (
                        <Button size="sm" onClick={() => handleContinuePC(stage.id)}>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Editar PC
                        </Button>
                      )}
                      {stage.status === 'nao_iniciada' && (
                        <Button size="sm" onClick={() => handleStartPC(stage.id)} disabled={!canStart}>
                          <Play className="h-4 w-4 mr-2" />
                          Iniciar PC
                        </Button>
                      )}
                      {stage.status === 'em_andamento' && (
                        <Button size="sm" onClick={() => handleContinuePC(stage.id)}>
                          <ArrowRight className="h-4 w-4 mr-2" />
                          Continuar PC
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {projectStages.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Calendar className="h-10 w-10 text-muted-foreground/40 mb-3" />
                <p className="text-muted-foreground">Nenhuma etapa de PC cadastrada para este projeto.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PCSchedule;
