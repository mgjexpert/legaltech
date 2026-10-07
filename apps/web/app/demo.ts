import type { DocumentRecord, Fact, Intake } from "@fro/domain";
export const DEMO_CASE_ID = "00000000-0000-4000-8000-000000000010";
export const DEMO_WORKSPACE_ID = "00000000-0000-4000-8000-000000000020";
export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";
export const demoIntake: Intake = {
  relationship: "MARRIAGE", state: "SP", hasChildren: true, objective: "PREPARE", monthlyIncomeCents: 650000,
};
export const demoDocuments: DocumentRecord[] = [
  { id: "00000000-0000-4000-8000-000000000040", caseId: DEMO_CASE_ID, workspaceId: DEMO_WORKSPACE_ID,
    category: "IDENTITY", label: "Identificação · exemplo fictício", status: "CONFIRMED", sha256: "a".repeat(64), version: 1 },
  { id: "00000000-0000-4000-8000-000000000041", caseId: DEMO_CASE_ID, workspaceId: DEMO_WORKSPACE_ID,
    category: "INCOME", label: "Comprovante de renda · exemplo fictício", status: "CONFIRMED", sha256: "b".repeat(64), version: 1 },
  { id: "00000000-0000-4000-8000-000000000042", caseId: DEMO_CASE_ID, workspaceId: DEMO_WORKSPACE_ID,
    category: "RELATIONSHIP", label: "Certidão · exemplo fictício", status: "PENDING_REVIEW", sha256: "c".repeat(64), version: 1 },
];
export const demoFact: Fact = {
  id: "00000000-0000-4000-8000-000000000060", caseId: DEMO_CASE_ID, workspaceId: DEMO_WORKSPACE_ID,
  key: "monthly_income_cents", value: 650000, status: "CANDIDATE",
  source: { type: "DOCUMENT", documentVersionId: "00000000-0000-4000-8000-000000000050", page: 1 },
};
