-- Tabella profili utente nel schema public.
-- Va creata su Supabase PRIMA di usare l'app.
-- Eseguire questo script dall'SQL Editor di Supabase Dashboard.

CREATE TABLE IF NOT EXISTS public.utenti (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  full_name   text NOT NULL DEFAULT '',
  telefono    text NOT NULL DEFAULT '',
  is_disable  boolean NOT NULL DEFAULT false,
  is_pregnant boolean NOT NULL DEFAULT false,
  role        text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Abilita Row Level Security
ALTER TABLE public.utenti ENABLE ROW LEVEL SECURITY;

-- Ogni utente può leggere e aggiornare solo il proprio profilo
CREATE POLICY "Utente legge il proprio profilo"
  ON public.utenti FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Utente aggiorna il proprio profilo"
  ON public.utenti FOR UPDATE
  USING (auth.uid() = id);

-- Gli admin possono leggere tutti i profili
CREATE POLICY "Admin legge tutti i profili"
  ON public.utenti FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.utenti
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Inserimento consentito solo a utenti autenticati (per la registrazione)
CREATE POLICY "Inserimento profilo autenticato"
  ON public.utenti FOR INSERT
  WITH CHECK (auth.uid() = id);
