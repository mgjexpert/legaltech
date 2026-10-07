begin;
create table app_private.audit_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  sequence bigint not null,
  payload jsonb not null,
  payload_canonical text not null,
  previous_hash text,
  event_hash text not null check (event_hash ~ '^[a-f0-9]{64}$'),
  unique (case_id,sequence)
);
create function app_private.prevent_mutation() returns trigger
language plpgsql set search_path = '' as $$
begin raise exception 'APPEND_ONLY: updates, deletes and truncation are forbidden'; end $$;
create trigger audit_immutable before update or delete on app_private.audit_events
for each row execute function app_private.prevent_mutation();
create trigger audit_no_truncate before truncate on app_private.audit_events
for each statement execute function app_private.prevent_mutation();
create trigger document_version_immutable before update or delete on public.document_versions
for each row execute function app_private.prevent_mutation();
create trigger scan_result_immutable before update or delete on public.document_scan_results
for each row execute function app_private.prevent_mutation();

create function app_private.append_audit(p_case_id uuid,p_actor_id uuid,p_action text,p_resource_id uuid,p_policy_versions jsonb default '[]'::jsonb)
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  v_previous text;
  v_sequence bigint;
  v_payload jsonb;
  v_canonical text;
  v_id uuid := gen_random_uuid();
begin
  if p_case_id is null or p_actor_id is null or p_resource_id is null or p_action is null
    or p_policy_versions is null or length(p_action) not between 1 and 100 or jsonb_typeof(p_policy_versions) <> 'array' then
    raise exception 'Invalid audit metadata';
  end if;
  -- Transaction-scoped lock serializes writers for ONE case. Do not log narrative or documents.
  perform pg_advisory_xact_lock(hashtextextended(p_case_id::text,0));
  select event_hash,sequence into v_previous,v_sequence from app_private.audit_events where case_id=p_case_id order by sequence desc limit 1;
  v_sequence := coalesce(v_sequence,0)+1;
  v_payload := jsonb_build_object('id',v_id,'case_id',p_case_id,'sequence',v_sequence,'actor_id',p_actor_id,
    'action',p_action,'resource_id',p_resource_id,'occurred_at',clock_timestamp(),'policy_versions',p_policy_versions,'format_version',1);
  v_canonical := v_payload::text;
  insert into app_private.audit_events(id,case_id,sequence,payload,payload_canonical,previous_hash,event_hash)
  values(v_id,p_case_id,v_sequence,v_payload,v_canonical,v_previous,
    encode(extensions.digest(convert_to(coalesce(v_previous,'') || E'\n' || v_canonical,'UTF8'),'sha256'),'hex'));
  return v_id;
end $$;
revoke all on function app_private.prevent_mutation(), app_private.append_audit(uuid,uuid,text,uuid,jsonb) from public;
revoke all on app_private.audit_events from public,anon,authenticated,service_role;
grant usage on schema app_private to service_role;
grant execute on function app_private.append_audit(uuid,uuid,text,uuid,jsonb) to service_role;
-- Hash chain detects modifications against an independently retained checkpoint.
-- A DBA can rewrite history; external anchoring and retention are still pending.

create table app_private.outbox_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  event_type text not null,
  payload jsonb not null check (jsonb_typeof(payload)='object'),
  created_at timestamptz not null default now(),
  available_at timestamptz not null default now(),
  processed_at timestamptz,
  attempts integer not null default 0 check (attempts >= 0)
);
create index outbox_pending_idx on app_private.outbox_events(available_at) where processed_at is null;
create table app_private.idempotency_records (
  actor_id uuid not null references auth.users(id),
  case_id uuid not null references public.cases(id),
  operation text not null,
  idempotency_key uuid not null,
  request_hash text not null check (request_hash ~ '^[a-f0-9]{64}$'),
  response_json jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (actor_id,case_id,operation,idempotency_key),
  check (expires_at > created_at)
);
revoke all on app_private.outbox_events,app_private.idempotency_records from public,anon,authenticated;
-- These tables define persistence contracts only; transaction/idempotent APIs and workers are backlog items.
commit;
