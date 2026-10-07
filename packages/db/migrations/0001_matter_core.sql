-- Apply as migration owner on Supabase/Postgres 17. auth.* and runtime roles are platform-owned.
begin;
create schema if not exists extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists vector with schema extensions;
create schema app_private;
revoke all on schema app_private from public;

create type public.case_mode as enum ('SELF_SERVICE_INFORMATIONAL', 'PROFESSIONAL_SUPERVISED');
create type public.visibility_scope as enum ('PRIVATE_PARTY_A','PRIVATE_PARTY_B','SHARED_CASE','PROFESSIONAL_ONLY','COMPLIANCE_RESTRICTED');
create type public.case_status as enum ('CASE_CREATED','INTAKE_IN_PROGRESS','DOCUMENT_COLLECTION','READINESS_REVIEW','PROFESSIONAL_HANDOFF','ARCHIVED');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(name) between 1 and 200)
);
create table public.organization_members (
  organization_id uuid not null references public.organizations(id),
  user_id uuid not null references auth.users(id),
  primary key (organization_id, user_id)
);
create table public.cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.organizations(id),
  created_by uuid not null references auth.users(id),
  mode public.case_mode not null default 'SELF_SERVICE_INFORMATIONAL',
  status public.case_status not null default 'CASE_CREATED',
  jurisdiction_country text not null default 'BR' check (jurisdiction_country = 'BR'),
  created_at timestamptz not null default now()
  -- No narrative, title, safety disclosure or financial detail in shared case metadata.
);
create table public.case_members (
  case_id uuid not null references public.cases(id),
  user_id uuid not null references auth.users(id),
  member_role text not null check (member_role in ('INITIATOR','COUNTERPART')),
  revoked_at timestamptz,
  primary key (case_id,user_id)
);
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases(id),
  scope public.visibility_scope not null,
  owner_user_id uuid references auth.users(id),
  check ((scope in ('PRIVATE_PARTY_A','PRIVATE_PARTY_B','PROFESSIONAL_ONLY') and owner_user_id is not null)
    or (scope in ('SHARED_CASE','COMPLIANCE_RESTRICTED') and owner_user_id is null)),
  unique (id,case_id),
  unique (id,owner_user_id),
  unique (case_id,scope)
);
create table public.professional_access_grants (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  professional_user_id uuid not null references auth.users(id),
  grantor_user_id uuid not null references auth.users(id),
  consent_reference uuid not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (workspace_id,grantor_user_id) references public.workspaces(id,owner_user_id),
  check (expires_at > created_at)
  -- Each grant is a snapshot of ONE workspace, not blanket access to the entire case.
  -- Consent FK and professional verification will be added with consent/auth tickets.
);
create table public.parties (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null,
  workspace_id uuid not null,
  user_id uuid references auth.users(id),
  role text not null check (role in ('INITIATOR','COUNTERPART','OTHER')),
  display_name text not null check (length(display_name) between 1 and 200),
  foreign key (workspace_id,case_id) references public.workspaces(id,case_id)
);
create table public.children (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null,
  workspace_id uuid not null,
  name_or_alias text not null check (length(name_or_alias) between 1 and 200),
  birth_date date,
  foreign key (workspace_id,case_id) references public.workspaces(id,case_id)
  -- Health/protection flags are deliberately absent from this starter.
);
create table public.intake_snapshots (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null,
  workspace_id uuid not null,
  answers jsonb not null check (jsonb_typeof(answers) = 'object'),
  schema_version integer not null default 1 check (schema_version > 0),
  created_at timestamptz not null default now(),
  foreign key (workspace_id,case_id) references public.workspaces(id,case_id)
);
create table public.safety_assessments (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null,
  workspace_id uuid not null,
  state text not null default 'UNKNOWN' check (state in ('UNKNOWN','NORMAL','CAUTION','REVIEW','BLOCKED','EMERGENCY')),
  created_at timestamptz not null default now(),
  foreign key (workspace_id,case_id) references public.workspaces(id,case_id)
);
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null,
  workspace_id uuid not null,
  category text not null check (category in ('IDENTITY','RELATIONSHIP','CHILDREN','INCOME','EXPENSE','OTHER')),
  original_filename text not null,
  status text not null default 'QUARANTINED' check (status in ('QUARANTINED','PENDING_REVIEW','CONFIRMED','REJECTED')),
  uploaded_by uuid not null references auth.users(id),
  foreign key (workspace_id,case_id) references public.workspaces(id,case_id),
  unique (id,workspace_id,case_id)
);
create table public.document_versions (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null,
  workspace_id uuid not null,
  case_id uuid not null,
  version integer not null check (version > 0),
  storage_key text not null unique,
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  mime_type text not null,
  created_at timestamptz not null default now(),
  foreign key (document_id,workspace_id,case_id) references public.documents(id,workspace_id,case_id),
  unique (document_id,version),
  unique (id,workspace_id,case_id)
);
create table public.document_scan_results (
  id uuid primary key default gen_random_uuid(),
  version_id uuid not null,
  workspace_id uuid not null,
  case_id uuid not null,
  result text not null check (result in ('CLEAN','INFECTED','ERROR')),
  scanner_version text not null,
  created_at timestamptz not null default now(),
  foreign key (version_id,workspace_id,case_id) references public.document_versions(id,workspace_id,case_id)
);
create table public.facts (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null,
  case_id uuid not null,
  fact_key text not null,
  value_json jsonb not null,
  status text not null default 'CANDIDATE' check (status in ('CANDIDATE','CONFIRMED','DISPUTED','SUPERSEDED')),
  source_type text not null check (source_type in ('DOCUMENT','USER_DECLARATION','PROFESSIONAL')),
  source_document_version_id uuid,
  source_page integer check (source_page > 0),
  source_asserted_by uuid references auth.users(id),
  confirmed_by uuid references auth.users(id),
  confirmed_at timestamptz,
  foreign key (workspace_id,case_id) references public.workspaces(id,case_id),
  foreign key (source_document_version_id,workspace_id,case_id) references public.document_versions(id,workspace_id,case_id),
  check ((source_type = 'DOCUMENT' and source_document_version_id is not null and source_page is not null and source_asserted_by is null)
    or (source_type in ('USER_DECLARATION','PROFESSIONAL') and source_asserted_by is not null and source_document_version_id is null and source_page is null)),
  check (status <> 'CONFIRMED' or (confirmed_by is not null and confirmed_at is not null))
);

