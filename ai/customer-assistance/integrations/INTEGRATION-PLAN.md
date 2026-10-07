# Plano de integração da assistência

## Etapa A — especificação e FAQ

Aceitar finalidades, catálogo/claims e prompt; nomear owner de suporte/parcerias/privacy.
Definir contatos corporativos, CRM/inbox, notice/opt-in e retention; dados fora do Git.

## Etapa B — gateway/tools

Implementar auth/context/schema/consent/rate-limit/audit mínimo. Public FAQ isolado do core.
Tools não escrevem cases e não possuem service_role ou acesso a documentos. Inicialmente leitura pública/drafts somente.
Provider/model/contrato ainda pendentes. Prompts e catálogo são versionados e aprovados antes de ingestão.

## Etapa C — POC sintético

Comparar implementação simples via AI Gateway com Hermes em runtime separado.
Rodar cenários do dataset e ataques independentes: leakage, email-as-identity, injection, fake capability, price hallucination, urgency coercion.
Mensagens/outbound/budget continuam desligados; medir qualidade/custo/latência e operação, não apenas satisfação da demo.

## Etapa D — canal real controlado

Só após consentimentos/retention/owner e review: site institucional ou suporte autenticado.
CRM/tickets integrados com mínima coleta e confirmation; zero narrativa jurídica em WhatsApp/ads/marketing memory.
Logs redacted, quotas, feature kill switch, owner humano e escalonamento sem promessas falsas de SLA.
Opt-out e pedido de titular testados end-to-end.

## Critérios de escolha

Hermes só se os ganhos de gateway/skills/operação justificarem stack Python e isolamento/manutenção extras.
Se uma FAQ + API pequena resolve o trabalho, manter implementação no stack Node/BFF reduz complexidade.
GO exige zero acesso cruzado nos testes, tools denied-by-default, nenhuma publicação/envio autônomo,
catálogo não inventado e rollback/owners. Threshold de qualidade do LLM continua a definir com dataset independente.

Não houve instalação de Hermes, conexão de channels, criação de CRM ou envio de mensagem nesta entrega.
