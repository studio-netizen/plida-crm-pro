import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/candidati/$id")({
  component: CandidatoDetailPage,
});

type Candidato = {
  id: string;
  cognome: string;
  nome: string;
  luogo_nascita: string | null;
  data_nascita: string | null;
  email: string | null;
  telefono: string | null;
  lingua_madre: string | null;
  paese_origine: string | null;
  titolo_studi: string | null;
  note_generali: string | null;
  created_at: string;
  updated_at: string;
};

function CandidatoDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();

  const { data: cand, isLoading } = useQuery({
    queryKey: ["candidato", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("candidati").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Candidato;
    },
  });

  const [form, setForm] = useState<Partial<Candidato>>({});
  useEffect(() => { if (cand) setForm(cand); }, [cand]);

  const saveMut = useMutation({
    mutationFn: async (vals: Partial<Candidato>) => {
      const { error } = await supabase.from("candidati").update({
        cognome: vals.cognome,
        nome: vals.nome,
        luogo_nascita: vals.luogo_nascita || null,
        data_nascita: vals.data_nascita || null,
        email: vals.email || null,
        telefono: vals.telefono || null,
        lingua_madre: vals.lingua_madre || null,
        paese_origine: vals.paese_origine || null,
        titolo_studi: vals.titolo_studi || null,
        note_generali: vals.note_generali || null,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Modifiche salvate");
      qc.invalidateQueries({ queryKey: ["candidato", id] });
    },
    onError: (e: Error) => toast.error("Errore", { description: e.message }),
  });

  if (isLoading || !cand) {
    return <div className="p-6 text-sm text-muted-foreground">Caricamento…</div>;
  }

  const set = <K extends keyof Candidato>(k: K, v: Candidato[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="p-6 space-y-4 max-w-5xl">
      <div className="flex items-center justify-between">
        <Link to="/candidati" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Torna ai candidati
        </Link>
        <div className="text-right">
          <h2 className="text-xl font-semibold">{cand.cognome} {cand.nome}</h2>
          <p className="text-xs text-muted-foreground">Creato il {new Date(cand.created_at).toLocaleDateString("it-IT")}</p>
        </div>
      </div>

      <Tabs defaultValue="anagrafica">
        <TabsList>
          <TabsTrigger value="anagrafica">Anagrafica</TabsTrigger>
          <TabsTrigger value="profilo" disabled>Profilo linguistico</TabsTrigger>
          <TabsTrigger value="iscrizioni">Iscrizioni</TabsTrigger>
          <TabsTrigger value="pagamenti">Pagamenti</TabsTrigger>
          <TabsTrigger value="log" disabled>Note & Log</TabsTrigger>
        </TabsList>

        <TabsContent value="iscrizioni">
          <IscrizioniTab candidatoId={id} />
        </TabsContent>
        <TabsContent value="pagamenti">
          <PagamentiTab candidatoId={id} />
        </TabsContent>

        <TabsContent value="anagrafica">
          <Card>
            <CardContent className="p-6">
              <form
                onSubmit={(e) => { e.preventDefault(); saveMut.mutate(form); }}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <Field label="Cognome *"><Input value={form.cognome ?? ""} onChange={(e) => set("cognome", e.target.value)} required /></Field>
                <Field label="Nome *"><Input value={form.nome ?? ""} onChange={(e) => set("nome", e.target.value)} required /></Field>
                <Field label="Luogo di nascita"><Input value={form.luogo_nascita ?? ""} onChange={(e) => set("luogo_nascita", e.target.value)} /></Field>
                <Field label="Data di nascita"><Input type="date" value={form.data_nascita ?? ""} onChange={(e) => set("data_nascita", e.target.value)} /></Field>
                <Field label="Email"><Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} /></Field>
                <Field label="Telefono"><Input value={form.telefono ?? ""} onChange={(e) => set("telefono", e.target.value)} /></Field>
                <Field label="Lingua madre"><Input value={form.lingua_madre ?? ""} onChange={(e) => set("lingua_madre", e.target.value)} /></Field>
                <Field label="Paese di origine"><Input value={form.paese_origine ?? ""} onChange={(e) => set("paese_origine", e.target.value)} /></Field>
                <Field label="Titolo di studio" wide><Input value={form.titolo_studi ?? ""} onChange={(e) => set("titolo_studi", e.target.value)} /></Field>
                <Field label="Note generali" wide>
                  <Textarea rows={4} value={form.note_generali ?? ""} onChange={(e) => set("note_generali", e.target.value)} />
                </Field>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" disabled={saveMut.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {saveMut.isPending ? "Salvataggio…" : "Salva modifiche"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={"space-y-1.5 " + (wide ? "md:col-span-2" : "")}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

type IscrRow = {
  id: string;
  tipo_iscrizione: "completo" | "recupero" | "urgenza";
  stato_portale: "da_inserire" | "inserito";
  quota_totale: number | null;
  note: string | null;
  sessioni: { id: string; data_sessione: string; tipo_esame: string; livello: string } | null;
};

function IscrizioniTab({ candidatoId }: { candidatoId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["cand-iscr", candidatoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("iscrizioni")
        .select("id,tipo_iscrizione,stato_portale,quota_totale,note, sessioni(id,data_sessione,tipo_esame,livello)")
        .eq("candidato_id", candidatoId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as IscrRow[];
    },
  });
  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Caricamento…</div>;
  if (!data || data.length === 0) return <div className="p-6 text-sm text-muted-foreground">Nessuna iscrizione.</div>;
  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5">Sessione</th>
              <th className="text-left px-4 py-2.5">Tipo</th>
              <th className="text-left px-4 py-2.5">Portale</th>
              <th className="text-right px-4 py-2.5">Quota</th>
              <th className="text-left px-4 py-2.5">Note</th>
            </tr>
          </thead>
          <tbody>
            {data.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="px-4 py-2">
                  {i.sessioni ? (
                    <Link to="/sessioni/$id" params={{ id: i.sessioni.id }} className="hover:underline font-medium">
                      {i.sessioni.tipo_esame} {i.sessioni.livello} — {new Date(i.sessioni.data_sessione).toLocaleDateString("it-IT")}
                    </Link>
                  ) : "—"}
                </td>
                <td className="px-4 py-2 text-xs">{i.tipo_iscrizione}</td>
                <td className="px-4 py-2 text-xs">{i.stato_portale === "inserito" ? "✓ inserito" : "da inserire"}</td>
                <td className="px-4 py-2 text-right tabular-nums">{i.quota_totale != null ? `€ ${Number(i.quota_totale).toFixed(2)}` : "—"}</td>
                <td className="px-4 py-2 text-xs text-muted-foreground max-w-[280px]">{i.note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}

type PagRow = {
  id: string;
  importo: number;
  metodo: "bonifico" | "contante";
  data_ricevuta: string | null;
  data_bonifico_banca: string | null;
  numero_ricevuta: string | null;
  verificato: boolean;
  note: string | null;
  iscrizioni: { id: string; sessioni: { tipo_esame: string; livello: string; data_sessione: string } | null } | null;
};

function PagamentiTab({ candidatoId }: { candidatoId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["cand-pag", candidatoId],
    queryFn: async () => {
      const { data: iscr, error: e1 } = await supabase.from("iscrizioni").select("id").eq("candidato_id", candidatoId);
      if (e1) throw e1;
      const ids = (iscr ?? []).map((x) => x.id);
      if (ids.length === 0) return [] as PagRow[];
      const { data, error } = await supabase
        .from("pagamenti")
        .select("id,importo,metodo,data_ricevuta,data_bonifico_banca,numero_ricevuta,verificato,note, iscrizioni(id, sessioni(tipo_esame,livello,data_sessione))")
        .in("iscrizione_id", ids)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as unknown as PagRow[];
    },
  });
  if (isLoading) return <div className="p-4 text-sm text-muted-foreground">Caricamento…</div>;
  if (!data || data.length === 0) return <div className="p-6 text-sm text-muted-foreground">Nessun pagamento registrato.</div>;
  return (
    <Card>
      <CardContent className="p-0">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5">Data</th>
              <th className="text-left px-4 py-2.5">Sessione</th>
              <th className="text-left px-4 py-2.5">Metodo</th>
              <th className="text-right px-4 py-2.5">Importo</th>
              <th className="text-left px-4 py-2.5">Stato</th>
            </tr>
          </thead>
          <tbody>
            {data.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="px-4 py-2">{p.data_ricevuta ?? p.data_bonifico_banca ?? "—"}</td>
                <td className="px-4 py-2 text-xs">
                  {p.iscrizioni?.sessioni
                    ? `${p.iscrizioni.sessioni.tipo_esame} ${p.iscrizioni.sessioni.livello} — ${new Date(p.iscrizioni.sessioni.data_sessione).toLocaleDateString("it-IT")}`
                    : "—"}
                </td>
                <td className="px-4 py-2 text-xs">{p.metodo}</td>
                <td className="px-4 py-2 text-right tabular-nums">€ {Number(p.importo).toFixed(2)}</td>
                <td className="px-4 py-2 text-xs">
                  {p.verificato ? <span className="text-emerald-600">verificato</span> : <span className="text-amber-600">da verificare</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
