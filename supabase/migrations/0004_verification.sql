-- 1) Organization registry (public reference data; read-only for clients)
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) <= 160),
  aliases text[] not null default '{}',
  kind org_kind not null default 'company',
  official_domains text[] not null check (cardinality(official_domains) >= 1),
  careers_url text,
  scholarships_url text,
  is_government boolean not null default false,
  is_demo boolean not null default false,
  needs_team_review boolean not null default true,
  created_at timestamptz not null default now()
);
create unique index organizations_name_uidx on public.organizations (lower(name));
alter table public.organizations enable row level security;
create policy "organizations_read_all" on public.organizations for select to anon, authenticated using (true);

-- 2) Reported entities (hashed identifiers; no direct client access)
create table public.reported_entities (
  id uuid primary key default gen_random_uuid(),
  entity_type entity_type not null,
  value_hash text not null check (value_hash ~ '^[0-9a-f]{64}$'),
  status entity_status not null default 'reported',
  report_count integer not null default 0 check (report_count >= 0),
  first_reported_at timestamptz not null default now(),
  last_reported_at timestamptz not null default now(),
  confirmed_at timestamptz,
  notes text check (char_length(notes) <= 500),
  unique (entity_type, value_hash)
);
alter table public.reported_entities enable row level security;   -- no policies: no direct access

create table public.scam_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references auth.users(id) on delete cascade,
  entity_type entity_type not null,
  value_hash text not null check (value_hash ~ '^[0-9a-f]{64}$'),
  description text check (char_length(description) <= 1000),
  created_at timestamptz not null default now(),
  unique (reporter_id, entity_type, value_hash)
);
alter table public.scam_reports enable row level security;
create policy "scam_reports_select_own" on public.scam_reports for select to authenticated using (reporter_id = (select auth.uid()));
-- inserts happen only through submit_scam_report()

create or replace function public.check_reported_entities(p_items jsonb)
returns table (entity_type entity_type, value_hash text, status entity_status, report_count integer)
language sql stable security definer set search_path = public as $$
  select r.entity_type, r.value_hash, r.status, r.report_count
  from public.reported_entities r
  join jsonb_to_recordset(p_items) as x(entity_type text, value_hash text)
    on r.entity_type::text = x.entity_type and r.value_hash = x.value_hash
  where r.status <> 'cleared'
  limit 20
$$;
revoke all on function public.check_reported_entities(jsonb) from public;
grant execute on function public.check_reported_entities(jsonb) to anon, authenticated;

create or replace function public.submit_scam_report(p_entity_type entity_type, p_value_hash text, p_description text)
returns void language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_rows integer;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  insert into public.scam_reports (reporter_id, entity_type, value_hash, description)
  values (v_uid, p_entity_type, p_value_hash, left(p_description, 1000))
  on conflict (reporter_id, entity_type, value_hash) do nothing;
  get diagnostics v_rows = row_count;
  if v_rows = 1 then
    insert into public.reported_entities (entity_type, value_hash, report_count)
    values (p_entity_type, p_value_hash, 1)
    on conflict (entity_type, value_hash)
    do update set report_count = public.reported_entities.report_count + 1, last_reported_at = now();
  end if;
end $$;
revoke all on function public.submit_scam_report(entity_type, text, text) from public;
grant execute on function public.submit_scam_report(entity_type, text, text) to authenticated;

-- 3) Migrate analyses from risk_level to verification_status
alter table public.analyses add column verification_status verification_status;
update public.analyses set verification_status = (case risk_level
  when 'HIGH_CONCERN' then 'HIGH_RISK'
  when 'NEEDS_VERIFICATION' then 'NEEDS_REVIEW'
  else 'LIKELY_GENUINE' end)::verification_status;
alter table public.analyses alter column verification_status set not null;
drop index if exists public.analyses_user_risk_idx;
alter table public.analyses drop column risk_level;
create index analyses_user_status_idx on public.analyses (user_id, verification_status);
alter table public.analyses
  add column matched_organization_id uuid references public.organizations(id) on delete set null,
  add column sender_email_domain text,
  add column headers_supplied boolean not null default false,
  add column listing_match_status text not null default 'not_checked'
    check (listing_match_status in ('not_checked','unknown','match','partial','mismatch','user_supplied'));

-- 4) Evidence rows: one per decision (traceable evidence for every verification decision)
create table public.analysis_checks (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  check_key text not null check (char_length(check_key) <= 80),
  label text not null check (char_length(label) <= 160),
  outcome check_outcome not null,
  detail text not null check (char_length(detail) between 1 and 600),
  source text not null check (source in ('rule','header_parse','dns','rdap','ct_log','safe_browsing','registry','reported_db','listing_compare','user_attested','ai')),
  created_at timestamptz not null default now(),
  unique (analysis_id, check_key)
);
create index analysis_checks_analysis_idx on public.analysis_checks (analysis_id);
alter table public.analysis_checks enable row level security;
create policy "checks_select_own" on public.analysis_checks for select to authenticated using (user_id = (select auth.uid()));
create policy "checks_insert_own" on public.analysis_checks for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = (select auth.uid())));
create policy "checks_update_own" on public.analysis_checks for update to authenticated
  using (user_id = (select auth.uid()) and source = 'user_attested') with check (user_id = (select auth.uid()) and source = 'user_attested');
create policy "checks_delete_own" on public.analysis_checks for delete to authenticated using (user_id = (select auth.uid()));
