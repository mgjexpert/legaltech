# ADR-001 — Matter-centric e monólito modular

Status: adotado na base local; aprovação da equipe pendente. Data: 06/10/2026.
Contexto: conversas não são boa fonte canônica para documentos, fatos e compromissos familiares.
Decisão: case persistente + workspaces; Next BFF modular e worker dedicado futuro; Postgres/RLS + storage privado como alvo.
Alternativas: chatbot-first, microserviços e acoplamento obrigatório a docassemble. Não escolhidas pela falta de boundaries/complexidade de operação.
Consequências: schema e domain precedem IA; eventos entre módulos; core funciona sem modelo. A demo não persiste e não comprova integração Supabase.
Validação: schemas/estado/readiness testados e SQL em Postgres real; autenticação/persistência ainda no backlog.
