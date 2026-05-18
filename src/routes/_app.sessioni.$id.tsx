import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, AlertTriangle, RotateCcw, CircleCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/sessioni/$id")({
  component: SessioneDetailPage,
});

const ABILITA = ["ascolto", "lettura", "scrittura", "parlato"] as const;
const GIORNI_ORALE = ["lun", "mar", "mer", "gio", "ven", "sab"] as const;
type TipoIscrizione = "completo" | "recupero" | "urgenza";
type StatoPortale = "da_inserire" | "inserito";

type Sessione = {
  id: string;
  data_sessione: string;
  tipo_esame: string;
  livello: string;
  sede: string;
  note: string | null;
};

type Iscrizione = {
  id: string;
  candidato_id: string;
  tipo_iscrizione: TipoIscrizione;
  abilita_recupero: string[] | null;
  giorno_orale: string | null;
  stato_portale: StatoPortale;
  codice_esame_roma: string | null;
  cod_articolo: string | null;
  quota_totale: number | null;
  note: string | null;
  candidati: { id: string; cognome: string; nome: string; email: string | null; telefono: string | null } | null;
  urgenze: { id: string; quota_plida: number | null; quota_nostra: number | null; pagato: boolean }[];
};

function SessioneDetailPage() {
  const { id } = Route.useParams();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: sess } = useQuery({
    queryKey: ["sessione", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("sessioni").select("*").eq("id", id).single();
      if (error) throw error;
      return data as Sessione;
    },
  });

  const { data: iscr, isLoading } = useQuery({
    queryKey: ["sessione-iscr", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("iscrizioni")
        .select("id,candidato_id,tipo_iscrizione,abilita_recupero,giorno_orale,stato_portale,codice_esame_roma,cod_articolo,quota_totale,note, candidati(id,cognome,nome,email,telefono), urgenze(id,quota_plida,quota_nostra,pagato)")
        .eq("sessione_id", id)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data as unknown as Iscrizione[];
    },
  });

  const togglePortale = useMutation({
    mutationFn: async (v: { id: string; stato: StatoPortale }) => {
      const { error } = await supabase.from("iscrizioni").update({ stato_portale: v.stato }).eq("id", v.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sessione-iscr", id] }),
    onError: (e: Error) => toast.error("Errore", { description: e.message }),
  });

  if (!sess) return <div className="p-6 text-sm text-muted-foreground">Caricamento…</div>;

  return (
    <div className="p-6 space-y-4 max-w-7xl">
      <div className="flex items-center justify-between">
        <Link to="/sessioni" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 mr-1" /> Torna alle sessioni
        </Link>
        <div className="text-right">
          <h2 className="text-xl font-semibold">
            {sess.tipo_esame} {sess.livello} — {new Date(sess.data_sessione).toLocaleDateString("it-IT")}
          </h2>
          <p className="text-xs text-muted-foreground">{sess.sede}{sess.note ? ` · ${sess.note}` : ""}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nuova iscrizione</Button>
          </DialogTrigger>
          <NewIscrizioneDialog sessioneId={id} onClose={() => setOpen(false)} />
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5">Candidato</th>
              <th className="text-left px-4 py-2.5">Tipo</th>
              <th className="text-left px-4 py-2.5">Abilità rec.</th>
              <th className="text-left px-4 py-2.5">Orale</th>
              <th className="text-left px-4 py-2.5">Cod. Roma</th>
              <th className="text-right px-4 py-2.5">Quota</th>
              <th className="text-left px-4 py-2.5">Portale</th>
              <th className="text-left px-4 py-2.5">Note</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Caricamento…</td></tr>
            ) : iscr && iscr.length > 0 ? (
              iscr.map((i) => (
                <tr key={i.id} className="border-t hover:bg-muted/30 align-top">
                  <td className="px-4 py-2.5">
                    {i.candidati ? (
                      <Link to="/candidati/$id" params={{ id: i.candidati.id }} className="font-medium hover:underline">
                        {i.candidati.cognome} {i.candidati.nome}
                      </Link>
                    ) : "—"}
                    <div className="text-xs text-muted-foreground">{i.candidati?.telefono ?? i.candidati?.email ?? ""}</div>
                  </td>
                  <td className="px-4 py-2.5">
                    {i.tipo_iscrizione === "urgenza" && (
                      <span className="inline-flex items-center gap-1 rounded bg-destructive/10 text-destructive px-1.5 py-0.5 text-xs font-medium">
                        <AlertTriangle className="h-3 w-3" />urgenza
                      </span>
                    )}
                    {i.tipo_iscrizione === "recupero" && (
                      <span className="inline-flex items-center gap-1 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 px-1.5 py-0.5 text-xs font-medium">
                        <RotateCcw className="h-3 w-3" />recupero
                      </span>
                    )}
                    {i.tipo_iscrizione === "completo" && (
                      <span className="text-xs text-muted-foreground">completo</span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-xs">{(i.abilita_recupero ?? []).join(", ") || "—"}</td>
                  <td className="px-4 py-2.5 text-xs">{i.giorno_orale ?? "—"}</td>
                  <td className="px-4 py-2.5 text-xs font-mono">{i.codice_esame_roma ?? "—"}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">
                    {i.quota_totale != null ? `€ ${Number(i.quota_totale).toFixed(2)}` : "—"}
                    {i.urgenze.length > 0 && (
                      <div className="text-[10px] text-muted-foreground">
                        +urg: PLIDA {i.urgenze[0].quota_plida ?? 0} / noi {i.urgenze[0].quota_nostra ?? 0}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2.5">
                    <button
                      onClick={() =>
                        togglePortale.mutate({ id: i.id, stato: i.stato_portale === "inserito" ? "da_inserire" : "inserito" })
                      }
                      className={
                        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium transition-colors " +
                        (i.stato_portale === "inserito"
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/70")
                      }
                    >
                      {i.stato_portale === "inserito" ? <><CircleCheck className="h-3 w-3" />inserito</> : "da inserire"}
                    </button>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-foreground/90 max-w-[260px] whitespace-pre-wrap">
                    {i.note ? <span className="block rounded bg-amber-50 dark:bg-amber-950/30 px-2 py-1">{i.note}</span> : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">Nessuna iscrizione. Aggiungi la prima.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function NewIscrizioneDialog({ sessioneId, onClose }: { sessioneId: string; onClose: () => void }) {
  const qc = useQueryClient();
  const [candidatoId, setCandidatoId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [tipo, setTipo] = useState<TipoIscrizione>("completo");
  const [abilita, setAbilita] = useState<string[]>([]);
  const [giorno, setGiorno] = useState<string>("");
  const [codiceRoma, setCodiceRoma] = useState("");
  const [codArticolo, setCodArticolo] = useState("");
  const [quotaTot, setQuotaTot] = useState("");
  const [note, setNote] = useState("");
  const [quotaPlida, setQuotaPlida] = useState("");
  const [quotaNostra, setQuotaNostra] = useState("");

  const { data: candidates } = useQuery({
    queryKey: ["candidati-search", search],
    queryFn: async () => {
      let req = supabase.from("candidati").select("id,cognome,nome,email").order("cognome").limit(30);
      if (search.trim()) {
        const t = `%${search.trim()}%`;
        req = req.or(`cognome.ilike.${t},nome.ilike.${t},email.ilike.${t}`);
      }
      const { data, error } = await req;
      if (error) throw error;
      return data as { id: string; cognome: string; nome: string; email: string | null }[];
    },
  });

  const selected = useMemo(() => candidates?.find((c) => c.id === candidatoId), [candidates, candidatoId]);

  const createMut = useMutation({
    mutationFn: async () => {
      if (!candidatoId) throw new Error("Seleziona un candidato");
      const { data: ins, error } = await supabase.from("iscrizioni").insert({
        candidato_id: candidatoId,
        sessione_id: sessioneId,
        tipo_iscrizione: tipo,
        abilita_recupero: tipo === "recupero" ? abilita : [],
        giorno_orale: giorno ? (giorno as "lun" | "mar" | "mer" | "gio" | "ven" | "sab") : null,
        codice_esame_roma: codiceRoma || null,
        cod_articolo: codArticolo || null,
        quota_totale: quotaTot ? Number(quotaTot) : null,
        note: note || null,
      }).select("id").single();
      if (error) throw error;
      if (tipo === "urgenza") {
        const { error: e2 } = await supabase.from("urgenze").insert({
          iscrizione_id: ins.id,
          quota_plida: quotaPlida ? Number(quotaPlida) : null,
          quota_nostra: quotaNostra ? Number(quotaNostra) : null,
        });
        if (e2) throw e2;
      }
    },
    onSuccess: () => {
      toast.success("Iscrizione creata");
      qc.invalidateQueries({ queryKey: ["sessione-iscr", sessioneId] });
      qc.invalidateQueries({ queryKey: ["sessioni"] });
      onClose();
    },
    onError: (e: Error) => toast.error("Errore", { description: e.message }),
  });

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader><DialogTitle>Nuova iscrizione</DialogTitle></DialogHeader>
      <form
        onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label>Candidato *</Label>
          <Input placeholder="Cerca per cognome/nome/email…" value={search} onChange={(e) => setSearch(e.target.value)} />
          <div className="max-h-40 overflow-auto rounded border bg-background">
            {(candidates ?? []).map((c) => (
              <button
                type="button"
                key={c.id}
                onClick={() => setCandidatoId(c.id)}
                className={
                  "block w-full text-left px-3 py-1.5 text-sm hover:bg-muted " +
                  (candidatoId === c.id ? "bg-primary/10 font-medium" : "")
                }
              >
                {c.cognome} {c.nome} <span className="text-xs text-muted-foreground">{c.email ?? ""}</span>
              </button>
            ))}
            {candidates && candidates.length === 0 && (
              <div className="px-3 py-2 text-xs text-muted-foreground">Nessun candidato.</div>
            )}
          </div>
          {selected && (
            <div className="text-xs text-muted-foreground">Selezionato: <strong>{selected.cognome} {selected.nome}</strong></div>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-1.5">
            <Label>Tipo iscrizione</Label>
            <select value={tipo} onChange={(e) => setTipo(e.target.value as TipoIscrizione)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="completo">Completo</option>
              <option value="recupero">Recupero</option>
              <option value="urgenza">Urgenza</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Giorno orale</Label>
            <select value={giorno} onChange={(e) => setGiorno(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
              <option value="">—</option>
              {GIORNI_ORALE.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <Label>Quota totale (€)</Label>
            <Input type="number" step="0.01" value={quotaTot} onChange={(e) => setQuotaTot(e.target.value)} />
          </div>
        </div>

        {tipo === "recupero" && (
          <div className="space-y-1.5 rounded-md border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 p-3">
            <Label>Abilità da recuperare</Label>
            <div className="flex gap-4">
              {ABILITA.map((a) => (
                <label key={a} className="flex items-center gap-1.5 text-sm">
                  <Checkbox
                    checked={abilita.includes(a)}
                    onCheckedChange={(v) =>
                      setAbilita((arr) => (v ? [...arr, a] : arr.filter((x) => x !== a)))
                    }
                  />
                  {a}
                </label>
              ))}
            </div>
          </div>
        )}

        {tipo === "urgenza" && (
          <div className="grid grid-cols-2 gap-3 rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <div className="space-y-1.5">
              <Label>Quota a PLIDA Roma (€)</Label>
              <Input type="number" step="0.01" value={quotaPlida} onChange={(e) => setQuotaPlida(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Quota a Piacenza (€)</Label>
              <Input type="number" step="0.01" value={quotaNostra} onChange={(e) => setQuotaNostra(e.target.value)} />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Codice esame Roma</Label>
            <Input value={codiceRoma} onChange={(e) => setCodiceRoma(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Cod. articolo</Label>
            <Input value={codArticolo} onChange={(e) => setCodArticolo(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Note (visibili nella tabella sessione)</Label>
          <Textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={onClose}>Annulla</Button>
          <Button type="submit" disabled={createMut.isPending || !candidatoId}>
            {createMut.isPending ? "Creazione…" : "Crea iscrizione"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
