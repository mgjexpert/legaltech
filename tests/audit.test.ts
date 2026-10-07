import { it, expect } from "vitest";
import { hashAudit, verifyAuditChain, type AuditEnvelope } from "@fro/audit";
function record(sequence: number, previousHash: string|null): AuditEnvelope {
  const payloadCanonical=JSON.stringify({case_id:"case-a",sequence,action:"synthetic"});
  return {caseId:"case-a",sequence,previousHash,payloadCanonical,eventHash:hashAudit(previousHash,payloadCanonical)};
}
it("detects a missing interior event",()=>{
  const a=record(1,null),b=record(2,a.eventHash),c=record(3,b.eventHash);
  expect(verifyAuditChain([a,b,c])).toBe(true); expect(verifyAuditChain([a,c])).toBe(false);
});
it("detects tampering of payload",()=>expect(verifyAuditChain([{...record(1,null),payloadCanonical:"{}"}])).toBe(false));
it("validates envelope identity against signed payload",()=>expect(verifyAuditChain([{...record(1,null),caseId:"case-b"}])).toBe(false));
it("does not claim a truncated suffix can be detected without external checkpoint",()=>{
  expect(verifyAuditChain([record(1,null)])).toBe(true);
});
