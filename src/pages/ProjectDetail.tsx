import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { projects, expenses as allExpenses, travelDeclarations, personnelDeclarations, rubricOptions, counterpartOptions, formatCurrency, formatDate, Expense, approvalStatusLabels, ApprovalStatus, expenseDiscounts, pcScheduleStages, PCScheduleStage, PCStageStatus, pcStageStatusLabels } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Progress } from '@/components/ui/progress';
import { Download, FileUp, ExternalLink, Plus, Pencil, Trash2, FileCheck, FileText, Send, CheckCircle, RotateCcw, AlertCircle, Lock, AlertTriangle, EyeOff, Eye, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

type ExpenseTab = 'nf' | 'viagem' | 'pessoal';

const ProjectDetail = () => {
  const { projectId, stageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const project = projects.find((p) => p.id === projectId);
  // Preserve tab from URL search params
  const [searchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as ExpenseTab) || 'nf';
  const [tab, setTab] = useState<ExpenseTab>(initialTab);
  const [approvalComment, setApprovalComment] = useState('');
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PCStageStatus | null>(null);
  const [showNonPresentable, setShowNonPresentable] = useState(false);
  const [localExpenses, setLocalExpenses] = useState<Expense[]>(allExpenses);
  const [stages, setStages] = useState<PCScheduleStage[]>(pcScheduleStages);

  const currentStage = stages.find(s => s.id === stageId);
  const stageStatus: PCStageStatus = currentStage?.status || 'nao_iniciada';
  const isGP = user?.role === 'gp';
  const isPMO = user?.role === 'escritorio';
  const canEdit = (isGP && (stageStatus === 'em_elaboracao' || stageStatus === 'ajustes_solicitados')) || isPMO;
  const isReadOnly = !canEdit;
  const showCheckboxes = canEdit;

  // IDs used in OTHER stages (not this one)
  const otherStageExpenseIds = useMemo(() => {
    const ids = new Set<string>();
    stages
      .filter(s => s.projectId === projectId && s.id !== stageId)
      .forEach(s => s.selectedExpenseIds.forEach(id => ids.add(id)));
    return ids;
  }, [stages, projectId, stageId]);

  const otherStageTravelDeclIds = useMemo(() => {
    const ids = new Set<string>();
    stages
      .filter(s => s.projectId === projectId && s.id !== stageId)
      .forEach(s => s.selectedTravelDeclIds.forEach(id => ids.add(id)));
    return ids;
  }, [stages, projectId, stageId]);

  const otherStagePersonnelDeclIds = useMemo(() => {
    const ids = new Set<string>();
    stages
      .filter(s => s.projectId === projectId && s.id !== stageId)
      .forEach(s => s.selectedPersonnelDeclIds.forEach(id => ids.add(id)));
    return ids;
  }, [stages, projectId, stageId]);

  // For concluded: show only items in this stage
  // For in_progress: show items NOT used in other stages and not non-presentable
  const projectExpenses = useMemo(() => {
    if (!currentStage) return [];
    if (isReadOnly) {
      return localExpenses.filter(e => currentStage.selectedExpenseIds.includes(e.id) && e.type === tab);
    }
    return localExpenses.filter(e =>
      e.projectId === projectId &&
      e.type === tab &&
      !e.nonPresentable &&
      !otherStageExpenseIds.has(e.id)
    );
  }, [projectId, tab, localExpenses, currentStage, isReadOnly, otherStageExpenseIds]);

  const nonPresentableExpenses = useMemo(
    () => localExpenses.filter((e) => e.projectId === projectId && e.nonPresentable),
    [projectId, localExpenses]
  );

  const projectTravelDecl = useMemo(() => {
    if (!currentStage) return [];
    if (isReadOnly) {
      return travelDeclarations.filter(d => currentStage.selectedTravelDeclIds.includes(d.id));
    }
    return travelDeclarations.filter(d =>
      d.projectId === projectId && !otherStageTravelDeclIds.has(d.id)
    );
  }, [projectId, currentStage, isReadOnly, otherStageTravelDeclIds]);

  const projectPersonnelDecl = useMemo(() => {
    if (!currentStage) return [];
    if (isReadOnly) {
      return personnelDeclarations.filter(d => currentStage.selectedPersonnelDeclIds.includes(d.id));
    }
    return personnelDeclarations.filter(d =>
      d.projectId === projectId && !otherStagePersonnelDeclIds.has(d.id)
    );
  }, [projectId, currentStage, isReadOnly, otherStagePersonnelDeclIds]);

  // Toggle expense selection in stage
  const toggleExpenseInStage = (expId: string) => {
    if (!currentStage || isReadOnly) return;
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

  const toggleTravelDeclInStage = (declId: string) => {
    if (!currentStage || isReadOnly) return;
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

  const togglePersonnelDeclInStage = (declId: string) => {
    if (!currentStage || isReadOnly) return;
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

  // Calculate stage total
  const getStageTotal = () => {
    if (!currentStage) return 0;
    const stage = stages.find(s => s.id === stageId)!;
    const expTotal = localExpenses
      .filter(e => stage.selectedExpenseIds.includes(e.id))
      .reduce((sum, e) => sum + (e.usedValue ?? e.value), 0);
    const travelTotal = travelDeclarations
      .filter(d => stage.selectedTravelDeclIds.includes(d.id))
      .reduce((sum, d) => {
        return sum + allExpenses.filter(e => d.expenseIds.includes(e.id)).reduce((s, e) => s + e.value, 0);
      }, 0);
    const persTotal = personnelDeclarations
      .filter(d => stage.selectedPersonnelDeclIds.includes(d.id))
      .reduce((sum, d) => {
        return sum + allExpenses.filter(e => d.expenseIds.includes(e.id)).reduce((s, e) => s + e.value, 0);
      }, 0);
    return expTotal + travelTotal + persTotal;
  };


  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
      </div>
    );
  }

  if (!currentStage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Etapa de PC não encontrada.</p>
      </div>
    );
  }

  const handleExport = () => {
    if (stageStatus !== 'aprovada') {
      toast.error('A PC precisa estar aprovada para exportação final.');
      return;
    }
    toast.success('Planilha exportada com sucesso!');
  };

  const openApprovalDialog = (action: ApprovalStatus) => {
    setPendingAction(action);
    setApprovalComment('');
    setApprovalDialogOpen(true);
  };

  const confirmApproval = () => {
    if (pendingAction) {
      setStages(prev => prev.map(s => s.id === stageId ? { ...s, status: pendingAction } : s));
      toast.success(`Status alterado para: ${pcStageStatusLabels[pendingAction]}`);
    }
    setApprovalDialogOpen(false);
  };

  const markNonPresentable = (expId: string) => {
    setLocalExpenses(prev => prev.map(e => e.id === expId ? { ...e, nonPresentable: true } : e));
    // Also remove from stage selection
    setStages(prev => prev.map(s => s.id === stageId ? { ...s, selectedExpenseIds: s.selectedExpenseIds.filter(id => id !== expId) } : s));
    toast.success('Despesa marcada como não apresentável.');
  };

  const markPresentable = (expId: string) => {
    setLocalExpenses(prev => prev.map(e => e.id === expId ? { ...e, nonPresentable: false } : e));
    toast.success('Despesa restaurada para apresentável.');
  };

  const updateExpenseField = (expId: string, field: keyof Expense, value: any) => {
    setLocalExpenses(prev => prev.map(e => e.id === expId ? { ...e, [field]: value } : e));
  };

  const stageTotal = getStageTotal();
  const updatedStage = stages.find(s => s.id === stageId)!;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <PageHeader
          title={project.name}
          subtitle={`${project.code} · ${project.entity} · ${currentStage.name}${isReadOnly ? ' (Consulta)' : ''}`}
          backTo={`/projeto/${projectId}`}
          actions={
            <>
              <Button size="sm" onClick={handleExport} disabled={stageStatus !== 'aprovada'}>
                <Download className="h-4 w-4 mr-2" />
                Exportar planilha
                {stageStatus !== 'aprovada' && <Lock className="h-3 w-3 ml-1" />}
              </Button>
            </>
          }
        />

        {/* PC Progress Summary */}
        <Card className="mb-6 animate-fade-in bg-muted/30 border-dashed">
          <CardContent className="py-3 px-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{updatedStage.name}</span>
            </div>
            <PCProgressBar stage={updatedStage} total={stageTotal} />
          </CardContent>
        </Card>

        {/* Approval Workflow */}
        <Card className="mb-6 animate-fade-in">
          <CardContent className="py-4 px-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Aprovação:</p>
                <Badge variant={approvalStatus === 'aprovada' ? 'default' : approvalStatus === 'ajustes_solicitados' ? 'destructive' : 'secondary'} className="text-xs">
                  {approvalStatusLabels[approvalStatus]}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {isGP && (approvalStatus === 'em_elaboracao' || approvalStatus === 'ajustes_solicitados') && (
                  <Button size="sm" onClick={() => openApprovalDialog('submetida')}>
                    <Send className="h-4 w-4 mr-2" />
                    Submeter para aprovação
                  </Button>
                )}
                {isPMO && (approvalStatus === 'submetida' || approvalStatus === 'em_analise') && (
                  <>
                    {approvalStatus === 'submetida' && (
                      <Button variant="outline" size="sm" onClick={() => { setApprovalStatus('em_analise'); toast.info('Status: Em análise'); }}>
                        <AlertCircle className="h-4 w-4 mr-2" />
                        Iniciar análise
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="text-destructive" onClick={() => openApprovalDialog('ajustes_solicitados')}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Solicitar ajustes
                    </Button>
                    <Button size="sm" onClick={() => openApprovalDialog('aprovada')}>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprovar
                    </Button>
                  </>
                )}
              </div>
            </div>
            {!canEdit && isGP && approvalStatus !== 'em_elaboracao' && approvalStatus !== 'ajustes_solicitados' && (
              <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Edição bloqueada — a PC foi submetida para aprovação.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Approval dialog */}
        <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {pendingAction === 'submetida' && 'Submeter para aprovação'}
                {pendingAction === 'ajustes_solicitados' && 'Solicitar ajustes'}
                {pendingAction === 'aprovada' && 'Aprovar Prestação de Contas'}
              </DialogTitle>
              <DialogDescription>Registre um comentário para esta ação (opcional).</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <Textarea value={approvalComment} onChange={(e) => setApprovalComment(e.target.value)} placeholder="Comentário ou observação..." rows={3} />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setApprovalDialogOpen(false)}>Cancelar</Button>
              <Button onClick={confirmApproval} variant={pendingAction === 'ajustes_solicitados' ? 'destructive' : 'default'}>
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>


        {/* Tab selector */}
        <div className="mb-6">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tipo de despesa</label>
          <Select value={tab} onValueChange={(v) => setTab(v as ExpenseTab)}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nf">Materiais/Serviços</SelectItem>
              <SelectItem value="viagem">Viagens</SelectItem>
              <SelectItem value="pessoal">Folha de Pessoal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content by tab */}
        {tab === 'nf' && (
          <NFSection
            expenses={projectExpenses}
            projectId={projectId!}
            onMarkNonPresentable={markNonPresentable}
            onUpdateExpense={updateExpenseField}
            readOnly={isReadOnly}
            stageSelectedIds={updatedStage.selectedExpenseIds}
            onToggleInStage={toggleExpenseInStage}
            showCheckboxes={isInProgress}
          />
        )}
        {tab === 'viagem' && (
          <TravelSection
            declarations={projectTravelDecl}
            projectId={projectId!}
            onEdit={(id) => navigate(`/projeto/${projectId}/viagem/${id}?returnTab=viagem&stageId=${stageId}`)}
            onCreate={() => navigate(`/projeto/${projectId}/viagem/nova?returnTab=viagem&stageId=${stageId}`)}
            readOnly={isReadOnly}
            stageSelectedIds={updatedStage.selectedTravelDeclIds}
            onToggleInStage={toggleTravelDeclInStage}
            showCheckboxes={isInProgress}
          />
        )}
        {tab === 'pessoal' && (
          <PersonnelSection
            declarations={projectPersonnelDecl}
            projectId={projectId!}
            onEdit={(id) => navigate(`/projeto/${projectId}/pessoal/${id}?returnTab=pessoal&stageId=${stageId}`)}
            onCreate={() => navigate(`/projeto/${projectId}/pessoal/nova?returnTab=pessoal&stageId=${stageId}`)}
            readOnly={isReadOnly}
            stageSelectedIds={updatedStage.selectedPersonnelDeclIds}
            onToggleInStage={togglePersonnelDeclInStage}
            showCheckboxes={isInProgress}
          />
        )}

        {/* Non-presentable expenses section - only in edit mode */}
        {!isReadOnly && (
          <div className="mt-8">
            <button
              onClick={() => setShowNonPresentable(!showNonPresentable)}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
            >
              <EyeOff className="h-4 w-4" />
              Despesas não apresentáveis (documento ilegível) ({nonPresentableExpenses.length})
              <span className="text-xs">({showNonPresentable ? 'ocultar' : 'mostrar'})</span>
            </button>
            {showNonPresentable && (
              <Card className="animate-fade-in border-dashed">
                <CardContent className="p-0">
                  {nonPresentableExpenses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <EyeOff className="h-8 w-8 text-muted-foreground/30 mb-2" />
                      <p className="text-sm text-muted-foreground">Nenhuma despesa não apresentável.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent">
                          <TableHead className="pl-6">Item</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Rubrica</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {nonPresentableExpenses.map((exp) => (
                          <TableRow key={exp.id} className="opacity-60">
                            <TableCell className="pl-6 text-sm">{exp.item}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {exp.type === 'nf' ? 'NF' : exp.type === 'viagem' ? 'Viagem' : 'Pessoal'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{exp.rubric}</TableCell>
                            <TableCell className="text-right tabular-nums text-sm">{formatCurrency(exp.value)}</TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => markPresentable(exp.id)}>
                                <Eye className="h-3.5 w-3.5 mr-1" />
                                Restaurar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// PC Progress Bar
const PCProgressBar = ({ stage, total }: { stage: PCScheduleStage; total: number }) => {
  const pct = stage.forecastValue > 0 ? Math.min((total / stage.forecastValue) * 100, 999) : 0;
  const faltante = Math.max(0, stage.forecastValue - total);
  const excedente = Math.max(0, total - stage.forecastValue);

  return (
    <div>
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
    </div>
  );
};

// NF Section with checkboxes for stage selection
const NFSection = ({ expenses: exps, projectId, onMarkNonPresentable, onUpdateExpense, readOnly, stageSelectedIds, onToggleInStage, showCheckboxes }: {
  expenses: Expense[];
  projectId: string;
  onMarkNonPresentable: (id: string) => void;
  onUpdateExpense: (id: string, field: keyof Expense, value: any) => void;
  readOnly?: boolean;
  stageSelectedIds: string[];
  onToggleInStage: (id: string) => void;
  showCheckboxes: boolean;
}) => {
  const [editingCell, setEditingCell] = useState<{ expId: string; field: string } | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [discountDetailExpId, setDiscountDetailExpId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    item: '', justification: '', rubric: 'Equipamentos', counterpart: 'Financiador',
    supplierCnpj: '', supplierName: '', provisionDate: '', value: '', nfNumber: '', nfDate: '', nfValue: '',
  });

  const discountMap = useMemo(() => {
    const map: Record<string, typeof expenseDiscounts> = {};
    expenseDiscounts.forEach((d) => {
      if (!map[d.expenseId]) map[d.expenseId] = [];
      map[d.expenseId].push(d);
    });
    return map;
  }, []);

  const getSuggestedValue = (exp: Expense) => {
    const discounts = discountMap[exp.id];
    if (!discounts || discounts.length === 0) return null;
    const totalDiscount = discounts.reduce((sum, d) => sum + Math.abs(d.value), 0);
    return exp.value - totalDiscount;
  };

  const getNetValue = (exp: Expense) => {
    const discounts = discountMap[exp.id];
    if (!discounts || discounts.length === 0) return exp.value;
    const totalDiscount = discounts.reduce((sum, d) => sum + Math.abs(d.value), 0);
    return exp.value - totalDiscount;
  };

  // The displayed usedValue: if not manually edited, use net value (with discount)
  const getDisplayUsedValue = (exp: Expense) => {
    if (exp.usedValueEdited) return exp.usedValue ?? exp.value;
    return getNetValue(exp);
  };

  const isEditing = (expId: string, field: string) =>
    !readOnly && editingCell?.expId === expId && editingCell?.field === field;
  const startEdit = (expId: string, field: string) => { if (!readOnly) setEditingCell({ expId, field }); };
  const stopEdit = () => setEditingCell(null);

  const handleAddExpense = () => {
    toast.success('Despesa adicionada com sucesso!');
    setAddDialogOpen(false);
    setNewExpense({ item: '', justification: '', rubric: 'Equipamentos', counterpart: 'Financiador', supplierCnpj: '', supplierName: '', provisionDate: '', value: '', nfNumber: '', nfDate: '', nfValue: '' });
  };

  const EditableText = ({ expId, field, value, mono }: { expId: string; field: string; value: string; mono?: boolean }) => {
    if (isEditing(expId, field)) {
      return <Input defaultValue={value} className="h-8 text-sm" autoFocus onBlur={stopEdit} onKeyDown={(e) => e.key === 'Enter' && stopEdit()} />;
    }
    const displayValue = field === 'justification' && value.length > 40 ? value.slice(0, 40) + '…' : value;
    return (
      <div className={`flex items-center gap-1.5 group/cell ${readOnly ? '' : 'cursor-pointer'}`} onClick={() => startEdit(expId, field)}>
        <span className={`text-sm ${mono ? 'font-mono' : ''} truncate`} title={value}>{displayValue || '—'}</span>
        {!readOnly && <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/cell:opacity-100 shrink-0 transition-opacity" />}
      </div>
    );
  };

  const discountDetailDiscounts = discountDetailExpId ? (discountMap[discountDetailExpId] || []) : [];
  const discountDetailExp = discountDetailExpId ? exps.find(e => e.id === discountDetailExpId) : null;

  return (
    <TooltipProvider>
      <Card className="animate-fade-in">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {showCheckboxes && <TableHead className="w-10 pl-4"></TableHead>}
                <TableHead className={showCheckboxes ? '' : 'pl-6'} style={{ minWidth: 70 }}>Nº NF</TableHead>
                <TableHead className="min-w-[160px]">Item/Produto</TableHead>
                <TableHead className="min-w-[180px]">Justificativa</TableHead>
                <TableHead className="min-w-[120px]">Rubrica</TableHead>
                <TableHead className="min-w-[100px]">Contrapartida</TableHead>
                <TableHead className="min-w-[140px]">CNPJ</TableHead>
                <TableHead className="min-w-[150px]">Razão Social</TableHead>
                <TableHead className="min-w-[100px]">Data Provisão</TableHead>
                <TableHead className="min-w-[100px]">Data NF</TableHead>
                <TableHead className="min-w-[130px] text-right">Valor Utilizado</TableHead>
                <TableHead className="min-w-[110px] text-right">Valor NF</TableHead>
                <TableHead className="min-w-[80px]">Doc</TableHead>
                {!readOnly && <TableHead className="min-w-[50px]">Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {exps.map((exp) => {
                const hasDiscount = !!discountMap[exp.id] && discountMap[exp.id].length > 0;
                const displayUsedValue = getDisplayUsedValue(exp);
                const suggestedValue = getSuggestedValue(exp);
                const isUsedValueEdited = exp.usedValueEdited && displayUsedValue !== suggestedValue;
                const isSelected = stageSelectedIds.includes(exp.id);

                return (
                  <TableRow key={exp.id} className={showCheckboxes && isSelected ? 'bg-primary/5' : ''}>
                    {showCheckboxes && (
                      <TableCell className="pl-4">
                        <Checkbox checked={isSelected} onCheckedChange={() => onToggleInStage(exp.id)} />
                      </TableCell>
                    )}
                    <TableCell className={showCheckboxes ? '' : 'pl-6'}>
                      <EditableText expId={exp.id} field="nfNumber" value={exp.nfNumber || ''} mono />
                    </TableCell>
                    <TableCell><EditableText expId={exp.id} field="item" value={exp.item} /></TableCell>
                    <TableCell><EditableText expId={exp.id} field="justification" value={exp.justification} /></TableCell>
                    <TableCell>
                      {isEditing(exp.id, 'rubric') ? (
                        <Select defaultValue={exp.rubric} onValueChange={stopEdit}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {rubricOptions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className={`flex items-center gap-1.5 group/cell ${readOnly ? '' : 'cursor-pointer'}`} onClick={() => startEdit(exp.id, 'rubric')}>
                          <Badge variant="secondary" className="text-xs">{exp.rubric}</Badge>
                          {!readOnly && <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/cell:opacity-100 shrink-0 transition-opacity" />}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing(exp.id, 'counterpart') ? (
                        <Select defaultValue={exp.counterpart} onValueChange={stopEdit}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {counterpartOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className={`flex items-center gap-1.5 group/cell ${readOnly ? '' : 'cursor-pointer'}`} onClick={() => startEdit(exp.id, 'counterpart')}>
                          <span className="text-sm">{exp.counterpart}</span>
                          {!readOnly && <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/cell:opacity-100 shrink-0 transition-opacity" />}
                        </div>
                      )}
                    </TableCell>
                    <TableCell><EditableText expId={exp.id} field="cnpj" value={exp.supplierCnpj} mono /></TableCell>
                    <TableCell><EditableText expId={exp.id} field="supplier" value={exp.supplierName} /></TableCell>
                    <TableCell>
                      {isEditing(exp.id, 'provisionDate') ? (
                        <Input type="date" defaultValue={exp.provisionDate || exp.acquisitionDate} className="h-8 text-sm" autoFocus onBlur={stopEdit} />
                      ) : (
                        <div className={`flex items-center gap-1.5 group/cell ${readOnly ? '' : 'cursor-pointer'}`} onClick={() => startEdit(exp.id, 'provisionDate')}>
                          <span className="text-sm tabular-nums">{formatDate(exp.provisionDate || exp.acquisitionDate)}</span>
                          {!readOnly && <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/cell:opacity-100 shrink-0 transition-opacity" />}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing(exp.id, 'nfDate') ? (
                        <Input type="date" defaultValue={exp.nfDate || exp.provisionDate || exp.acquisitionDate} className="h-8 text-sm" autoFocus onBlur={stopEdit} />
                      ) : (
                        <div className={`flex items-center gap-1.5 group/cell ${readOnly ? '' : 'cursor-pointer'}`} onClick={() => startEdit(exp.id, 'nfDate')}>
                          <span className="text-sm tabular-nums">{formatDate(exp.nfDate || exp.provisionDate || exp.acquisitionDate)}</span>
                          {!readOnly && <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/cell:opacity-100 shrink-0 transition-opacity" />}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        {hasDiscount && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className="inline-flex items-center gap-1 cursor-pointer rounded px-1 py-0.5 bg-warning/15 hover:bg-warning/25 transition-colors text-xs"
                                onClick={() => setDiscountDetailExpId(exp.id)}
                              >
                                <AlertTriangle className="h-3 w-3 text-warning" />
                                <span className="text-[10px] text-warning-foreground">Desconto aplicado</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-[240px]">
                              <p className="text-xs">Valor com desconto deduzido. Clique para detalhes.</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                        {!readOnly && isEditing(exp.id, 'usedValue') ? (
                          <Input
                            type="number"
                            defaultValue={displayUsedValue}
                            className="h-8 text-sm text-right w-32"
                            step="0.01"
                            autoFocus
                            onBlur={(e) => {
                              const newVal = parseFloat(e.target.value);
                              if (!isNaN(newVal)) {
                                onUpdateExpense(exp.id, 'usedValue', newVal);
                                if (hasDiscount && newVal !== suggestedValue) {
                                  onUpdateExpense(exp.id, 'usedValueEdited', true);
                                } else {
                                  onUpdateExpense(exp.id, 'usedValueEdited', false);
                                }
                              }
                              stopEdit();
                            }}
                          />
                        ) : (
                          <div className={`flex items-center gap-1.5 justify-end group/cell ${readOnly ? '' : 'cursor-pointer'}`} onClick={() => startEdit(exp.id, 'usedValue')}>
                            <span className={`text-sm tabular-nums font-medium ${isUsedValueEdited ? 'text-info' : ''}`}>
                              {formatCurrency(displayUsedValue)}
                            </span>
                            {isUsedValueEdited && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 text-info border-info/30">editado</Badge>
                            )}
                            {!readOnly && <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/cell:opacity-100 shrink-0 transition-opacity" />}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {!readOnly && isEditing(exp.id, 'nfValue') ? (
                        <Input
                          type="number"
                          defaultValue={exp.nfValue ?? exp.value}
                          className="h-8 text-sm text-right w-28"
                          step="0.01"
                          autoFocus
                          onBlur={(e) => {
                            const newVal = parseFloat(e.target.value);
                            if (!isNaN(newVal)) onUpdateExpense(exp.id, 'nfValue', newVal);
                            stopEdit();
                          }}
                        />
                      ) : (
                        <div className={`flex items-center gap-1.5 justify-end group/cell ${readOnly ? '' : 'cursor-pointer'}`} onClick={() => startEdit(exp.id, 'nfValue')}>
                          <span className="text-sm tabular-nums">{formatCurrency(exp.nfValue ?? exp.value)}</span>
                          {!readOnly && <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/cell:opacity-100 shrink-0 transition-opacity" />}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {exp.documentUrl ? (
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Abrir
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="h-7 text-xs" disabled={readOnly}>
                          <FileUp className="h-3 w-3 mr-1" />
                          Anexar
                        </Button>
                      )}
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onMarkNonPresentable(exp.id)}>
                              <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent><p className="text-xs">Marcar como não apresentável</p></TooltipContent>
                        </Tooltip>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
              {exps.length === 0 && (
                <TableRow>
                  <TableCell colSpan={showCheckboxes ? 14 : 13} className="h-32 text-center text-muted-foreground">
                    Nenhuma despesa {readOnly ? 'apresentada nesta PC.' : 'disponível.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {!readOnly && (
            <div className="p-4 border-t">
              <Button variant="ghost" size="sm" className="text-primary" onClick={() => setAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar despesa
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Discount Detail Dialog */}
      <Dialog open={!!discountDetailExpId} onOpenChange={(open) => { if (!open) setDiscountDetailExpId(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Detalhe do Desconto
            </DialogTitle>
            <DialogDescription>
              {discountDetailExp && `Descontos aplicados à despesa: ${discountDetailExp.item}`}
            </DialogDescription>
          </DialogHeader>
          {discountDetailExp && (
            <div className="space-y-4 py-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor original (bruto):</span>
                <span className="font-medium tabular-nums">{formatCurrency(discountDetailExp.value)}</span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Conta</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Descrição</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discountDetailDiscounts.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="text-sm font-mono">{d.account}</TableCell>
                      <TableCell className="text-right tabular-nums text-sm text-destructive">{formatCurrency(d.value)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground max-w-[200px]">{d.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between text-sm border-t pt-3">
                <span className="font-medium">Valor sugerido (líquido):</span>
                <span className="font-bold tabular-nums text-warning-foreground">{formatCurrency(getNetValue(discountDetailExp)!)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">Valor utilizado no projeto:</span>
                <span className="font-bold tabular-nums">{formatCurrency(discountDetailExp.usedValue ?? discountDetailExp.value)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscountDetailExpId(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      {!readOnly && (
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Nova Despesa</DialogTitle>
              <DialogDescription>Preencha os dados da despesa abaixo.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Nº da NF</label>
                <Input value={newExpense.nfNumber} onChange={(e) => setNewExpense({ ...newExpense, nfNumber: e.target.value })} placeholder="NF-000" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Data de Provisão</label>
                <Input type="date" value={newExpense.provisionDate} onChange={(e) => setNewExpense({ ...newExpense, provisionDate: e.target.value })} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Item/Produto</label>
                <Input value={newExpense.item} onChange={(e) => setNewExpense({ ...newExpense, item: e.target.value })} placeholder="Ex.: Computador Dell" />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Justificativa</label>
                <Textarea value={newExpense.justification} onChange={(e) => setNewExpense({ ...newExpense, justification: e.target.value })} placeholder="Justificativa da aquisição" rows={2} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Rubrica</label>
                <Select value={newExpense.rubric} onValueChange={(v) => setNewExpense({ ...newExpense, rubric: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {rubricOptions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Contrapartida</label>
                <Select value={newExpense.counterpart} onValueChange={(v) => setNewExpense({ ...newExpense, counterpart: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {counterpartOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">CNPJ do Fornecedor</label>
                <Input value={newExpense.supplierCnpj} onChange={(e) => setNewExpense({ ...newExpense, supplierCnpj: e.target.value })} placeholder="00.000.000/0001-00" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Razão Social</label>
                <Input value={newExpense.supplierName} onChange={(e) => setNewExpense({ ...newExpense, supplierName: e.target.value })} placeholder="Nome do fornecedor" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Data da NF</label>
                <Input type="date" value={newExpense.nfDate} onChange={(e) => setNewExpense({ ...newExpense, nfDate: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Valor Utilizado (R$)</label>
                <Input type="number" step="0.01" value={newExpense.value} onChange={(e) => setNewExpense({ ...newExpense, value: e.target.value })} placeholder="0,00" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Valor da NF (R$)</label>
                <Input type="number" step="0.01" value={newExpense.nfValue} onChange={(e) => setNewExpense({ ...newExpense, nfValue: e.target.value })} placeholder="0,00" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleAddExpense}>Adicionar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </TooltipProvider>
  );
};

// Travel Section
const TravelSection = ({
  declarations,
  projectId,
  onEdit,
  onCreate,
  readOnly,
  stageSelectedIds,
  onToggleInStage,
  showCheckboxes,
}: {
  declarations: typeof travelDeclarations;
  projectId: string;
  onEdit: (id: string) => void;
  onCreate: () => void;
  readOnly?: boolean;
  stageSelectedIds: string[];
  onToggleInStage: (id: string) => void;
  showCheckboxes: boolean;
}) => (
  <div className="animate-fade-in">
    {!readOnly && (
      <div className="mb-4">
        <Button size="sm" onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Criar nova declaração de viagem
        </Button>
      </div>
    )}
    {declarations.length === 0 ? (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">
            {readOnly ? 'Nenhuma declaração de viagem nesta PC.' : 'Nenhuma declaração disponível.'}
          </p>
        </CardContent>
      </Card>
    ) : (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {showCheckboxes && <TableHead className="w-10 pl-4"></TableHead>}
                <TableHead className={showCheckboxes ? '' : 'pl-6'}>Declaração</TableHead>
                <TableHead>Viajante</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead className="text-right">Valor total</TableHead>
                <TableHead>Status</TableHead>
                {!readOnly && <TableHead>Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {declarations.map((d) => {
                const total = allExpenses
                  .filter((e) => d.expenseIds.includes(e.id))
                  .reduce((s, e) => s + e.value, 0);
                const isSelected = stageSelectedIds.includes(d.id);
                return (
                  <TableRow key={d.id} className={showCheckboxes && isSelected ? 'bg-primary/5' : ''}>
                    {showCheckboxes && (
                      <TableCell className="pl-4">
                        <Checkbox checked={isSelected} onCheckedChange={() => onToggleInStage(d.id)} />
                      </TableCell>
                    )}
                    <TableCell className={`${showCheckboxes ? '' : 'pl-6'} font-medium`}>{d.name}</TableCell>
                    <TableCell>{d.traveler}</TableCell>
                    <TableCell className="text-sm">{formatDate(d.periodStart)} — {formatDate(d.periodEnd)}</TableCell>
                    <TableCell>{d.destination}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{d.event}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(total)}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === 'pronta' ? 'default' : 'secondary'} className="text-xs">
                        {d.status === 'pronta' ? 'Pronta' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(d.id)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.success('Declaração gerada!')}>
                            <FileCheck className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => toast.info('Exclusão em desenvolvimento')}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )}
  </div>
);

// Personnel Section
const PersonnelSection = ({
  declarations,
  projectId,
  onEdit,
  onCreate,
  readOnly,
  stageSelectedIds,
  onToggleInStage,
  showCheckboxes,
}: {
  declarations: typeof personnelDeclarations;
  projectId: string;
  onEdit: (id: string) => void;
  onCreate: () => void;
  readOnly?: boolean;
  stageSelectedIds: string[];
  onToggleInStage: (id: string) => void;
  showCheckboxes: boolean;
}) => (
  <div className="animate-fade-in">
    {!readOnly && (
      <div className="mb-4">
        <Button size="sm" onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Criar nova declaração de pessoal
        </Button>
      </div>
    )}
    {declarations.length === 0 ? (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">
            {readOnly ? 'Nenhuma declaração de pessoal nesta PC.' : 'Nenhuma declaração disponível.'}
          </p>
        </CardContent>
      </Card>
    ) : (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                {showCheckboxes && <TableHead className="w-10 pl-4"></TableHead>}
                <TableHead className={showCheckboxes ? '' : 'pl-6'}>Declaração</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Qtd. Pessoas</TableHead>
                <TableHead className="text-right">Valor total</TableHead>
                <TableHead>Status</TableHead>
                {!readOnly && <TableHead>Ações</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {declarations.map((d) => {
                const total = allExpenses
                  .filter((e) => d.expenseIds.includes(e.id))
                  .reduce((s, e) => s + e.value, 0);
                const isSelected = stageSelectedIds.includes(d.id);
                return (
                  <TableRow key={d.id} className={showCheckboxes && isSelected ? 'bg-primary/5' : ''}>
                    {showCheckboxes && (
                      <TableCell className="pl-4">
                        <Checkbox checked={isSelected} onCheckedChange={() => onToggleInStage(d.id)} />
                      </TableCell>
                    )}
                    <TableCell className={`${showCheckboxes ? '' : 'pl-6'} font-medium`}>{d.name}</TableCell>
                    <TableCell>{d.reference}</TableCell>
                    <TableCell>{d.team.length}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(total)}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === 'pronta' ? 'default' : 'secondary'} className="text-xs">
                        {d.status === 'pronta' ? 'Pronta' : 'Rascunho'}
                      </Badge>
                    </TableCell>
                    {!readOnly && (
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(d.id)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => toast.success('Declaração gerada!')}>
                            <FileCheck className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => toast.info('Exclusão em desenvolvimento')}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    )}
  </div>
);

export default ProjectDetail;
