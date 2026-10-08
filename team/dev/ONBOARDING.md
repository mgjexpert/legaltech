# Onboarding da equipe

## Conhecer o estado real

Ler AGENTS.md, README, architecture/DB/RLS, ADRs e VALIDATION.
A UI atual é fixture sintética. Auth/DB/Storage/RAG não estão ligados a ela.
31/033/008 são próximos componentes de segurança e integração, não “polimento opcional”.

## Ambiente local

Node 24.19.0, npm 11.9.0, Docker para DB, Chromium/Playwright para E2E.

```bash
npm ci --cache /tmp/legaltech-npm-cache
npm run check:docs
npm run typecheck
npm test
npm run test:db
npm run build
npm run test:e2e
```

npm run dev para editar; npm run start para artefato já construído. Não usar production data em testes.
E2E exige build e utiliza servidor próprio na porta 3100; não reaproveita o servidor dev.
Migrations do core se aplicam em Supabase com auth/roles próprios; bootstrap.sql só em DB descartável.

## Ambientes e contas

GitHub/Vercel/Supabase/Cloudflare: grants individuais, MFA, owner corporativo e revisão de acesso.
Supabase staging e produção separados; previews sem segredos de produção.
Publishable/anon key não substitui JWT/RLS. service_role nunca no browser/NEXT_PUBLIC_* ou como reader em nome de usuário.
Secrets em provider/manager, jamais em Git, prompts, screenshots ou logs.

## Processo de entrega

Issue com escopo/aceite → implementação → checks → review independente → staging → smoke → aprovação de rollout.
PRs de regra jurídica/fonte/prompt precisam de counsel e evals; quem altera regra não aprova sozinho o próprio teste.
Schemas novos levam workspace/case FK e testes negativos. Workers assumem retries/at-least-once.
Não habilitar canal bilateral por flag antes dos gates. Não publicar dados reais por CI green.
