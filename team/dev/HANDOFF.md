# Transferência para a equipa técnica

Pacote de entrega de 08/10/2026. Repositório: mgjexpert/legaltech. Branch de entrega: main.
Base de código auditada: e7af2d905161ac3c7bb5af5cc79ac5198c8fe5fd; esta entrega acrescenta documentação,
atualiza o estado Git e integra o histórico da foundation. A transferência para main foi solicitada pelo responsável pelo projeto.
Não constitui deploy, aceite jurídico ou autorização de uso com casos reais.

## O que a equipa recebe

| Local | Conteúdo | Estado / limite |
|---|---|---|
| apps/web | Next.js/React: intake, documentos de exemplo, finanças, confirmação, readiness e export | Demonstração sintética; recarregar perde alterações; sem login/DB/LLM |
| packages/domain | Schemas Zod, estados, centavos e preparação | Integrado à demonstração; não substitui autorização |
| packages/policy-engine | AUTO/PROPOSE/APPROVAL/PROFESSIONAL/BLOCK e guards runtime | Biblioteca testada; precisa ser chamada por comandos reais |
| packages/db | Migrations 0001–0003, RLS, facts/documents/grants, audit/outbox/idempotência | Testado separadamente em Postgres; sem conexão à Web |
| packages/audit | Verificador da cadeia de hashes | Sem checkpoints externos ou integração a comandos Web |
| apps/worker | Handler puro de preparação | Sem daemon, fila, lease/retries ou origem autorizada |
| legal | Registry de fontes e regras | Pendentes/inativas; não aptas a respostas jurídicas públicas |
| evals e tests | Contratos determinísticos e regressões; testes de DB e navegador | Sem avaliação de modelo LLM ou validação jurídica |
| docs | Blueprint original, arquitetura, ADRs, backlog, revisão e runbooks | Distingue alvo arquitetural de integração comprovada |
| team/dev | Onboarding, primeira iteração, DoD e este pacote | Responsáveis nominais ainda precisam ser designados |
| marketing | Briefs, campanhas, perfis e plano de medição | Rascunhos; contas/publicação externa não verificadas |
| ai/customer-assistance | Prompts, knowledge, contratos/tools, evals e análise Hermes | DESIGN_ONLY, tools desativadas; Hermes não instalado |

Estado canônico: [matriz de integração](../../docs/INTEGRATION-STATUS.md).
Diagnóstico: [revisão de ponta a ponta](../../docs/END-TO-END-REVIEW.md).
Blueprint: [documento original preservado](../../docs/BLUEPRINT.md); suas instruções são especificação de produto,
não autorização para ativar serviços, partilhar dados ou dispensar revisão humana.

## Ordem de leitura

1. [README](../../README.md) e [AGENTS](../../AGENTS.md).
2. [Revisão atual](../../docs/END-TO-END-REVIEW.md), [matriz](../../docs/INTEGRATION-STATUS.md) e [evidências](../../docs/REVIEW-EVIDENCE.json).
3. [Arquitetura](../../docs/ARCHITECTURE.md), [modelo/RLS](../../docs/DATA-MODEL.md) e [ADRs](../../docs/adr/README.md).
4. [Plano](../../docs/EXECUTION-PLAN.md), [53 tickets](../../docs/MVP-BACKLOG.md) e [primeira iteração](SPRINT-01.md).
5. [Segurança](../../docs/SECURITY.md), [privacidade](../../docs/PRIVACY.md), [limites jurídicos](../../docs/LEGAL-BOUNDARIES.md) e [governança de IA](../../docs/AI-GOVERNANCE.md).
6. [Guia de deploy](DEPLOYMENT.md), [runbook](../../docs/RUNBOOK.md), [incidentes](../../docs/INCIDENT-RESPONSE.md) e [DoD](DEFINITION-OF-DONE.md).

## Reproduzir a base

Com acesso corporativo ao GitHub, clonar e entrar na raiz do repositório:

```bash
git clone https://github.com/mgjexpert/legaltech.git
cd legaltech
git switch main
git rev-parse HEAD
```

Ativar o Node indicado em .nvmrc (24.19.0), npm 11.9.0, Docker e Chromium/Playwright.
Usar package-lock.json; os comandos partem da raiz, não apenas de apps/web.

```bash
npm ci
npx playwright install --with-deps chromium
npm run check
npm run dev
```

