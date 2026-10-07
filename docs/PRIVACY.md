# Privacy/Data Map v0.1 — proposta

Não há dados pessoais reais nas fixtures. O dashboard usa apenas estado de sessão; sem DB, cookies de autenticação,
analytics externos, localStorage ou chamada LLM. O app não deve receber documentos/dados reais nesta fase.

| Classe futura | Finalidade mínima | Acesso | Retenção |
|---|---|---|---|
| Conta/identidade | login, recovery, evitar impersonation | usuário/Auth autorizado | definir com privacy owner |
| Vínculo/parties | organizar caso | workspace proprietário; grant específico | definir por base/finalidade |
| Crianças | organização no melhor interesse | mínimo/alias; scope privado | avaliação específica e base legal |
| Documentos/finanças | evidence/organização | quarantine/ACL; profissional concedido | prazos/hold por entidade |
| Safety disclosures | proteção/triagem | privado + compliance autorizado | risco exige minimização e parecer |
| Shared communications | canal consentido/proveniência | shared parties + grant | conciliar append-only/eliminação por parecer |
| Auditoria | responsabilidade/integridade | schema restrito | só metadata; retenção independente |
| AI runs | rastreabilidade/qualidade | gateway minimizado | sem conteúdo por padrão; contrato de provider |

Não definir prazos genéricos sem base jurídica e finalidade. Não tratar consentimento como única base universal.
Consent record precisa de versões/recipient/scope/purpose; revogação cancela acesso futuro, não apaga automaticamente todo registro.
Dados infantis, saúde/safety e transferências precisam de análise específica. Blueprint não resolve RIPD/DPIA.

Antes de Pilot 1: mapa de dados completo, notice/terms/consents revisados, DPA/suboperadores/região,
direitos do titular, export/eliminação/backup/hold, owner nominal e teste de purge end-to-end.
Nenhuma credential vai em prompts/docs/logs; chaves gerenciadas no ambiente; service_role só backend restrito.
