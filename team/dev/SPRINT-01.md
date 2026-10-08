# Primeira iteração — integração segura

Janela sugerida: primeira iteração de duas semanas do plano; datas/assignees dependem da equipe.
Objetivo: um humano autenticado cria e retoma seu caso privado em staging, com RLS e trilha de metadados.

| Ordem | Ticket / tarefa | Owner | Saída testável |
|---|---|---|---|
| 1 | Aceitar ADRs, nomear reviewers e configurar repo/CI | lead/product/security | branch protection/review e CI executada de fato |
| 2 | Criar Supabase staging e executar migrations | backend | schema aplicado, default grants/exposed schemas revisados; bootstrap nunca aplicado |
| 3 | FRO-031 consent registry | backend/privacy | purpose/scope/version/recipient, grants com FK, revoke tests |
| 4 | FRO-008 Auth/session/MFA | backend/web/security | JWT validado no servidor, login/logout/expiry/recovery tests |
| 5 | FRO-033 create-case command + audit/outbox | backend | case+workspace+membership em um commit; actor confiável; replay idempotente/mismatch 409 |
| 6 | Conectar dashboard ao case loader autorizado | web/backend | não acessar A/B/tenant alheio; fixtures continuam disponíveis só para demo explícita |
| 7 | RLS via API e Supabase staging | QA/security | self + outsider + pro grant + expire/revoke; sem service role nas leituras |
| 8 | Staging sintético Vercel e smoke | dev/ops | previews restritas; teste funcional com sessões reais e dados sintéticos |

Não incorporar OCR/LLM ou campanha paga ao caminho crítico desta iteração.
Saída: evidência de cada critério + novo registro de execução e atualização da matriz de integração;
preservar VALIDATION como histórico. Itens não executados continuam registrados como não executados.
