# Contratos de ferramentas — proposta, sem endpoints entregues

Todas as ferramentas permanecem disabled. Nome de tool não dá acesso: BFF valida sessão/purpose/rate-limit/consent e schema.
Token do agente não é service_role nem acesso SQL amplo. Browser/agente não envia actor_id como identidade confiável.

| Tool proposta | Input mínimo / autorização | Output mínimo | Limite |
|---|---|---|---|
| public_faq_lookup | query limitada, idioma; KB pública aprovada/versionada | trechos permitidos + version IDs | sem acesso a cases/prompts internos |
| create_contact_interest | finalidade LEAD ou PARTNER, canal, contato mínimo, consent proof versionado + confirmação | interest_id e status | não aceitar relato de caso, documentos, CPF ou dados infantis |
| create_support_ticket | sessão validada, categoria técnica, resumo confirmado e minimizado | ticket_id e status | visitante não ganha acesso informando email; sem case narrative |
| propose_partner_meeting | contact interest consentido, preferência mínima | rascunho de pedido/link aprovado quando existir | não envia convite/email ou promete parceiro confirmado |

Contato é dado pessoal, não ficção “anônima”: banco/CRM/inbox com ACL/retention; não arquivo no Git.
Recusar campos fora de schema, uploads ou instruções embutidas para chamar ferramentas extras.
Idempotência por actor/purpose/op/key; mesmo payload retorna operação original, hash diferente 409; audit sem contato/narrativa.
Opt-out/eliminação e prova de consentimento devem existir antes de capturar leads em canal real.
Outputs de erro não confirmam usuário/case/account sem autorização. Support pode emitir generic acknowledgment quando usuário é visitante.

O pacote não implementa CRM, tickets, provider ou messaging. Endpoints/credentials/DPA/human handoff são trabalho do plano de integração.
