import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
import { randomBytes } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import assert from "node:assert/strict";
import { hashAudit, verifyAuditChain, type AuditEnvelope } from "@fro/audit";

const image = "pgvector/pgvector@sha256:ac08538c6f8b9904c33c8224c5e5706dbe760aca29db1d096972b4052c22a75d";
const container = "fro-test-" + process.pid + "-" + randomBytes(4).toString("hex");
const uuid = (n: number) => "00000000-0000-4000-8000-" + String(n).padStart(12,"0");
const run = (args: string[], input?: string) => execFileSync("docker",args,{
  ...(input === undefined ? {} : { input }), encoding: "utf8", stdio: ["pipe","pipe","pipe"], timeout: 30_000,
}).trim();
const sql = (query: string) => run(["exec","-i",container,"psql","-U","postgres","-v","ON_ERROR_STOP=1","-qAt"],query);
const actor = (n: number, query: string, aal = "aal1") => sql(
  "set role authenticated; set \"request.jwt.claim.sub\" = '" + uuid(n) +
  "'; set \"request.jwt.claims\" = '{\"aal\":\"" + aal + "\"}'; " + query);
let passed = 0;
function test(name: string, check: () => void) { check(); passed++; console.log("PASS " + name); }
function denied(fn: () => unknown, expected: RegExp) {
  assert.throws(fn, (err: unknown) => {
    const e = err as { stderr?: Buffer | string };
    return expected.test(String(e.stderr ?? err));
  });
}

