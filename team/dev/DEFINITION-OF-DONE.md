# Definition of Done

- Comportamento e limites descritos no ticket; implementação não amplia escopo implícito.
- Validação/sessão/autorização no servidor; RLS/Storage seguem ator e workspace; nenhuma leitura com bypass em nome de usuário.
- Testes positivos e negativos do recurso, concorrência/idempotência quando impactado; runner/contagens atuais.
- Checks apropriados ao impacto: TypeScript/testes/DB, build e smoke/E2E para Web.
- Dados sintéticos; logs/audit metadados mínimos; nenhum token ou dado de cliente em Git.
- UI acessível, erro claro e sem claims de capability inexistente.
- Migrations e rollback/plano de recovery; schema/API/prompts/datasets versionados.
- Review independente; fontes/regras/conteúdo jurídico validados por profissional responsável.
- Docs/backlog/VALIDATION atualizados; feature parcial continua marcada parcial.
- Rollout/staging/ops aprovados pelo owner correspondente; nenhuma P0 aberta antes de piloto.

Documentação reversível exige checagem de links/consistência, sem criar testes que apenas espelham texto.
Um prompt novo não se considera safe por obedecer num exemplo: avaliar tool enforcement, privacidade e dataset independente.
