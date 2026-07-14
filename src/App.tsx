import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import AlunosPage from "@/features/alunos/AlunosPage";
import ProfessoresPage from "@/features/professores/ProfessoresPage";
import DisciplinasPage from "@/features/disciplinas/DisciplinasPage";

function PlaceholderPage({ title }: { title: string }) {
  return <div className="p-8 text-muted-foreground">{title} — em construção.</div>;
}

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<PlaceholderPage title="Dashboard" />} />
        <Route path="/alunos" element={<AlunosPage />} />
        <Route path="/professores" element={<ProfessoresPage />} />
        <Route path="/disciplinas" element={<DisciplinasPage />} />
      </Routes>
    </AppShell>
  );
}

export default App;
