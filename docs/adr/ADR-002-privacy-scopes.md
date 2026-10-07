# ADR-002 — Workspaces e grants explícitos

Status: adotado na base local; parecer de privacidade pendente.
Contexto: A/B podem estar em conflito; tenant ou case membership não deve expor notas privadas.
Decisão: workspaces separados por case/scope; FK composta em itens/fontes; RLS; pro grant por workspace + expiry/revoke + MFA.
Org membership não concede caso. Compartilhar cria snapshot independente com consentimento, nunca muda item privado para público silenciosamente.
Alternativas: flag no frontend, um JSON do caso inteiro, global service_role. Rejeitadas por bypass/leakage.
Consequências: queries/RAG/export/cache precisam de actor+purpose. Compliance não tem acesso genérico. Pro-only está reservado, não integrado.
Validação: A/B, casos, colega, MFA, grants e revogação em DB real. Storage/Auth/consents ainda pendentes.
