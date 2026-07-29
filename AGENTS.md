# ItaSafety — regras de trabalho para agentes

Este arquivo vale para todo o repositório.

## Princípio central

Código, banco e documentação formam uma única entrega. Nenhuma feature, correção,
migration, mudança de integração ou alteração operacional está concluída enquanto
a documentação afetada não tiver sido atualizada.

## Antes de alterar

1. Leia `docs/README.md` e os documentos relacionados ao domínio afetado.
2. Consulte o código e, para decisões sobre produção, confirme o estado remoto.
   Migrations e scripts locais não são evidência suficiente do estado do banco.
3. Registre premissas, riscos e critérios de sucesso.
4. Preserve alterações preexistentes do usuário.

## Documentação obrigatória

Toda mudança deve atualizar, conforme o impacto:

- `docs/product.md`: comportamento, regra de negócio ou jornada do usuário;
- `docs/frontend.md`: rota, componente, estado ou contrato usado pelo frontend;
- `docs/backend.md`: tabela, RPC, policy, grant, trigger, Edge Function ou integração;
- `docs/architecture.md`: fronteira, dependência ou fluxo entre sistemas;
- `docs/security.md`: autenticação, autorização, dados sensíveis, abuso ou mitigação;
- `docs/operations.md`: configuração, deploy, rollback, observabilidade ou manutenção;
- `docs/decisions/`: decisão arquitetural relevante e seus trade-offs.

Use `docs/feature-documentation-standard.md` como checklist.

## Banco e segurança

- O projeto Supabase de produção é identificado pelo project ref
  `porgyoqngtshxdxuwaft`.
- Não exponha senhas, tokens, chaves privadas, JWTs ou dados pessoais em código,
  logs, documentação, commits ou respostas.
- Nunca edite uma migration já aplicada para representar uma correção futura.
  Crie uma migration nova, monotônica e verificável.
- Mudanças remotas exigem evidência anterior, plano de rollback e validação posterior.
- Testes de RLS devem cobrir `anon`, usuário comum, usuário A versus B, admin e
  `service_role` quando aplicável.
- `service_role` pertence apenas ao servidor e às Edge Functions.

## Critério de conclusão

Uma entrega deve informar:

1. o que mudou;
2. por que mudou;
3. arquivos e objetos afetados;
4. testes executados e resultados;
5. estado de deploy;
6. riscos ou pendências restantes;
7. documentação atualizada.

Se algum item não puder ser confirmado, registre-o como `não confirmado` em vez de
inferir sucesso.
