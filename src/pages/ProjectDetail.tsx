import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projects, expenses, travelDeclarations, personnelDeclarations, rubricOptions, counterpartOptions, formatCurrency, formatDate, Expense, approvalStatusLabels, ApprovalStatus, expenseDiscounts } from '@/data/mockData';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Download, History, FileUp, ExternalLink, Plus, Pencil, Trash2, FileCheck, FileText, Send, CheckCircle, RotateCcw, AlertCircle, Lock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

type ExpenseTab = 'nf' | 'viagem' | 'pessoal';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const project = projects.find((p) => p.id === projectId);
  const [tab, setTab] = useState<ExpenseTab>('nf');
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>(project?.approvalStatus || 'em_elaboracao');
  const [approvalComment, setApprovalComment] = useState('');
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<ApprovalStatus | null>(null);
  const projectExpenses = useMemo(
    () => expenses.filter((e) => e.projectId === projectId && e.type === tab),
    [projectId, tab]
  );

  const projectTravelDecl = useMemo(
    () => travelDeclarations.filter((d) => d.projectId === projectId),
    [projectId]
  );

  const projectPersonnelDecl = useMemo(
    () => personnelDeclarations.filter((d) => d.projectId === projectId),
    [projectId]
  );

  if (!project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Projeto não encontrado.</p>
      </div>
    );
  }

  const handleExport = () => {
    if (approvalStatus !== 'aprovada') {
      toast.error('A PC precisa estar aprovada para exportação final.');
      return;
    }
    toast.success('Planilha exportada com sucesso!');
  };
  const handleHistory = () => toast.info('Histórico de versões — funcionalidade em desenvolvimento');

  const isGP = user?.role === 'gp';
  const isPMO = user?.role === 'escritorio';
  const canEdit = isGP && (approvalStatus === 'em_elaboracao' || approvalStatus === 'ajustes_solicitados');

  const openApprovalDialog = (action: ApprovalStatus) => {
    setPendingAction(action);
    setApprovalComment('');
    setApprovalDialogOpen(true);
  };

  const confirmApproval = () => {
    if (pendingAction) {
      setApprovalStatus(pendingAction);
      toast.success(`Status alterado para: ${approvalStatusLabels[pendingAction]}`);
    }
    setApprovalDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <PageHeader
          title={project.name}
          subtitle={`${project.code} · ${project.entity} · Prazo: ${formatDate(project.deadline)}`}
          backTo="/"
          actions={
            <>
              <Button variant="outline" size="sm" onClick={handleHistory}>
                <History className="h-4 w-4 mr-2" />
                Histórico
              </Button>
              <Button size="sm" onClick={handleExport} disabled={approvalStatus !== 'aprovada'}>
                <Download className="h-4 w-4 mr-2" />
                Exportar planilha
                {approvalStatus !== 'aprovada' && <Lock className="h-3 w-3 ml-1" />}
              </Button>
            </>
          }
        />

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
                {/* GP actions */}
                {isGP && (approvalStatus === 'em_elaboracao' || approvalStatus === 'ajustes_solicitados') && (
                  <Button size="sm" onClick={() => openApprovalDialog('submetida')}>
                    <Send className="h-4 w-4 mr-2" />
                    Submeter para aprovação
                  </Button>
                )}
                {/* PMO actions */}
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

        {/* Status */}
        <div className="mb-6">
          <StatusBadge status={project.status} />
        </div>

        {/* Tab selector */}
        <div className="mb-6">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tipo de despesa</label>
          <Select value={tab} onValueChange={(v) => setTab(v as ExpenseTab)}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nf">Despesas com Nota Fiscal</SelectItem>
              <SelectItem value="viagem">Viagens</SelectItem>
              <SelectItem value="pessoal">Folha de Pessoal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content by tab */}
        {tab === 'nf' && <NFSection expenses={projectExpenses} projectId={projectId!} />}
        {tab === 'viagem' && (
          <TravelSection
            declarations={projectTravelDecl}
            projectId={projectId!}
            onEdit={(id) => navigate(`/projeto/${projectId}/viagem/${id}`)}
            onCreate={() => navigate(`/projeto/${projectId}/viagem/nova`)}
          />
        )}
        {tab === 'pessoal' && (
          <PersonnelSection
            declarations={projectPersonnelDecl}
            projectId={projectId!}
            onEdit={(id) => navigate(`/projeto/${projectId}/pessoal/${id}`)}
            onCreate={() => navigate(`/projeto/${projectId}/pessoal/nova`)}
          />
        )}
      </div>
    </div>
  );
};