async function main() {
  run(["run","--detach","--name",container,"--network","none","--env",
    "POSTGRES_PASSWORD=" + randomBytes(24).toString("hex"),image]);
  try {
    let ready = false;
    for (let attempt=0;attempt<50;attempt++) {
      // The image init server listens only on a Unix socket and is shut down
      // before the final server starts. TCP readiness excludes that transient phase.
      try { run(["exec",container,"pg_isready","-h","127.0.0.1","-U","postgres"]); ready=true; break; }
      catch { await new Promise(resolve => setTimeout(resolve,200)); }
    }
    assert.ok(ready,"Postgres did not become ready");
    sql(readFileSync("packages/db/tests/bootstrap.sql","utf8"));
    sql("create table public.external_module_fixture(id integer); insert into public.external_module_fixture values(1); grant select on public.external_module_fixture to authenticated");
    const migrations = readdirSync("packages/db/migrations").filter(n=>n.endsWith(".sql")).sort();
    assert.deepEqual(migrations,["0001_matter_core.sql","0002_audit_and_jobs.sql","0003_integrity_guards.sql"]);
    for (const file of migrations) sql(readFileSync("packages/db/migrations/" + file,"utf8"));
    sql(`
      insert into auth.users(id) values ${[1,2,3,4,5].map(n=>"('"+uuid(n)+"')").join(",")};
      insert into public.organizations(id,name) values ('${uuid(100)}','Escritório fictício');
      insert into public.organization_members values ('${uuid(100)}','${uuid(5)}');
      insert into public.cases(id,created_by,tenant_id) values
        ('${uuid(10)}','${uuid(1)}','${uuid(100)}'),('${uuid(11)}','${uuid(4)}',null);
      insert into public.case_members(case_id,user_id,member_role) values
        ('${uuid(10)}','${uuid(1)}','INITIATOR'),('${uuid(10)}','${uuid(2)}','COUNTERPART'),
        ('${uuid(11)}','${uuid(4)}','INITIATOR');
      insert into public.workspaces(id,case_id,scope,owner_user_id) values
        ('${uuid(20)}','${uuid(10)}','PRIVATE_PARTY_A','${uuid(1)}'),
        ('${uuid(21)}','${uuid(10)}','PRIVATE_PARTY_B','${uuid(2)}'),
        ('${uuid(22)}','${uuid(10)}','SHARED_CASE',null),
        ('${uuid(23)}','${uuid(10)}','PROFESSIONAL_ONLY','${uuid(3)}'),
        ('${uuid(24)}','${uuid(10)}','COMPLIANCE_RESTRICTED',null),
        ('${uuid(30)}','${uuid(11)}','PRIVATE_PARTY_A','${uuid(4)}');
      insert into public.professional_access_grants(id,workspace_id,professional_user_id,grantor_user_id,consent_reference,expires_at)
        values ('${uuid(90)}','${uuid(20)}','${uuid(3)}','${uuid(1)}','${uuid(91)}',now()+interval '1 day');
      insert into public.documents(id,case_id,workspace_id,category,original_filename,uploaded_by) values
        ('${uuid(40)}','${uuid(10)}','${uuid(20)}','IDENTITY','A-sintetico.pdf','${uuid(1)}'),
        ('${uuid(41)}','${uuid(10)}','${uuid(21)}','IDENTITY','B-sintetico.pdf','${uuid(2)}'),
        ('${uuid(42)}','${uuid(10)}','${uuid(22)}','OTHER','shared-sintetico.pdf','${uuid(1)}'),
        ('${uuid(43)}','${uuid(11)}','${uuid(30)}','OTHER','outro-sintetico.pdf','${uuid(4)}');
      insert into public.document_versions(id,document_id,workspace_id,case_id,version,storage_key,sha256,mime_type)
        values ('${uuid(50)}','${uuid(40)}','${uuid(20)}','${uuid(10)}',1,'synthetic/A/v1',repeat('a',64),'application/pdf');
      insert into public.parties(case_id,workspace_id,role,display_name) values
        ('${uuid(10)}','${uuid(20)}','INITIATOR','Parte A fictícia'),
        ('${uuid(10)}','${uuid(21)}','COUNTERPART','Parte B fictícia');
      insert into public.children(case_id,workspace_id,name_or_alias) values
        ('${uuid(10)}','${uuid(20)}','Criança fictícia A'),('${uuid(10)}','${uuid(21)}','Criança fictícia B');
      insert into public.intake_snapshots(case_id,workspace_id,answers) values
        ('${uuid(10)}','${uuid(20)}','{}'),('${uuid(10)}','${uuid(21)}','{}');
      insert into public.safety_assessments(case_id,workspace_id,state) values
        ('${uuid(10)}','${uuid(20)}','UNKNOWN'),('${uuid(10)}','${uuid(21)}','BLOCKED');
      insert into public.facts(case_id,workspace_id,fact_key,value_json,source_type,source_asserted_by) values
        ('${uuid(10)}','${uuid(20)}','income','1000','USER_DECLARATION','${uuid(1)}'),
        ('${uuid(10)}','${uuid(21)}','income','2000','USER_DECLARATION','${uuid(2)}');
    `);
    test("pgvector installed",()=>assert.equal(sql("select count(*) from pg_extension where extname='vector'"),"1"));
    test("migrations preserve permissions on unrelated tables",()=>assert.equal(actor(1,"select count(*) from public.external_module_fixture"),"1"));
    test("A sees own + shared documents only",()=>assert.equal(actor(1,"select string_agg(original_filename,',' order by original_filename) from public.documents"),"A-sintetico.pdf,shared-sintetico.pdf"));
    test("B sees own + shared documents only",()=>assert.equal(actor(2,"select string_agg(original_filename,',' order by original_filename) from public.documents"),"B-sintetico.pdf,shared-sintetico.pdf"));
    test("unrelated case cannot see case 10",()=>assert.equal(actor(4,"select count(*) from public.cases where id='"+uuid(10)+"'"),"0"));
    test("firm membership does not grant case access",()=>assert.equal(actor(5,"select count(*) from public.documents"),"0"));
    test("anonymous has no table permission",()=>denied(()=>sql("set role anon; select * from public.documents"),/permission denied/));
    test("professional with aal1 sees no documents",()=>assert.equal(actor(3,"select count(*) from public.documents"),"0"));
    test("professional with aal2 sees only granted workspace",()=>assert.equal(actor(3,"select string_agg(original_filename,',') from public.documents","aal2"),"A-sintetico.pdf"));
    test("professional has no implicit shared/professional/compliance scope",()=>assert.equal(actor(3,"select count(*) from public.workspaces","aal2"),"1"));
    for (const table of ["parties","children","intake_snapshots","safety_assessments","facts"]) {
      test("scoped isolation for "+table,()=>assert.equal(actor(1,"select count(*) from public."+table+" where workspace_id='"+uuid(21)+"'"),"0"));
    }
    test("grant revocation takes effect on next query",()=>{
      sql("update public.professional_access_grants set revoked_at=now() where id='"+uuid(90)+"'");
      assert.equal(actor(3,"select count(*) from public.documents","aal2"),"0");
      sql("update public.professional_access_grants set revoked_at=null where id='"+uuid(90)+"'");
    });
    test("expired grant is rejected",()=>{
      sql("update public.professional_access_grants set created_at=now()-interval '2 day',expires_at=now()-interval '1 day' where id='"+uuid(90)+"'");
      assert.equal(actor(3,"select count(*) from public.documents","aal2"),"0");
      sql("update public.professional_access_grants set expires_at=now()+interval '1 day' where id='"+uuid(90)+"'");
    });
    test("member revocation removes private and shared reads",()=>{
      sql("update public.case_members set revoked_at=now() where user_id='"+uuid(1)+"'");
      assert.equal(actor(1,"select count(*) from public.documents"),"0");
      assert.equal(actor(3,"select count(*) from public.documents","aal2"),"0");
      sql("update public.case_members set revoked_at=null where user_id='"+uuid(1)+"'");
    });
    test("cross-case workspace FK rejects corrupted writes",()=>denied(()=>sql(
      "insert into public.children(case_id,workspace_id,name_or_alias) values ('"+uuid(11)+"','"+uuid(20)+"','invalid')"),/foreign key constraint/));
    test("cross-workspace evidence FK rejects leakage",()=>denied(()=>sql(
      "insert into public.facts(case_id,workspace_id,fact_key,value_json,source_type,source_document_version_id,source_page) values ('"+uuid(10)+"','"+uuid(21)+"','bad','1','DOCUMENT','"+uuid(50)+"',1)"),/foreign key constraint/));
    test("confirmed fact requires confirmation metadata",()=>denied(()=>sql(
      "insert into public.facts(case_id,workspace_id,fact_key,value_json,source_type,source_asserted_by,status) values ('"+uuid(10)+"','"+uuid(20)+"','bad','1','USER_DECLARATION','"+uuid(1)+"','CONFIRMED')"),/check constraint/));
    for (const value of ["-1","1.5",'"650000"',"true","9007199254740992"]) {
      test("DB rejects malformed income cents "+value,()=>denied(()=>sql(
        "insert into public.facts(case_id,workspace_id,fact_key,value_json,source_type,source_asserted_by) values ('"+uuid(10)+"','"+uuid(20)+"','monthly_income_cents','"+value+"','USER_DECLARATION','"+uuid(1)+"')"),/income_fact_safe_cents/));
    }
    test("DB accepts zero income as numeric cents",()=>sql(
      "insert into public.facts(case_id,workspace_id,fact_key,value_json,source_type,source_asserted_by) values ('"+uuid(10)+"','"+uuid(20)+"','monthly_income_cents','0','USER_DECLARATION','"+uuid(1)+"')"));
    test("authenticated cannot write arbitrary records",()=>denied(()=>actor(1,
      "insert into public.children(case_id,workspace_id,name_or_alias) values ('"+uuid(10)+"','"+uuid(20)+"','bad')"),/permission denied/));
    test("RLS blocks inserts even if table permission is accidentally granted",()=>{
      sql("grant insert on public.children to authenticated");
      try { denied(()=>actor(1,"insert into public.children(case_id,workspace_id,name_or_alias) values ('"+uuid(10)+"','"+uuid(21)+"','bad')"),/row-level security/); }
      finally { sql("revoke insert on public.children from authenticated"); }
    });
    test("document versions are immutable",()=>denied(()=>sql("update public.document_versions set storage_key='bad'"),/APPEND_ONLY/));
    test("document version truncate cannot bypass immutability",()=>denied(()=>sql("truncate public.document_versions cascade"),/APPEND_ONLY/));
    test("scan result truncate cannot bypass immutability",()=>denied(()=>sql("truncate public.document_scan_results"),/APPEND_ONLY/));
    test("grant cannot be issued by the other party",()=>denied(()=>sql(
      "insert into public.professional_access_grants(workspace_id,professional_user_id,grantor_user_id,consent_reference,expires_at) values ('"+uuid(20)+"','"+uuid(3)+"','"+uuid(2)+"','"+uuid(91)+"',now()+interval '1 day')"),/foreign key constraint/));
    test("authenticated cannot call audit definer",()=>denied(()=>actor(1,
      "select app_private.append_audit('"+uuid(10)+"','"+uuid(1)+"','test','"+uuid(40)+"')"),/permission denied/));
    sql("set role service_role; select app_private.append_audit('"+uuid(10)+"','"+uuid(1)+"','case.created','"+uuid(10)+"')");
    const execute = promisify(execFile);
    await Promise.all(Array.from({length:8},()=>execute("docker",["exec",container,"psql","-U","postgres","-v","ON_ERROR_STOP=1","-qAt","-c",
      "set role service_role; select app_private.append_audit('"+uuid(10)+"','"+uuid(1)+"','synthetic.concurrent','"+uuid(40)+"')"])));
    test("concurrent append produces complete verifiable chain",()=>{
      const records: AuditEnvelope[] = JSON.parse(sql(`select json_agg(json_build_object(
        'caseId',case_id,'sequence',sequence,'previousHash',previous_hash,
        'payloadCanonical',payload_canonical,'eventHash',event_hash) order by sequence) from app_private.audit_events`));
      assert.equal(records.length,9);
      assert.ok(verifyAuditChain(records));
      const tampered = records.map((e,i)=>i===2 ? {...e,payloadCanonical:e.payloadCanonical.replace("synthetic.concurrent","modified")} : e);
      assert.equal(verifyAuditChain(tampered),false);
      assert.equal(hashAudit(records[0]!.previousHash,records[0]!.payloadCanonical),records[0]!.eventHash);
    });
    for (const mutation of ["update app_private.audit_events set event_hash=repeat('b',64)","delete from app_private.audit_events","truncate app_private.audit_events"]) {
      test("audit rejects "+mutation.split(" ")[0],()=>denied(()=>sql(mutation),/APPEND_ONLY/));
    }
    test("outbox and idempotency storage hidden from users",()=>denied(()=>actor(1,"select * from app_private.outbox_events"),/permission denied/));
    console.log("\n"+passed+" database checks passed; real PostgreSQL; disposable container removed.");
  } finally { run(["rm","--force","--volumes",container]); }
}
main().catch((err: unknown)=>{
  // Only synthetic fixtures and DB diagnostics; never print environment values.
  console.error(err instanceof Error ? err.message : "Database validation failed");
  process.exitCode=1;
});
