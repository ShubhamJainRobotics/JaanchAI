-- Patch v4: Redesign "Do these next" verification steps
-- Add stable step_key to checklist_items and enforce uniqueness per analysis

alter table public.checklist_items add column if not exists step_key text;
update public.checklist_items set step_key = 'legacy_' || id::text where step_key is null;
alter table public.checklist_items alter column step_key set not null;
create unique index if not exists checklist_items_analysis_step_uidx
  on public.checklist_items (analysis_id, step_key);
