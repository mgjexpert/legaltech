import { describe,it,expect } from "vitest";
import { evaluatePolicy, type PolicyContext } from "@fro/policy-engine";
import dataset from "../evals/datasets/policy-golden-v1.json";
describe("25 synthetic deterministic golden policy cases",()=>{
  it.each(dataset.cases)("$id · $name",scenario=>{
    const result=evaluatePolicy(scenario.action,scenario.context as PolicyContext);
    expect(result.permission).toBe(scenario.expected.permission);
    expect(result.canExecute).toBe(scenario.expected.canExecute);
    expect(result.ruleId).toMatch(/^TECH-/); expect(result.ruleVersion).toBe(1);
  });
  it.each(["UNKNOWN","CAUTION","REVIEW","BLOCKED","EMERGENCY"] as const)("fails closed for safety %s",safety=>{
    const context={...dataset.cases[16]!.context,safety} as PolicyContext;
    expect(evaluatePolicy("send_message",context).canExecute).toBe(false);
  });
  it("expired/revoked professional authority cannot be restored by mode flag",()=>{
    const context={...dataset.cases[24]!.context,professionalGrantActive:false} as PolicyContext;
    expect(evaluatePolicy("final_legal_document",context).canExecute).toBe(false);
  });
  it.each([null, {}, {...dataset.cases[0]!.context,workspaceAccess:"false"},
    {...dataset.cases[0]!.context,mode:"UNRECOGNIZED"},
    {...dataset.cases[0]!.context,safety:"UNRECOGNIZED"},
    {...dataset.cases[0]!.context,actor:"UNKNOWN"},
    {...dataset.cases[0]!.context,explicitApproval:"true"}])("blocks malformed runtime context %#",context=>{
    const result=evaluatePolicy("calculate_finances",context as unknown as PolicyContext);
    expect(result.permission).toBe("BLOCK");
    expect(result.canExecute).toBe(false);
  });
  it("does not permit a material action with string approval",()=>{
    const context={...dataset.cases[19]!.context,explicitApproval:"false"} as unknown as PolicyContext;
    expect(evaluatePolicy("share_document",context).canExecute).toBe(false);
  });
});
