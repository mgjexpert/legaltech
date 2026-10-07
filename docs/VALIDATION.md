# Evidências de entrega v0.1

Data: 06/10/2026. Validação na instância cloud atual, não em produção/Supabase hospedado.

## O que foi entregue

- Blueprint original preservado, revisão com 22 lacunas priorizadas, arquitetura/ERD, 5 ADRs e governança.
- Plano de 12 semanas em 6 iterações, fases/pilotos/gates e 53 tickets com dependências/aceite.
- Monorepo npm/TypeScript strict; Next App Router com dashboard responsivo de dados sintéticos.
- Intake demonstrativo, índice documental, matemática em centavos, fato/evidência/confirm, divergências,
  Readiness Report de organização e Case Pack JSON sintético.
- Núcleo de domínio, Policy Engine técnico versionado, handler puro de preparação e verificador de audit chain.
- Duas migrations Postgres/pgvector: RLS, metadados de caso, workspaces, grants temporais, documentos/fatos,
  auditoria append-only e contratos de outbox/idempotência.
- Registry com 17 referências PENDING_VERIFICATION; regras jurídicas DRAFT/inativas.
- CI definida (não executada no GitHub nesta entrega). README/AGENTS/runbooks para continuação.

## Resultados executados

| Verificação | Resultado | O que demonstra |
|---|---|---|
| npm ci --cache /tmp/legaltech-npm-cache | passou | lockfile reproduzível; script de instalação exercitado |
| npm run typecheck | passou | TypeScript strict, inclusive sem arquivos .next/next-env gerados |
| npm test | 57 passaram, 0 falharam | domínio, workers puros, 25 golden policy contratos + safety, audit verification |
| npm run test:db | 30 checks passaram | PostgreSQL real, pgvector, roles/RLS, A/B, caso/tenant, grants/MFA claim, expire/revoke/FKs, escrita negada |
| Audit concorrente no DB | passou | 8 writers concorrentes + evento inicial, cadeia de 9 eventos verificável |
| npm run build | passou | build de produção Next 16.3.8; página e health route |
| npm run start + health/request | passou | processo reiniciado após rebuild, health=synthetic-demo/persistence=false e página renderizada |
| npm run test:e2e | 3 passaram, 0 falharam | Chromium real: intake→confirm→report→download; mobile; health/headers |
| npm audit | 0 vulnerabilidades reportadas | advisory scan do lockfile atual; não é pentest/licença |
| Integridade do Blueprint | idêntico ao upload Markdown | original preservado; nenhuma atualização silenciosa |

Sem testes intencionalmente skipados nesta seleção. Não houve teste de LLM nem sessão JWT/Supabase real.
As 25 golden fixtures são parte dos 57 testes, não contagem adicional.
Screenshots desktop/mobile e downloads de teste são outputs ignorados em artifacts/ e test-results/.
Containers de banco foram removidos com volumes; nenhum banco persistente de usuário foi criado.

## Limites importantes para a equipe

Dashboard e banco ainda são componentes separados. A Web não autentica, não persiste, não faz upload, não consulta IA,
não concede acesso real ao advogado e não se comunica com contraparte. Export é somente JSON sintético em dispositivo.
Handler worker não é fila/daemon; outbox e idempotency tables não implementam semântica transacional por si sós.
RLS não impede bypass por migration owner/service_role. JWT/aal são simulados no bootstrap; MFA real segue pendente.
Consent reference ainda precisa de tabela/FK/termos e APIs. Professional-only/compliance workspaces estão reservados.
Não há full text de fontes jurídicas ou regra legal ativa. Não houve validação independente das referências do Blueprint.
Hash chain não detecta truncation final/reescrita por DBA sem checkpoint externo.
AV/OCR/Storage/RAG/portal/retention/ops/closed pilot seguem no backlog; nenhuma prontidão de produção alegada.

## Configuração cloud e publicação

Salvos no draft do ambiente: install_script (npm ci + build) e start_skill (diretório, startup, readiness,
isolamento, checks e limitações). Nenhum segredo/variável/network/repository membership foi substituído.
Salvar o draft não executa comandos nem publica. Instalação/build/startup foram exercitados na máquina atual.
Revisar e salvar as alterações em environment settings e publicar o ambiente para disponibilizar a configuração/snapshot.
Publicação, restauração em nova tarefa e execução remota da CI não foram verificadas.

## Próximo trabalho da equipe

Revisar ADRs e nomear responsáveis; implementar auth/MFA/consentimentos e APIs transacionais (008/031/033),
validar RLS também em Supabase/Storage e integrar intake/document pipeline, finanças/readiness e handoff.
Manter dados sintéticos até todos os gates do Pilot 1; Bridge e negociação permanecem fases posteriores.
