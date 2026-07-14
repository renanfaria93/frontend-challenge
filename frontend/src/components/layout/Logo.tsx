import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  subtitle?: boolean;
}

export function Logo({ className, subtitle = true }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-sm shadow-indigo-500/30">
        <GraduationCap className="h-5 w-5" strokeWidth={2.25} />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-sm font-semibold tracking-tight text-sidebar-foreground">
          Frontend Challenge
        </span>
        {subtitle && (
          <span className="mt-1 text-xs text-sidebar-foreground/55">Painel acadêmico</span>
        )}
      </div>
    </div>
  );
}
