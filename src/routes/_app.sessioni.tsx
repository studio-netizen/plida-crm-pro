import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, CalendarDays } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/sessioni")({
  component: SessioniPage,
});

const LIVELLI = ["A2", "B1", "B2", "C1"] as const;
const TIPI = ["PLIDA", "CILS", "CELI"] as const;
type Livello = (typeof LIVELLI)[number];
type Tipo = (typeof TIPI)[number];

type Sessione = {
  id: string;
  data_sessione: string;
  tipo_esame: Tipo;
  livello: Livello;
  sede: string;
  note: string | null;
  iscritti?: { count: number }[];
};

function SessioniPage() {
  const [tipo, setTipo] = useState<string>("tutti");
  const [livello, setLivello] = useState<string>("tutti");
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["sessioni", tipo, livello],
    queryFn: async () => {
      let req = supabase
        .from("sessioni")
        .select("id,data_sessione,tipo_esame,livello,sede,note, iscritti:iscrizioni(count)")
        .order("data_sessione", { ascending: false })
        .limit(200);
      if (tipo !== "tutti") req = req.eq("tipo_esame", tipo as Tipo);
      if (livello !== "tutti") req = req.eq("livello", livello as Livello);
      const { data, error } = await req;
      if (error) throw error;
      return data as Sessione[];
    },
  });

  const createMut = useMutation({
    mutationFn: async (v: { data_sessione: string; tipo_esame: Tipo; livello: Livello; sede: string; note: string }) => {
      const { data, error } = await supabase.from("sessioni").insert({
        data_sessione: v.data_sessione,
        tipo_esame: v.tipo_esame,
        livello: v.livello,
        sede: v.sede || "Piacenza",
        note: v.note || null,
      }).select("id").single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Sessione creata");
      qc.invalidateQueries({ queryKey: ["sessioni"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error("Errore", { description: e.message }),
  });

  return (
    <div className="p-6 space-y-4 max-w-7xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Select value={tipo} onValueChange={setTipo}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tutti">Tutti i tipi</SelectItem>
              {TIPI.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={livello} onValueChange={setLivello}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Livello" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="tutti">Tutti i livelli</SelectItem>
              {LIVELLI.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nuova sessione</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuova sessione</DialogTitle></DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                createMut.mutate({
                  data_sessione: String(fd.get("data") ?? ""),
                  tipo_esame: String(fd.get("tipo") ?? "PLIDA") as Tipo,
                  livello: String(fd.get("livello") ?? "B1") as Livello,
                  sede: String(fd.get("sede") ?? "Piacenza"),
                  note: String(fd.get("note") ?? ""),
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="data">Data sessione *</Label>
                  <Input id="data" name="data" type="date" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sede">Sede</Label>
                  <Input id="sede" name="sede" defaultValue="Piacenza" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tipo">Tipo esame *</Label>
                  <select id="tipo" name="tipo" required className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {TIPI.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="livello">Livello *</Label>
                  <select id="livello" name="livello" required defaultValue="B1" className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                    {LIVELLI.map((l) => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="note">Note</Label>
                <Textarea id="note" name="note" rows={3} />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annulla</Button>
                <Button type="submit" disabled={createMut.isPending}>{createMut.isPending ? "Creazione…" : "Crea"}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5">Data</th>
              <th className="text-left px-4 py-2.5">Tipo</th>
              <th className="text-left px-4 py-2.5">Livello</th>
              <th className="text-left px-4 py-2.5">Sede</th>
              <th className="text-right px-4 py-2.5">Iscritti</th>
              <th className="text-left px-4 py-2.5">Note</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Caricamento…</td></tr>
            ) : data && data.length > 0 ? (
              data.map((s) => (
                <tr key={s.id} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">
                    <Link to="/sessioni/$id" params={{ id: s.id }} className="inline-flex items-center gap-2 hover:underline">
                      <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                      {new Date(s.data_sessione).toLocaleDateString("it-IT")}
                    </Link>
                  </td>
                  <td className="px-4 py-2"><span className="inline-flex rounded-md bg-muted px-2 py-0.5 text-xs font-medium">{s.tipo_esame}</span></td>
                  <td className="px-4 py-2"><span className="inline-flex rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-semibold">{s.livello}</span></td>
                  <td className="px-4 py-2 text-muted-foreground">{s.sede}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{s.iscritti?.[0]?.count ?? 0}</td>
                  <td className="px-4 py-2 text-muted-foreground truncate max-w-[280px]">{s.note ?? "—"}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nessuna sessione.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
