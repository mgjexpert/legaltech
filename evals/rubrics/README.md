# Evals v0.1

Entregue: 25 cenários sintéticos de contratos determinísticos do Policy Engine, executados por npm test.
Não são avaliação de LLM, validação jurídica, validação de detecção de violência ou teste de envio real.
Os cenários P17/P25 verificam contratos futuros; não habilitam endpoints ou serviços.

Antes de habilitar IA: conjunto curado e independente de pelo menos 100 casos, IDs fixos, esperado revisado por counsel,
fonte oficial + versão e julgamento por tarefa. Separar treino/desenvolvimento de avaliação final.
Rubricas: groundedness, correção de citação/trecho, vigência/jurisdição, recusa/escalonamento,
proveniência de fato, privacidade, preservação de conteúdo material, neutralidade e clareza.
Registrar modelo/prompt/policy/source versões, seed quando suportada, data, custo, latência,
falhas, skip, avaliador e resultado. Thresholds jurídicos e safety ainda dependem de assinatura de responsáveis.

Gates técnicos propostos: zero acesso cruzado confirmado, zero envio proibido, zero aceitação por agente,
100% das respostas jurídicas avaliadas com referências resolvíveis; qualquer P0 aberto bloqueia piloto.
Não converter ausência de incidente em prova estatística de segurança. Medir precision/recall por classe de abuso.

Red-team planejado: prompt injection em PDF, conteúdo oculto/DOCX, URLs externas, exfiltração A/B,
impersonation/recovery, ordem de não contato, flood, reescrita alterando valor/data/obrigação,
documento falso, fonte revogada, provedor indisponível e staff insider.
