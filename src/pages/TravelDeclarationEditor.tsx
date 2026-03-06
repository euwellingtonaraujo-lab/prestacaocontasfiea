import { useState, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { expenses, travelDeclarations, formatCurrency, formatDate, Traveler } from '@/data/mockData';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Save, Check, Download, Upload, X, Plane, Plus, Trash2, Users, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const TravelDeclarationEditor = () => {
  const { projectId, declarationId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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
  const [travelers, setTravelers] = useState<Traveler[]>(existing?.travelers || []);

  const travelExpenses = useMemo(
    () => expenses.filter((e) => e.projectId === projectId && e.type === 'viagem'),
    [projectId]
  );

  // Find expenses used in OTHER travel declarations
  const usedInOtherDeclarations = useMemo(() => {
    const map = new Map<string, string>();
    travelDeclarations
      .filter(d => d.projectId === projectId && d.id !== declarationId)
      .forEach(d => {
        d.expenseIds.forEach(eid => map.set(eid, d.name));
      });
    return map;
  }, [projectId, declarationId]);

  const total = useMemo(
    () => travelExpenses.filter((e) => selectedExpenses.has(e.id)).reduce((s, e) => s + e.value, 0),
    [travelExpenses, selectedExpenses]
  );

  const travelersTotal = useMemo(() => travelers.reduce((s, t) => s + t.value, 0), [travelers]);

  const toggleExpense = (id: string) => {
    if (usedInOtherDeclarations.has(id)) return;
    setSelectedExpenses((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addTraveler = () => {
    setTravelers((prev) => [...prev, { id: `tv-${Date.now()}`, name: '', role: '', value: 0 }]);
  };

  const updateTraveler = (id: string, field: keyof Traveler, value: string | number) => {
    setTravelers((prev) => prev.map((t) => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTraveler = (id: string) => {
    setTravelers((prev) => prev.filter((t) => t.id !== id));
  };

  const goBack = () => {
    const returnTab = searchParams.get('returnTab');
    const stageId = searchParams.get('stageId');
    if (stageId) {
      navigate(`/projeto/${projectId}/pc/${stageId}${returnTab ? `?tab=${returnTab}` : ''}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <PageHeader
          title={isNew ? 'Nova Declaração de Viagem' : `Editar Declaração de Viagem`}
          subtitle={`Projeto ${projectId}`}
          onBack={goBack}
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
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Viajante principal</label>
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

        {/* Travelers list */}
        <Card className="mb-6 animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              Viajantes
            </CardTitle>
            <Button variant="outline" size="sm" onClick={addTraveler}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar viajante
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Nome</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead className="text-right">Valor (R$)</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {travelers.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="pl-6">
                      <Input value={t.name} onChange={(e) => updateTraveler(t.id, 'name', e.target.value)} className="h-8 text-sm" placeholder="Nome" />
                    </TableCell>
                    <TableCell>
                      <Input value={t.role} onChange={(e) => updateTraveler(t.id, 'role', e.target.value)} className="h-8 text-sm" placeholder="Função" />
                    </TableCell>
                    <TableCell>
                      <Input type="number" step="0.01" value={t.value || ''} onChange={(e) => updateTraveler(t.id, 'value', parseFloat(e.target.value) || 0)} className="h-8 text-sm text-right" />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeTraveler(t.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {travelers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-16 text-center text-muted-foreground">
                      Nenhum viajante adicionado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            {travelers.length > 0 && (
              <div className="p-4 border-t flex justify-end">
                <div className="text-sm">
                  <span className="text-muted-foreground">Total viajantes: </span>
                  <span className="font-bold text-foreground tabular-nums">{formatCurrency(travelersTotal)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Part B - Select expenses */}
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="text-base">Despesas da Viagem</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <TooltipProvider>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="pl-6 w-10"></TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Situação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {travelExpenses.map((exp) => {
                    const usedIn = usedInOtherDeclarations.get(exp.id);
                    const isUsed = !!usedIn;
                    return (
                      <TableRow key={exp.id} className={isUsed ? 'opacity-50' : ''}>
                        <TableCell className="pl-6">
                          <Checkbox
                            checked={selectedExpenses.has(exp.id)}
                            onCheckedChange={() => toggleExpense(exp.id)}
                            disabled={isUsed}
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
                          {isUsed ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="destructive" className="text-[10px] cursor-help">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Já utilizada
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Utilizada em: {usedIn}</p>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span className="text-xs text-muted-foreground">Disponível</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {travelExpenses.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Nenhuma despesa de viagem cadastrada.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TooltipProvider>
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
          <Button variant="outline" onClick={() => { toast.success('Rascunho salvo!'); goBack(); }}>
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
