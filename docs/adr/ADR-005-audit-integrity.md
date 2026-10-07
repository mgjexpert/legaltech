# ADR-005 — Append-only com integridade verificável

Status: cadeia local implementada; anchoring/retention pendentes.
Contexto: evidência precisa de ordem, canonicalização e concorrência; hash simples não impede DBA de reescrever histórico.
Decisão: metadata mínima, lock transacional por case, sequência e previous_hash; canonical payload persistido em jsonb::text;
SHA-256 sobre previous_hash + LF + payload. Triggers vedam UPDATE/DELETE/TRUNCATE, function execute restrito.
Alternativa: timestamp sem hash ou hash de JSON reserializado pelo cliente. Rejeitadas por ambiguidade/falta de verificabilidade.
Consequências: verificador não detecta remoção do último trecho sem checkpoint externo; operação privilegiada pode remover triggers.
Conteúdo sensível não vai em audit; retenção/eliminação e checkpoint assinados dependem de privacy/ops.
Validação: tampering/interior omission/envelope mismatch; cadeia de 9 eventos com 8 writers concorrentes em DB real.
