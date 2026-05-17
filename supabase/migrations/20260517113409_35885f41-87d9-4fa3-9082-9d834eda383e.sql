
-- ============ ENUMS ============
CREATE TYPE tipo_esame AS ENUM ('PLIDA', 'CILS', 'CELI');
CREATE TYPE livello_esame AS ENUM ('A2', 'B1', 'B2', 'C1');
CREATE TYPE tipo_iscrizione AS ENUM ('completo', 'recupero', 'urgenza');
CREATE TYPE giorno_orale AS ENUM ('lun', 'mar', 'mer', 'gio', 'ven', 'sab');
CREATE TYPE stato_portale AS ENUM ('da_inserire', 'inserito');
CREATE TYPE metodo_pagamento AS ENUM ('bonifico', 'contante');
CREATE TYPE operazione_audit AS ENUM ('INSERT', 'UPDATE', 'DELETE');

-- ============ PROFILI OPERATRICE ============
CREATE TABLE public.profili_operatrice (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_visualizzato TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Funzione helper per controllare se l'utente è un'operatrice autenticata
CREATE OR REPLACE FUNCTION public.is_operatrice()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profili_operatrice WHERE id = auth.uid())
$$;

-- Trigger per creare il profilo automaticamente alla signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profili_operatrice (id, nome_visualizzato, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_visualizzato', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ CANDIDATI ============
CREATE TABLE public.candidati (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cognome TEXT NOT NULL,
  nome TEXT NOT NULL,
  luogo_nascita TEXT,
  data_nascita DATE,
  email TEXT,
  telefono TEXT,
  lingua_madre TEXT,
  paese_origine TEXT,
  titolo_studi TEXT,
  note_generali TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_candidati_cognome ON public.candidati(cognome);
CREATE INDEX idx_candidati_email ON public.candidati(email);

-- ============ SESSIONI ============
CREATE TABLE public.sessioni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_esame tipo_esame NOT NULL,
  livello livello_esame NOT NULL,
  data_sessione DATE NOT NULL,
  sede TEXT NOT NULL DEFAULT 'Piacenza',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sessioni_data ON public.sessioni(data_sessione DESC);

-- ============ ISCRIZIONI ============
CREATE TABLE public.iscrizioni (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID NOT NULL REFERENCES public.candidati(id) ON DELETE CASCADE,
  sessione_id UUID NOT NULL REFERENCES public.sessioni(id) ON DELETE CASCADE,
  codice_esame_roma TEXT,
  cod_articolo TEXT,
  quota_totale NUMERIC(10,2),
  tipo_iscrizione tipo_iscrizione NOT NULL DEFAULT 'completo',
  abilita_recupero TEXT[] DEFAULT '{}',
  giorno_orale giorno_orale,
  stato_portale stato_portale NOT NULL DEFAULT 'da_inserire',
  orale_ok BOOLEAN NOT NULL DEFAULT false,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_iscrizioni_candidato ON public.iscrizioni(candidato_id);
CREATE INDEX idx_iscrizioni_sessione ON public.iscrizioni(sessione_id);

-- ============ PAGAMENTI ============
CREATE TABLE public.pagamenti (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iscrizione_id UUID NOT NULL REFERENCES public.iscrizioni(id) ON DELETE CASCADE,
  metodo metodo_pagamento NOT NULL,
  importo NUMERIC(10,2) NOT NULL,
  numero_ricevuta TEXT,
  data_ricevuta DATE,
  data_bonifico_banca DATE,
  verificato BOOLEAN NOT NULL DEFAULT false,
  operatrice_id UUID REFERENCES auth.users(id),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);
CREATE INDEX idx_pagamenti_iscrizione ON public.pagamenti(iscrizione_id);
CREATE INDEX idx_pagamenti_verificato ON public.pagamenti(verificato);

-- ============ URGENZE ============
CREATE TABLE public.urgenze (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  iscrizione_id UUID NOT NULL REFERENCES public.iscrizioni(id) ON DELETE CASCADE,
  quota_plida NUMERIC(10,2),
  quota_nostra NUMERIC(10,2),
  pagato BOOLEAN NOT NULL DEFAULT false
);

-- ============ PROFILO LINGUISTICO ============
CREATE TABLE public.profilo_linguistico (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidato_id UUID NOT NULL REFERENCES public.candidati(id) ON DELETE CASCADE,
  data_compilazione DATE,
  fascia_eta TEXT,
  autoval_ascolto INTEGER CHECK (autoval_ascolto BETWEEN 1 AND 4),
  autoval_lettura INTEGER CHECK (autoval_lettura BETWEEN 1 AND 4),
  autoval_parlato INTEGER CHECK (autoval_parlato BETWEEN 1 AND 4),
  autoval_scrittura INTEGER CHECK (autoval_scrittura BETWEEN 1 AND 4),
  corsi_frequentati BOOLEAN,
  num_corsi TEXT,
  durata_corsi TEXT,
  livello_corsi TEXT,
  motivazione_esame TEXT,
  difficolta_percepite TEXT,
  conosce_facsimile BOOLEAN,
  ha_libro_preparazione BOOLEAN,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============ TEST PRELIMINARI ============
CREATE TABLE public.test_preliminari (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_test DATE NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.test_preliminari_candidati (
  test_id UUID NOT NULL REFERENCES public.test_preliminari(id) ON DELETE CASCADE,
  candidato_id UUID NOT NULL REFERENCES public.candidati(id) ON DELETE CASCADE,
  presente BOOLEAN NOT NULL DEFAULT false,
  note TEXT,
  PRIMARY KEY (test_id, candidato_id)
);

-- ============ AUDIT LOG ============
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabella TEXT NOT NULL,
  record_id UUID NOT NULL,
  operazione operazione_audit NOT NULL,
  campo_modificato TEXT,
  valore_precedente TEXT,
  valore_nuovo TEXT,
  utente_id UUID REFERENCES auth.users(id),
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_record ON public.audit_log(tabella, record_id);
CREATE INDEX idx_audit_utente ON public.audit_log(utente_id);
CREATE INDEX idx_audit_timestamp ON public.audit_log("timestamp" DESC);

-- ============ FUNZIONE GENERICA AUDIT ============
CREATE OR REPLACE FUNCTION public.log_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  k TEXT;
  uid UUID;
BEGIN
  uid := auth.uid();

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log(tabella, record_id, operazione, campo_modificato, valore_precedente, valore_nuovo, utente_id)
    VALUES (TG_TABLE_NAME, NEW.id, 'INSERT', NULL, NULL, NULL, uid);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log(tabella, record_id, operazione, campo_modificato, valore_precedente, valore_nuovo, utente_id)
    VALUES (TG_TABLE_NAME, OLD.id, 'DELETE', NULL, NULL, NULL, uid);
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
    FOR k IN SELECT jsonb_object_keys(new_data) LOOP
      IF k IN ('updated_at','updated_by') THEN CONTINUE; END IF;
      IF (old_data->k) IS DISTINCT FROM (new_data->k) THEN
        INSERT INTO public.audit_log(tabella, record_id, operazione, campo_modificato, valore_precedente, valore_nuovo, utente_id)
        VALUES (TG_TABLE_NAME, NEW.id, 'UPDATE', k, old_data->>k, new_data->>k, uid);
      END IF;
    END LOOP;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$;

-- Trigger updated_at + updated_by per iscrizioni
CREATE OR REPLACE FUNCTION public.set_updated_meta()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  NEW.updated_by := auth.uid();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_candidati_updated BEFORE UPDATE ON public.candidati
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_meta();
CREATE TRIGGER trg_iscrizioni_updated BEFORE UPDATE ON public.iscrizioni
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_meta();

-- Attach audit triggers
CREATE TRIGGER trg_audit_candidati AFTER INSERT OR UPDATE OR DELETE ON public.candidati
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER trg_audit_iscrizioni AFTER INSERT OR UPDATE OR DELETE ON public.iscrizioni
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();
CREATE TRIGGER trg_audit_pagamenti AFTER INSERT OR UPDATE OR DELETE ON public.pagamenti
  FOR EACH ROW EXECUTE FUNCTION public.log_changes();

-- ============ RLS ============
ALTER TABLE public.profili_operatrice ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidati ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iscrizioni ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamenti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.urgenze ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profilo_linguistico ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_preliminari ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_preliminari_candidati ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Profili: ogni operatrice vede tutti i profili (per nomi nei log)
CREATE POLICY "operatrici vedono profili" ON public.profili_operatrice FOR SELECT TO authenticated USING (public.is_operatrice());
CREATE POLICY "operatrice aggiorna proprio profilo" ON public.profili_operatrice FOR UPDATE TO authenticated USING (id = auth.uid());

-- Tabelle dati: accesso completo per operatrici autenticate
CREATE POLICY "operatrici full candidati" ON public.candidati FOR ALL TO authenticated USING (public.is_operatrice()) WITH CHECK (public.is_operatrice());
CREATE POLICY "operatrici full sessioni" ON public.sessioni FOR ALL TO authenticated USING (public.is_operatrice()) WITH CHECK (public.is_operatrice());
CREATE POLICY "operatrici full iscrizioni" ON public.iscrizioni FOR ALL TO authenticated USING (public.is_operatrice()) WITH CHECK (public.is_operatrice());
CREATE POLICY "operatrici full pagamenti" ON public.pagamenti FOR ALL TO authenticated USING (public.is_operatrice()) WITH CHECK (public.is_operatrice());
CREATE POLICY "operatrici full urgenze" ON public.urgenze FOR ALL TO authenticated USING (public.is_operatrice()) WITH CHECK (public.is_operatrice());
CREATE POLICY "operatrici full profilo_ling" ON public.profilo_linguistico FOR ALL TO authenticated USING (public.is_operatrice()) WITH CHECK (public.is_operatrice());
CREATE POLICY "operatrici full test" ON public.test_preliminari FOR ALL TO authenticated USING (public.is_operatrice()) WITH CHECK (public.is_operatrice());
CREATE POLICY "operatrici full test_cand" ON public.test_preliminari_candidati FOR ALL TO authenticated USING (public.is_operatrice()) WITH CHECK (public.is_operatrice());

-- Audit log: solo lettura per operatrici (scritto dai trigger via SECURITY DEFINER)
CREATE POLICY "operatrici leggono audit" ON public.audit_log FOR SELECT TO authenticated USING (public.is_operatrice());
