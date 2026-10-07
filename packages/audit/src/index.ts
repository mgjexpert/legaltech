import { createHash } from "node:crypto";

export interface AuditEnvelope {
  caseId: string;
  sequence: number;
  previousHash: string | null;
  payloadCanonical: string;
  eventHash: string;
}
// PostgreSQL owns serialization: payload::text (jsonb) is persisted as the canonical preimage.
// Consumers must not reserialize JSON before verification.
export function hashAudit(previousHash: string | null, payloadCanonical: string): string {
  return createHash("sha256").update((previousHash ?? "") + "\n" + payloadCanonical, "utf8").digest("hex");
}
export function verifyAuditChain(events: readonly AuditEnvelope[]): boolean {
  let previousHash: string | null = null;
  let caseId: string | undefined;
  for (let i = 0; i < events.length; i++) {
    const event = events[i]!;
    if (event.sequence !== i + 1 || event.previousHash !== previousHash) return false;
    if (caseId !== undefined && event.caseId !== caseId) return false;
    const payload: unknown = (() => { try { return JSON.parse(event.payloadCanonical); } catch { return null; } })();
    if (!payload || typeof payload !== "object" || !("case_id" in payload) || !("sequence" in payload)
      || payload.case_id !== event.caseId || payload.sequence !== event.sequence) return false;
    if (hashAudit(event.previousHash, event.payloadCanonical) !== event.eventHash) return false;
    previousHash = event.eventHash;
    caseId = event.caseId;
  }
  return true;
}
