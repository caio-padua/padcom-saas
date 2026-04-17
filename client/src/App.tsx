import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Home from "./pages/Home";
import Pacientes from "./pages/Pacientes";
import PacienteDetalhe from "./pages/PacienteDetalhe";
import AnamneseIntegrativa from "./pages/AnamneseIntegrativa";
import AnamneseEstetica from "./pages/AnamneseEstetica";
import RelatosDiarios from "./pages/RelatosDiarios";
import Prescricoes from "./pages/Prescricoes";
import ExamesPage from "./pages/Exames";
import SessoesPage from "./pages/Sessoes";
import AlertasPage from "./pages/Alertas";
import ConsultorasPage from "./pages/Consultoras";
import PerguntasPage from "./pages/Perguntas";
import AuditoriaPage from "./pages/Auditoria";
import EvolucaoPage from "./pages/Evolucao";
import PatientPortal from "./pages/PatientPortal";

function DashboardRouter() {
  return (
    <DashboardLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/pacientes" component={Pacientes} />
        <Route path="/pacientes/:id" component={PacienteDetalhe} />
        <Route path="/anamnese-integrativa" component={AnamneseIntegrativa} />
        <Route path="/anamnese-estetica" component={AnamneseEstetica} />
        <Route path="/relatos-diarios" component={RelatosDiarios} />
        <Route path="/prescricoes" component={Prescricoes} />
        <Route path="/exames" component={ExamesPage} />
        <Route path="/sessoes" component={SessoesPage} />
        <Route path="/alertas" component={AlertasPage} />
        <Route path="/consultoras" component={ConsultorasPage} />
        <Route path="/perguntas" component={PerguntasPage} />
        <Route path="/auditoria" component={AuditoriaPage} />
        <Route path="/evolucao" component={EvolucaoPage} />
        <Route component={NotFound} />
      </Switch>
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Patient portal - public, no auth required */}
      <Route path="/portal/:token" component={PatientPortal} />
      <Route path="/portal/:token/:tab" component={PatientPortal} />
      {/* All other routes go through dashboard layout */}
      <Route component={DashboardRouter} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
