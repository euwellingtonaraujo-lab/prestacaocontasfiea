import { ProjectStatus, statusLabels } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const statusStyles: Record<ProjectStatus, string> = {
  em_andamento: 'bg-primary/10 text-primary border-primary/20',
  em_atraso: 'bg-destructive/10 text-destructive border-destructive/20',
  prazo_proximo: 'bg-warning/10 text-warning border-warning/20',
};

export const StatusBadge = ({ status }: { status: ProjectStatus }) => (
  <Badge variant="outline" className={cn('font-medium text-xs', statusStyles[status])}>
    {statusLabels[status]}
  </Badge>
);
