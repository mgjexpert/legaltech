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
});
