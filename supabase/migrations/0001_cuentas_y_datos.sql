-- A Tiempo · cuentas y datos de cada persona (2026-11-04)
--
-- Se pega una vez en Supabase → SQL Editor → Run. Cada cuenta es de quien toma
-- los medicamentos (no hay cuidador). Los datos de la app van como JSON con la
-- misma forma que en src/types.ts, para no duplicar el modelo en dos lugares.
--
-- Seguridad: RLS en todas las tablas. Cada fila lleva user_id y solo la cuenta
-- dueña (auth.uid()) puede leerla, crearla, cambiarla o borrarla. La clave
-- publicable de la app no puede saltarse estas reglas.

-- Perfil (SeniorProfile): uno por cuenta.
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

-- Planes (MedicationPlan, con su reclamo en la EPS dentro de data.claim).
create table if not exists public.plans (
  user_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, id)
);

-- Tomas marcadas "Listo": clave planId@YYYY-MM-DDTHH:MM → hora en que se marcó.
create table if not exists public.taken_doses (
  user_id uuid not null references auth.users (id) on delete cascade,
  dose_key text not null,
  taken_at text not null,
  primary key (user_id, dose_key)
);

-- Estado de los avisos de reclamo (resueltos y pospuestos).
create table if not exists public.user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  claim_alerts jsonb not null default '{"dismissed": [], "snoozedUntil": {}}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.taken_doses enable row level security;
alter table public.user_state enable row level security;

-- Una política por tabla: la cuenta dueña puede todo sobre sus filas; nadie más nada.
drop policy if exists "Cada cuenta maneja su perfil" on public.profiles;
create policy "Cada cuenta maneja su perfil" on public.profiles
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Cada cuenta maneja sus planes" on public.plans;
create policy "Cada cuenta maneja sus planes" on public.plans
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Cada cuenta maneja sus tomas" on public.taken_doses;
create policy "Cada cuenta maneja sus tomas" on public.taken_doses
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Cada cuenta maneja sus avisos" on public.user_state;
create policy "Cada cuenta maneja sus avisos" on public.user_state
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
