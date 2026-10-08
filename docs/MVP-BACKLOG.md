# MVP Backlog v0.1

Os IDs FRO-001…030 preservam os 30 primeiros tickets do Blueprint (§47). As lacunas críticas adicionam 031…042.
Papéis sugeridos, não pessoas já designadas. S/M/L são tamanhos relativos; estimar após discovery.
Nenhum status “base” significa feature de produção completa. As dependências são portas de integração; spikes sintéticos podem avançar antes delas.

Revisão v0.3: [lacunas e prioridades atuais](END-TO-END-REVIEW.md), [matriz de integração](INTEGRATION-STATUS.md).
As correções de validação/imutabilidade e os novos testes fortalecem a base de 004/010/023/025;
não encerram esses tickets, cujos critérios incluem integração e revisão independente.

## FRO-001 — ADR matter-centric

Responsável: Arquitetura. Tamanho: S. Dependências: —. Prioridade: P1.

Aceite: Caso é unidade central; boundaries e dependências revisáveis; nenhum domínio depende de chat como storage.

Estado: ADR documentado; revisão humana pendente.

## FRO-002 — ADR privacy scopes

Responsável: Arquitetura/Security. Tamanho: S. Dependências: 001. Prioridade: P1.

Aceite: Private A/B/shared/pro/compliance explícitos; compartilhamento cria snapshot; matriz de leitura e testes negativos.

Estado: ADR + base RLS.

## FRO-003 — ADR AI Gateway

Responsável: Arquitetura/AI. Tamanho: S. Dependências: 002. Prioridade: P1.

Aceite: Provider/purpose/retention/prompt/versions/rate-limit centralizados; nenhum SDK externo fora do gateway.

Estado: ADR; runtime pendente.

## FRO-004 — ADR Policy Engine

Responsável: Arquitetura/Backend. Tamanho: S. Dependências: 002. Prioridade: P1.

Aceite: AUTO/PROPOSE/APPROVAL/PROFESSIONAL/BLOCK; default deny; policy não depende de texto do LLM.

Estado: ADR + regras técnicas testadas.

## FRO-005 — Schema cases

Responsável: Backend. Tamanho: M. Dependências: 001,002. Prioridade: P0.

Aceite: Campos mínimos, dois modos, estados e país; nenhuma narrativa privada no metadata; migrations staging reproduzidas.

Estado: Base SQL/schema; APIs pendentes.

## FRO-006 — Schema case_members/workspaces

Responsável: Backend/Security. Tamanho: M. Dependências: 005. Prioridade: P0.

Aceite: Membership não deriva de tenant; proprietário e scope definidos; revogação e construtor transacional testados.

Estado: Base SQL; construtor pendente.

## FRO-007 — Parties/children

Responsável: Backend. Tamanho: M. Dependências: 006,031. Prioridade: P1.

Aceite: workspace/case FK, alias de criança e minimização; schema validation e testes cruzados; sem chat de menor.

Estado: Base SQL; APIs pendentes.

## FRO-008 — Auth + MFA professional

Responsável: Backend/Security. Tamanho: L. Dependências: 006,031. Prioridade: P0.

Aceite: JWT/session real no BFF; MFA aal2 para pro; logout/recovery/expiry tests; actor não vem do payload.

Estado: Não iniciado.

## FRO-009 — RLS base

Responsável: Backend/Security. Tamanho: M. Dependências: 006,008. Prioridade: P0.

Aceite: RLS em DB + Storage; grants Supabase revisados; browser sem service_role; anônimo sem leitura.

Estado: Base SQL; Storage/integração pendentes.

## FRO-010 — RLS cross-party tests

Responsável: QA/Security. Tamanho: M. Dependências: 009. Prioridade: P0.

Aceite: Testes A/B, caso/tenant, profissional, expire/revoke; cenário staging via API/Storage sem bypass.

Estado: Postgres real testado; staging pendente.

## FRO-011 — Audit event service

Responsável: Backend. Tamanho: M. Dependências: 005,008. Prioridade: P0.

Aceite: Append metadata + chain/lock por caso; trilha via comandos com actor confiável; append-only/concurrency tests.

Estado: SQL e verificador; API/checkpoints pendentes.

## FRO-012 — Legal source registry

Responsável: Legal/Backend. Tamanho: M. Dependências: 004. Prioridade: P1.

