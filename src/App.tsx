import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";

function PlaceholderPage({ title }: { title: string }) {
  return <div className="p-8 text-muted-foreground">{title} — em construção.</div>;
}

function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<PlaceholderPage title="Dashboard" />} />
        <Route path="/alunos" element={<PlaceholderPage title="Alunos" />} />
        <Route path="/professores" element={<PlaceholderPage title="Professores" />} />
        <Route path="/disciplinas" element={<PlaceholderPage title="Disciplinas" />} />
      </Routes>
    </AppShell>
  );
}

export default App;