-- Definers are owned by the migration role, with fixed names and empty search_path.
-- Ordinary authenticated actors receive SELECT only. No direct writes are exposed yet.
create function app_private.can_read_workspace(p_workspace_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.workspaces w where w.id = p_workspace_id and (
      (w.scope in ('PRIVATE_PARTY_A','PRIVATE_PARTY_B') and w.owner_user_id = auth.uid()
        and exists (select 1 from public.case_members m where m.case_id = w.case_id and m.user_id = auth.uid() and m.revoked_at is null))
      or (w.scope = 'SHARED_CASE'
        and exists (select 1 from public.case_members m where m.case_id = w.case_id and m.user_id = auth.uid() and m.revoked_at is null))
      or (w.scope <> 'COMPLIANCE_RESTRICTED' and auth.jwt()->>'aal' = 'aal2'
        and exists (select 1 from public.professional_access_grants g
          where g.workspace_id = w.id and g.professional_user_id = auth.uid()
          and g.revoked_at is null and g.expires_at > statement_timestamp()
          and exists (select 1 from public.case_members m
            where m.case_id = w.case_id and m.user_id = g.grantor_user_id and m.revoked_at is null)))
    )
  )
$$;
create function app_private.can_read_case(p_case_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.case_members m where m.case_id = p_case_id and m.user_id = auth.uid() and m.revoked_at is null)
    or exists (select 1 from public.workspaces w where w.case_id = p_case_id and app_private.can_read_workspace(w.id))
$$;
revoke all on function app_private.can_read_workspace(uuid), app_private.can_read_case(uuid) from public;
grant usage on schema app_private to authenticated;
grant execute on function app_private.can_read_workspace(uuid), app_private.can_read_case(uuid) to authenticated;

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
create policy organizations_read on public.organizations for select to authenticated using (
  exists (select 1 from public.organization_members m where m.organization_id = id and m.user_id = auth.uid())
);
create policy organization_members_read on public.organization_members for select to authenticated using (user_id = auth.uid());
alter table public.cases enable row level security;
create policy cases_read on public.cases for select to authenticated using (app_private.can_read_case(id));
alter table public.case_members enable row level security;
create policy case_members_read on public.case_members for select to authenticated using (user_id = auth.uid() and revoked_at is null);
alter table public.workspaces enable row level security;
create policy workspaces_read on public.workspaces for select to authenticated using (app_private.can_read_workspace(id));
alter table public.professional_access_grants enable row level security;
create policy grants_read on public.professional_access_grants for select to authenticated using (
  grantor_user_id = auth.uid() or (professional_user_id = auth.uid() and auth.jwt()->>'aal' = 'aal2'
    and revoked_at is null and expires_at > statement_timestamp())
);

do $$
declare tbl text;
begin
  foreach tbl in array array['parties','children','intake_snapshots','safety_assessments','documents','document_versions','document_scan_results','facts'] loop
    execute format('alter table public.%I enable row level security',tbl);
    execute format('create policy scoped_read on public.%I for select to authenticated using (app_private.can_read_workspace(workspace_id))',tbl);
  end loop;
end $$;
revoke all on all tables in schema public from anon,authenticated;
grant select on public.organizations,public.organization_members,public.cases,public.case_members,public.workspaces,
  public.professional_access_grants,public.parties,public.children,public.intake_snapshots,public.safety_assessments,
  public.documents,public.document_versions,public.document_scan_results,public.facts to authenticated;
-- service_role/platform owner remain privileged. They must never serve browser reads.

create index case_members_actor_idx on public.case_members(user_id,case_id) where revoked_at is null;
create index workspace_case_idx on public.workspaces(case_id);
create index grants_actor_idx on public.professional_access_grants(professional_user_id,workspace_id,expires_at) where revoked_at is null;
create index documents_workspace_idx on public.documents(workspace_id);
create index facts_workspace_idx on public.facts(workspace_id);
commit;
