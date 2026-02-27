import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import ProjectDetail from "./pages/ProjectDetail";
import TravelDeclarationEditor from "./pages/TravelDeclarationEditor";
import PersonnelDeclarationEditor from "./pages/PersonnelDeclarationEditor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/projeto/:projectId" element={<ProjectDetail />} />
          <Route path="/projeto/:projectId/viagem/:declarationId" element={<TravelDeclarationEditor />} />
          <Route path="/projeto/:projectId/pessoal/:declarationId" element={<PersonnelDeclarationEditor />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
