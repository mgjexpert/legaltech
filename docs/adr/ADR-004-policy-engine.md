# ADR-004 — Permissões fora do LLM

Status: regras técnicas v1 implementadas; regras jurídicas em draft.
Contexto: prompts não garantem controle de envio, disclosure, compromissos ou requisitos profissionais.
Decisão: engine determinístico AUTO/PROPOSE/APPROVAL/PROFESSIONAL/BLOCK; ações desconhecidas bloqueadas; servidor fornece contexto confiável.
Modo não é autoridade; grant+MFA+review também necessários. UNKNOWN safety bloqueia bilateral. No Pilot 1 canal não habilitado.
Alternativa: system prompt único com todas restrições. Rejeitada por injection e falta de enforcement.
Consequências: canExecute sozinho não cria endpoint; cada handler valida destinatário/scope/consent e transação. Agente não possui send/accept tool.
Validação: 25 golden contratos e estados de safety; sem alegar validação de aconselhamento jurídico ou classificador LLM.
