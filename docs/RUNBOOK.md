# Runbook da base local

Use o checkout existente /workspace/legaltech. Cada cloud task é isolada; não crie worktree sem pedido do usuário.
Runtime: Node 24.19.0, npm 11.9.0. Lockfile controla deps. Cache npm em /tmp para não depender de HOME gravável.
Docker é necessário apenas aos testes de Postgres. Chromium de sistema ou Playwright gerenciado para E2E.

## Instalar e validar

```bash
cd /workspace/legaltech
npm ci --cache /tmp/legaltech-npm-cache
npm run typecheck
npm test
npm run test:db
npm run build
npm run test:e2e
```

Playwright usa /usr/bin/chromium quando disponível; caso contrário execute npx playwright install chromium
ou configure PLAYWRIGHT_CHROMIUM_EXECUTABLE com binário confiável. CI instala Chromium/deps via Playwright.
Se browser/Docker faltarem, registrar como não executado, sem mascarar testes. Não usar dados reais para “testar rápido”.
Migrations precisam de auth/roles Supabase; bootstrap de teste só em DB descartável.

## Iniciar

```bash
cd /workspace/legaltech
npm run dev
```

Para validar o artefato de produção: npm run build e npm run start. Escuta 127.0.0.1:3000.
Readiness web: GET /api/health deve informar status=ok, synthetic-demo, persistence=false;
GET / deve exibir ambiente de testes e “Visão geral”. A health não afirma DB/Auth prontos.
Não criar links de preview de loopback no onboarding. Reutilizar apenas servidor da mesma aplicação e diretório.
Se a porta estiver ocupada, identificar antes; nunca matar processo desconhecido.

## Falhas comuns

- Cache npm sem permissão: usar --cache /tmp/legaltech-npm-cache; não desativar TLS/integridade.
- Node incompatível: ativar runtime da .nvmrc; engine-strict exige Node 24, npm 11.
- Docker indisponível: checar docker info; teste DB precisa de daemon real. Script limpa apenas seu container fro-test-*.
- Pull bloqueado: registrar hostname/erro do proxy e ajustar domínio em settings com preservação da allowlist; não desligar verification.
- Grant test falha: ler row count e roles usados; não testar com BYPASSRLS/superuser como usuário.
- Startup após mudança web: reconstruir para npm run start; npm run dev recompila por demanda.

## Preparação para integração real

Não pedir token GitHub só porque variável de token falta: platform HTTPS Git proxy já funciona.
Antes de secrets, inspecionar apenas nomes/status; nunca env dumps. Sem credenciais requeridas na base sintética.
Para Supabase futuro: URL pública, anon/publishable key, sessão real no servidor; service-role é credencial privada worker-only.
Nenhum desses valores foi inventado ou adicionado nesta entrega. Supabase DB/Storage/MFA exigem configuração própria.
Network futura: domínios exatos do projeto Supabase, fontes oficiais e vendors aprovados; allowlist deve preservar destinos existentes.

## Operações ainda pendentes

RPO/RTO e retenção precisam de decisão. Backup/restore drill, rollback de migrations, DLQ, alertas e owner do suporte
antes de Pilot 1. Nenhum processo vivo é snapshot: iniciar a aplicação em cada nova task e revalidar.
