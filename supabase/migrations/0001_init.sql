-- Extensions
create extension if not exists pgcrypto;

-- Enums
create type opportunity_domain as enum ('internship','scholarship','job','freelance','competition','website','message_other');
create type input_type as enum ('text','screenshot','pdf');
create type risk_level as enum ('HIGH_CONCERN','NEEDS_VERIFICATION','NO_MAJOR_WARNING_SIGNS');
create type signal_category as enum ('payment','urgency','data_request','missing_details','channel','too_good_to_be_true','link');
create type signal_severity as enum ('critical','high','medium','low','info');
create type signal_source as enum ('rule','ai','link_check');
create type channel_type as enum ('whatsapp','telegram','email','sms','linkedin','instagram','website','phone_call','other');

-- Profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  college text check (char_length(college) <= 120),
  default_save_history boolean not null default true,
  default_ai_consent boolean not null default false,
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)));
  return new;
end; $$;

create trigger on_auth_user_created
after insert on auth.users for each row execute function public.handle_new_user();

-- Analyses
create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  domain opportunity_domain not null,
  input_type input_type not null default 'text',
  channel channel_type not null default 'other',
  claimed_org text check (char_length(claimed_org) <= 120),
  input_text text check (char_length(input_text) <= 8000),      -- null when user opts out of raw text storage
  input_hash text not null,                                      -- sha256 of normalized text
  input_length integer not null check (input_length between 1 and 8000),
  risk_level risk_level not null,
  rule_score integer not null check (rule_score between 0 and 100),
  summary text not null,
  ai_used boolean not null default false,
  ai_status text not null default 'not_requested' check (ai_status in ('not_requested','ok','failed','invalid_output','timeout')),
  duration_ms integer check (duration_ms >= 0),
  result jsonb not null,
  created_at timestamptz not null default now()
);
create index analyses_user_created_idx on public.analyses (user_id, created_at desc);
create index analyses_user_risk_idx on public.analyses (user_id, risk_level);
create index analyses_user_domain_idx on public.analyses (user_id, domain);

-- Signals (normalized copy of result.signals for filtering/analytics)
create table public.analysis_signals (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rule_id text not null,
  category signal_category not null,
  severity signal_severity not null,
  source signal_source not null,
  title text not null,
  why_it_matters text not null,
  evidence_quote text,
  created_at timestamptz not null default now()
);
create index analysis_signals_analysis_idx on public.analysis_signals (analysis_id);

-- Unknowns
create table public.analysis_unknowns (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  item text not null,
  how_to_verify text not null,
  created_at timestamptz not null default now()
);
create index analysis_unknowns_analysis_idx on public.analysis_unknowns (analysis_id);

-- Checklist (supports the planned "share of users completing recommended checks" metric)
create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  position integer not null,
  label text not null,
  portal_key text,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index checklist_items_analysis_idx on public.checklist_items (analysis_id, position);

-- Link checks
create table public.link_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_id uuid references public.analyses(id) on delete cascade,
  url text not null check (char_length(url) <= 2048),
  hostname text not null,
  registrable_domain text,
  risk_level risk_level not null,
  observations jsonb not null default '[]'::jsonb,
  unverified jsonb not null default '[]'::jsonb,
  rdap_status text not null default 'not_run' check (rdap_status in ('not_run','ok','unavailable','not_found','timeout')),
  domain_registered_at timestamptz,
  created_at timestamptz not null default now()
);
create index link_checks_user_idx on public.link_checks (user_id, created_at desc);

-- Recruiter challenge emails
create table public.recruiter_challenges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_id uuid references public.analyses(id) on delete cascade,
  subject text not null,
  body text not null,
  ai_used boolean not null default false,
  created_at timestamptz not null default now()
);
create index recruiter_challenges_analysis_idx on public.recruiter_challenges (analysis_id);

-- Feedback
create table public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  analysis_id uuid references public.analyses(id) on delete set null,
  helpful boolean not null,
  comment text check (char_length(comment) <= 1000),
  created_at timestamptz not null default now()
);
