import { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  onBack?: () => void;
  actions?: ReactNode;
}

export const PageHeader = ({ title, subtitle, backTo, onBack, actions }: PageHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = onBack || (backTo ? () => navigate(backTo) : undefined);

  return (
    <div className="flex items-start justify-between mb-8">
      <div className="flex items-start gap-3">
        {handleBack && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="mt-0.5 shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
};
