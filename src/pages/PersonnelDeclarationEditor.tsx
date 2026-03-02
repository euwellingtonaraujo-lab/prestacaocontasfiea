import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { expenses, personnelDeclarations, collaborators, formatCurrency, formatDate, TeamMember, Collaborator } from '@/data/mockData';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Check, Download, Upload, X, Plus, Users, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const PersonnelDeclarationEditor = () => {
  const { projectId, declarationId } = useParams();
  const navigate = useNavigate();
  const isNew = declarationId === 'nova';

  const existing = personnelDeclarations.find((d) => d.id === declarationId);

  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(
    new Set(existing?.expenseIds || [])
  );
  const [team, setTeam] = useState<TeamMember[]>(existing?.team || []);
  const [attachments, setAttachments] = useState<string[]>(existing?.attachments || []);

  const personnelExpenses = useMemo(
    () => expenses.filter((e) => e.projectId === projectId && e.type === 'pessoal'),
    [projectId]
  );

  const expenseTotal = useMemo(
    () => personnelExpenses.filter((e) => selectedExpenses.has(e.id)).reduce((s, e) => s + e.value, 0),
    [personnelExpenses, selectedExpenses]
  );

  const teamTotal = useMemo(() => team.reduce((s, t) => s + t.value, 0), [team]);

  const toggleExpense = (id: string) => {
    setSelectedExpenses((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addTeamMemberFromCollaborator = (collaboratorId: string) => {
    const col = collaborators.find(c => c.id === collaboratorId);
    if (!col) return;
    // Prevent duplicates
    if (team.some(t => t.name === col.name)) {
      toast.error('Colaborador já adicionado.');
      return;
    }
    setTeam((prev) => [...prev, {
      id: `tm-${Date.now()}`,
      name: col.name,
      role: col.role,
      workHours: col.workHours,
      value: col.monthlySalary,
    }]);
  };

  const removeTeamMember = (id: string) => {
    setTeam((prev) => prev.filter((t) => t.id !== id));
  };

  // Available collaborators (not yet added)
  const availableCollaborators = collaborators.filter(
    c => !team.some(t => t.name === c.name)
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <PageHeader
          title={isNew ? 'Nova Declaração de Pessoal' : 'Editar Declaração de Pessoal'}
          subtitle={`Projeto ${projectId}`}
          backTo={`/projeto/${projectId}`}
        />

        {/* Part A - Select expenses */}
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Despesas da Rubrica de Pessoal</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-10"></TableHead>
                  <TableHead>Conta/Tipo</TableHead>
                  <TableHead>Competência</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Documento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personnelExpenses.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="pl-6">
                      <Checkbox
                        checked={selectedExpenses.has(exp.id)}
                        onCheckedChange={() => toggleExpense(exp.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{exp.item}</TableCell>
                    <TableCell>{exp.competence || '—'}</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(exp.value)}</TableCell>
                    <TableCell>
                      {exp.documentUrl ? (
                        <Badge variant="outline" className="text-xs">Anexado</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {personnelExpenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Nenhuma despesa de pessoal cadastrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t flex justify-end">
              <div className="text-sm">
                <span className="text-muted-foreground">Total consolidado: </span>
                <span className="font-bold text-foreground tabular-nums">{formatCurrency(expenseTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Part B - Team */}
        <Card className="mb-6 animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Relação da Equipe
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select onValueChange={addTeamMemberFromCollaborator}>
                <SelectTrigger className="w-[220px] h-9 text-sm">
                  <SelectValue placeholder="Selecionar colaborador..." />
                </SelectTrigger>
                <SelectContent>
                  {availableCollaborators.length === 0 ? (
                    <SelectItem value="__none" disabled>Todos já adicionados</SelectItem>
                  ) : (
                    availableCollaborators.map((col) => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Nome</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead className="text-right">Carga Horária (h/sem)</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {team.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="pl-6 font-medium">{member.name}</TableCell>
                    <TableCell className="text-muted-foreground">{member.role}</TableCell>
                    <TableCell className="text-right tabular-nums text-muted-foreground">{member.workHours}h</TableCell>
                    <TableCell className="text-right tabular-nums">{formatCurrency(member.value)}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeTeamMember(member.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {team.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-20 text-center text-muted-foreground">
                      Nenhum membro adicionado. Selecione um colaborador acima.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t flex justify-end">
              <div className="text-sm">
                <span className="text-muted-foreground">Total da equipe: </span>
                <span className="font-bold text-foreground tabular-nums">{formatCurrency(teamTotal)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Part C - Attachments */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Documentos Comprobatórios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Documentos da folha de pagamento, comprovantes de FGTS/encargos, etc.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setAttachments((prev) => [...prev, `comprovante_${prev.length + 1}.pdf`]);
                  toast.success('Arquivo anexado!');
                }}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload de arquivo
                </Button>
              </div>
              {attachments.length > 0 && (
                <div className="space-y-2 mt-3">
                  {attachments.map((a, i) => (
                    <div key={i} className="flex items-center justify-between bg-muted rounded-md px-3 py-2">
                      <span className="text-sm">{a}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 pb-8">
          <Button variant="outline" onClick={() => { toast.success('Rascunho salvo!'); navigate(`/projeto/${projectId}`); }}>
            <Save className="h-4 w-4 mr-2" />
            Salvar rascunho
          </Button>
          <Button variant="secondary" onClick={() => toast.success('Declaração marcada como pronta!')}>
            <Check className="h-4 w-4 mr-2" />
            Marcar como Pronta
          </Button>
          <Button onClick={() => toast.success('Declaração exportada!')}>
            <Download className="h-4 w-4 mr-2" />
            Gerar/Exportar Declaração
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PersonnelDeclarationEditor;
