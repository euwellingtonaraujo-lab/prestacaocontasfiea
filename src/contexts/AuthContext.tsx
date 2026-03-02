import { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'gp' | 'escritorio';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  entity: string;
  portfolio: string;
  active: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  users: AppUser[];
  login: (email: string, password: string) => boolean;
  logout: () => void;
  addUser: (user: Omit<AppUser, 'id'>) => void;
  updateUser: (id: string, data: Partial<AppUser>) => void;
  toggleUserActive: (id: string) => void;
}

const defaultUsers: AppUser[] = [
  { id: 'u1', name: 'Maria Silva', email: 'maria@fiea.org.br', role: 'gp', entity: 'Sesi', portfolio: 'Carteira 1', active: true },
  { id: 'u2', name: 'João Santos', email: 'joao@fiea.org.br', role: 'gp', entity: 'Senai', portfolio: 'Carteira 2', active: true },
  { id: 'u3', name: 'Ana Costa', email: 'ana@fiea.org.br', role: 'escritorio', entity: 'Corporativo', portfolio: 'Carteira 1', active: true },
  { id: 'u4', name: 'Roberto Lima', email: 'roberto@fiea.org.br', role: 'escritorio', entity: 'Corporativo', portfolio: 'Carteira 2', active: true },
];

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const roleLabels: Record<UserRole, string> = {
  gp: 'Gerente de Projeto',
  escritorio: 'Gerente do Escritório (PMO)',
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [users, setUsers] = useState<AppUser[]>(defaultUsers);

  const login = (email: string, _password: string) => {
    const found = users.find((u) => u.email === email && u.active);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const logout = () => setUser(null);

  const addUser = (data: Omit<AppUser, 'id'>) => {
    const newUser: AppUser = { ...data, id: `u${Date.now()}` };
    setUsers((prev) => [...prev, newUser]);
  };

  const updateUser = (id: string, data: Partial<AppUser>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...data } : u)));
    if (user?.id === id) setUser((prev) => (prev ? { ...prev, ...data } : prev));
  };

  const toggleUserActive = (id: string) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)));
  };

  return (
    <AuthContext.Provider value={{ user, users, login, logout, addUser, updateUser, toggleUserActive }}>
      {children}
    </AuthContext.Provider>
  );
};
