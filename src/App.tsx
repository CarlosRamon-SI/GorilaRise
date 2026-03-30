
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import PainelAtleta from "./pages/PainelAtleta";
import Loja from "./pages/Loja";
import ClubeVantagens from "./pages/ClubeVantagens";
import FichaInscricao from "./pages/FichaInscricao";
import Institucional from "./pages/Institucional";
import NotFound from "./pages/NotFound";
import DietPrescription from "./components/DietPrescription";
import SubscriptionSystem from "./components/SubscriptionSystem";
import ExerciseList from "./components/ExerciseList";
import ListaExercicios from "./components/ListaExercicios";
import SportsDrills from "./components/SportsDrills";
import ScrollToTop from "./components/ScrollToTop";
import { AuthProvider } from "./contexts/AuthContext";
import OTeste from "./pages/OTeste"
import Planos from "./pages/Planos";
import RiseKids from "./pages/RiseKids";
import AdminLayout from "./components/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import Usuarios from "./pages/admin/Usuarios";
import AdminModalidades from "./pages/admin/AdminModalidades";
import AdminPlanos from "./pages/admin/AdminPlanos";
import Matriculas from "./pages/admin/Matriculas";
import Leads from "./pages/admin/Leads"
import AdminProjetos from "./pages/admin/AdminProjetos"
import AdminDocumentos from "./pages/admin/AdminDocumentos"
import ProjetoPage from "./pages/projetos/ProjetoPage";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/painel" element={<PainelAtleta />} />
          <Route path="/loja" element={<Loja />} />
          <Route path="/clube-vantagens" element={<ClubeVantagens />} />
          <Route path="/ficha-inscricao" element={<FichaInscricao />} />
          <Route path="/a-associacao" element={<Institucional />} />
          <Route path="/prescricao-dieta" element={<DietPrescription />} />
          <Route path="/assinatura" element={<SubscriptionSystem />} />
          <Route path="/exercicios" element={<ExerciseList />} />
          <Route path="/lista-exercicios" element={<ListaExercicios />} />
          <Route path="/drills" element={<SportsDrills />} />
          <Route path="/o-teste" element={<OTeste />} />
          <Route path="/rise-kids" element={<RiseKids />} />
          <Route path="/planos" element={<Planos />} />
          {/* Admin panel */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="modalidades" element={<AdminModalidades />} />
            <Route path="planos" element={<AdminPlanos />} />
            <Route path="matriculas" element={<Matriculas />} />
            <Route path="leads" element={<Leads />} />
            <Route path="projetos" element={<AdminProjetos />} />
            <Route path="documentos" element={<AdminDocumentos />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="/projetos/:slug" element={<ProjetoPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
    </AuthProvider>
);

export default App;
