import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/candidati/")({
  component: CandidatiPage,
});

type Candidato = {
  id: string;
  cognome: string;
  nome: string;
  email: string | null;
  telefono: string | null;
  paese_origine: string | null;
  created_at: string;
};

function CandidatiPage() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["candidati", q],
    queryFn: async () => {
      let req = supabase
        .from("candidati")
        .select("id,cognome,nome,email,telefono,paese_origine,created_at")
        .order("cognome", { ascending: true })
        .limit(500);
      if (q.trim()) {
        const term = `%${q.trim()}%`;
        req = req.or(
          `cognome.ilike.${term},nome.ilike.${term},email.ilike.${term},paese_origine.ilike.${term}`
        );
      }
      const { data, error } = await req;
      if (error) throw error;
      return data as Candidato[];
    },
  });

  const createMut = useMutation({
    mutationFn: async (vals: { cognome: string; nome: string; email: string; telefono: string }) => {
      const { data, error } = await supabase
        .from("candidati")
        .insert({
          cognome: vals.cognome.trim(),
          nome: vals.nome.trim(),
          email: vals.email.trim() || null,
          telefono: vals.telefono.trim() || null,
        })
        .select("id")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Candidato creato");
      qc.invalidateQueries({ queryKey: ["candidati"] });
      setOpen(false);
    },
    onError: (e: Error) => toast.error("Errore", { description: e.message }),
  });

  return (
    <div className="p-6 space-y-4 max-w-7xl">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca per cognome, nome, email, paese…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nuovo candidato</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Nuovo candidato</DialogTitle></DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                createMut.mutate({
                  cognome: String(fd.get("cognome") ?? ""),
                  nome: String(fd.get("nome") ?? ""),
                  email: String(fd.get("email") ?? ""),
                  telefono: String(fd.get("telefono") ?? ""),
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cognome">Cognome *</Label>
                  <Input id="cognome" name="cognome" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="nome">Nome *</Label>
                  <Input id="nome" name="nome" required />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="telefono">Telefono</Label>
                <Input id="telefono" name="telefono" />
              </div>
              <DialogFooter>
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Annulla</Button>
                <Button type="submit" disabled={createMut.isPending}>
                  {createMut.isPending ? "Creazione…" : "Crea"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5">Cognome</th>
              <th className="text-left px-4 py-2.5">Nome</th>
              <th className="text-left px-4 py-2.5">Email</th>
              <th className="text-left px-4 py-2.5">Telefono</th>
              <th className="text-left px-4 py-2.5">Paese</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Caricamento…</td></tr>
            ) : data && data.length > 0 ? (
              data.map((c) => (
                <tr key={c.id} className="border-t hover:bg-muted/30 cursor-pointer">
                  <td className="px-4 py-2 font-medium">
                    <Link to="/candidati/$id" params={{ id: c.id }} className="hover:underline">
                      {c.cognome}
                    </Link>
                  </td>
                  <td className="px-4 py-2">
                    <Link to="/candidati/$id" params={{ id: c.id }} className="hover:underline">
                      {c.nome}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{c.email ?? "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{c.telefono ?? "—"}</td>
                  <td className="px-4 py-2 text-muted-foreground">{c.paese_origine ?? "—"}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">Nessun candidato trovato.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
