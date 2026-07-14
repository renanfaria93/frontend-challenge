import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import DashboardPage from "@/features/dashboard/DashboardPage";
import AlunosPage from "@/features/alunos/AlunosPage";
import ProfessoresPage from "@/features/professores/ProfessoresPage";
import DisciplinasPage from "@/features/disciplinas/DisciplinasPage";

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/alunos" element={<AlunosPage />} />
        <Route path="/professores" element={<ProfessoresPage />} />
        <Route path="/disciplinas" element={<DisciplinasPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
