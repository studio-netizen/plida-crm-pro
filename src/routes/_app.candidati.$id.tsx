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
