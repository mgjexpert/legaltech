# ADR-003 — Gateway e contexto centralizados

Status: arquitetura adotada; implementação futura FRO-034.
Contexto: dados familiares não podem chegar a providers via SDKs dispersos sem finalidade/contrato.
Decisão: única boundary gateway com model allowlist, DPA/retention, minimização, budgets e version metadata; contexto por actor/purpose/workspace/grant vivo.
Alternativa: chamar provider do browser ou de qualquer agente. Rejeitada pela perda de controle e exposição.
Consequências: nenhuma chamada externa nesta base; nenhum segredo necessário; provider é escolha pendente.
Validação exigida: fallback/refusal, revogação, exfiltração/prompt injection, cache isolation e evals com fontes versionadas.
