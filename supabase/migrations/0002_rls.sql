alter table public.profiles            enable row level security;
alter table public.analyses            enable row level security;
alter table public.analysis_signals    enable row level security;
alter table public.analysis_unknowns   enable row level security;
alter table public.checklist_items     enable row level security;
alter table public.link_checks         enable row level security;
alter table public.recruiter_challenges enable row level security;
alter table public.feedback            enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles for select to authenticated using (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- analyses
create policy "analyses_select_own" on public.analyses for select to authenticated using (user_id = (select auth.uid()));
create policy "analyses_insert_own" on public.analyses for insert to authenticated with check (user_id = (select auth.uid()));
create policy "analyses_delete_own" on public.analyses for delete to authenticated using (user_id = (select auth.uid()));

-- analysis_signals (insert must also point at an analysis the user owns)
create policy "signals_select_own" on public.analysis_signals for select to authenticated using (user_id = (select auth.uid()));
create policy "signals_insert_own" on public.analysis_signals for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = (select auth.uid())));
create policy "signals_delete_own" on public.analysis_signals for delete to authenticated using (user_id = (select auth.uid()));

-- analysis_unknowns
create policy "unknowns_select_own" on public.analysis_unknowns for select to authenticated using (user_id = (select auth.uid()));
create policy "unknowns_insert_own" on public.analysis_unknowns for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = (select auth.uid())));
create policy "unknowns_delete_own" on public.analysis_unknowns for delete to authenticated using (user_id = (select auth.uid()));

-- checklist_items
create policy "checklist_select_own" on public.checklist_items for select to authenticated using (user_id = (select auth.uid()));
create policy "checklist_insert_own" on public.checklist_items for insert to authenticated
  with check (user_id = (select auth.uid()) and exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = (select auth.uid())));
create policy "checklist_update_own" on public.checklist_items for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "checklist_delete_own" on public.checklist_items for delete to authenticated using (user_id = (select auth.uid()));

-- link_checks
create policy "links_select_own" on public.link_checks for select to authenticated using (user_id = (select auth.uid()));
create policy "links_insert_own" on public.link_checks for insert to authenticated with check (user_id = (select auth.uid()));
create policy "links_delete_own" on public.link_checks for delete to authenticated using (user_id = (select auth.uid()));

-- recruiter_challenges
create policy "challenges_select_own" on public.recruiter_challenges for select to authenticated using (user_id = (select auth.uid()));
create policy "challenges_insert_own" on public.recruiter_challenges for insert to authenticated with check (user_id = (select auth.uid()));
create policy "challenges_delete_own" on public.recruiter_challenges for delete to authenticated using (user_id = (select auth.uid()));

-- feedback (write-only for users; no reads needed by client)
create policy "feedback_insert_own" on public.feedback for insert to authenticated with check (user_id = (select auth.uid()));