Aceite: IDs oficiais, versão, texto/hash, jurisdição/vigência, status de review; nenhuma fonte só por título.

Estado: Registro JSON pendente de verificação.

## FRO-013 — Source ingestion job

Responsável: Backend/Legal. Tamanho: M. Dependências: 012,033. Prioridade: P1.

Aceite: Fetch allowlist/TLS, snapshot imutável, checksum; mudança abre review; nunca ativa rule automaticamente.

Estado: Não iniciado.

## FRO-014 — Legal RAG endpoint

Responsável: AI/Backend. Tamanho: L. Dependências: 012,013,027,034. Prioridade: P1.

Aceite: Retrieval curado por jurisdição/versão; citação com trecho resolvível; sem fonte adequada recusa; isolamento do contexto.

Estado: Não iniciado.

## FRO-015 — Legal answer citation UI

Responsável: Frontend. Tamanho: M. Dependências: 014. Prioridade: P1.

Aceite: Fonte/trecho/vigência/review visíveis; links seguros; refusal acessível; E2E sem citações inventadas.

Estado: Não iniciado.

## FRO-016 — Intake state machine

Responsável: Frontend/Backend. Tamanho: M. Dependências: 007,008,033. Prioridade: P1.

Aceite: Persistência versionada, autosave autorizado, back/resume; UNKNOWN distinto de false; confirmações de fatos críticos.

Estado: Form sintético + schemas/estados; persistência pendente.

## FRO-017 — Intake natural-language extraction

Responsável: AI. Tamanho: M. Dependências: 016,034. Prioridade: P1.

Aceite: LLM só produz candidatos tipados; confirmação antes de consolidar; injection/refusal e logging mínimo.

Estado: Não iniciado.

## FRO-018 — Fact confirmation

Responsável: Frontend/Backend. Tamanho: M. Dependências: 016,023. Prioridade: P1.

Aceite: Autor/data/fonte; conflito de versão devolve 409; disputa e superseded preservados; nenhuma auto-confirmação.

Estado: Demonstração local + constraints; API pendente.

## FRO-019 — Document upload

Responsável: Frontend/Backend. Tamanho: L. Dependências: 008,009,020,033. Prioridade: P1.

Aceite: Storage privado, limites, URLs curtas, quarantine, versão/hash; sem acesso cruzado ou download público.

Estado: Índice sintético; upload ausente.

## FRO-020 — Antivirus/MIME validation

Responsável: Backend/Security. Tamanho: L. Dependências: 009. Prioridade: P1.

Aceite: Sniff bytes, extensão não define MIME; AV atualizado, timeout/error mantém quarentena; EICAR/zip bomb fixtures seguras.

Estado: Contrato scan results; scanner ausente.

## FRO-021 — OCR/parser abstraction

Responsável: Backend. Tamanho: L. Dependências: 020,039,041. Prioridade: P1.

Aceite: Spike de 2 alternativas, limites/isolamento, pages/confidence, PDFs hostis sem rede; adapter substituível.

Estado: Não iniciado.

## FRO-022 — Document classifier

Responsável: AI/Backend. Tamanho: M. Dependências: 021,034. Prioridade: P1.

Aceite: Categorias/schema, confidence e fallback de revisão; conteúdo não é instrução; golden documentos sintéticos.

Estado: Não iniciado.

## FRO-023 — Fact-source linking

Responsável: Backend. Tamanho: M. Dependências: 007,021. Prioridade: P1.

Aceite: Versão/página/trecho resolvível no mesmo workspace; origem document/declaration/professional; candidates distinguíveis.

Estado: FKs e domínio; pipeline pendente.

## FRO-024 — Missing-doc checklist

Responsável: Frontend/Backend. Tamanho: M. Dependências: 016,019,027. Prioridade: P1.

Aceite: Checklist versionado contextual, confirmado vs recebido; não encontrado não significa não existe; explica pendências.

Estado: Checklist técnico sintético; rules revisadas pendentes.

## FRO-025 — Financial schemas

Responsável: Backend/Frontend. Tamanho: L. Dependências: 007,023. Prioridade: P1.

Aceite: Inteiros centavos+moeda+período/fonte; income/expenses/assets/debts/child costs; correction/version tests.

Estado: Soma segura e tabela de exemplo; SQL/API pendentes.

## FRO-026 — Readiness report

Responsável: Frontend/Backend. Tamanho: M. Dependências: 024,025. Prioridade: P1.