// NF Section with inline edit icons and add dialog
const NFSection = ({ expenses: exps, projectId }: { expenses: typeof expenses; projectId: string }) => {
  const [editingCell, setEditingCell] = useState<{ expId: string; field: string } | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [discountDetailExpId, setDiscountDetailExpId] = useState<string | null>(null);
  const [newExpense, setNewExpense] = useState({
    item: '',
    justification: '',
    rubric: 'Equipamentos',
    counterpart: 'Financiador',
    supplierCnpj: '',
    supplierName: '',
    acquisitionDate: '',
    value: '',
  });

  // Build discount map: expenseId -> discounts[]
  const discountMap = useMemo(() => {
    const map: Record<string, typeof expenseDiscounts> = {};
    expenseDiscounts.forEach((d) => {
      if (!map[d.expenseId]) map[d.expenseId] = [];
      map[d.expenseId].push(d);
    });
    return map;
  }, []);

  const getNetValue = (exp: Expense) => {
    const discounts = discountMap[exp.id];
    if (!discounts || discounts.length === 0) return null;
    const totalDiscount = discounts.reduce((sum, d) => sum + Math.abs(d.value), 0);
    return exp.value - totalDiscount;
  };

  const isEditing = (expId: string, field: string) =>
    editingCell?.expId === expId && editingCell?.field === field;

  const startEdit = (expId: string, field: string) => setEditingCell({ expId, field });
  const stopEdit = () => setEditingCell(null);

  const handleAddExpense = () => {
    toast.success('Despesa adicionada com sucesso!');
    setAddDialogOpen(false);
    setNewExpense({ item: '', justification: '', rubric: 'Equipamentos', counterpart: 'Financiador', supplierCnpj: '', supplierName: '', acquisitionDate: '', value: '' });
  };

  const EditableText = ({ expId, field, value, mono }: { expId: string; field: string; value: string; mono?: boolean }) => {
    if (isEditing(expId, field)) {
      return <Input defaultValue={value} className="h-8 text-sm" autoFocus onBlur={stopEdit} onKeyDown={(e) => e.key === 'Enter' && stopEdit()} />;
    }
    const displayValue = field === 'justification' && value.length > 40 ? value.slice(0, 40) + '…' : value;
    return (
      <div className="flex items-center gap-1.5 group/cell cursor-pointer" onClick={() => startEdit(expId, field)}>
        <span className={`text-sm ${mono ? 'font-mono' : ''} truncate`} title={value}>{displayValue || '—'}</span>
        <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/cell:opacity-100 shrink-0 transition-opacity" />
      </div>
    );
  };

  // Discount detail modal data
  const discountDetailDiscounts = discountDetailExpId ? (discountMap[discountDetailExpId] || []) : [];
  const discountDetailExp = discountDetailExpId ? exps.find(e => e.id === discountDetailExpId) : null;

  return (
    <TooltipProvider>
      <Card className="animate-fade-in">
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6 min-w-[160px]">Item/Produto</TableHead>
                <TableHead className="min-w-[180px]">Justificativa</TableHead>
                <TableHead className="min-w-[120px]">Rubrica</TableHead>
                <TableHead className="min-w-[110px]">Contrapartida</TableHead>
                <TableHead className="min-w-[140px]">CNPJ</TableHead>
                <TableHead className="min-w-[160px]">Razão Social</TableHead>
                <TableHead className="min-w-[100px]">Data</TableHead>
                <TableHead className="min-w-[120px] text-right">Valor</TableHead>
                <TableHead className="min-w-[80px]">NF</TableHead>
                <TableHead className="min-w-[140px]">Última edição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exps.map((exp) => {
                const netValue = getNetValue(exp);
                const hasDiscount = netValue !== null;
                return (
                  <TableRow key={exp.id}>
                    <TableCell className="pl-6">
                      <EditableText expId={exp.id} field="item" value={exp.item} />
                    </TableCell>
                    <TableCell>
                      <EditableText expId={exp.id} field="justification" value={exp.justification} />
                    </TableCell>
                    <TableCell>
                      {isEditing(exp.id, 'rubric') ? (
                        <Select defaultValue={exp.rubric} onValueChange={stopEdit}>
                          <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {rubricOptions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="flex items-center gap-1.5 group/cell cursor-pointer" onClick={() => startEdit(exp.id, 'rubric')}>
                          <Badge variant="secondary" className="text-xs">{exp.rubric}</Badge>
                          <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/cell:opacity-100 shrink-0 transition-opacity" />
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
                        <div className="flex items-center gap-1.5 group/cell cursor-pointer" onClick={() => startEdit(exp.id, 'counterpart')}>
                          <span className="text-sm">{exp.counterpart}</span>
                          <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/cell:opacity-100 shrink-0 transition-opacity" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <EditableText expId={exp.id} field="cnpj" value={exp.supplierCnpj} mono />
                    </TableCell>
                    <TableCell>
                      <EditableText expId={exp.id} field="supplier" value={exp.supplierName} />
                    </TableCell>
                    <TableCell>
                      {isEditing(exp.id, 'date') ? (
                        <Input type="date" defaultValue={exp.acquisitionDate} className="h-8 text-sm" autoFocus onBlur={stopEdit} />
                      ) : (
                        <div className="flex items-center gap-1.5 group/cell cursor-pointer" onClick={() => startEdit(exp.id, 'date')}>
                          <span className="text-sm tabular-nums">{formatDate(exp.acquisitionDate)}</span>
                          <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/cell:opacity-100 shrink-0 transition-opacity" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {hasDiscount ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              className="inline-flex items-center gap-1.5 cursor-pointer rounded px-1.5 py-0.5 bg-warning/15 hover:bg-warning/25 transition-colors"
                              onClick={() => setDiscountDetailExpId(exp.id)}
                            >
                              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                              <span className="text-sm tabular-nums font-medium text-warning-foreground">{formatCurrency(netValue!)}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="left" className="max-w-[240px]">
                            <p className="text-xs">Valor líquido (desconto aplicado). Original: {formatCurrency(exp.value)}. Clique para detalhes.</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        isEditing(exp.id, 'value') ? (
                          <Input type="number" defaultValue={exp.value} className="h-8 text-sm text-right" step="0.01" autoFocus onBlur={stopEdit} />
                        ) : (
                          <div className="flex items-center gap-1.5 justify-end group/cell cursor-pointer" onClick={() => startEdit(exp.id, 'value')}>
                            <span className="text-sm tabular-nums">{formatCurrency(exp.value)}</span>
                            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover/cell:opacity-100 shrink-0 transition-opacity" />
                          </div>
                        )
                      )}
                    </TableCell>
                    <TableCell>
                      {exp.documentUrl ? (
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Abrir
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <FileUp className="h-3 w-3 mr-1" />
                          Anexar
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">{exp.lastEditedAt}</p>
                      <p className="text-xs text-muted-foreground">por {exp.lastEditedBy}</p>
                    </TableCell>
                  </TableRow>
                );
              })}
              {exps.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="h-32 text-center text-muted-foreground">
                    Nenhuma despesa cadastrada.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Add row */}
          <div className="p-4 border-t">
            <Button variant="ghost" size="sm" className="text-primary" onClick={() => setAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar despesa
            </Button>
          </div>
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
                <span className="text-muted-foreground">Valor original:</span>
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
                <span className="font-medium">Valor líquido:</span>
                <span className="font-bold tabular-nums text-warning-foreground">{formatCurrency(getNetValue(discountDetailExp)!)}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscountDetailExpId(null)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Expense Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova Despesa</DialogTitle>
            <DialogDescription>Preencha os dados da despesa abaixo.</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
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
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Data de Aquisição</label>
              <Input type="date" value={newExpense.acquisitionDate} onChange={(e) => setNewExpense({ ...newExpense, acquisitionDate: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Valor (R$)</label>
              <Input type="number" step="0.01" value={newExpense.value} onChange={(e) => setNewExpense({ ...newExpense, value: e.target.value })} placeholder="0,00" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddExpense}>Adicionar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

// Travel Section
const TravelSection = ({
  declarations,
  projectId,
  onEdit,
  onCreate,
}: {
  declarations: typeof travelDeclarations;
  projectId: string;
  onEdit: (id: string) => void;
  onCreate: () => void;
}) => (
  <div className="animate-fade-in">
    <div className="mb-4">
      <Button size="sm" onClick={onCreate}>
        <Plus className="h-4 w-4 mr-2" />
        Criar nova declaração de viagem
      </Button>
    </div>
    {declarations.length === 0 ? (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Nenhuma declaração criada.</p>
        </CardContent>
      </Card>
    ) : (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Declaração</TableHead>
                <TableHead>Viajante</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead className="text-right">Valor total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {declarations.map((d) => {
                const total = expenses
                  .filter((e) => d.expenseIds.includes(e.id))
                  .reduce((s, e) => s + e.value, 0);
                return (
                  <TableRow key={d.id}>
                    <TableCell className="pl-6 font-medium">{d.name}</TableCell>
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
}: {
  declarations: typeof personnelDeclarations;
  projectId: string;
  onEdit: (id: string) => void;
  onCreate: () => void;
}) => (
  <div className="animate-fade-in">
    <div className="mb-4">
      <Button size="sm" onClick={onCreate}>
        <Plus className="h-4 w-4 mr-2" />
        Criar nova declaração de pessoal
      </Button>
    </div>
    {declarations.length === 0 ? (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <FileText className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Nenhuma declaração criada.</p>
        </CardContent>
      </Card>
    ) : (
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="pl-6">Declaração</TableHead>
                <TableHead>Referência</TableHead>
                <TableHead>Qtd. Pessoas</TableHead>
                <TableHead className="text-right">Valor total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {declarations.map((d) => {
                const total = expenses
                  .filter((e) => d.expenseIds.includes(e.id))
                  .reduce((s, e) => s + e.value, 0);
                return (
                  <TableRow key={d.id}>
                    <TableCell className="pl-6 font-medium">{d.name}</TableCell>
                    <TableCell>{d.reference}</TableCell>
                    <TableCell>{d.team.length}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(total)}</TableCell>
                    <TableCell>
                      <Badge variant={d.status === 'pronta' ? 'default' : 'secondary'} className="text-xs">
                        {d.status === 'pronta' ? 'Pronta' : 'Rascunho'}
                      </Badge>
                    </TableCell>
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
