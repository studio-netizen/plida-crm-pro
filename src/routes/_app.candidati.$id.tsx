import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, AlertTriangle, Clock, Eye, UserCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/candidati/$id")({
  component: CandidatoDetailPage,
});

type Sesso = "M" | "F" | "altro";
type RelRef = "moglie" | "marito" | "figlio" | "datore_lavoro" | "insegnante" | "altro";
type TipoEsame = "PLIDA" | "CILS" | "CELI";
type Livello = "A2" | "B1" | "B2" | "C1";
type Motiv = "cittadinanza" | "lavoro" | "studio" | "ricongiungimento" | "altro";
type Canale = "whatsapp" | "email" | "telefono";
type Fascia = "mattina" | "pomeriggio" | "indifferente";

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
  codice_fiscale: string | null;
  sesso: Sesso | null;
  citta_residenza: string | null;
  nazionalita: string | null;
  referente_nome: string | null;
  referente_relazione: RelRef | null;
  referente_telefono: string | null;
  referente_email: string | null;
  comunicare_con_referente: boolean;
  obiettivo_tipo_esame: TipoEsame | null;
  obiettivo_livello: Livello | null;
  obiettivo_motivazione: Motiv | null;
  obiettivo_scadenza: string | null;
  obiettivo_scadenza_nota: string | null;
  lingua_preferita: string | null;
  canale_preferito: Canale | null;
  fascia_oraria_preferita: Fascia | null;
  flag_fragile: boolean;
  flag_urgenza_scadenza: boolean;
  flag_tenere_occhio: boolean;
  flag_gia_cliente: boolean;
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
    mutationFn: async (v: Partial<Candidato>) => {
      const { error } = await supabase.from("candidati").update({
        cognome: v.cognome,
        nome: v.nome,
        email: v.email || null,
        telefono: v.telefono || null,
        luogo_nascita: v.luogo_nascita || null,
        data_nascita: v.data_nascita || null,
        lingua_madre: v.lingua_madre || null,
        paese_origine: v.paese_origine || null,
        titolo_studi: v.titolo_studi || null,
        note_generali: v.note_generali || null,
        codice_fiscale: v.codice_fiscale || null,
        sesso: v.sesso || null,
        citta_residenza: v.citta_residenza || null,
        nazionalita: v.nazionalita || null,
        referente_nome: v.referente_nome || null,
        referente_relazione: v.referente_relazione || null,
        referente_telefono: v.referente_telefono || null,
        referente_email: v.referente_email || null,
        comunicare_con_referente: !!v.comunicare_con_referente,
        obiettivo_tipo_esame: v.obiettivo_tipo_esame || null,
        obiettivo_livello: v.obiettivo_livello || null,
        obiettivo_motivazione: v.obiettivo_motivazione || null,
        obiettivo_scadenza: v.obiettivo_scadenza || null,
        obiettivo_scadenza_nota: v.obiettivo_scadenza_nota || null,
        lingua_preferita: v.lingua_preferita || null,
        canale_preferito: v.canale_preferito || null,
        fascia_oraria_preferita: v.fascia_oraria_preferita || null,
        flag_fragile: !!v.flag_fragile,
        flag_urgenza_scadenza: !!v.flag_urgenza_scadenza,
        flag_tenere_occhio: !!v.flag_tenere_occhio,
        flag_gia_cliente: !!v.flag_gia_cliente,
      }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Modifiche salvate");
      qc.invalidateQueries({ queryKey: ["candidato", id] });
    },
    onError: (e: Error) => toast.error("Errore", { description: e.message }),
  });

  const toggleFlag = useMutation({
    mutationFn: async (v: { key: "flag_fragile" | "flag_urgenza_scadenza" | "flag_tenere_occhio" | "flag_gia_cliente"; value: boolean }) => {
      const patch =
        v.key === "flag_fragile" ? { flag_fragile: v.value } :
        v.key === "flag_urgenza_scadenza" ? { flag_urgenza_scadenza: v.value } :
        v.key === "flag_tenere_occhio" ? { flag_tenere_occhio: v.value } :
        { flag_gia_cliente: v.value };
      const { error } = await supabase.from("candidati").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["candidato", id] }),
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

      {/* Flag visivi */}
      <div className="flex flex-wrap gap-2">
        <FlagToggle
          active={cand.flag_fragile}
          onClick={() => toggleFlag.mutate({ key: "flag_fragile", value: !cand.flag_fragile })}
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          label="Candidato fragile"
          tone="rose"
        />
        <FlagToggle
          active={cand.flag_urgenza_scadenza}
          onClick={() => toggleFlag.mutate({ key: "flag_urgenza_scadenza", value: !cand.flag_urgenza_scadenza })}
          icon={<Clock className="h-3.5 w-3.5" />}
          label="Urgenza scadenza"
          tone="red"
        />
        <FlagToggle
          active={cand.flag_tenere_occhio}
          onClick={() => toggleFlag.mutate({ key: "flag_tenere_occhio", value: !cand.flag_tenere_occhio })}
          icon={<Eye className="h-3.5 w-3.5" />}
          label="Da tenere d'occhio"
          tone="amber"
        />
        <FlagToggle
          active={cand.flag_gia_cliente}
          onClick={() => toggleFlag.mutate({ key: "flag_gia_cliente", value: !cand.flag_gia_cliente })}
          icon={<UserCheck className="h-3.5 w-3.5" />}
          label="Già cliente"
          tone="emerald"
        />
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
          <form
            onSubmit={(e) => { e.preventDefault(); saveMut.mutate(form); }}
            className="space-y-4"
          >
            {/* Dati personali */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <SectionTitle>Dati personali</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Cognome *"><Input value={form.cognome ?? ""} onChange={(e) => set("cognome", e.target.value)} required /></Field>
                  <Field label="Nome *"><Input value={form.nome ?? ""} onChange={(e) => set("nome", e.target.value)} required /></Field>
                  <Field label="Email *"><Input type="email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} required /></Field>
                  <Field label="Telefono"><Input value={form.telefono ?? ""} onChange={(e) => set("telefono", e.target.value)} /></Field>
                  <Field label="Codice fiscale"><Input value={form.codice_fiscale ?? ""} onChange={(e) => set("codice_fiscale", e.target.value.toUpperCase())} maxLength={16} /></Field>
                  <Field label="Sesso">
                    <NativeSelect value={form.sesso ?? ""} onChange={(v) => set("sesso", (v || null) as Sesso | null)}>
                      <option value="">—</option>
                      <option value="M">M</option>
                      <option value="F">F</option>
                      <option value="altro">Altro</option>
                    </NativeSelect>
                  </Field>
                  <Field label="Luogo di nascita"><Input value={form.luogo_nascita ?? ""} onChange={(e) => set("luogo_nascita", e.target.value)} /></Field>
                  <Field label="Data di nascita"><Input type="date" value={form.data_nascita ?? ""} onChange={(e) => set("data_nascita", e.target.value)} /></Field>
                  <Field label="Città di residenza"><Input value={form.citta_residenza ?? ""} onChange={(e) => set("citta_residenza", e.target.value)} /></Field>
                  <Field label="Nazionalità"><Input value={form.nazionalita ?? ""} onChange={(e) => set("nazionalita", e.target.value)} /></Field>
                  <Field label="Paese di origine"><Input value={form.paese_origine ?? ""} onChange={(e) => set("paese_origine", e.target.value)} /></Field>
                  <Field label="Lingua madre"><Input value={form.lingua_madre ?? ""} onChange={(e) => set("lingua_madre", e.target.value)} /></Field>
                  <Field label="Titolo di studio" wide><Input value={form.titolo_studi ?? ""} onChange={(e) => set("titolo_studi", e.target.value)} /></Field>
                  <Field label="Note generali" wide>
                    <Textarea rows={3} value={form.note_generali ?? ""} onChange={(e) => set("note_generali", e.target.value)} />
                  </Field>
                </div>
              </CardContent>
            </Card>

            {/* Referente */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <SectionTitle>Referente</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Nome completo referente"><Input value={form.referente_nome ?? ""} onChange={(e) => set("referente_nome", e.target.value)} /></Field>
                  <Field label="Relazione col candidato">
                    <NativeSelect value={form.referente_relazione ?? ""} onChange={(v) => set("referente_relazione", (v || null) as RelRef | null)}>
                      <option value="">—</option>
                      <option value="moglie">Moglie</option>
                      <option value="marito">Marito</option>
                      <option value="figlio">Figlio</option>
                      <option value="datore_lavoro">Datore di lavoro</option>
                      <option value="insegnante">Insegnante</option>
                      <option value="altro">Altro</option>
                    </NativeSelect>
                  </Field>
                  <Field label="Telefono referente"><Input value={form.referente_telefono ?? ""} onChange={(e) => set("referente_telefono", e.target.value)} /></Field>
                  <Field label="Email referente"><Input type="email" value={form.referente_email ?? ""} onChange={(e) => set("referente_email", e.target.value)} /></Field>
                  <div className="md:col-span-2 flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-50/40 dark:bg-amber-950/20 p-3">
                    <Checkbox
                      id="comref"
                      checked={!!form.comunicare_con_referente}
                      onCheckedChange={(v) => set("comunicare_con_referente", !!v)}
                    />
                    <Label htmlFor="comref" className="text-sm cursor-pointer">
                      Comunicare col referente invece che col candidato
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Obiettivo esame */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <SectionTitle>Obiettivo esame</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Tipo esame">
                    <NativeSelect value={form.obiettivo_tipo_esame ?? ""} onChange={(v) => set("obiettivo_tipo_esame", (v || null) as TipoEsame | null)}>
                      <option value="">—</option>
                      <option value="PLIDA">PLIDA</option>
                      <option value="CILS">CILS</option>
                      <option value="CELI">CELI</option>
                    </NativeSelect>
                  </Field>
                  <Field label="Livello obiettivo">
                    <NativeSelect value={form.obiettivo_livello ?? ""} onChange={(v) => set("obiettivo_livello", (v || null) as Livello | null)}>
                      <option value="">—</option>
                      <option value="A2">A2</option>
                      <option value="B1">B1</option>
                      <option value="B2">B2</option>
                      <option value="C1">C1</option>
                    </NativeSelect>
                  </Field>
                  <Field label="Motivazione" wide>
                    <NativeSelect value={form.obiettivo_motivazione ?? ""} onChange={(v) => set("obiettivo_motivazione", (v || null) as Motiv | null)}>
                      <option value="">—</option>
                      <option value="cittadinanza">Cittadinanza</option>
                      <option value="lavoro">Lavoro</option>
                      <option value="studio">Studio</option>
                      <option value="ricongiungimento">Ricongiungimento familiare</option>
                      <option value="altro">Altro</option>
                    </NativeSelect>
                  </Field>
                  <Field label="Data scadenza (facoltativa)"><Input type="date" value={form.obiettivo_scadenza ?? ""} onChange={(e) => set("obiettivo_scadenza", e.target.value)} /></Field>
                  <Field label="Nota scadenza"><Input value={form.obiettivo_scadenza_nota ?? ""} onChange={(e) => set("obiettivo_scadenza_nota", e.target.value)} placeholder="es. entro fine 2026" /></Field>
                </div>
              </CardContent>
            </Card>

            {/* Preferenze comunicazione */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <SectionTitle>Preferenze comunicazione</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Field label="Lingua preferita"><Input value={form.lingua_preferita ?? ""} onChange={(e) => set("lingua_preferita", e.target.value)} placeholder="es. Italiano, Inglese…" /></Field>
                  <Field label="Canale preferito">
                    <NativeSelect value={form.canale_preferito ?? ""} onChange={(v) => set("canale_preferito", (v || null) as Canale | null)}>
                      <option value="">—</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="email">Email</option>
                      <option value="telefono">Telefono</option>
                    </NativeSelect>
                  </Field>
                  <Field label="Fascia oraria preferita">
                    <NativeSelect value={form.fascia_oraria_preferita ?? ""} onChange={(v) => set("fascia_oraria_preferita", (v || null) as Fascia | null)}>
                      <option value="">—</option>
                      <option value="mattina">Mattina</option>
                      <option value="pomeriggio">Pomeriggio</option>
                      <option value="indifferente">Indifferente</option>
                    </NativeSelect>
                  </Field>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end sticky bottom-4">
              <Button type="submit" disabled={saveMut.isPending} size="lg" className="shadow-lg">
                <Save className="h-4 w-4 mr-2" />
                {saveMut.isPending ? "Salvataggio…" : "Salva modifiche"}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{children}</h3>;
}

function Field({ label, children, wide }: { label: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={"space-y-1.5 " + (wide ? "md:col-span-2" : "")}>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

function NativeSelect({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
    >
      {children}
    </select>
  );
}

type Tone = "rose" | "red" | "amber" | "emerald";
function FlagToggle({ active, onClick, icon, label, tone }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string; tone: Tone }) {
  const activeCls: Record<Tone, string> = {
    rose: "bg-rose-500 text-white border-rose-500 hover:bg-rose-600",
    red: "bg-red-600 text-white border-red-600 hover:bg-red-700",
    amber: "bg-amber-500 text-white border-amber-500 hover:bg-amber-600",
    emerald: "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700",
  };
  const idleCls = "bg-background text-muted-foreground border-dashed border-border hover:bg-muted";
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
        (active ? activeCls[tone] : idleCls)
      }
    >
      {icon}
      {label}
    </button>
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
