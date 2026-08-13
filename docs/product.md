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

## Arquitetura pública de descoberta — Fase 1

Estado: **implementado localmente, não implantado**.

A entrada pública agora separa duas responsabilidades:

1. `/` apresenta a marca, o posicionamento institucional, FAQ e caminhos para
   catálogo e contato;
2. `/catalogo` concentra busca, descoberta por categorias, seleção de produtos e
   início da lista de cotação;
3. `/categorias` permanece como índice completo da taxonomia versionada;
4. `/departamento/$slug` e `/detalhes/$sku` preservam URLs existentes;
5. `/carrinho` permite revisar a lista e exige autenticação somente quando o
   visitante tenta finalizar a submissão.

A antiga home híbrida não foi movida para `/catalogo`. Hero em vídeo, métricas,
storytelling, parceiros e grandes blocos comerciais deixaram de participar da
rota ativa de descoberta. Seus componentes ainda existem no repositório e podem
ser avaliados para remoção em uma etapa posterior.

Produtos podem ser abertos e adicionados por visitante anônimo. A lista local
permanece visível no cabeçalho, em `/carrinho` e no acesso flutuante quando há
itens. Essa seleção não submete uma cotação nem contorna autenticação, aprovação
empresarial ou controles do banco.

### Fundação visual compartilhada — Fase 2

Estado: **implementado localmente, não implantado**.

Landing e Catálogo agora usam o mesmo DNA visual: Inter, grafite de alto
contraste, azul ItaSafety como ação principal, vermelho raro, bordas discretas,
radius controlado, três níveis de sombra e um único padrão de foco. A Landing
aplica composição editorial e mais espaço negativo; o Catálogo aplica composição
funcional e maior velocidade de leitura. Essas densidades não representam dois
design systems.

A fase não alterou catálogo, autenticação, regras de empresa, submissão ou dados
de produto. Também não introduziu filtros, Quick View, comparação ou nova copy
comercial. ProductCard e CategoryCard foram diferenciados porque produto é
seleção e categoria é navegação. Loading, vazio, erro, disabled e feedback de
adição passaram a possuir bases compartilhadas.

O vermelho permanece assinatura de atenção e consequência, não decoração de
chrome. O azul comunica confiança, navegação e ação. Os cards editoriais da
Landing não definem tokens para o restante da aplicação.

### Landing institucional em `/`

A Landing ativa possui três etapas: Hero, Motivos e FAQ. O Hero mantém proposta,
contexto e ações no mesmo eixo de leitura e materializa proteção facial com um
modelo 3D interativo de viseira no desktop/tablet e com o poster do mesmo objeto
em smartphones pequenos. A composição não retoma o device removido nem o
capacete usado em composições anteriores. O modelo “PPE VISOR”, licenciado em
CC BY 4.0, é atribuído a Lanzaman no Sketchfab na área legal do Footer da Landing.
A inspeção visual em múltiplos ângulos não encontrou marca de fabricante. O asset
não constitui afirmação de marca, certificação, CA ou disponibilidade de produto
ItaSafety. Motivos combina o
trilho de benefícios com uma
composição editorial larga sobre escolha preventiva, mantendo copy curta e uma
única ação comercial. O device, Product Family, full-bleed, jornada
intermediária e CTA final foram retirados da página. A copy principal continua
“Um acidente custa muito mais que o EPI.” sem números, prazos, certificações
institucionais ou prova social não validados.

Motivos apresenta quatro aspectos da jornada ItaSafety: catálogo organizado,
escolha mais clara, atendimento para empresas e seleção para cotação. Os cards
usam fotografia em área completa, copy controlada no topo e veil tonal para
contraste, sem publicar dado comercial novo. O comportamento é um trilho
horizontal com elevação mínima no hover.

Na Landing, o header transparente oferece somente Início, Motivos e Perguntas.
Busca, cotação, conta e navegação completa continuam disponíveis nas superfícies
funcionais do produto, especialmente no Catálogo, mas não competem com o Hero.

Os textos usam somente posicionamento institucional compatível com a jornada já
existente. Números comerciais, prazos, cobertura geográfica, preços e
depoimentos não confirmados não são publicados. O FAQ explica navegação,
cadastro, cotação, CA, preços, acompanhamento e contato sem criar novas garantias
comerciais.

Na arquitetura da Fase 1:

- a landing é o componente da rota `/` em builds normais e no modo `ui`;
- o modo `ui` continua sendo uma ferramenta local de isolamento de backend, não
  uma chave que troca a composição da home;
- CTAs usam caminhos internos relativos e não dependem de `localhost`;
- a landing não envia formulários nem executa integração;
- Header e Footer globais são compartilhados com o catálogo, enquanto os cards
  de Motivos e seus assets permanecem restritos à Landing;
- a implementação não foi publicada e não constitui evidência de produção.

### Catálogo em `/catalogo`

O catálogo começa por contexto compacto, busca, categorias principais e produtos.
A busca atual filtra somente a seleção local versionada e mantém o termo no
search param `q`. Resultado zero informa a limitação e oferece limpeza ou contato.
Não existem nesta fase filtros avançados, busca remota, Quick View, comparação,
preço, estoque ou recomendação.

### Contratos locais de dados

`src/lib/products.ts` contém oito registros locais versionados em
`LOCAL_CATALOG_PRODUCTS`. Os campos usados
pela experiência são `sku`, `name`, `category`, `categorySlug`, `ca`,
`description` e `image`. `tags` continua sendo metadado editorial local legado e
não é promovido pelo novo catálogo como prova de novidade, demanda ou certificação.

| Informação                                                          | Estado na Fase 1                                                                           |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| SKU, nome, categoria, slug, descrição e imagem                      | local versionado; existência no código confirmada; verdade comercial remota não confirmada |
| Número de CA                                                        | local versionado; status atual do certificado não confirmado                               |
| Contagem por categoria                                              | derivada apenas dos oito registros locais; não representa o portfólio total                |
| Fabricante, estoque, disponibilidade, normas, aplicações e garantia | não confirmados; removidos das superfícies ativas                                          |
| Preço e oferta                                                      | ausentes; nenhum placeholder ou dado estruturado foi criado                                |

`src/lib/categories.ts` contém 14 categorias locais com `slug`, `title`, `icon`
e subcategorias opcionais. A taxonomia mistura tipo de produto, proteção,
ambiente, material, aplicação e atributo. A Fase 1 preserva essa ordem e não
trata a taxonomia do frontend como fonte de verdade de negócio. Subcategorias
sem relacionamento confiável com produto não são apresentadas como filtros.

### Estados de carregamento da aplicação

A aplicação normal apresenta skeletons estruturais durante transições de rota e
consultas iniciais de conteúdo. Eles preservam títulos, cards, formulários,
listas e tabelas para reduzir mudança brusca de layout. Spinners permanecem
restritos a ações em andamento, como autenticar, salvar, enviar, aprovar ou
rejeitar, porque nesses casos representam uma operação e não carregamento de
estrutura.

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
