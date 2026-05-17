import { createFileRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AppSidebar } from "@/components/app-sidebar";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function AppLayout() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/login" });
    }
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen grid place-items-center bg-background">
        <div className="text-sm text-muted-foreground">Caricamento…</div>
      </div>
    );
  }

  // Page title in header
  const titles: Record<string, string> = {
    "/": "Dashboard",
    "/candidati": "Candidati",
    "/sessioni": "Sessioni",
    "/pagamenti": "Pagamenti",
    "/test": "Test preliminari",
    "/log": "Audit log",
  };
  const title = titles[path] ?? (path.startsWith("/candidati") ? "Candidati" : "");

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b bg-card flex items-center justify-between px-6">
          <h1 className="text-base font-semibold tracking-tight">{title}</h1>
        </header>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
