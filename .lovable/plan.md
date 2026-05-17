
# CRM PLIDA Piacenza

Brief molto ampio (8 tabelle, audit log con trigger, 9 aree funzionali, import/export Excel). Lo costruisco in **fasi incrementali**, in modo che tu possa testare presto e iterare. Ti propongo l'ordine sotto — confermami e parto dalla Fase 1.

## Stack
- Frontend: React + TanStack Start (template Lovable) + Tailwind + shadcn/ui
- Backend: **Lovable Cloud** (Postgres + Auth + RLS + Storage, gestito) — equivalente a Supabase ma integrato
- Deploy: pubblicazione su `*.lovable.app`, poi colleghi `crm.plidapiacenza.com` come dominio custom

## Modello dati
Implemento tutte le 8 tabelle del brief (`candidati`, `sessioni`, `iscrizioni`, `pagamenti`, `urgenze`, `profilo_linguistico`, `test_preliminari`, `test_preliminari_candidati`, `audit_log`) con i tipi enum richiesti. RLS attiva su tutte: le 3 operatrici autenticate hanno accesso completo in lettura/scrittura (è uno strumento interno condiviso, non multi-tenant). `audit_log` scrivibile solo da trigger.

**Audit log via trigger Postgres**: una funzione generica `log_changes()` su `candidati`, `iscrizioni`, `pagamenti` che logga ogni campo modificato (INSERT/UPDATE/DELETE) con utente da `auth.uid()`.

**Utenti**: nessuna registrazione pubblica. Creo le 3 operatrici manualmente via Cloud → Users dopo il setup (ti guido). Tabella `profili_operatrice` collegata a `auth.users` per il nome visualizzato.

## Fasi proposte

**Fase 1 — Fondamenta (questo primo giro)**
- Abilita Lovable Cloud
- Schema completo DB + enum + trigger audit_log + RLS
- Login email/password + layout con sidebar (Dashboard / Candidati / Sessioni / Pagamenti / Test / Log) + header con utente loggato
- Dashboard base (placeholder con contatori reali)
- CRUD Candidati (lista + ricerca + scheda con tab Anagrafica)

**Fase 2 — Core operativo**
- CRUD Sessioni (lista + filtri + vista sessione con tabella iscritti)
- CRUD Iscrizioni (form nuovo, recuperi, urgenze, note prominenti)
- Tab Iscrizioni e Pagamenti nella scheda candidato

**Fase 3 — Pagamenti & audit UI**
- Registrazione pagamenti + flag verificato
- Vista globale "Pagamenti da verificare"
- Tab Audit Log nella scheda + pulsante Ripristina per campo
- Filtro audit globale

**Fase 4 — Test preliminari & profilo linguistico**
- Sessioni test + presenze
- Form profilo linguistico nella scheda candidato

**Fase 5 — Import/Export**
- Export Excel sessione (formato simile agli attuali — mandami un esempio per matchare il layout)
- Export CSV anagrafica
- Import Excel/CSV con mapping colonne + anteprima

**Fase 6 — Rifiniture**
- Riepilogo finanziario sessione (bonifici vs contanti, per operatrice)
- Avvisi dashboard
- Dominio custom `crm.plidapiacenza.com`

## UI
Palette neutra (grigi caldi, accenti blu/teal sobrio), tabelle dense leggibili, badge stato (verde/giallo/rosso), tipografia professionale (Inter), desktop-first.

## Note
- Pubblico/Vercel/Netlify: useremo la pubblicazione integrata Lovable (più semplice e con SSL automatico); puntando il sottodominio via CNAME su Cloudflare funziona uguale.
- "Operatrice che incassa" tracciata da `auth.uid()` automaticamente.
- Campo `note` su iscrizioni: lo rendo sempre visibile nella riga della tabella sessione (non solo in dettaglio).

Confermi questo piano e parto dalla **Fase 1**? Se vuoi modifiche (ordine, scope di una fase, scelte tecniche) dimmelo ora.
