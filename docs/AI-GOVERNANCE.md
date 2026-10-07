# Governança de IA v0.1

Nenhum modelo, agente de produção, chamada externa ou prompt jurídico ativo nesta entrega.
O Policy Engine técnico é determinístico e testado; ai gateway e context builder são backlog FRO-034.
Arquitetura mantém operações úteis sem LLM.

| Agente planejado | Escopo/ferramentas permitidas | Limite material |
|---|---|---|
| Case Concierge | estado/tarefas autorizados, navegação | não muda estado jurídico |
| Intake | respostas do workspace, candidatos tipados | não confirma fatos sozinho |
| Document | versões liberadas pelo scan, OCR/provenance | arquivo é dado não confiável; não dá instruções |
| Legal Information | KB curada com source_version_id/trecho | sem base vigente recusa; sem advice individual self-service |
| Route | fatos confirmados → engine | não inventa regra/route; mostra versão |
| Financial | valores autorizados + centavos/períodos | matemática não é decisão de alimentos |
| Communication | rascunho privado e sugestão/diff | não tem send tool; material change exige aceite |
| Negotiation | tópicos/termos autorizados | não usa razão privada A para pressionar B; não aceita |
| Safety | classificação auxiliar minimizada | não é única barreira e não limpa flag sozinho |
| Professional Copilot | workspace concedido e MFA | outputs sujeitos a review profissional |
| Evaluation | fixtures/amostras aprovadas minimizadas | offline; não usa dados reais em dev |

Contexto construído no servidor por actor + purpose + case/workspace + live grant. Cache não deve ampliar scope;
retrieval, embeddings e export obedecem mesma ACL; revogação invalida cache e corta nova leitura.
Prompt injection em documento não ganha prioridade nem tool. Ferramentas validam permissão independente do LLM.

Manifesto futuro de prompt: id/version/hash/owner/purpose, scopes, tool allowlist, refusal, citações, policy version,
provider/model, dataset/rubric versions, changelog e review independente. Prompts serão código versionado; nenhum texto fictício “jurídico” ativo como placeholder.
Gateway aplica DPA/retention/model allowlist, budget, rate-limit, minimização/redaction, fallback e metadados sem narrativa.
Modelos não aprovam suas próprias regras/testes/merges.

Evals atuais: 25 cenários determinísticos; veja evals/rubrics/README.md. Não validar qualidade de LLM a partir desses resultados.
Thresholds jurídicos/safety requerem counsel/product, calibração por classe, conjunto independente e 100+ casos antes de recursos públicos.