Aceite: Pendências auditáveis, fatos contraditórios/confirmados e limites; não gera score jurídico; snapshot autorizado.

Estado: Cálculo/UI local; persistência/rules pendentes.

## FRO-027 — Policy rule registry

Responsável: Backend/Legal. Tamanho: L. Dependências: 004,012,030. Prioridade: P1.

Aceite: ID/version/owner/legal basis/effective period; precedência, retired/unknown, approval independente; decisão auditada.

Estado: Regras técnicas v1; jurídicas inativas.

## FRO-028 — Professional invite/access grant

Responsável: Backend/Frontend. Tamanho: L. Dependências: 008,009,031,038. Prioridade: P0.

Aceite: Profissional verificado, consentimento específico, scope/expiry, MFA, revoke imediato; portal alpha + acesso rastreado.

Estado: SQL grants testado; convites/portal ausentes.

## FRO-029 — Case Pack export

Responsável: Backend/Frontend. Tamanho: L. Dependências: 023,025,026,028,036. Prioridade: P1.

Aceite: Snapshot selecionado, JSON/CSV/PDF+índice/manifest; consent e audit; export respeita RLS/versões/TTL.

Estado: JSON sintético no browser; export profissional pendente.

## FRO-030 — Eval harness + 25 golden cases

Responsável: QA/AI/Legal. Tamanho: L. Dependências: 004,012. Prioridade: P1.

Aceite: 25 casos determinísticos baseline; 100+ casos AI/jurídicos independentes antes de Navigator/Bridge; rubricas assinadas e report do run.

Estado: 25 policy contracts entregues; LLM evals não executados.

## Tickets adicionais obrigatórios e fases posteriores

| ID | Prioridade / fase | Owner | Depende de | Aceite verificável |
|---|---|---|---|---|
| FRO-031 Consentimento e revogação | P0 / Pilot 1 | Backend + Privacy | 002,005 | consent com actor, purpose, recipient, scope, terms_version, legal basis e revogação; grant usa FK válida; tests de consent vencido e scope ampliado |
| FRO-032 Safety workflow | P0 / antes de Pilot 2 | Safety + Backend | 008,031 | UNKNOWN bloqueia canal; flags privadas; bloqueio prevalece; reabertura só reviewer independente; filas humanas/owner/SLA; testes de abuso/report/medida |
| FRO-033 APIs transacionais/outbox | P0 / Pilot 1 | Backend | 005,011 | criar case/intake/grants/export em commit auditado; idempotent key replay + payload mismatch 409; retries/inbox/DLQ e concorrência |
| FRO-034 Context Builder + AI Gateway | P0 / antes de IA real | AI + Security | 008,009,012,039 | actor/purpose/scopes minimizados; cache por versão/grant; revogação; budget/no-PII logs; provider failure e injection eval |
| FRO-035 Bridge transactional protocol | P0 / Pilot 2 | Backend + Security | 010,031,032,033,038 | snapshot final/approval/hash/recipient; recheck safety no lock/commit; mensagens/recibos separados; imutabilidade; race safety/send test |
| FRO-036 Retenção/eliminação | P0 / antes de casos reais | Privacy + Backend | 031,011 | matriz por entidade/base/prazo aprovada; legal hold; purge de blobs/index/backup conforme política; tombstone mínimo sem narrativa; DSR auditado |
| FRO-037 Audit checkpoints externos | P1 / hardening | Security + Backend | 011 | hashes externos assinados por período; restore + truncation test; gestão de chave e alertas; sem alegar prova judicial automática |
| FRO-038 Identity/invite/recovery | P0 / pro invite e Pilot 2 | Security + Backend | 008,031 | token one-time curto e hash armazenado; identidade profissional; anti-impersonation/controle A/B; recuperação não dá acesso sem prova |
| FRO-039 Provider/privacy contracts | P0 / OCR/IA externa real | Privacy + Legal + Ops | Fase 0 | DPA, no-training/retention, localização/suboperadores, minimização e transferência aprovados; nenhum SDK sem gateway |
| FRO-040 Operações/restores | P0 / Pilot 1 | Ops + Security | 008,011 | owners nominais/P0 SLA, alertas sem PII, backup criptografado, restore drill com RPO/RTO medidos, rollback e runbook ensaiado |
| FRO-041 Licenças/component spikes | P1 / adoção de componente | Tech lead + Legal | Fase 0 | inventário/SBOM/licenças verificadas por commit/release; decisão docassemble/Casewell/ProMediate; compatibilidade e riscos |
| FRO-042 PWA/cache privacy | P2 / após web piloto | Frontend + Security | 008,009,036 | assets offline só não sensíveis; logout elimina caches; session expiry não revela caso; acessibilidade WCAG alvo AA e mobile |

