import { z } from "zod";
import { IntakeSchema, DocumentSchema, FactSchema, calculateReadiness } from "@fro/domain";

export const PreparationJobSchema = z.object({
  type: z.literal("PREPARATION_SNAPSHOT"),
  id: z.uuid(), caseId: z.uuid(), workspaceId: z.uuid(),
  intake: IntakeSchema,
  documents: z.array(DocumentSchema),
  facts: z.array(FactSchema),
}).strict();
// Pure handler, not a persistent queue or background process. A trusted loader must
// enforce grants/purpose before submitting data; this worker cannot bypass RLS.
export function processPreparationJob(input: unknown) {
  const job = PreparationJobSchema.parse(input);
  return {
    jobId: job.id,
    readiness: calculateReadiness(job.intake,job.documents,job.facts,{caseId:job.caseId,workspaceId:job.workspaceId}),
  };
}
