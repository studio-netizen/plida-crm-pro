import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarDays, Wallet, AlertCircle, FileWarning, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/_app/")({
  component: DashboardPage,
});

function StatCard({ icon: Icon, label, value, hint, tone = "default" }: {
  icon: typeof Users; label: string; value: string | number; hint?: string;
  tone?: "default" | "warning" | "destructive" | "success";
}) {
  const toneClass = {
    default: "bg-accent text-accent-foreground",
    warning: "bg-warning/20 text-warning-foreground",
    destructive: "bg-destructive/15 text-destructive",
    success: "bg-success/15 text-success",
  }[tone];
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
            {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
          </div>
          <div className={`h-9 w-9 rounded-md grid place-items-center ${toneClass}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardPage() {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [cand, sess, pagDaVerif, portaleDaIns, oraliKo] = await Promise.all([
        supabase.from("candidati").select("*", { count: "exact", head: true }),
        supabase.from("sessioni").select("*", { count: "exact", head: true }).gte("data_sessione", today),
        supabase.from("pagamenti").select("*", { count: "exact", head: true }).eq("verificato", false),
        supabase.from("iscrizioni").select("*", { count: "exact", head: true }).eq("stato_portale", "da_inserire"),
        supabase.from("iscrizioni").select("*", { count: "exact", head: true }).eq("orale_ok", false),
      ]);
      return {
        candidati: cand.count ?? 0,
        sessioniFuture: sess.count ?? 0,
        pagamentiDaVerificare: pagDaVerif.count ?? 0,
        portaleDaInserire: portaleDaIns.count ?? 0,
        oraliDaConfermare: oraliKo.count ?? 0,
      };
    },
  });

  const { data: prossimeSessioni } = useQuery({
    queryKey: ["dashboard-sessioni"],
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("sessioni")
        .select("id,tipo_esame,livello,data_sessione,sede")
        .gte("data_sessione", today)
        .order("data_sessione", { ascending: true })
        .limit(5);
      return data ?? [];
    },
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={Users} label="Candidati" value={stats?.candidati ?? "—"} />
        <StatCard icon={CalendarDays} label="Sessioni future" value={stats?.sessioniFuture ?? "—"} />
        <StatCard icon={Wallet} label="Pagamenti da verificare" value={stats?.pagamentiDaVerificare ?? "—"} tone="warning" />
        <StatCard icon={FileWarning} label="Portale da inserire" value={stats?.portaleDaInserire ?? "—"} tone="warning" />
        <StatCard icon={AlertCircle} label="Orali da confermare" value={stats?.oraliDaConfermare ?? "—"} tone="destructive" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Prossime sessioni</CardTitle></CardHeader>
          <CardContent>
            {prossimeSessioni && prossimeSessioni.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="text-xs text-muted-foreground uppercase tracking-wider">
                  <tr><th className="text-left py-2">Data</th><th className="text-left">Esame</th><th className="text-left">Livello</th><th className="text-left">Sede</th></tr>
                </thead>
                <tbody>
                  {prossimeSessioni.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="py-2">{new Date(s.data_sessione).toLocaleDateString("it-IT")}</td>
                      <td>{s.tipo_esame}</td>
                      <td>{s.livello}</td>
                      <td className="text-muted-foreground">{s.sede}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-sm text-muted-foreground py-8 text-center">
                Nessuna sessione programmata.
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Accesso rapido</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Link to="/candidati" className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm hover:bg-accent">
              <Users className="h-4 w-4" /> Nuovo candidato
            </Link>
            <Link to="/sessioni" className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm hover:bg-accent">
              <CalendarDays className="h-4 w-4" /> Gestisci sessioni
            </Link>
            <Link to="/pagamenti" className="flex items-center gap-3 rounded-md border px-3 py-2 text-sm hover:bg-accent">
              <ClipboardList className="h-4 w-4" /> Pagamenti da verificare
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
