import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Users, CalendarDays, Wallet, FileCheck2, History, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/candidati", label: "Candidati", icon: Users },
  { to: "/sessioni", label: "Sessioni", icon: CalendarDays },
  { to: "/pagamenti", label: "Pagamenti", icon: Wallet },
  { to: "/test", label: "Test preliminari", icon: FileCheck2 },
  { to: "/log", label: "Audit log", icon: History },
];

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { profile, signOut } = useAuth();

  return (
    <aside className="hidden md:flex md:w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary text-sidebar-primary-foreground grid place-items-center font-bold">
            P
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold">PLIDA Piacenza</div>
            <div className="text-[11px] uppercase tracking-wider text-sidebar-foreground/60">CRM esami</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = item.exact ? path === item.to : path === item.to || path.startsWith(item.to + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors " +
                (active
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground")
              }
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-sidebar-border p-4 space-y-3">
        <div className="text-xs">
          <div className="text-sidebar-foreground/60">Connessa come</div>
          <div className="font-medium truncate">{profile?.nome_visualizzato ?? profile?.email ?? "—"}</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Esci
        </Button>
      </div>
    </aside>
  );
}
