# IA de assistência: clientes, leads e parceiros

Pacote de integração v0.1 — **DESIGN_ONLY**, sem agente ativo ou conexão a canais.
Não é Legal Navigator, Professional Copilot ou assistente bilateral. Não carregar o Blueprint inteiro como conhecimento público.

Objetivos separados:
- PUBLIC_LEAD: explicar proposta/estágio, interesses e pedido de contato consentido, sem história do caso.
- CUSTOMER_SUPPORT: ajuda de uso/conta, somente contexto autenticado autorizado; não analisar documentos familiares.
- PARTNER_B2B: explicar colaboração/produto, registrar interesse em conversa; sem marketplace/comissão de indicação.
- SAFETY_HANDOFF: interromper automação comercial quando há risco e apresentar orientação de encaminhamento apropriada.

Arquivos:
- [Índice de conhecimento](knowledge/INDEX.md) e [catálogo de disponibilidade](knowledge/SERVICE-CATALOG.json)
- [Prompt versionado proposto](prompts/ASSISTANT-v0.1.md)
- [Capabilities/policy manifest](policies/capabilities.v1.json)
- [Contrato de ferramentas](contracts/TOOLS.md) e [contrato de ingestão](contracts/KNOWLEDGE-INGESTION.md)
- [Cenários de avaliação](evals/scenarios.v1.json)
- [Análise de Hermes](integrations/HERMES-ASSESSMENT.md)
- [Plano de integração](integrations/INTEGRATION-PLAN.md)

Git guarda configurações revisáveis, não conversas, leads ou dados de caso. Dados operacionais ficam em sistema com ACL/retention.
FAQ público e CRM/support não compartilham memória com espaços privados A/B. Nenhum segredo, token ou fila de mensagens neste pacote.
Prompt/manifest/fixtures não constituem enforcement: BFF/gateway implementam permissão, propósito e auditoria em cada tool.
