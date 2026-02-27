import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { projects, portfolioOptions, entityOptions, statusLabels, ProjectStatus } from '@/data/mockData';
import { PageHeader } from '@/components/PageHeader';
import { StatusBadge } from '@/components/StatusBadge';
import { DonutChart } from '@/components/DonutChart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDate } from '@/data/mockData';
import { FileText } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState('Todas');
  const [entity, setEntity] = useState('Todas');

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (portfolio !== 'Todas' && p.portfolio !== portfolio) return false;
      if (entity !== 'Todas' && p.entity !== entity) return false;
      return true;
    });
  }, [portfolio, entity]);

  const chartData = useMemo(() => {
    const counts: Record<ProjectStatus, number> = { em_andamento: 0, em_atraso: 0, prazo_proximo: 0 };
    filtered.forEach((p) => counts[p.status]++);
    return [
      { name: statusLabels.em_andamento, value: counts.em_andamento, color: 'hsl(220, 70%, 55%)' },
      { name: statusLabels.em_atraso, value: counts.em_atraso, color: 'hsl(0, 72%, 55%)' },
      { name: statusLabels.prazo_proximo, value: counts.prazo_proximo, color: 'hsl(38, 92%, 50%)' },
    ];
  }, [filtered]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <PageHeader
          title="Prestação de Contas"
          subtitle="Visão geral dos projetos e status de prestação de contas"
        />

        {/* Filters + Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 animate-fade-in">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 mb-1">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Carteira</label>
                  <Select value={portfolio} onValueChange={setPortfolio}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {portfolioOptions.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-muted-foreground">Entidade</label>
                  <Select value={entity} onValueChange={setEntity}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {entityOptions.map((o) => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="animate-fade-in">
            <CardContent className="pt-6">
              <p className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-wider">Resumo</p>
              <DonutChart data={chartData} />
            </CardContent>
          </Card>
        </div>

        {/* Projects table */}
        <Card className="animate-fade-in">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Projeto</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Status da PC</TableHead>
                  <TableHead>Data limite</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((project) => (
                  <TableRow
                    key={project.id}
                    className="cursor-pointer group"
                    onClick={() => navigate(`/projeto/${project.id}`)}
                  >
                    <TableCell className="pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {project.name}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">{project.code}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-foreground">{project.entity}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={project.status} />
                    </TableCell>
                    <TableCell>
                      <span className="text-sm tabular-nums text-foreground">{formatDate(project.deadline)}</span>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                      Nenhum projeto encontrado com os filtros selecionados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
