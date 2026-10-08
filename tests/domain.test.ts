import { describe, it, expect } from "vitest";
import { calculateReadiness, FactSchema, IntakeSchema, sumCents, transitionCase } from "@fro/domain";
import { processPreparationJob } from "../apps/worker/src/preparation";
import { demoIntake, demoDocuments, demoFact, DEMO_CASE_ID, DEMO_WORKSPACE_ID, DEMO_USER_ID } from "../apps/web/app/demo";
const ctx = {caseId:DEMO_CASE_ID,workspaceId:DEMO_WORKSPACE_ID};

describe("preparation semantics",()=>{
  it("unknown children does not become a declaration of no children",()=>{
    const r=calculateReadiness({},[],[],ctx);
    expect(r.intake.answered).toBe(0); expect(r.preparationStatus).toBe("INCOMPLETE");
    expect(r.legalReadiness).toBe("NOT_ASSESSED");
  });
  it("false and zero are answered values",()=>{
    expect(calculateReadiness({hasChildren:false,monthlyIncomeCents:0},[],[],ctx).intake.answered).toBe(2);
  });
  it("pending/quarantined documents never satisfy checklist",()=>{
    const r=calculateReadiness(demoIntake,demoDocuments,[],ctx);
    expect(r.documents.missing).toEqual(["RELATIONSHIP","CHILDREN"]);
    const docs=demoDocuments.map(doc=>({...doc,status:"QUARANTINED" as const}));
    expect(calculateReadiness(demoIntake,docs,[],ctx).documents.confirmedRequired).toBe(0);
  });
  it("confirmed candidate is explicit and attributable",()=>{
    expect(FactSchema.safeParse({...demoFact,status:"CONFIRMED"}).success).toBe(false);
    expect(FactSchema.safeParse({...demoFact,status:"CONFIRMED",confirmedBy:DEMO_USER_ID,confirmedAt:"2026-10-06T12:00:00Z"}).success).toBe(true);
  });
  it("document evidence requires version and page",()=>{
    expect(FactSchema.safeParse({...demoFact,source:{type:"DOCUMENT",page:0}}).success).toBe(false);
  });
  it("rejects cross-workspace aggregation",()=>{
    expect(()=>calculateReadiness(demoIntake,demoDocuments,[{...demoFact,workspaceId:DEMO_USER_ID}],ctx)).toThrow(/escopos/);
  });
  it("rejects cross-case aggregation",()=>{
    expect(()=>calculateReadiness(demoIntake,[{...demoDocuments[0]!,caseId:DEMO_USER_ID}],[],ctx)).toThrow(/escopos/);
  });
  it("complete preparation is never a legal readiness determination",()=>{
    const docs=demoDocuments.map(doc=>({...doc,status:"CONFIRMED" as const}));
    const r=calculateReadiness({...demoIntake,hasChildren:false},docs,[],ctx);
    expect(r.preparationStatus).toBe("READY_FOR_ORGANIZATION_REVIEW");
    expect(r.legalReadiness).toBe("NOT_ASSESSED");
  });
  it("contradictory facts keep preparation incomplete",()=>{
    const docs=demoDocuments.map(doc=>({...doc,status:"CONFIRMED" as const}));
    expect(calculateReadiness({...demoIntake,hasChildren:false},docs,[{...demoFact,status:"DISPUTED"}],ctx).preparationStatus).toBe("INCOMPLETE");
  });
  it("declared income cannot silently overwrite contradictory confirmed evidence",()=>{
    const docs=demoDocuments.map(doc=>({...doc,status:"CONFIRMED" as const}));
    const fact={...demoFact,status:"CONFIRMED" as const,confirmedBy:DEMO_USER_ID,confirmedAt:"2026-10-06T12:00:00Z"};
    const r=calculateReadiness({...demoIntake,hasChildren:false,monthlyIncomeCents:700000},docs,[fact],ctx);
    expect(r.discrepancies).toHaveLength(1);
    expect(r.preparationStatus).toBe("INCOMPLETE");
    expect(fact.value).toBe(650000);
  });
});
describe("money and case state",()=>{
  it("accepts only an actual Brazilian federative unit",()=>{
    expect(IntakeSchema.safeParse({state:"ZZ"}).success).toBe(false);
    expect(IntakeSchema.safeParse({state:"SP"}).success).toBe(true);
    expect(IntakeSchema.safeParse({state:"DF"}).success).toBe(true);
  });
  it.each([-1,1.5,"650000",true,Number.MAX_SAFE_INTEGER+1])("rejects invalid income fact cents %s",value=>{
    expect(FactSchema.safeParse({...demoFact,value}).success).toBe(false);
  });
  it("allows zero income without treating it as unanswered",()=>{
    expect(FactSchema.safeParse({...demoFact,value:0}).success).toBe(true);
    expect(calculateReadiness({monthlyIncomeCents:0},[],[],ctx).intake.answered).toBe(1);
  });
  it("sums in integer cents",()=>expect(sumCents([10010,20020])).toBe(30030));
  it.each([1.5,-1,NaN,Infinity])("rejects invalid cents %s",(value)=>expect(()=>sumCents([value])).toThrow());
  it("rejects overflow",()=>expect(()=>sumCents([Number.MAX_SAFE_INTEGER,1])).toThrow(/limite/));
  it("rejects undeclared or malformed intake fields",()=>{
    expect(IntakeSchema.safeParse({legalResult:"approved"}).success).toBe(false);
    expect(IntakeSchema.safeParse({monthlyIncomeCents:-1}).success).toBe(false);
  });
  it("does not jump from case creation to professional handoff",()=>{
    expect(()=>transitionCase("CASE_CREATED","PROFESSIONAL_HANDOFF")).toThrow();
    expect(transitionCase("CASE_CREATED","INTAKE_IN_PROGRESS")).toBe("INTAKE_IN_PROGRESS");
  });
  it("archived cases are terminal in starter",()=>expect(()=>transitionCase("ARCHIVED","CASE_CREATED")).toThrow());
});
describe("pure worker contract",()=>{
  const job={type:"PREPARATION_SNAPSHOT",id:DEMO_USER_ID,...ctx,intake:demoIntake,documents:demoDocuments,facts:[demoFact]};
  it("builds a deterministic preparation snapshot",()=>expect(processPreparationJob(job).readiness.documents.missing).toContain("CHILDREN"));
  it("refuses an undeclared action",()=>expect(()=>processPreparationJob({...job,type:"SEND_MESSAGE"})).toThrow());
  it("does not accept mixed case context",()=>expect(()=>processPreparationJob({...job,caseId:DEMO_USER_ID})).toThrow(/escopos/));
});