Playwright pode exigir dependências e permissões de instalação no sistema da equipa;
alternativa de Chromium confiável em [onboarding](ONBOARDING.md) e [runbook](../../docs/RUNBOOK.md).
Docker é necessário para os testes reais de banco. O runner remove apenas seu container/volume descartável.
Não aplicar packages/db/tests/bootstrap.sql a qualquer banco Supabase ou de aplicação.

O dev usa 127.0.0.1:3000; E2E usa produção em porta exclusiva 3100 após build.
GET /api/health informa synthetic-demo e persistence=false. Nenhum segredo externo é necessário para esta base.
Os resultados anteriores são 72 testes unitários, 39 checks DB e 3 E2E; evidências de entrega em
[HANDOFF-EVIDENCE.json](HANDOFF-EVIDENCE.json). Não confundir os 25 contratos de policy com testes de LLM.

## Responsabilidades e acessos a transferir

| Responsável a nomear | Acesso / decisão | Critério de recebimento |
|---|---|---|
| Tech lead / maintainer | GitHub corporativo, reviews e proteção de main | Clone/checks reproduzidos e backlog aceito |
| Backend / Security | Supabase staging, Auth/MFA, DB/RLS/Storage, grants | Sessão e isolamento reais, inclusive via API/Storage |
| DevOps | Conta Vercel ou VPS, domínio/DNS e secrets manager | Deploy sintético, TLS, smoke/rollback e processo de incidentes |
| QA | CI, ambiente de teste e datasets sintéticos | Regressões reproduzidas e critérios negativos documentados |
| Product | Escopo Pilot 1 e prioridade dos tickets | Aceites e decisões de produto registradas |
| Legal / Privacy | Fontes, bases legais, retenção e providers | Review independente registrado antes de ativação |
| Safety / incident owner | Workflow humano, escalonamento e recuperação | Gates operacionais ensaiados antes de recursos bilaterais |

Fornecer convites individuais com MFA e privilégios mínimos. Transferir segredos somente por manager/provider;
não por este documento, Git, chat ou prompts. Projetos/regiões/domínio/budget precisam de decisão da equipa.
Vercel/Supabase/Cloudflare/VPS externos não foram provisionados ou auditados nesta entrega.
Consultar [stack](../../docs/STACK-AND-NEXT-STEPS.md) para escolher hosting; Vercel é opcional se a equipa usar VPS.

## Próxima vertical a implementar

Objetivo: humano autenticado cria e retoma um caso privado em staging, com dados sintéticos e trilha auditável.

1. FRO-031: consentimentos versionados/finalidade/scope/recipient e revogação; ligar grants por FK.
2. FRO-008/038: sessão/JWT/identity/MFA verificados no servidor, logout/expiry/recovery.
3. FRO-033 + 005/006/011: comando case+workspace+membership+audit+outbox transacional e idempotente.
4. FRO-009/010: RLS com sessão de usuário também via Supabase API/Storage; nenhum service_role como leitor do usuário.
5. Conectar loader/intake autorizado ao dashboard; demonstrar isolamento A/B/outro caso/outro escritório e retomada.
6. Depois: upload/quarentena/AV/OCR, facts confirmados, finanças/readiness persistidos e handoff profissional.

Manter demo e dados persistidos explicitamente separados. Não usar LLM, Hermes ou notificações como atalho
para os controlos de identidade, consentimento e persistência. Bridge/negociação continuam fases posteriores.

## Aceite da transferência

- [ ] Nomear maintainer, reviewers e responsáveis operacionais/jurídicos; registrar aceite em issue corporativa.
- [ ] Conferir SHA recebido em main e executar o pipeline no ambiente da equipa.
- [ ] Confirmar resultados da CI remota e configurar proteção de main/reviews; não verificados nesta sessão.
- [ ] Escolher Vercel ou VPS e implantar somente staging sintético restrito, com smoke e rollback registrados.
- [ ] Criar Supabase staging se mantida a stack; revisar migration history/grants/exposed schemas e nunca usar bootstrap de teste.
- [ ] Atribuir tickets da primeira vertical e datas; registrar bloqueios, sem marcar funcionalidades por existência de pastas.
- [ ] Validar os gates de Pilot 1 antes de qualquer caso real, incluindo privacy/provider review e restore drill.

Lista pendente de aceite humano; nenhum responsável ou serviço é considerado aprovado automaticamente.
Registrar execução e links na issue de transferência, sem PII/segredos; atualizar a matriz somente com evidência.
Merge em main organiza o código para a equipa e não remove o NO-GO de produção/casos reais.
