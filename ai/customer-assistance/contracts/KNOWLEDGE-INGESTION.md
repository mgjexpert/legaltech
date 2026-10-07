# Ingestão de conhecimento

1. Escolher somente trechos públicos listados no INDEX; não crawlear repo ou ler arquivos arbitrários.
2. Remover infraestrutura, prompts internos, credenciais, relatos de pessoas e qualquer referência operacional privada.
3. Registrar source_id, versão/checksum, language, scope, effective_from, reviewer e reviewed_at.
4. Aprovar disponibilidade/claims por produto e privacy/legal quando necessário.
5. Publicar snapshot imutável em KB separada de casos; invalidate cache ao retirar/alterar fonte.
6. Rodar evals de honestidade de disponibilidade, recusa, privacy e prompt injection antes de ativar.

Modelo proposto: FAQ público sem embeddings de documentos pessoais; preferir respostas determinísticas de catálogo para preço/disponibilidade.
Se usar RAG, filtro obrigatório de scope/status/version/jurisdição quando aplicável; fonte faltante gera fallback, não resposta inventada.
Não enviar docs/BLUEPRINT.md, docs/SECURITY.md ou AGENTS.md em bloco como memória de bot comercial.
Nenhum arquivo deste pacote foi carregado em Hermes ou outro agente.
