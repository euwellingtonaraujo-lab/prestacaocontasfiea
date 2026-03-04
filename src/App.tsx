import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/ProjectDetail";
import TravelDeclarationEditor from "./pages/TravelDeclarationEditor";
import PersonnelDeclarationEditor from "./pages/PersonnelDeclarationEditor";
import UserManagement from "./pages/UserManagement";
import PCSchedule from "./pages/PCSchedule";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AuthGate = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  if (!user) return <Login />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthGate>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/usuarios" element={<UserManagement />} />
              <Route path="/projeto/:projectId" element={<PCSchedule />} />
              <Route path="/projeto/:projectId/pc/:stageId" element={<ProjectDetail />} />
              <Route path="/projeto/:projectId/viagem/:declarationId" element={<TravelDeclarationEditor />} />
              <Route path="/projeto/:projectId/pessoal/:declarationId" element={<PersonnelDeclarationEditor />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthGate>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
