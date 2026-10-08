# Guia de deploy para a equipa

Escopo atual: demonstração sintética. Dois caminhos possíveis; escolher um host Web para evitar duplicar operação.
Este guia documenta passos a executar, não afirma deploy existente. Nenhuma conexão Vercel/Supabase foi feita.
Responsabilidades/aceite: [transferência técnica](HANDOFF.md). Arquitetura alvo: [stack](../../docs/STACK-AND-NEXT-STEPS.md).

## Antes de publicar staging

1. Nomear DevOps/maintainer e obter acesso corporativo ao host escolhido, GitHub e DNS, com MFA.
2. Definir ambiente, região, custo máximo, domínio e acesso restrito à demo; somente dados sintéticos.
3. Executar npm ci e npm run check; confirmar CI remota e SHA que será implantado.
4. Configurar secrets por ambiente no provider/manager; atualmente nenhum segredo externo é necessário à demo.
5. Registrar smoke/rollback e owners de operação. Verificar se o host já tem deploy automático antes de mudar a branch.

## Opção A — Vercel para Next.js

| Configuração proposta | Valor / validação |
|---|---|
| Repositório | mgjexpert/legaltech, conexão feita por maintainer na conta corporativa |
| Framework | Next.js |
| Branch | main após entrega; previews de PRs restritas |
| Root Directory | apps/web, com acesso aos arquivos do monorepo fora dessa pasta habilitado |
| Runtime | Node 24 compatível com .nvmrc e engines; confirmar disponibilidade no provider |
| Install Command | cd ../.. && npm ci, preservando o lockfile e workspaces da raiz |
| Build Command | cd ../.. && npm run build |
| Output | Padrão Next.js: .next relativo a apps/web; não tratar como export estático |
| Variáveis da demo | Nenhuma integração externa exigida; NEXT_TELEMETRY_DISABLED=1 é opcional |
| Acesso | Proteção de deployment/preview adequada ao plano escolhido; confirmar por teste externo |

Configuração proposta, ainda não validada na Vercel. Confirmar logs do primeiro build, resolução dos workspaces,
runtime e path de saída. Se o provider detectar/configurar monorepo automaticamente, conferir os comandos efetivos
e preservar instalação na raiz e as dependências @fro/domain/@fro/policy-engine.
Não apontar domínio de produção ou liberar casos reais ao obter build verde.
Vercel hospeda Web/BFF; OCR persistente, filas e Hermes não são daemons a iniciar nessa aplicação.

## Opção B — Web em VPS, com Supabase gerenciado depois

A equipa opera Node, reverse proxy, TLS, patches, restart, monitorização e backups do que hospedar.
Para a demo não precisa instalar Postgres de aplicação nem Supabase self-hosted na VPS.
Não há Dockerfile, Compose, unit systemd ou Terraform entregues; esses artefatos de infraestrutura devem ser
implementados e revisados pela equipa conforme o host. O worker atual também não é serviço executável.

Sequência para processo Node diretamente no host, em um diretório de release separado:

```bash
npm ci
npm run build
npm run start
```

Usar Node/npm fixados, usuário de serviço sem root e supervisor (por exemplo systemd).
O comando start mantém Next em 127.0.0.1:3000: reverse proxy no mesmo host encaminha HTTPS para esse loopback.
Expor somente as portas de borda necessárias; restringir SSH à política da equipa.
Executar smoke após restart e testar TLS/headers/domínio do lado externo.
As dependências são workspaces locais: manter raiz/packages/lockfile no artefato ou implementar e validar um bundle standalone.
Não copiar apenas apps/web/.next para a VPS e presumir artefato suficiente.

Se a equipa containerizar, definir explicitamente interface/porta da Web, usuário, imagem/runtime, healthcheck,
resources e armazenamento efêmero. Loopback dentro de container não é acessível ao proxy em outro container;
ajustar binding/portas de forma revisada, sem expor diretamente a porta do app à internet.
Parsers/AV/worker e Hermes precisam de isolamento separado e privilégios próprios quando implementados.

