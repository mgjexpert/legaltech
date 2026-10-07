# Hermes — avaliação para este projeto

Hipótese usada: **Hermes Agent da Nous Research**, pois “Hermes” também pode significar modelos ou outro software.
A escolha é provisória até confirmação do usuário. Hermes Agent é runtime de agente; os modelos Hermes são outra decisão de provider/modelo.

## Evidência consultada

Repositório oficial: https://github.com/NousResearch/hermes-agent
Commit consultado: 7dab93b06e2bb3757dc18229169efcee1b5b47a3.
README descreve gateway de messaging, provedores intercambiáveis, memória persistente/search, skills criadas/melhoradas,
backends de terminal (incluindo Docker/SSH), cron e integração MCP.
LICENSE lida nesse commit: MIT, copyright 2025 Nous Research; preservar notices se houver distribuição/reutilização.
pyproject.toml consultado nesse commit declara Python >=3.11,<3.15; versão Python e lockfile da release escolhida devem ser fixados no POC.
Não executamos testes de Hermes, audit de dependências ou validação de isolation/retention. Ter licença MIT não certifica adequação LGPD.

## Recomendação

**Faz sentido como POC separado de operações/assistência, não como núcleo do Family Resolution OS.**
Começar com tarefas internas e sintéticas: preparar FAQ/rascunhos, organizar tarefas de suporte e responder sobre catálogo aprovado.
Para clientes/leads/parceiros, somente depois das etapas do INTEGRATION-PLAN e dos contratos de tools.

| Uso | Adequação proposta | Condição |
|---|---|---|
| Apoio interno de documentação/rascunhos | boa hipótese para testar | dados sintéticos/públicos, review antes de publicar |
| FAQ do produto e interesse B2B | hipótese viável | catálogo fiel e consentimento mínimo; sem estratégia jurídica |
| Suporte de conta | possível com adapter | sessão validada no BFF; token de tool estreito; memória restrita |
| Core/RAG jurídico/negociação/envio entre partes | não adotar como autoridade | core mantém Policy Engine, RLS, grants, audit e approvals próprios |
| Memória compartilhada de famílias | inadmissível por desenho | sem cross-client/cross-workspace learning em dados privados |

## Isolamento exigido para o spike

Processo/container/VM independente; não montar checkout/prod secrets ou banco core com amplo acesso.
Instâncias/state dirs separados por boundary, com access controls e retenção; isolamento por prompt não é suficiente.
Ferramentas via BFF com allowlist, finalidade e autorização server-side. Desabilitar/omitir shell/browser/MCP não necessários;
validar configuração e comportamento da release, sem supor flags não verificadas.
Não deixar criação autônoma de skills ou memória de cliente alterar behavior aprovado; aprovar versões externamente e impedir ativação sem review.
Rede só destinos aprovados, logs mínimos, quotas, kill switch, provider enterprise quando houver dados operacionais.
Não usar gateways WhatsApp/Telegram como repositório canônico de comunicações familiares.

## Custo e alternativas

Hermes acrescenta runtime Python, state/memory store, updates, providers e operação contínua; VPS/container próprio se gateway persistir.
Não precisa de GPU por si só quando usa API; self-hosted modelo tem sizing separado.
Alternativa inicial: FAQ determinística + assistant leve no AI Gateway Node, com mesmas tools estreitas e menos moving parts.
Hermes só passa de spike para serviço se reduzir trabalho/complexidade líquida com evals e controles verificáveis.

Consulta do README não autoriza executar seus install scripts, criar canais, permitir autonomous terminal ou migrar keys.
Não foi instalado/forkado no monorepo; clone de referência temporário foi usado apenas para leitura.
