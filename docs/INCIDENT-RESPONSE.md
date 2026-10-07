# Incident response — rascunho para nomear responsáveis

P0: vazamento A/B, credencial privilegiada exposta, envio proibido ou comprometimento de dados.
P1: falha sustentada de acesso/grants, erro legal de alto impacto ou pipeline inseguro.
P2/P3: indisponibilidade limitada e defeitos sem exposição. Severidade definitiva e SLAs precisam de aprovação.

1. Acionar owner safety/security nominal; se inexistente, recurso não pode entrar em piloto real.
2. Conter funcionalidade afetada (flag servidor, pausa de worker, revogar sessões/grants conforme incidente).
3. Preservar logs/metadados/checkpoints com acesso mínimo; não copiar conteúdo sensível para chat/tickets públicos.
4. Delimitar casos/escopos/versões atingidos; privacy/legal decide obrigações/comunicações.
5. Corrigir e rodar regressão/red team; revisão independente autoriza reabertura.
6. Registrar timeline, causa, decisões, medidas e follow-up; ensaiar restore quando afetado.

Ninguém pode contornar bloqueio de contato para resolver incidente. Nenhuma notificação a pessoas externas é enviada pela base.
Comunicações futuras exigem owner, fundamento e canal seguro. O rascunho não substitui equipe de resposta ou serviço de emergência.
