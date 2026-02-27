import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { expenses, travelDeclarations, formatCurrency, formatDate } from '@/data/mockData';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Save, Check, Download, Upload, X, Plane } from 'lucide-react';
import { toast } from 'sonner';

const TravelDeclarationEditor = () => {
  const { projectId, declarationId } = useParams();
  const navigate = useNavigate();
  const isNew = declarationId === 'nova';

  const existing = travelDeclarations.find((d) => d.id === declarationId);

  const [traveler, setTraveler] = useState(existing?.traveler || '');
  const [periodStart, setPeriodStart] = useState(existing?.periodStart || '');
  const [periodEnd, setPeriodEnd] = useState(existing?.periodEnd || '');
  const [destination, setDestination] = useState(existing?.destination || '');
  const [event, setEvent] = useState(existing?.event || '');
  const [observations, setObservations] = useState(existing?.observations || '');
  const [selectedExpenses, setSelectedExpenses] = useState<Set<string>>(
    new Set(existing?.expenseIds || [])
  );
  const [attachments, setAttachments] = useState<string[]>(existing?.attachments || []);

  const travelExpenses = useMemo(
    () => expenses.filter((e) => e.projectId === projectId && e.type === 'viagem'),
    [projectId]
  );

  const total = useMemo(
    () => travelExpenses.filter((e) => selectedExpenses.has(e.id)).reduce((s, e) => s + e.value, 0),
    [travelExpenses, selectedExpenses]
  );

  const toggleExpense = (id: string) => {
    setSelectedExpenses((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <PageHeader
          title={isNew ? 'Nova Declaração de Viagem' : `Editar Declaração de Viagem`}
          subtitle={`Projeto ${projectId}`}
          backTo={`/projeto/${projectId}`}
        />

        {/* Part A - Travel data */}
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plane className="h-4 w-4 text-primary" />
              Dados da Viagem
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Viajante</label>
                <Input value={traveler} onChange={(e) => setTraveler(e.target.value)} placeholder="Nome do viajante" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Local/Destino</label>
                <Input value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Ex.: Brasília/DF" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Início do período</label>
                <Input type="date" value={periodStart} onChange={(e) => setPeriodStart(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Fim do período</label>
                <Input type="date" value={periodEnd} onChange={(e) => setPeriodEnd(e.target.value)} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Evento/Motivo</label>
                <Input value={event} onChange={(e) => setEvent(e.target.value)} placeholder="Descrição do evento" />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Observações (opcional)</label>
                <Textarea value={observations} onChange={(e) => setObservations(e.target.value)} rows={2} placeholder="Observações adicionais..." />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Part B - Select expenses */}
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Despesas da Viagem</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 w-10"></TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Documento</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {travelExpenses.map((exp) => (
                  <TableRow key={exp.id}>
                    <TableCell className="pl-6">
                      <Checkbox
                        checked={selectedExpenses.has(exp.id)}
                        onCheckedChange={() => toggleExpense(exp.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{exp.description || exp.item}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs capitalize">
                        {exp.travelCategory?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="tabular-nums">{formatDate(exp.acquisitionDate)}</TableCell>
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
                {travelExpenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Nenhuma despesa de viagem cadastrada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="p-4 border-t flex justify-end">
              <div className="text-sm">
                <span className="text-muted-foreground">Total consolidado: </span>
                <span className="font-bold text-foreground tabular-nums">{formatCurrency(total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Part C - Attachments */}
        <Card className="mb-8 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Documentos Vinculados à Declaração</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">
                Comprovantes de pagamento, faturas de intermediadoras, etc.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => {
                  setAttachments((prev) => [...prev, `documento_${prev.length + 1}.pdf`]);
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

export default TravelDeclarationEditor;
