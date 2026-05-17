import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/log")({
  component: LogPage,
});

function LogPage() {
  const { data } = useQuery({
    queryKey: ["audit-log"],
    queryFn: async () => {
      const { data } = await supabase
        .from("audit_log")
        .select("id,tabella,record_id,operazione,campo_modificato,valore_precedente,valore_nuovo,utente_id,timestamp")
        .order("timestamp", { ascending: false })
        .limit(200);
      return data ?? [];
    },
  });

  return (
    <div className="p-6 max-w-7xl">
      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5">Quando</th>
              <th className="text-left px-4 py-2.5">Tabella</th>
              <th className="text-left px-4 py-2.5">Operazione</th>
              <th className="text-left px-4 py-2.5">Campo</th>
              <th className="text-left px-4 py-2.5">Prima</th>
              <th className="text-left px-4 py-2.5">Dopo</th>
            </tr>
          </thead>
          <tbody>
            {data && data.length > 0 ? data.map((row) => (
              <tr key={row.id} className="border-t">
                <td className="px-4 py-2 text-muted-foreground whitespace-nowrap">
                  {new Date(row.timestamp).toLocaleString("it-IT")}
                </td>
                <td className="px-4 py-2 font-mono text-xs">{row.tabella}</td>
                <td className="px-4 py-2"><span className="text-xs uppercase">{row.operazione}</span></td>
                <td className="px-4 py-2 font-mono text-xs">{row.campo_modificato ?? "—"}</td>
                <td className="px-4 py-2 text-muted-foreground max-w-xs truncate">{row.valore_precedente ?? "—"}</td>
                <td className="px-4 py-2 max-w-xs truncate">{row.valore_nuovo ?? "—"}</td>
              </tr>
            )) : (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Nessuna modifica registrata.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
