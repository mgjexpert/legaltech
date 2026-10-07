import type { CaseMode, SafetyState } from "@fro/domain";

export const ACTIONS = [
  "classify_document", "calculate_finances", "propose_rewrite", "send_message",
  "share_document", "individual_legal_advice", "final_legal_document",
  "accept_proposal", "disclose_private_to_counterparty",
] as const;
export type Action = typeof ACTIONS[number];
export type PermissionClass = "AUTO" | "PROPOSE" | "APPROVAL" | "PROFESSIONAL" | "BLOCK";
export interface PolicyContext {
  // Build this on the server from session, membership, grants and consent records.
  // Do not deserialize this object from a client request as trusted authorization.
  mode: CaseMode;
  safety: SafetyState;
  actor: "HUMAN" | "AGENT" | "PROFESSIONAL";
  workspaceAccess: boolean;
  professionalGrantActive: boolean;
  mfaVerified: boolean;
  explicitApproval: boolean;
  bilateralEnabled: boolean;
  bothPartiesConsented: boolean;
}
export interface PolicyDecision {
  permission: PermissionClass;
  canExecute: boolean;
  reason: string;
  ruleId: string;
  ruleVersion: number;
}
function decision(permission: PermissionClass, canExecute: boolean, reason: string, ruleId: string): PolicyDecision {
  return { permission, canExecute, reason, ruleId, ruleVersion: 1 };
}
export function evaluatePolicy(action: string, ctx: PolicyContext): PolicyDecision {
  if (!ctx.workspaceAccess) return decision("BLOCK", false, "Sem acesso ao workspace.", "TECH-ACCESS-001");
  if (!ACTIONS.includes(action as Action)) return decision("BLOCK", false, "Ação desconhecida.", "TECH-DEFAULT-DENY-001");
  if (action === "disclose_private_to_counterparty")
    return decision("BLOCK", false, "Notas privadas não são divulgadas à contraparte.", "TECH-PRIVACY-001");
  if (action === "accept_proposal") {
    return decision("BLOCK", false, ctx.actor === "AGENT" ? "Agente não aceita proposta." : "Negociação não habilitada nesta base.", "TECH-ACCEPT-001");
  }
  if (action === "send_message" || action === "propose_rewrite") {
    if (!ctx.bilateralEnabled) return decision("BLOCK", false, "Canal bilateral não habilitado.", "TECH-BILATERAL-GATE-001");
    if (ctx.safety !== "NORMAL" || !ctx.bothPartiesConsented)
      return decision("BLOCK", false, "Canal requer consentimentos e segurança confirmados.", "TECH-SAFETY-001");
    if (action === "propose_rewrite") return decision("PROPOSE", false, "Somente sugestão privada; nenhuma execução material.", "TECH-REWRITE-001");
    if (ctx.actor !== "HUMAN") return decision("BLOCK", false, "Envio exige ação humana.", "TECH-SEND-001");
    return decision("APPROVAL", ctx.explicitApproval, "Enviar exige confirmação do conteúdo final.", "TECH-SEND-001");
  }
  if (action === "individual_legal_advice" || action === "final_legal_document") {
    const allowed = ctx.mode === "PROFESSIONAL_SUPERVISED" && ctx.actor === "PROFESSIONAL"
      && ctx.professionalGrantActive && ctx.mfaVerified && ctx.explicitApproval;
    return decision("PROFESSIONAL", allowed, "Exige profissional autorizado, MFA e revisão explícita.", "TECH-PROFESSIONAL-001");
  }
  if (action === "share_document") {
    return decision("APPROVAL", ctx.actor === "HUMAN" && ctx.explicitApproval,
      "Compartilhamento exige humano e aprovação específica; destinatário/escopo ainda validam na API.", "TECH-SHARE-001");
  }
  return decision("AUTO", true, "Operação técnica no escopo autorizado; não é conclusão jurídica.", "TECH-LOCAL-001");
}
