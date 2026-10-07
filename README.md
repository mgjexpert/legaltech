# Family Resolution OS

Base técnica e Implementation Pack v0.1 para a equipe de engenharia. Brasil, caso como unidade central,
piloto de preparação individual. O Blueprint original está em [docs/BLUEPRINT.md](docs/BLUEPRINT.md).

**Estado: base local com dados sintéticos; não é o MVP completo, nem ambiente para casos reais.**
O dashboard não autentica, não grava em banco e não chama LLM. Não há upload real, envio à contraparte,
negociação, consulta jurídica ou Portal Profissional funcional. O backend/RLS é validado separadamente
em Postgres real; ainda não está integrado ao dashboard.

## Começar

Node 24 (pin em .nvmrc), npm 11 e Docker para os testes de banco.

```bash
cd /workspace/legaltech
npm ci --cache /tmp/legaltech-npm-cache
npm run dev
```

O servidor escuta no loopback, porta 3000. Para verificar internamente:
```bash
curl --fail http://127.0.0.1:3000/api/health
```

Nenhuma conta Supabase, chave de IA ou segredo é necessária nesta etapa.
A navegação demonstra intake, checklist, finanças, confirmação de fato e export JSON sintético.
Alterações são somente da sessão; recarregar restaura as fixtures. Nunca inserir dados reais.

## Validar

```bash
npm run typecheck
npm test
npm run test:db
npm run build
npm run test:e2e
npm run start
```

Os testes de banco iniciam um container descartável sem rede/porta publicada, aplicam migrations e removem
container/volume ao terminar. Bootstrap auth é exclusivo dos testes: nunca aplicá-lo em Supabase.
Se Docker não estiver disponível, esses testes ficam **não executados**, sem substituir por mocks.
Imagem Postgres/pgvector fixada por digest; lockfile e npm ci preservam resolução.

## Entrega para a equipe

- [Revisão de arquitetura e lacunas](docs/ARCHITECTURE-REVIEW.md)
- [Arquitetura e contratos](docs/ARCHITECTURE.md), [modelo de dados/RLS](docs/DATA-MODEL.md)
- [Plano de execução](docs/EXECUTION-PLAN.md), [30 tickets + bloqueadores](docs/MVP-BACKLOG.md)
- [Decisões arquiteturais](docs/adr/README.md)
- [Limites jurídicos](docs/LEGAL-BOUNDARIES.md), [governança de IA](docs/AI-GOVERNANCE.md)
- [Segurança](docs/SECURITY.md), [privacidade](docs/PRIVACY.md)
- [Operação](docs/RUNBOOK.md), [incidentes](docs/INCIDENT-RESPONSE.md)
- [Evidências e limitações da entrega](docs/VALIDATION.md)

## Operação, equipe e aquisição

- [Stack tecnológica e próximos passos](docs/STACK-AND-NEXT-STEPS.md)
- [Instruções da equipe dev](team/dev/README.md)
- [Campanhas e perfis de redes sociais](marketing/README.md)
- [Pacote para IA de assistência a clientes/leads/parceiros](ai/customer-assistance/README.md)
- [Avaliação de Hermes Agent](ai/customer-assistance/integrations/HERMES-ASSESSMENT.md)

Essas pastas guardam especificações e materiais em rascunho. Não guardam contatos pessoais, credenciais,
conversas ou dados de casos. Campanhas/perfis não foram publicados e assistência/Hermes não estão ativos.

apps/web: Next.js App Router/PWA futura. apps/worker: handler puro de preparação, sem fila persistente.
packages/domain: schemas, estados, dinheiro em centavos e preparação. packages/policy-engine: contratos de permissão.
packages/db: migrations RLS, auditoria/outbox/idempotência. packages/audit: verificador de hash chain.
legal/: fontes e regras pendentes de revisão. evals/: 25 cenários determinísticos sintéticos.

Não habilitar features apenas mudando uma flag; os gates estão no plano e no backlog.
Não existe licença de distribuição escolhida para o produto; licenças de dependências precisam de revisão antes da produção.
