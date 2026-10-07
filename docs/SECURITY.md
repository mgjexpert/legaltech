# Threat model e segurança v0.1

Ativos: dados privados A/B, dados infantis, credenciais, documentos originais, grants/consents,
fonte jurídica/policy, trilha audit e disponibilidade do canal. Agressores: contraparte, impostor,
usuário autenticado de outro caso/escritório, documento hostil, provider, insider e atacante externo.
Trust boundaries: browser/BFF, Auth/Postgres, Storage/worker, worker/IA e público/contexto privado.

| Ameaça | Defesa projetada | Evidência atual / pendência |
|---|---|---|
| IDOR/leitura entre A/B | RLS + FKs compostas + scope/purpose em cada query | Postgres testado; BFF/Storage/E2E auth pendentes |
| Colega/tenant acessa caso | grant explícito, não org membership | teste real de colega sem acesso |
| Impersonation/controle A/B/recovery | identidade proporcional, MFA, one-time invite, session revocation | FRO-008/038, não entregues |
| Envio proibido/coação/stalking | safety UNKNOWN deny, flags + consent, revisão humana | contract tests; nenhum canal real |
| Race entre bloquear e enviar | lock e recheck no commit + approval vinculado | protocolo definido, implementação futura |
| PDF/DOCX/malware/zip bomb | limite, quarentena, AV/MIME, parser isolado sem egress | upload indisponível; FRO-020/021 |
| Prompt injection/exfiltração | dados separados de instruções, tool ACL, context builder | sem LLM atual; red team futuro |
| RAG de norma vencida | versões/vigência/counsel; rule update não autônoma | registry pending, nenhuma regra jurídica ativa |
| Audit rewrite/truncation | append-only+hash+lock+checkpoint externo | triggers/chain/concurrency testados; checkpoint pendente |
| Insider/service role | least privilege, auditar leitura, grant temporal | schema restrito; operação/credentials futura |
| Export/link/cache leakage | snapshot de scope aprovado, URL TTL curto, cache purpose/actor | só export sintético local; backend pendente |
| Provider retention/training | gateway e contratos, minimização | sem provider; privacy review futura |
| DoS/abuso de custos | quotas por actor/case, limite de uploads/IA, DLQ | FRO-033/034/040 |

Headers da Web: CSP self, frame-ancestors none, nosniff, no-referrer, permissions-policy.
CSP atual aceita unsafe-inline por bootstrap Next; política nonce/strict CSP deve ser revisada com auth/produção.
Sem service worker, analytics ou secrets no browser. Demo gera JSON no dispositivo, não notifica terceiros.

Testes locais não validam TLS/deploy, assinatura JWT/MFA real, DAST, pentest, proteção do host,
Storage/Realtime, AV ou operações. Nenhuma certificação ou admissibilidade probatória alegada.
Antes de real data: envs separados, TLS, secrets manager, backup cifrado + restore, dependency/SAST/DAST,
rate limits, DPA/RIPD, review de permissões e incident owners. CI entregue executa checks; execução remota não comprovada.