## Supabase: passo de integração, não requisito da demo

Supabase gerenciado pode servir tanto Web na Vercel quanto na VPS.
Se a equipa escolher substituí-lo, registrar ADR para Auth/MFA, roles/JWT/RLS, Storage privado e operação;
Postgres simples sozinho não entrega esses serviços.

1. Criar staging separado de produção, com região, owners, backups e termos aprovados.
2. Verificar Auth/roles, pgvector, grants e schemas expostos. Registrar histórico antes de aplicar 0001 → 0002 → 0003.
3. Nunca aplicar packages/db/tests/bootstrap.sql; suas claims/roles são simulações de teste.
4. Não reaplicar migrations já registradas. Em DB existente, auditar renda inválida antes de 0003;
   a constraint interrompe a transação. A correção de REVOKE em 0001 vale para nova instalação.
5. Implementar BFF/sessão/consentimentos/comandos e policies de Storage; as tabelas isoladas não integram a Web.
6. Configurar URL e publishable/anon key conforme o SDK adotado e sessão real; service_role/secret key permanece server-only,
   nunca em NEXT_PUBLIC_*, e nunca como leitor em nome do usuário. Os nomes de env serão definidos na implementação.
7. Validar login/logout/expiry, MFA profissional, isolamento A/B/tenant/grants/revoke e Storage por API, com dados sintéticos.

Hoje apps/web/.env.example contém apenas orientações. Acrescentar chaves não ativa integração ausente.
Não há runner de migrations de produção, pipeline de infra ou procedimento de upgrade executado em Supabase nesta base.
Criá-los com histórico e staging antes de automatizar migrações de qualquer banco persistente.
Consultar [modelo de dados](../../docs/DATA-MODEL.md) e [tickets](../../docs/MVP-BACKLOG.md).

## Smoke e evidência de deploy

| Verificação | Resultado esperado na demo |
|---|---|
| GET / | Ambiente de testes visível, dashboard utilizável e aviso de dados sintéticos |
| GET /api/health | status=ok, synthetic-demo, persistence=false; não afirma DB/Auth prontos |
| Jornada | Intake → confirmação de fato → readiness → JSON local com synthetic=true |
| Recarregar | Fixtures restauradas; nenhuma promessa de persistência |
| Mobile e headers | Navegação utilizável, CSP/frame/nosniff/referrer conforme configuração e proxy |
| Acesso externo | TLS válido e restrição de acesso conferida por pessoa sem sessão autorizada |
| Restart / rollback | Processo saudável, release anterior recuperável, domínio continua funcional |

Registrar SHA, ambiente, runtime, build, horário, executor, URL restrita, smoke e limites na issue de deploy.
No fluxo real futuro, estender health/readiness e E2E para dependências efetivas; nunca trocar persistence=false apenas por existir env.

## Rollback

Vercel: promover/reimplantar um deployment anterior conhecido, verificar domínio e repetir smoke.
VPS: manter releases por SHA, apontar supervisor para release anterior, restart e smoke; não fazer pull sobre processo ativo.
Rollback de Web não desfaz migration nem reverte dados. Migrations futuras exigem plano próprio de compatibilidade/restore;
não remover constraints/triggers ou reaplicar 0001 como rollback.
Depois de incidentes, preservar evidência mínima e seguir o [runbook](../../docs/INCIDENT-RESPONSE.md).

## Gate para casos reais

Ainda NO-GO: auth/consent/BFF/storage integrados, grants profissionais, provider/privacy review, restore drill,
monitorização e responsáveis humanos precisam das evidências documentadas. Fontes jurídicas/RAG/LLM e Bridge/negociação
têm gates adicionais. A presença do código em main ou uma URL funcionando não altera esses critérios.
