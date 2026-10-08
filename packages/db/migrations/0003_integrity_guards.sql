-- Additive hardening for databases already migrated through 0002.
-- Stops on invalid pre-existing income facts; never rounds or silently repairs evidence.
begin;
create trigger document_version_no_truncate before truncate on public.document_versions
for each statement execute function app_private.prevent_mutation();
create trigger scan_result_no_truncate before truncate on public.document_scan_results
for each statement execute function app_private.prevent_mutation();

alter table public.facts add constraint income_fact_safe_cents check (
  fact_key <> 'monthly_income_cents' or
  case when jsonb_typeof(value_json) = 'number' then
    (value_json::text)::numeric between 0 and 9007199254740991
    and trunc((value_json::text)::numeric) = (value_json::text)::numeric
  else false end
);
commit;
