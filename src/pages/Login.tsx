import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      toast.success('Login realizado com sucesso!');
    } else {
      toast.error('Credenciais inválidas ou usuário inativo.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md animate-fade-in">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-2">
            <LogIn className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-xl">Prestação de Contas</CardTitle>
          <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com.br" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full">
              <LogIn className="h-4 w-4 mr-2" />
              Entrar
            </Button>
          </form>

          <div className="mt-6 p-3 rounded-lg bg-muted">
            <p className="text-xs font-medium text-muted-foreground mb-2">Contas de demonstração:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><span className="font-mono">maria@fiea.org.br</span> — Gerente de Projeto</p>
              <p><span className="font-mono">ana@fiea.org.br</span> — Gerente do Escritório</p>
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 italic">Qualquer senha funciona</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
