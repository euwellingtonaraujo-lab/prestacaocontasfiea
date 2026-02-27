import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projects, expenses, travelDeclarations, personnelDeclarations, rubricOptions, counterpartOptions, formatCurrency, formatDate } from '@/data/mockData';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Download, History, FileUp, ExternalLink, Plus, Pencil, Trash2, FileCheck, FileText } from 'lucide-react';
import { toast } from 'sonner';

type ExpenseTab = 'nf' | 'viagem' | 'pessoal';

const ProjectDetail = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const project = projects.find((p) => p.id === projectId);
  const [tab, setTab] = useState<ExpenseTab>('nf');

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

  const handleExport = () => toast.success('Planilha exportada com sucesso!');
  const handleHistory = () => toast.info('Histórico de versões — funcionalidade em desenvolvimento');

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
              <Button size="sm" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Exportar planilha
              </Button>
            </>
          }
        />

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
        {tab === 'nf' && <NFSection expenses={projectExpenses} />}
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

// NF Section
const NFSection = ({ expenses: exps }: { expenses: typeof expenses }) => (
  <Card className="animate-fade-in">
    <CardContent className="p-0 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="pl-6 min-w-[160px]">Item/Produto</TableHead>
            <TableHead className="min-w-[200px]">Justificativa</TableHead>
            <TableHead className="min-w-[120px]">Rubrica</TableHead>
            <TableHead className="min-w-[110px]">Contrapartida</TableHead>
            <TableHead className="min-w-[140px]">CNPJ</TableHead>
            <TableHead className="min-w-[160px]">Razão Social</TableHead>
            <TableHead className="min-w-[110px]">Data</TableHead>
            <TableHead className="min-w-[110px] text-right">Valor</TableHead>
            <TableHead className="min-w-[90px]">NF</TableHead>
            <TableHead className="min-w-[180px]">Última edição</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {exps.map((exp) => (
            <TableRow key={exp.id}>
              <TableCell className="pl-6">
                <Input defaultValue={exp.item} className="h-8 text-sm" />
              </TableCell>
              <TableCell>
                <Textarea defaultValue={exp.justification} className="text-sm min-h-[36px] resize-none" rows={1} />
              </TableCell>
              <TableCell>
                <Select defaultValue={exp.rubric}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {rubricOptions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Select defaultValue={exp.counterpart}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {counterpartOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Input defaultValue={exp.supplierCnpj} className="h-8 text-sm font-mono" />
              </TableCell>
              <TableCell>
                <Input defaultValue={exp.supplierName} className="h-8 text-sm" />
              </TableCell>
              <TableCell>
                <Input type="date" defaultValue={exp.acquisitionDate} className="h-8 text-sm" />
              </TableCell>
              <TableCell className="text-right">
                <Input type="number" defaultValue={exp.value} className="h-8 text-sm text-right" step="0.01" />
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
          ))}
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
        <Button variant="ghost" size="sm" className="text-primary" onClick={() => toast.info('Funcionalidade de adicionar linha em desenvolvimento')}>
          <Plus className="h-4 w-4 mr-2" />
          Adicionar despesa
        </Button>
      </div>
    </CardContent>
  </Card>
);

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
