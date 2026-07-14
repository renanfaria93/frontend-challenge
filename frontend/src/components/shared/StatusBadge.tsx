import { Badge } from "@/components/ui/badge";
import type { StatusEntidade } from "@/types/common";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: StatusEntidade;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const isAtivo = status === "ativo";
  return (
    <Badge
      variant="outline"
      className={cn(
        "border-transparent",
        isAtivo
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
      )}
    >
      {isAtivo ? "Ativo" : "Inativo"}
    </Badge>
  );
}
