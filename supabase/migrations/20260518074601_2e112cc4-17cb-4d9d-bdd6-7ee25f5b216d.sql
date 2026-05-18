
-- enum per sesso, relazione referente, motivazione, canale, fascia oraria
DO $$ BEGIN
  CREATE TYPE public.sesso_candidato AS ENUM ('M','F','altro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.relazione_referente AS ENUM ('moglie','marito','figlio','datore_lavoro','insegnante','altro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.motivazione_esame AS ENUM ('cittadinanza','lavoro','studio','ricongiungimento','altro');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.canale_comunicazione AS ENUM ('whatsapp','email','telefono');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.fascia_oraria AS ENUM ('mattina','pomeriggio','indifferente');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.candidati
  ADD COLUMN IF NOT EXISTS codice_fiscale text,
  ADD COLUMN IF NOT EXISTS sesso public.sesso_candidato,
  ADD COLUMN IF NOT EXISTS citta_residenza text,
  ADD COLUMN IF NOT EXISTS nazionalita text,

  ADD COLUMN IF NOT EXISTS referente_nome text,
  ADD COLUMN IF NOT EXISTS referente_relazione public.relazione_referente,
  ADD COLUMN IF NOT EXISTS referente_telefono text,
  ADD COLUMN IF NOT EXISTS referente_email text,
  ADD COLUMN IF NOT EXISTS comunicare_con_referente boolean NOT NULL DEFAULT false,

  ADD COLUMN IF NOT EXISTS obiettivo_tipo_esame public.tipo_esame,
  ADD COLUMN IF NOT EXISTS obiettivo_livello public.livello_esame,
  ADD COLUMN IF NOT EXISTS obiettivo_motivazione public.motivazione_esame,
  ADD COLUMN IF NOT EXISTS obiettivo_scadenza date,
  ADD COLUMN IF NOT EXISTS obiettivo_scadenza_nota text,

  ADD COLUMN IF NOT EXISTS lingua_preferita text,
  ADD COLUMN IF NOT EXISTS canale_preferito public.canale_comunicazione,
  ADD COLUMN IF NOT EXISTS fascia_oraria_preferita public.fascia_oraria,

  ADD COLUMN IF NOT EXISTS flag_fragile boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS flag_urgenza_scadenza boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS flag_tenere_occhio boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS flag_gia_cliente boolean NOT NULL DEFAULT false;
