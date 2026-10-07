# Decisões de componentes v0.1

| Componente | Decisão nesta entrega | Gate antes de expandir |
|---|---|---|
| Next/TypeScript/Node | adotados e fixados em package-lock/runtime | atualização com testes/audit; revisão de licença/SBOM |
| Postgres/pgvector | schema/testes reais, imagem por digest | Supabase staging, privilégios/extensions/exposed schemas/Storage |
| Supabase Auth/Storage | alvo de integração, não configurado | FRO-008/009/031, conta do projeto e credenciais gerenciadas |
| Queue/outbox | contratos SQL + handler puro; sem Redis/daemon | FRO-033, retries/inbox/leases/DLQ; decidir Redis com métricas |
| OCR/parser/antivírus | abstração planejada, nenhum parser confiável instalado | spike isolado, MIME/zip/PDF hostile tests, licença/privacy |
| Casewell | referência arquitetural, nenhuma reutilização de código | verificar licença/commit/compatibilidade antes de qualquer adoção |
| docassemble | possível POC separado para assembly posterior | licença/UX/integração e templates revisados; não dependência obrigatória |
| ProMediate | referência de método para negociação/evals futuras | verificar datasets/licença/reprodutibilidade; não motor jurídico pronto |
| IA enterprise | nenhuma chamada/provedor selecionado | DPA/no-training/retention/transferência, gateway e evals independentes |
| WhatsApp/email | aquisição/notificação posteriores | consent/opt-out, sem conteúdo sensível, portal canônico |
| E-sign/e-Notariado | handoff futuro, sem promessa de integração | identidade, formalidade e vendor/API/sandbox revisados |

As alegações de licença/qualidade no Blueprint são referências, não verificação independente.
Uma tabela de decisões não substitui LICENSE_REVIEW por componente e versão quando escolhido para produção.
