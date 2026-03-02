import { useState } from 'react';
import { useAuth, roleLabels, UserRole, AppUser } from '@/contexts/AuthContext';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Plus, Pencil, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { portfolioOptions, entityOptions } from '@/data/mockData';

const emptyForm = { name: '', email: '', role: 'gp' as UserRole, entity: 'Sesi', portfolio: 'Carteira 1' };

const UserManagement = () => {
  const { users, addUser, updateUser, toggleUserActive } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setDialogOpen(true); };
  const openEdit = (u: AppUser) => { setEditingId(u.id); setForm({ name: u.name, email: u.email, role: u.role, entity: u.entity, portfolio: u.portfolio }); setDialogOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.email) { toast.error('Preencha todos os campos'); return; }
    if (editingId) {
      updateUser(editingId, form);
      toast.success('Usuário atualizado!');
    } else {
      addUser({ ...form, active: true });
      toast.success('Usuário criado!');
    }
    setDialogOpen(false);
  };

  const entityOpts = entityOptions.filter((e) => e !== 'Todas');
  const portfolioOpts = portfolioOptions.filter((p) => p !== 'Todas');

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <PageHeader title="Gestão de Usuários" subtitle="Criar, editar e gerenciar acessos ao sistema" backTo="/" actions={
          <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />Novo usuário</Button>
        } />

        <Card className="animate-fade-in">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Nome</TableHead>
                  <TableHead>E-mail</TableHead>
                  <TableHead>Papel</TableHead>
                  <TableHead>Entidade</TableHead>
                  <TableHead>Carteira</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className={!u.active ? 'opacity-50' : ''}>
                    <TableCell className="pl-6 font-medium">{u.name}</TableCell>
                    <TableCell className="font-mono text-sm">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant={u.role === 'escritorio' ? 'default' : 'secondary'} className="text-xs">
                        {u.role === 'gp' ? 'GP' : 'PMO'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{u.entity}</TableCell>
                    <TableCell className="text-sm">{u.portfolio}</TableCell>
                    <TableCell>
                      <Badge variant={u.active ? 'default' : 'outline'} className="text-xs">
                        {u.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(u)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { toggleUserActive(u.id); toast.success(u.active ? 'Usuário desativado' : 'Usuário reativado'); }}>
                          {u.active ? <UserX className="h-3.5 w-3.5 text-destructive" /> : <UserCheck className="h-3.5 w-3.5 text-primary" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
              <DialogDescription>Preencha os dados do usuário abaixo.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nome completo</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Papel de acesso</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as UserRole })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gp">{roleLabels.gp}</SelectItem>
                    <SelectItem value="escritorio">{roleLabels.escritorio}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Entidade</Label>
                  <Select value={form.entity} onValueChange={(v) => setForm({ ...form, entity: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {entityOpts.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Carteira</Label>
                  <Select value={form.portfolio} onValueChange={(v) => setForm({ ...form, portfolio: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {portfolioOpts.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button onClick={handleSave}>{editingId ? 'Salvar' : 'Criar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default UserManagement;
