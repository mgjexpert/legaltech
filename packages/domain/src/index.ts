import { z } from "zod";

export const CaseModeSchema = z.enum(["SELF_SERVICE_INFORMATIONAL", "PROFESSIONAL_SUPERVISED"]);
export const VisibilityScopeSchema = z.enum([
  "PRIVATE_PARTY_A", "PRIVATE_PARTY_B", "SHARED_CASE", "PROFESSIONAL_ONLY", "COMPLIANCE_RESTRICTED",
]);
export const SafetyStateSchema = z.enum(["UNKNOWN", "NORMAL", "CAUTION", "REVIEW", "BLOCKED", "EMERGENCY"]);
export const CaseStatusSchema = z.enum([
  "CASE_CREATED", "INTAKE_IN_PROGRESS", "DOCUMENT_COLLECTION", "READINESS_REVIEW", "PROFESSIONAL_HANDOFF", "ARCHIVED",
]);
export type CaseMode = z.infer<typeof CaseModeSchema>;
export type SafetyState = z.infer<typeof SafetyStateSchema>;
export type CaseStatus = z.infer<typeof CaseStatusSchema>;

const cents = z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER);
export const IntakeSchema = z.object({
  relationship: z.enum(["MARRIAGE", "STABLE_UNION", "OTHER"]).optional(),
  state: z.string().regex(/^[A-Z]{2}$/).optional(),
  hasChildren: z.boolean().optional(),
  objective: z.enum(["PREPARE", "ORGANIZE_SUPPORT", "PROFESSIONAL_REVIEW"]).optional(),
  monthlyIncomeCents: cents.optional(),
}).strict();
export type Intake = z.infer<typeof IntakeSchema>;

export const CaseSchema = z.object({
  id: z.uuid(), mode: CaseModeSchema, status: CaseStatusSchema, jurisdictionCountry: z.literal("BR"),
  createdAt: z.iso.datetime(),
}).strict();
export const DocumentSchema = z.object({
  id: z.uuid(), caseId: z.uuid(), workspaceId: z.uuid(),
  category: z.enum(["IDENTITY", "RELATIONSHIP", "CHILDREN", "INCOME", "EXPENSE", "OTHER"]),
  label: z.string().min(1).max(200),
  status: z.enum(["QUARANTINED", "PENDING_REVIEW", "CONFIRMED", "REJECTED"]),
  sha256: z.string().regex(/^[a-f0-9]{64}$/), version: z.number().int().positive(),
}).strict();
export type DocumentRecord = z.infer<typeof DocumentSchema>;

export const FactSchema = z.object({
  id: z.uuid(), caseId: z.uuid(), workspaceId: z.uuid(), key: z.string().min(1),
  status: z.enum(["CANDIDATE", "CONFIRMED", "DISPUTED", "SUPERSEDED"]),
  value: z.union([z.string(), z.number().finite(), z.boolean()]),
  source: z.discriminatedUnion("type", [
    z.object({ type: z.literal("DOCUMENT"), documentVersionId: z.uuid(), page: z.number().int().positive() }).strict(),
    z.object({ type: z.literal("USER_DECLARATION"), declaredBy: z.uuid() }).strict(),
    z.object({ type: z.literal("PROFESSIONAL"), reviewedBy: z.uuid() }).strict(),
  ]),
  confirmedBy: z.uuid().optional(), confirmedAt: z.iso.datetime().optional(),
}).strict().superRefine((fact, ctx) => {
  if (fact.status === "CONFIRMED" && (!fact.confirmedBy || !fact.confirmedAt)) {
    ctx.addIssue({ code: "custom", message: "Fato confirmado exige autor e timestamp de confirmação." });
  }
});
export type Fact = z.infer<typeof FactSchema>;

const transitions: Record<CaseStatus, readonly CaseStatus[]> = {
  CASE_CREATED: ["INTAKE_IN_PROGRESS", "ARCHIVED"],
  INTAKE_IN_PROGRESS: ["DOCUMENT_COLLECTION", "ARCHIVED"],
  DOCUMENT_COLLECTION: ["READINESS_REVIEW", "INTAKE_IN_PROGRESS", "ARCHIVED"],
  READINESS_REVIEW: ["DOCUMENT_COLLECTION", "PROFESSIONAL_HANDOFF", "ARCHIVED"],
  PROFESSIONAL_HANDOFF: ["DOCUMENT_COLLECTION", "ARCHIVED"],
  ARCHIVED: [],
};
export function transitionCase(current: CaseStatus, next: CaseStatus): CaseStatus {
  if (!transitions[current].includes(next)) throw new Error("Transição de caso não permitida");
  return next;
}

export function sumCents(values: readonly number[]): number {
  return values.reduce((total, value) => {
    cents.parse(value);
    const next = total + value;
    if (!Number.isSafeInteger(next)) throw new Error("Total financeiro excede limite seguro");
    return next;
  }, 0);
}
export function calculateReadiness(intake: Intake, documents: readonly DocumentRecord[], facts: readonly Fact[], context: { caseId: string; workspaceId: string }) {
  IntakeSchema.parse(intake);
  // Identity is not authorization: the server still checks session + RLS before loading rows.
  documents.forEach(document => DocumentSchema.parse(document));
  facts.forEach(fact => FactSchema.parse(fact));
  z.object({ caseId: z.uuid(), workspaceId: z.uuid() }).strict().parse(context);
  if ([...documents,...facts].some(item => item.caseId !== context.caseId || item.workspaceId !== context.workspaceId)) {
    throw new Error("Readiness não combina escopos ou casos diferentes");
  }
  const keys = ["relationship", "state", "hasChildren", "objective", "monthlyIncomeCents"] as const;
  const answered = keys.filter(key => intake[key] !== undefined).length;
  const required: DocumentRecord["category"][] = ["IDENTITY", "INCOME"];
  if (intake.relationship === "MARRIAGE" || intake.relationship === "STABLE_UNION") required.push("RELATIONSHIP");
  if (intake.hasChildren === true) required.push("CHILDREN");
  const missing = required.filter(category => !documents.some(doc => doc.category === category && doc.status === "CONFIRMED"));
  const discrepancies = facts.filter(fact => fact.key === "monthly_income_cents" && fact.status !== "SUPERSEDED"
    && typeof fact.value === "number" && intake.monthlyIncomeCents !== undefined && fact.value !== intake.monthlyIncomeCents)
    .map(fact => ({factId:fact.id,key:fact.key}));
  return {
    intake: { answered, total: keys.length, percent: Math.round(answered / keys.length * 100) },
    documents: { required, missing, confirmedRequired: required.length - missing.length },
    facts: {
      confirmed: facts.filter(fact => fact.status === "CONFIRMED").length,
      pending: facts.filter(fact => fact.status === "CANDIDATE").length,
      disputed: facts.filter(fact => fact.status === "DISPUTED").length,
    },
    discrepancies,
    preparationStatus: answered === keys.length && missing.length === 0 && discrepancies.length === 0 && !facts.some(fact => ["CANDIDATE", "DISPUTED"].includes(fact.status))
      ? "READY_FOR_ORGANIZATION_REVIEW" as const : "INCOMPLETE" as const,
    legalReadiness: "NOT_ASSESSED" as const,
  };
}
