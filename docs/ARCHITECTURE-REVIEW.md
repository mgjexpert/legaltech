# Revisão de arquitetura v0.1

Data: 06/10/2026. Base: Blueprint fundador v0.1 fornecido pelo usuário.
Este é um review técnico do material, sem confirmação independente de jurisprudência, licenças ou marketing de benchmarks.
O Markdown original foi preservado. A presença de “fontes validadas” no anexo não implica validação por esta revisão.

## Conclusão

A direção é adequada para começar engenharia: Matter-centric, determinismo, dois modos, isolamento A/B,
proveniência, consentimento e handoff. O Blueprint define intenções; faltavam contratos executáveis de autorização,
transações, lifecycle de dados e operações. A base entregue é um recorte do Pilot 1 com fixtures.
Uma interface de demo não comprova segurança de um produto real.

## Lacunas e tratamento

P0: bloqueia casos reais ou canal bilateral. P1: precisa estar resolvido antes do piloto do recurso. P2: evolução controlada.
“Base” significa defesa/contrato implementado e testável localmente; não validação de integração em produção.

| ID | Prioridade / referência | Lacuna e efeito | Decisão / evidência nesta entrega | Pendência / ticket |
|---|---|---|---|---|
| G01 | P0, §15/48 | scope não aparece em Child, Party, financeiro e todas as relações; enum isolado não impede joins cruzados | workspace_id + case_id, FKs compostas, RLS e testes cruzados | Aplicar mesmo contrato a finanças/exports, FRO-025/029 |
| G02 | P0, §16/23 | tenant_id não define autoridade; membro do escritório pode ser confundido com autorizado ao caso | org membership não concede acesso, teste de colega sem grant | Auth e provisionamento, FRO-008/028 |
| G03 | P0, §13/14 | modo supervised pode virar boolean que libera ação | modo não concede grant; profissional + MFA + revisão obrigatórios no contrato | verificação profissional e review records, FRO-008/028 |
| G04 | P0, §15/43 | consentimento é mencionado, mas faltam finalidade, destinatário, versão e revogação | grant por workspace, expirável/revogável; grants sintéticos no banco | consent_reference é referência sem FK nesta base; implementar consents, FRO-031 |
| G05 | P0, §20/22 | safety desconhecido pode ser tratado como seguro; quem reabre bloqueio não está definido | UNKNOWN + deny-by-default; bilateral desligado; teste de estados | operação humana, owners/SLA e evidência, FRO-032 |
| G06 | P0, §20/26 | checar segurança antes da transação permite corrida com bloqueio/revogação | definido recheck sob lock antes de commit, sem API de envio entregue | enviar + outbox + approval vinculada ao hash, FRO-035 |
| G07 | P0, §15/25 | RAG, embeddings, cache e export podem misturar escopos mesmo com RLS no CRUD | cálculo de preparação recusa contextos mistos | Context Builder e cache por actor/purpose/grant/source version, FRO-014/029/034 |
| G08 | P0, §24 | hash sem serialização canônica/checkpoint não detecta reescrita por DBA | preimage jsonb::text persistida, lock por caso, hash + verificador; teste concorrente | checkpoints externos assinados, FRO-037 |
| G09 | P0, §20/24/25 | append-only conflita com eliminação/LGPD; “recibo” não pode atualizar a mensagem | logs mínimos separados de conteúdo; nenhuma tabela de mensagem nesta base | retention matrix, tombstone e purge autorizado, FRO-036 |
| G10 | P0, §17 | upload precisa de quarentena, limite de bytes, MIME por conteúdo, AV e SSRF defenses | sem upload real; scan results separados de versões imutáveis | pipeline/Storage policies e downloads protegidos, FRO-019/020/021 |
| G11 | P1, §12/17 | confirmado não equivale a verdade; versões/fontes podem cruzar scope | provenance tipada + metadata de confirmação + FK composta | scanner/OCR, contestação e revisão profissional, FRO-018/023 |
| G12 | P0, §18/54/58 | lista de URLs não é registry vigente; jurisprudência tem metadata insuficiente | registry PENDING_VERIFICATION, versões/hash nulos, regras legais inativas | capturar texto oficial, vigência e aprovação independente, FRO-012/013/027 |
| G13 | P1, §19 | regra ativa/retirada, conflitos, prioridade e input desconhecido não estão definidos | regras técnicas versionadas e default deny; jurídicas desativadas | registry assinado, precedência e regressão, FRO-027 |
| G14 | P1, §26 | tabela de idempotência não garante exactly-once; faltam payload mismatch e retries | contrato por actor/case/op/key, request_hash, outbox privado | API transacional, lease/DLQ/inbox consumidor, FRO-033 |
| G15 | P0, §23 | convite/recovery permite impostor e usuário controlar A/B | nenhum convite ou recovery funcional nesta base | one-time tokens, prova de sessão e risk review, FRO-008/038 |
| G16 | P1, §12/48 | “readiness” pode significar prontidão jurídica; financeiro precisa de centavos/período | status de organização e legalReadiness=NOT_ASSESSED; soma de inteiros segura | períodos, moeda, entradas negativas/correções, FRO-025/026 |
| G17 | P1, §13/28/35 | arquitetura de agentes não define capacidades reais e eval coverage | policy contracts e 25 golden cenários determinísticos | não há LLM ou prompts ativos; 100+ evals independentes, FRO-030/034 |
| G18 | P0, §25 | placeholder de proxy secret não comprova ZDR, termos e residência | nenhum provedor de IA recebe dados | DPA/transferências/no-training, inventário, FRO-039 |
| G19 | P1, §39/40 | faltam backups/restore, alertas sem PII e responsáveis por incidentes | runbook e threat model propostos | drills e equipe nominal/SLA, FRO-040 |
| G20 | P1, §37 | “Sprint 1–12” ambíguo para 12 semanas e escopo grande | 6 iterações de 2 semanas, gates e caminho crítico | estimativa depende da equipe; Bridge fora do Pilot 1 |
| G21 | P1, §16/41 | ferramentas/serviços sugeridos sem decisão de compatibilidade ou licença | Next/Node/Postgres+vector; docassemble não é dependência | parecer de licença + spike OCR, FRO-021/041 |
| G22 | P2, §16 | PWA implica cache/offline de dados sensíveis | dashboard web responsivo sem service worker | política de cache e logout/purge antes de PWA, FRO-042 |

