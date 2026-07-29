# Padrão de documentação de features

## Definição de pronto

Uma feature só está concluída quando:

- comportamento e regra de negócio estão descritos;
- frontend, backend e dados afetados estão identificados;
- autorização e privacidade foram avaliadas;
- migration e rollback estão documentados quando aplicável;
- variáveis e integrações estão listadas sem valores;
- testes e resultados foram registrados;
- estado de aplicação/deploy está explícito;
- limitações e pendências estão declaradas.

## Template

Copie este modelo para a seção apropriada ou para um documento específico.

```markdown
# Feature: nome

## Objetivo

Problema resolvido e valor para o usuário.

## Atores e permissões

- visitante:
- usuário:
- admin:
- serviço:

## Fluxo funcional

1. ...

## Frontend

- rotas:
- componentes:
- estado/cache:
- validações:
- estados de erro e vazio:

## Backend

- tabelas/colunas:
- RPCs/Server Functions/Edge Functions:
- integrações:
- transações e concorrência:

## Segurança e privacidade

- dados tratados:
- ameaça principal:
- grants/RLS:
- rate limit/abuso:
- logs e retenção:

## Operação

- variáveis:
- migration:
- deploy:
- observabilidade:
- rollback:

## Testes

- unitários:
- integração:
- RLS por papel:
- concorrência:
- smoke test:

## Evidências

- commit:
- migration remota:
- versão implantada:
- data/timezone:

## Pendências

- ...
```

## Quando criar uma decisão arquitetural

Crie `docs/decisions/NNNN-titulo.md` quando houver:

- escolha entre tecnologias;
- mudança de fronteira de confiança;
- nova integração externa;
- decisão de schema difícil de reverter;
- trade-off consciente de consistência, disponibilidade ou segurança;
- exceção temporária relevante.

Formato:

```markdown
# NNNN — título

- Status: proposta | aceita | substituída
- Data:

## Contexto

## Decisão

## Consequências positivas

## Consequências negativas

## Alternativas consideradas

## Critério de revisão
```

## Checklist de revisão

### Produto

- A linguagem reflete o funcionamento real?
- Afirmações comerciais foram validadas?
- Estados de erro, espera e rejeição estão descritos?

### Frontend

- Rota e estado foram documentados?
- Acessibilidade, loading e erro foram tratados?
- O frontend não foi apresentado como fronteira de autorização?

### Backend

- Contrato, transação, idempotência e concorrência estão claros?
- Tipos foram regenerados quando o schema mudou?
- Migration nova foi usada?

### Segurança

- Existe menor privilégio?
- Testes cobrem papéis diferentes?
- Dados pessoais e segredos não aparecem em evidências?
- Há proteção contra automação e repetição?

### Operação

- Deploy e rollback são executáveis?
- Métricas e logs permitem detectar falha?
- O estado remoto foi confirmado?
