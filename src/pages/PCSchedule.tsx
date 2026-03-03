import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  projects,
  expenses as allExpenses,
  travelDeclarations,
  personnelDeclarations,
  pcScheduleStages,
  PCScheduleStage,
  pcStageStatusLabels,
  formatCurrency,
  formatDate,
} from '@/data/mockData';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Calendar, Play, Eye, ArrowRight, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const PCSchedule = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === projectId);
  const [stages, setStages] = useState<PCScheduleStage[]>(pcScheduleStages);
  const [activeStageId, setActiveStageId] = useState<string | null>(null);
  const [viewStageId, setViewStageId] = useState<string | null>(null);
  const [editForecastId, setEditForecastId] = useState<string | null>(null);
  const [forecastInput, setForecastInput] = useState('');

  const projectStages = useMemo(
    () => stages.filter((s) => s.projectId === projectId),
    [stages, projectId]
  );

  const hasInProgressStage = useMemo(
    () => projectStages.some((s) => s.status === 'em_andamento'),
    [projectStages]
  );

  // All expense IDs used in any completed or in-progress stage for this project (excluding current active)
  const usedExpenseIds = useMemo(() => {
    const ids = new Set<string>();
    stages
      .filter((s) => s.projectId === projectId)
      .forEach((s) => {
        s.selectedExpenseIds.forEach((id) => ids.add(id));
      });
    return ids;
  }, [stages, projectId]);

  // Non-presentable expense IDs
  const nonPresentableIds = useMemo(() => {
    return new Set(allExpenses.filter(e => e.nonPresentable).map(e => e.id));
  }, []);

  const activeStage = activeStageId ? stages.find(s => s.id === activeStageId) : null;
  const viewStage = viewStageId ? stages.find(s => s.id === viewStageId) : null;

  // Eligible expenses for active stage
  const eligibleExpenses = useMemo(() => {
    if (!activeStage) return [];
    const otherStageExpIds = new Set<string>();
    stages
      .filter(s => s.projectId === projectId && s.id !== activeStage.id)
      .forEach(s => s.selectedExpenseIds.forEach(id => otherStageExpIds.add(id)));
    return allExpenses.filter(e =>
      e.projectId === projectId &&
      !e.nonPresentable &&
      !otherStageExpIds.has(e.id)
    );
  }, [activeStage, stages, projectId]);

  const eligibleTravelDecls = useMemo(() => {
    if (!activeStage) return [];
    const otherStageDeclIds = new Set<string>();
    stages
      .filter(s => s.projectId === projectId && s.id !== activeStage.id)
      .forEach(s => s.selectedTravelDeclIds.forEach(id => otherStageDeclIds.add(id)));
    return travelDeclarations.filter(d =>
      d.projectId === projectId &&
      !otherStageDeclIds.has(d.id)
    );
  }, [activeStage, stages, projectId]);

  const eligiblePersonnelDecls = useMemo(() => {
    if (!activeStage) return [];
    const otherStageDeclIds = new Set<string>();
    stages
      .filter(s => s.projectId === projectId && s.id !== activeStage.id)
      .forEach(s => s.selectedPersonnelDeclIds.forEach(id => otherStageDeclIds.add(id)));
    return personnelDeclarations.filter(d =>
      d.projectId === projectId &&
      !otherStageDeclIds.has(d.id)
    );
  }, [activeStage, stages, projectId]);

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
    // Only one PC can be in progress at a time for the same project.
    if (hasInProgressStage) {
      toast.error('Já existe uma prestação de contas em andamento. Conclua a PC atual para iniciar outra.');
      return;
    }
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, status: 'em_andamento' } : s));
    setActiveStageId(stageId);
    toast.info('PC iniciada. Selecione os itens elegíveis.');
  };

  const handleContinuePC = (stageId: string) => {
    setActiveStageId(stageId);
  };

  const handleViewPC = (stageId: string) => {
    setViewStageId(stageId);
  };

  const handleConcludePC = (stageId: string) => {
    const stage = stages.find(s => s.id === stageId);
    if (!stage) return;
    const total = getStageTotal(stage);

    if (!stage.forecastValue || stage.forecastValue <= 0) {
      toast.error('Defina o valor previsto para concluir a prestação.');
      return;
    }
    if (total < stage.forecastValue) {
      toast.error('A prestação só pode ser concluída quando atingir o valor previsto.');
      return;
    }

    setStages(prev => prev.map(s => s.id === stageId ? { ...s, status: 'concluida' } : s));
    setActiveStageId(null);
    toast.success('PC concluída com sucesso!');
  };

  const toggleExpenseInStage = (stageId: string, expId: string) => {
    setStages(prev => prev.map(s => {
      if (s.id !== stageId) return s;
      const has = s.selectedExpenseIds.includes(expId);
      return {
        ...s,
        selectedExpenseIds: has
          ? s.selectedExpenseIds.filter(id => id !== expId)
          : [...s.selectedExpenseIds, expId],
      };
    }));
  };

  const toggleTravelDeclInStage = (stageId: string, declId: string) => {
    setStages(prev => prev.map(s => {
      if (s.id !== stageId) return s;
      const has = s.selectedTravelDeclIds.includes(declId);
      return {
        ...s,
        selectedTravelDeclIds: has
          ? s.selectedTravelDeclIds.filter(id => id !== declId)
          : [...s.selectedTravelDeclIds, declId],
      };
    }));
  };

  const togglePersonnelDeclInStage = (stageId: string, declId: string) => {
    setStages(prev => prev.map(s => {
      if (s.id !== stageId) return s;
      const has = s.selectedPersonnelDeclIds.includes(declId);
      return {
        ...s,
        selectedPersonnelDeclIds: has
          ? s.selectedPersonnelDeclIds.filter(id => id !== declId)
          : [...s.selectedPersonnelDeclIds, declId],
      };
    }));
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
          backTo={`/`}
        />

        {/* Stages list */}
        <div className="grid gap-4 mb-8">
          {projectStages.map((stage) => {
            const total = getStageTotal(stage);
            const pct = stage.forecastValue > 0 ? Math.min((total / stage.forecastValue) * 100, 999) : 0;
            const faltante = Math.max(0, stage.forecastValue - total);
            const excedente = Math.max(0, total - stage.forecastValue);

            return (
              <Card key={stage.id} className="animate-fade-in">
                <CardContent className="py-5 px-6">
                  <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1 min-w-[240px]">
                      <div className="flex items-center gap-3 mb-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <h3 className="font-semibold text-foreground">{stage.name}</h3>
                        <Badge
                          variant={stage.status === 'concluida' ? 'default' : stage.status === 'em_andamento' ? 'outline' : 'secondary'}
                          className="text-xs"
                        >
                          {pcStageStatusLabels[stage.status]}
                        </Badge>
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
                      {stage.status === 'concluida' && (
                        <Button variant="outline" size="sm" onClick={() => handleViewPC(stage.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Visualizar PC
                        </Button>
                      )}
                      {stage.status === 'nao_iniciada' && (
                        <Button size="sm" onClick={() => handleStartPC(stage.id)} disabled={hasInProgressStage}>
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

        {/* Active PC editing dialog */}
        <Dialog open={!!activeStageId} onOpenChange={(open) => { if (!open) setActiveStageId(null); }}>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            {activeStage && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    {activeStage.name} — Seleção de Itens
                  </DialogTitle>
                  <DialogDescription>
                    Selecione os itens elegíveis para esta prestação de contas. Itens já utilizados em outras PCs ou não apresentáveis não são exibidos.
                  </DialogDescription>
                </DialogHeader>

                {/* Progress summary inside edit */}
                <PCProgressSummary stage={activeStage} total={getStageTotal(activeStage)} />

                {/* NF Expenses */}
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">Despesas (NF e outras)</h4>
                  {eligibleExpenses.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4">Nenhuma despesa elegível.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-10"></TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Rubrica</TableHead>
                          <TableHead className="text-right">Valor Utilizado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eligibleExpenses.map((exp) => {
                          const isSelected = activeStage.selectedExpenseIds.includes(exp.id);
                          return (
                            <TableRow key={exp.id} className={isSelected ? 'bg-primary/5' : ''}>
                              <TableCell>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleExpenseInStage(activeStage.id, exp.id)}
                                />
                              </TableCell>
                              <TableCell className="text-sm">{exp.item}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {exp.type === 'nf' ? 'NF' : exp.type === 'viagem' ? 'Viagem' : 'Pessoal'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">{exp.rubric}</TableCell>
                              <TableCell className="text-right tabular-nums text-sm">{formatCurrency(exp.usedValue ?? exp.value)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>

                {/* Travel Declarations */}
                {eligibleTravelDecls.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Declarações de Viagem</h4>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-10"></TableHead>
                          <TableHead>Declaração</TableHead>
                          <TableHead>Viajante</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eligibleTravelDecls.map((d) => {
                          const isSelected = activeStage.selectedTravelDeclIds.includes(d.id);
                          const total = allExpenses.filter(e => d.expenseIds.includes(e.id)).reduce((s, e) => s + e.value, 0);
                          return (
                            <TableRow key={d.id} className={isSelected ? 'bg-primary/5' : ''}>
                              <TableCell>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleTravelDeclInStage(activeStage.id, d.id)}
                                />
                              </TableCell>
                              <TableCell className="text-sm">{d.name}</TableCell>
                              <TableCell className="text-sm">{d.traveler}</TableCell>
                              <TableCell className="text-right tabular-nums text-sm">{formatCurrency(total)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Personnel Declarations */}
                {eligiblePersonnelDecls.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Declarações de Pessoal</h4>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="w-10"></TableHead>
                          <TableHead>Declaração</TableHead>
                          <TableHead>Referência</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {eligiblePersonnelDecls.map((d) => {
                          const isSelected = activeStage.selectedPersonnelDeclIds.includes(d.id);
                          const total = allExpenses.filter(e => d.expenseIds.includes(e.id)).reduce((s, e) => s + e.value, 0);
                          return (
                            <TableRow key={d.id} className={isSelected ? 'bg-primary/5' : ''}>
                              <TableCell>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => togglePersonnelDeclInStage(activeStage.id, d.id)}
                                />
                              </TableCell>
                              <TableCell className="text-sm">{d.name}</TableCell>
                              <TableCell className="text-sm">{d.reference}</TableCell>
                              <TableCell className="text-right tabular-nums text-sm">{formatCurrency(total)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setActiveStageId(null)}>Fechar</Button>
                  <Button
                    onClick={() => handleConcludePC(activeStage.id)}
                    disabled={!(activeStage.forecastValue > 0 && getStageTotal(activeStage) >= activeStage.forecastValue)}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Concluir PC
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* View concluded PC dialog */}
        <Dialog open={!!viewStageId} onOpenChange={(open) => { if (!open) setViewStageId(null); }}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            {viewStage && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    {viewStage.name} — Consulta
                  </DialogTitle>
                  <DialogDescription>Itens apresentados nesta prestação de contas (somente leitura).</DialogDescription>
                </DialogHeader>

                <PCProgressSummary stage={viewStage} total={getStageTotal(viewStage)} />

                {/* NF expenses */}
                {viewStage.selectedExpenseIds.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Despesas</h4>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Item</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead className="text-right">Valor Utilizado</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allExpenses.filter(e => viewStage.selectedExpenseIds.includes(e.id)).map((exp) => (
                          <TableRow key={exp.id}>
                            <TableCell className="text-sm">{exp.item}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {exp.type === 'nf' ? 'NF' : exp.type === 'viagem' ? 'Viagem' : 'Pessoal'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right tabular-nums text-sm">{formatCurrency(exp.usedValue ?? exp.value)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Travel */}
                {viewStage.selectedTravelDeclIds.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Declarações de Viagem</h4>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Declaração</TableHead>
                          <TableHead>Viajante</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {travelDeclarations.filter(d => viewStage.selectedTravelDeclIds.includes(d.id)).map((d) => {
                          const total = allExpenses.filter(e => d.expenseIds.includes(e.id)).reduce((s, e) => s + e.value, 0);
                          return (
                            <TableRow key={d.id}>
                              <TableCell className="text-sm">{d.name}</TableCell>
                              <TableCell className="text-sm">{d.traveler}</TableCell>
                              <TableCell className="text-right tabular-nums text-sm">{formatCurrency(total)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Personnel */}
                {viewStage.selectedPersonnelDeclIds.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-foreground mb-2">Declarações de Pessoal</h4>
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead>Declaração</TableHead>
                          <TableHead>Referência</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {personnelDeclarations.filter(d => viewStage.selectedPersonnelDeclIds.includes(d.id)).map((d) => {
                          const total = allExpenses.filter(e => d.expenseIds.includes(e.id)).reduce((s, e) => s + e.value, 0);
                          return (
                            <TableRow key={d.id}>
                              <TableCell className="text-sm">{d.name}</TableCell>
                              <TableCell className="text-sm">{d.reference}</TableCell>
                              <TableCell className="text-right tabular-nums text-sm">{formatCurrency(total)}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}

                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setViewStageId(null)}>Fechar</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

// Reusable progress summary component
const PCProgressSummary = ({ stage, total }: { stage: PCScheduleStage; total: number }) => {
  const pct = stage.forecastValue > 0 ? Math.min((total / stage.forecastValue) * 100, 999) : 0;
  const faltante = Math.max(0, stage.forecastValue - total);
  const excedente = Math.max(0, total - stage.forecastValue);

  return (
    <Card className="bg-muted/30 border-dashed">
      <CardContent className="py-3 px-4">
        <div className="flex items-center justify-between flex-wrap gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Previsto: </span>
            <span className="font-medium tabular-nums">{formatCurrency(stage.forecastValue)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Selecionado: </span>
            <span className="font-medium tabular-nums">{formatCurrency(total)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">% atingido: </span>
            <span className="font-medium tabular-nums">{pct.toFixed(1)}%</span>
          </div>
          {faltante > 0 && (
            <div>
              <span className="text-muted-foreground">Faltante: </span>
              <span className="font-medium tabular-nums text-warning-foreground">{formatCurrency(faltante)}</span>
            </div>
          )}
          {excedente > 0 && (
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3 text-warning" />
              <span className="text-muted-foreground">Excedente: </span>
              <span className="font-medium tabular-nums text-destructive">{formatCurrency(excedente)}</span>
            </div>
          )}
        </div>
        <Progress value={Math.min(pct, 100)} className="h-2 mt-2" />
      </CardContent>
    </Card>
  );
};

export default PCSchedule;