## Decisões fundadoras

1. Começar com modular monolith + worker separado, sem microserviços prematuros.
2. Fonte canônica: Postgres. Storage e Auth Supabase são alvo, ainda não integrados.
3. Privado/compartilhado são workspaces diferentes; compartilhar cria snapshot aprovado, não muda scope de um item privado.
4. Safety disclosures privados não aparecem em metadados comuns do caso; contraparte recebe no máximo estado genérico do canal.
5. Legal Navigator não ativa com simples RAG conectado: fontes aprovadas, vigência, citações resolvíveis e evals são gates.
6. Mensagem aceita é evento imutável; recibos são eventos separados; nenhuma aceitação jurídica por agente.
7. Audit hash chain evidencia alteração perante checkpoint conhecido; não é certificação probatória nem prevenção contra DBA.
8. Arquitetura deve funcionar sem LLM. Nenhuma requisição de teste envia dados a provedor.

## Decisões que continuam abertas

Responsáveis humanos e protocolo de risco; bases legais e retenção por entidade; identidade profissional;
provedor IA/contratos; OCR e AV; região de hospedagem; observabilidade; templates/minutas;
parâmetros de evals legais; geografia/composição do piloto; tamanho/velocidade da equipe.
Essas escolhas não impedem a base local, mas impedem habilitar os recursos correspondentes com casos reais.
