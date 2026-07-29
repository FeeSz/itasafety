# Produto ItaSafety

## O que é

A ItaSafety é apresentada pela aplicação como uma distribuidora B2B de
Equipamentos de Proteção Individual. A plataforma digital não funciona como um
checkout de varejo: ela ajuda empresas a consultar o catálogo, selecionar EPIs,
solicitar uma cotação e acompanhar a resposta comercial.

O posicionamento atual enfatiza:

- EPIs com Certificado de Aprovação;
- atendimento técnico para indústrias;
- conformidade com normas de segurança do trabalho;
- catálogo organizado por categoria;
- relacionamento comercial por cotação, sem preço público obrigatório.

## Conteúdo comercial que precisa de validação

O frontend contém afirmações divergentes:

- `/quemsomos` informa “há mais de 15 anos”;
- `/sobre` informa fundação em 1998 e “mais de duas décadas”;
- `/sobre` também menciona mais de 500 clientes e 3.200 SKUs.

Esses números são conteúdo editorial, não fatos técnicos confirmados por esta
documentação. Antes de reutilizá-los em novos textos, SEO ou integrações, a área de
negócio deve definir uma versão oficial.

## Atores

### Visitante

- navega na página inicial, categorias e produtos;
- pesquisa o catálogo;
- adiciona itens ao carrinho armazenado no navegador;
- acessa conteúdo institucional, contato e políticas;
- é direcionado à autenticação quando precisa continuar uma jornada privada.

### Usuário autenticado

- mantém o carrinho sincronizado com o Supabase;
- cadastra ou consulta sua empresa;
- aguarda aprovação do cadastro empresarial;
- envia uma cotação quando a empresa está aprovada;
- acompanha suas próprias cotações e o histórico de status;
- consulta e atualiza informações permitidas do perfil;
- solicita alterações cadastrais sujeitas a aprovação.

### Administrador

- acessa o painel protegido por role;
- gerencia conteúdo do catálogo;
- consulta empresas e solicitações de alteração;
- aprova alterações cadastrais por RPC;
- acompanha cotações;
- marca cotação como em análise;
- responde ou devolve uma cotação;
- consulta indicadores básicos de status da aplicação.

### Serviços

- Cloudflare/TanStack executa SSR, Server Functions e rotas HTTP;
- Supabase autentica usuários e aplica autorização no banco;
- a Edge Function envia notificações de cotação;
- EmailJS entrega mensagens transacionais;
- a interface MCP expõe consultas controladas ao catálogo.

## Jornadas principais

### 1. Descoberta do catálogo

1. visitante acessa home, categorias, departamento ou detalhe;
2. os dados podem vir do catálogo público em banco ou dos dados editoriais locais,
   conforme o componente;
3. itens são adicionados ao carrinho;
4. para visitantes, o carrinho permanece em `localStorage`.

### 2. Autenticação

1. usuário acessa `/auth`;
2. escolhe e-mail/senha ou provedor OAuth disponível;
3. o frontend consulta o rate limit de IP por Server Function;
4. o Supabase realiza autenticação;
5. o callback consulta `user_roles`;
6. administrador segue para `/admin`; demais usuários retornam à jornada pública
   ou à rota solicitada.

### 3. Cadastro de empresa

1. usuário autenticado informa dados empresariais;
2. um registro em `empresas` é criado com status controlado;
3. o painel administrativo consulta e decide a aprovação;
4. somente uma empresa aprovada permite a submissão normal da cotação;
5. alterações posteriores usam `empresa_change_requests`.

### 4. Carrinho e cotação

1. visitante adiciona produtos localmente;
2. após login, itens locais são migrados/sincronizados para
   `carrinho_cotacao`;
3. a tela `/carrinho` valida contato e empresa;
4. cria `cotacoes`;
5. insere os respectivos `cotacao_itens`;
6. invoca `enviar-notificacao-cotacao` com a ação `nova_cotacao`;
7. limpa o carrinho após sucesso.

O cabeçalho, os itens e a notificação ainda não são gravados em uma única
transação. Essa limitação está registrada como pendência de segurança e
confiabilidade.

### 5. Tratamento administrativo da cotação

1. admin lista cotações por status;
2. ao abrir uma cotação enviada, chama `marcar_em_analise`;
3. informa preços e condições ou um motivo de devolução;
4. a Edge Function chama `responder_cotacao`;
5. o banco valida admin, estado e itens;
6. a notificação de resposta é enviada ao cliente.

Estados atuais:

```text
enviado → em_analise → respondido
                    ↘ devolvido
```

### 6. Alteração cadastral

1. usuário propõe alteração de um campo permitido;
2. banco vincula a solicitação à empresa do próprio usuário;
3. admin aprova por `aprovar_change_request` ou rejeita conforme o fluxo;
4. a aprovação aplica a mudança de forma controlada.

## Capacidades complementares

- SEO com metadados, canonical, sitemap e dados estruturados;
- páginas de privacidade, cookies e termos;
- health check público sem dados sensíveis;
- tela administrativa de diagnóstico;
- endpoint MCP e rotas auxiliares de OAuth para consulta ao catálogo;
- modo de build separado para GitHub Pages.

## Fora do escopo atual

- pagamento e checkout;
- preços públicos completos;
- emissão fiscal;
- gestão de estoque;
- logística transacional;
- ERP/CRM documentado;
- suporte completo a pessoa física/CPF;
- outbox transacional completa;
- quota de envio de cotação e e-mail.
