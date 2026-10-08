# Family Resolution OS — instruções de engenharia

Leia README.md, docs/ARCHITECTURE.md e docs/MVP-BACKLOG.md antes de implementar.
Use o checkout existente: cada tarefa cloud já é isolada; não crie worktree sem pedido explícito.

- Produto centrado no caso. Dois modos e escopos explícitos; nenhum contexto “caso completo”.
- Não use dados reais em desenvolvimento, testes, fixtures ou logs. Não copie anexos reais de usuários.
- Policy Engine determinístico fora do LLM. Agentes não enviam mensagens, aceitam propostas ou compartilham dados.
- Não habilite Communication Bridge/negociação antes dos gates documentados.
- Não considere títulos/citações no Blueprint verificação das fontes. Regras jurídicas só ativam após revisão humana independente.
- RLS é defesa obrigatória. Adicione testes negativos reais no Postgres ao mudar permissões.
- Nunca exponha service_role ao browser; não use service_role para ler dados em nome de usuário.
- Mantenha audit append-only. Alteração de conteúdo material precisa de confirmação explícita.
- Execute npm run typecheck, npm test e npm run test:db. Alterações web requerem npm run build e smoke funcional.
- Não publique, faça deploy ou habilite dados reais apenas por passar os testes da base.

Entrega atual e pendências: docs/VALIDATION.md. Alterações legais exigem revisão por pessoa diferente da autora.

Revisão atual: docs/END-TO-END-REVIEW.md e docs/INTEGRATION-STATUS.json.
Ao mudar estado de componente, atualizar o JSON com evidência e executar npm run docs:generate + npm run check:docs.
Nunca declarar integração real por existir pasta, contrato, enum, workflow ou variável. E2E testa artefato de produção em porta exclusiva.
