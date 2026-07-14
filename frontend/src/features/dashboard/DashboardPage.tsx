import { BookOpen, GraduationCap, Users } from "lucide-react";
import { PageContainer } from "@/components/shared/PageContainer";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/SectionCard";
import { LoadingState } from "@/components/shared/LoadingState";
import { ErrorState } from "@/components/shared/ErrorState";
import { getApiErrorMessage } from "@/api/client";
import { useDashboardSummary } from "./useDashboardSummary";

interface MetricCardProps {
  title: string;
  caption: string;
  value: number;
  icon: React.ReactNode;
}

function MetricCard({ title, caption, value, icon }: MetricCardProps) {
  return (
    <SectionCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{caption}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
    </SectionCard>
  );
}

export default function DashboardPage() {
  const { isLoading, isError, error, totals, refetch } = useDashboardSummary();

  return (
    <PageContainer>
      <PageHeader title="Dashboard" description="Resumo geral do sistema." />

      {isLoading ? <LoadingState label="Carregando resumo..." /> : null}

      {!isLoading && isError ? (
        <ErrorState message={getApiErrorMessage(error)} onRetry={refetch} />
      ) : null}

      {!isLoading && !isError ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MetricCard
            title="Total de Alunos"
            caption="Alunos matriculados"
            value={totals.alunos}
            icon={<GraduationCap className="h-5 w-5" />}
          />
          <MetricCard
            title="Total de Professores"
            caption="Professores no quadro"
            value={totals.professores}
            icon={<Users className="h-5 w-5" />}
          />
          <MetricCard
            title="Total de Disciplinas"
            caption="Disciplinas oferecidas"
            value={totals.disciplinas}
            icon={<BookOpen className="h-5 w-5" />}
          />
        </div>
      ) : null}
    </PageContainer>
  );
}
