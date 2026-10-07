# Plano de execução v0.1

Objetivo: chegar ao Pilot 1 — preparação individual e handoff profissional — com base auditable e equipe responsável.
A entrega atual serve para iniciar engenharia/testes. Não promete o produto completo em 12 semanas sem validar capacidade.

## Premissas de planejamento

Hipótese: 2 devs full-stack, 1 backend/data, QA/security parcial, product owner e counsel/privacy acessíveis.
Confirmar capacidade na primeira semana; reduzir funcionalidades opcionais se equipe menor. Não reduzir isolamento/safety.
Interpretar o roadmap de 12 semanas como **6 iterações de 2 semanas**; “Sprint 1–12” no Blueprint nomeia janelas semanais.
Responsáveis aqui são papéis; nomear pessoas antes de executar piloto. Sem responsáveis jurídicos/safety, manter dados sintéticos.

## Sequência e gates

| Etapa | Janela | Entregável | Dependências e saída verificável |
|---|---|---|---|
| Fase 0 | semanas 1–2, trilha paralela | limites legais, data map, consentimentos, threat model, entrevistas | counsel/privacy/produto assinam baseline e escopo Pilot 1 |
| Fundação Matter Core | semanas 1–2 | auth real, case APIs, RLS, migrations, audit, CI | login/sessão e isolamento em staging; tickets 001–011 + 031 |
| Intake + KB | semanas 3–4 | intake persistido/confirmado, fontes versionadas, fallback/citação | fontes e regras aprovadas; 012–018/027/034 |
| Documentos | semanas 5–6 | Storage privado, quarentena, AV, parsing, evidence | malware/SSRF/ACL tests; 019–024/021 |
| Finanças + preparação | semanas 7–8 | valores/períodos, custos dos filhos, readiness rastreável | 025/026, sem score de direito ou rota definitiva |
| Handoff | semanas 9–10 | grants, consentimento, portal alpha, Case Pack | 028/029, MFA real, expiry/revoke e export scope tests |
| Hardening | semanas 11–12 | evals, privacy review, red team, restore drill, suporte | 030/036/037/039–041; nenhuma P0 aberta; piloto fechado aprovado |

Caminho crítico: auth+consent → workspace/RLS → dados persistidos → documentos verificados/fatos → readiness → grant/export.
Legal KB pode desenvolver em paralelo, mas sem ativar conteúdo não revisado. OCR/LLM/provider spikes antes de compromisso com vendor.
Casewell/docassemble/ProMediate são referências, sem clone/integração automática nesta entrega.

## Marcos de teste

**T0 — base local (agora):** dashboard sintético, schemas, rules técnicas, SQL, testes unitários e Postgres, build/smoke.
Auth/API persistente/storage/RAG/portal não estão entregues. Time pode começar com backlog + contracts.

**T1 — staging integrado:** sessão real, RLS também em API e Storage, migrações reproduzíveis, CI, fixtures e logs sem PII.
Testar fluxos end-to-end, inclusive logout, expiração, revogação, upload hostil e export.

**T2 — piloto fechado:** consentimento e base legal, supervisão/counsel, DPIA, incident owner, backups/restore,
review de conteúdo, evals independentes e contrato dos provedores. Piloto de 20–50 casos é hipótese, não autorização para coletar agora.

## Roadmap após Pilot 1

Fase 3 Portal: alpha no Pilot 1, expansão B2B após medir horas poupadas e pendências.
Fase 4/Pilot 2 Bridge: somente após identity/safety/legal gates, baixo risco selecionado e consentimento A/B.
Fase 5/Pilot 3 negociação: propostas versionadas, acceptance in principle, neutralidade e leakage evals.
Fase 6 coparentalidade: calendário/reembolso recorrente. Fase 7 formalização: integração profissional/cartório/e-sign validada.
Roadmap 12 meses mantém Prepare → Connect → Resolve → Continue, condicionado aos gates.
Não há marketplace no MVP. Preço e canais B2C/B2B continuam hipóteses a testar.

## GO / NO-GO

| Marco | GO exige | NO-GO se |
|---|---|---|
| Desenvolvimento local | dados sintéticos, ambiente separado, checks reproduzíveis | uso de dados reais ou chave privilegiada no browser |
| Pilot 1 | consent/DPIA/contratos revisados; auth+RLS+Storage/E2E; equipe nominal; restore drill; fontes vigentes | P0, auth ausente, export sem scope, provider sem termos, consentimento indefinido |
| Navigator público | fontes oficiais curadas/versionadas; citações verificáveis; vigência/retirada; eval threshold assinado | fonte sem revisão, advice individual em self-service ou fallback incorreto |
| Bridge público | todos gates §55, 100+ golden cases, red-team, closed pilot sem P0, enforcement proibição contato | qualquer gate pendente, envio por IA ou bypass safety |

Metricas: completude/tempo do intake, documentos faltantes, correção da extração, tempo poupado por profissional,
incidentes por scope, citations/refusal, abandono e qualidade do próximo passo. Não tratar consenso como sucesso em caso de coerção.

## Handoff e execução da equipe

Começar por FRO-008/031/033 para ligar o skeleton ao backend; depois 016/019.
Tickets de documento ou RAG não antecedem ACL/proveniência. Assignee aceita critérios do ticket antes de iniciar.
Pull request com evidência; review independente de legal-impacting rules e datasets; CI green não dispensa counsel.
Critério global de Done: implementação + testes positivos/negativos + logs mínimos + docs + review + rollout/rollback + sem P0.