## Definition of Done global

Teste positivo e negativo da permissão, evidência atual do runner, documentação/contratos, observabilidade sem conteúdo,
review independente, rollback, acessibilidade quando UI e nenhuma P0 aberta. Regras/fontes/prompts legais precisam de revisão humana e evals independentes.
Envia/compartilha/aceita jamais se implementam como tool livre de agente. Aprovação humana deve ser vinculada ao exato snapshot.

## Trabalho imediato da equipe

1. Validar ADRs e nomear responsáveis jurídicos/privacy/safety.
2. Integrar FRO-008/031 e comandos FRO-033 à base já testável.
3. Validar RLS/Storage no Supabase staging, completar intake e pipeline de documentos.
4. Implementar finanças, readiness persistido e handoff; rodar gates Pilot 1.

Nenhuma integração externa, publish/deploy ou criação de contas foi realizada nesta entrega.

## Backlog após Pilot 1 — fora das 12 semanas

| ID / fase | Owner | Dependências | Aceite |
|---|---|---|---|
| FRO-043 Tone/rewrite material diff, Pilot 2 | AI + Frontend + QA | 032,034,035 | Sugestão opcional privada; destaque valores/datas/obrigações/admissões alterados; nunca substitui rascunho silenciosamente; usuário vê texto final; evals independentes de preservação |
| FRO-044 Structured proposal/versioning, Pilot 3 | Backend + Product | 031,032,033,035 | Tópicos/termos/propostas/contrapropostas imutáveis por versão; optimistic concurrency; humano confirma versão exata; status ACCEPTED_IN_PRINCIPLE; agente nunca aceita |
| FRO-045 Consensus Map, Pilot 3 | Frontend + Backend | 044 | Cada tema mostra acordado em princípio/parcial/divergente/não discutido/requer profissional; fontes rastreáveis; não declara acordo válido |
| FRO-046 Cenários de negociação familiar, Pilot 3 | Product + Legal + AI | 025,044,045 | Alimentos/despesas/convivência/férias/saúde/educação em schemas; premissas/fonte/version claras; sem previsão judicial, coerção ou private-rationale leakage; golden cases por tema |
| FRO-047 Co-parent calendário/reembolsos, Fase 6 | Backend + Frontend | 035,044,036 | Pedidos de troca, recibos, despesa/reembolso, obrigações recorrentes; confirmações e versões; limites de contato continuam prevalecendo |
| FRO-048 Professional Copilot, Fase 3 expandida | AI + Legal | 028,034 | Ask-case só scopes concedidos com MFA; ver evidência/citação; revisão humana, revogação invalida contexto/cache; não aprende entre escritórios |
| FRO-049 Document assembly spike, Fase 7 | Backend + Legal | 029,041 | Comparar templates próprios com docassemble isolado; templates versionados/revisados; nenhuma minuta final automática self-service |
| FRO-050 WhatsApp/email notificações, após handoff | Backend + Privacy | 031,033,039 | Consent/opt-out, payload mínimo e link autenticado; sem conteúdo de caso/anexos sensíveis; retries/idempotência |
| FRO-051 E-sign/cartório handoff, Fase 7 | Integrations + Legal | 029,038,049 | Validar vendor/identidade/formalidades e sandbox; assinatura por humano; comprovantes auditados; não prometer formalização automática |
| FRO-052 Métricas e experimentos B2C/B2B | Product + Data + Privacy | 031,040 | Funil/no-PII, horas poupadas, documentos pendentes/segurança; testar Free/Prepare/Resolve/Co-parent e seats sem marketplace/comissão |
| FRO-053 Legal change management/admin | Legal + Backend + Ops | 012,013,027,030 | Mudança de checksum abre review; norma/rule/prompt versionados; aprovação independente; casos reavaliados conforme política; rollback e changelog |

Não estimar essas fases como parte do Pilot 1. Prioridade/escopo final depende dos resultados e dos gates de cada piloto.
