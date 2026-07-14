import { NavLink } from "react-router-dom";
import { BookOpen, GraduationCap, LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/alunos", label: "Alunos", icon: GraduationCap, end: false },
  { to: "/professores", label: "Professores", icon: Users, end: false },
  { to: "/disciplinas", label: "Disciplinas", icon: BookOpen, end: false },
];

export function Sidebar() {
  return (
    <nav className="flex h-full w-60 flex-col gap-1 border-r bg-sidebar p-4">
      <span className="mb-4 px-2 text-lg font-semibold text-sidebar-foreground">Admin</span>
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive && "bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary",
            )
          }
        >
          <Icon className="h-4 w-4" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
