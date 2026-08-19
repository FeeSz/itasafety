# ItaSafety — regras de trabalho para agentes

Este arquivo estabelece as regras globais de engenharia, produto, segurança, design e operação da ItaSafety e vale para todo o repositório.

Arquivos `AGENTS.md` mais próximos de um domínio podem adicionar regras específicas, mas nunca enfraquecer requisitos de segurança, integridade, produção, acessibilidade ou qualidade definidos aqui.

---

## 1. Missão

A ItaSafety deve ser tratada como um produto B2B de produção, não como protótipo, playground ou coleção de páginas independentes.

Toda implementação deve buscar simultaneamente:

* correção funcional;
* segurança;
* integridade de dados;
* qualidade arquitetural;
* excelência de frontend;
* usabilidade;
* acessibilidade;
* responsividade;
* performance;
* observabilidade;
* operação segura;
* documentação consistente;
* manutenção futura simples.

Código que apenas "funciona" não representa uma entrega concluída.

A experiência renderizada, os contratos, o banco, a segurança, os estados de falha, os fluxos operacionais e a documentação fazem parte da mesma feature.

---

## 2. Princípio central

**Código, interface, banco, segurança, testes, operação e documentação formam uma única entrega.**

Nenhuma feature, correção, migration, integração, refatoração ou alteração operacional está concluída enquanto todos os impactos aplicáveis não tiverem sido tratados.

Nunca use um requisito para justificar a degradação silenciosa de outro.

Exemplos:

* velocidade de implementação não justifica remover validação;
* estética não justifica perda de acessibilidade;
* abstração não justifica complexidade desnecessária;
* compatibilidade não justifica manter código inseguro;
* conveniência do frontend não justifica confiar nele como fronteira de autorização;
* uma migration bem-sucedida localmente não prova o estado de produção;
* um build bem-sucedido não prova que a experiência funciona no navegador;
* um deploy concluído não prova que o produto está saudável.

---

## 3. Hierarquia de evidência

Quando informações entrarem em conflito, prefira, nesta ordem:

1. requisito explícito e atual do usuário, desde que seguro;
2. estado remoto verificado do ambiente alvo;
3. comportamento observado no sistema em execução;
4. código atual do repositório;
5. documentação atual do repositório;
6. migrations e histórico versionado;
7. convenções existentes e decisões arquiteturais;
8. documentação oficial das tecnologias utilizadas;
9. boas práticas gerais.

Nunca substitua evidência por suposição.

Quando algo não puder ser confirmado, registre como `não confirmado`.

---

## 4. Fonte de verdade do projeto

Antes de assumir versões, bibliotecas, comandos ou infraestrutura, consulte o repositório.

`package.json` é a fonte de verdade para dependências e scripts atualmente utilizados.

A stack vigente inclui, entre outras tecnologias já adotadas pelo projeto:

* React;
* TypeScript;
* TanStack Start;
* TanStack Router;
* TanStack Query;
* Vite;
* Tailwind CSS;
* componentes baseados em Radix UI e componentes locais;
* Supabase;
* Cloudflare Workers;
* infraestrutura associada documentada no repositório.

Não introduza um framework paralelo, state manager, design system, biblioteca de animação, cliente HTTP, ORM, formulário ou abstração concorrente apenas por preferência pessoal.

Antes de adicionar dependência:

* confirme que o problema ainda não está resolvido pela stack atual;
* avalie impacto de bundle, manutenção, segurança e compatibilidade;
* prefira APIs nativas e abstrações existentes;
* justifique dependências relevantes;
* registre ADR quando houver impacto arquitetural importante.

Não faça upgrades oportunistas durante uma tarefa não relacionada.

---

## 5. Antes de qualquer alteração

Antes de editar código:

1. leia `docs/README.md`;
2. consulte os documentos relacionados ao domínio afetado;
3. identifique o comportamento atual;
4. determine o objetivo da alteração;
5. identifique explicitamente o que não faz parte do escopo;
6. inspecione os arquivos diretamente envolvidos e suas dependências relevantes;
7. identifique trust boundaries, dados envolvidos e possíveis efeitos colaterais;
8. registre premissas, riscos e critérios de sucesso;
9. preserve alterações preexistentes do usuário;
10. defina como a mudança será validada.

Para decisões sobre produção, confirme também o estado remoto relevante.

Migrations, dumps, arquivos `.env`, arquivos temporários do Supabase, documentação antiga e resultados locais não são evidência suficiente do estado remoto.

### Modo de análise

Uma solicitação de análise, auditoria, revisão, investigação ou planejamento não concede autorização implícita para modificar arquivos ou ambientes.

Não altere código, banco, configuração ou infraestrutura quando o usuário solicitar somente análise.

---

# 6. Produto e frontend

Frontend é parte central da qualidade da ItaSafety.

Toda interface deve demonstrar qualidade compatível com um produto profissional em produção — e mais que isso, deve ser **inconfundivelmente ItaSafety**. Uma tela que poderia pertencer a qualquer outro produto B2B gerado por IA não está pronta, mesmo que passe em todos os outros critérios deste arquivo.

Design genérico não é um risco estético menor. É um defeito de entrega, no mesmo nível de uma falha de acessibilidade ou de uma query N+1.

---

## 6.1 Direção visual

A ItaSafety deve transmitir:

* confiança;
* segurança;
* precisão;
* profissionalismo;
* tecnologia;
* simplicidade;
* clareza;
* qualidade industrial;
* maturidade B2B.

Use Apple, Vercel, Linear e Stripe como referências de **disciplina visual e experiência**, nunca como templates para cópia literal. Nunca produza um componente que, ao ser mostrado sem logo, poderia ser confundido com uma cópia direta desses produtos. A referência empresta rigor, não vocabulário visual.

### 6.1.1 Anti-padrões proibidos ("estilo padrão de IA")

Ferramentas de geração de UI (Lovable, v0, Codex sem direção, etc.) convergem para um conjunto reconhecível de defaults por ausência de opinião estética, não porque sejam boas escolhas. Os itens abaixo são **proibidos por padrão** neste projeto. Uma exceção só é aceitável quando justificada explicitamente por um motivo de produto, registrada na entrega — nunca por omissão ou conveniência.

**Proibido:**

* Fundo `bg-slate-950`, `bg-zinc-900`, `bg-neutral-900` ou qualquer cinza-quase-preto "puro" de biblioteca usado como base de página sem intenção cromática própria da ItaSafety.
* Borda em praticamente todo elemento (`border border-zinc-800`, `border border-gray-200`) como forma padrão de separar conteúdo. Separação vem de espaçamento, tipografia e alinhamento primeiro; borda é exceção pontual, não hábito.
* Gradiente roxo→rosa (ou variações azul→roxo→rosa) em texto, título ou botão primário. Isso é o clichê mais reconhecível de "produto gerado por IA" e é proibido sem exceção neste projeto.
* "Efeito painel": telas inteiras compostas por cards brancos com `shadow-md`/`shadow-lg` flutuando sobre fundo cinza claro, todos com o mesmo radius e a mesma sombra. Cards devem ser exceção deliberada (ver 6.3), não o container-padrão de qualquer bloco de conteúdo.
* Ícone genérico de biblioteca (lucide/heroicons) usado como enfeite decorativo sem função — "ícone porque preenche espaço".
* Emoji como substituto de iconografia ou ilustração em produto B2B.
* Sombra de card usando valores arbitrários repetidos e inconsistentes (`shadow-sm` num lugar, `shadow-md` idêntico visualmente noutro, `0 4px 6px rgba(0,0,0,0.1)` copiado e colado) — sombra faz parte do design system (6.2), não é decisão ad hoc por componente.
* Layout centralizado com título grande + subtítulo cinza + botão arredondado + imagem/mockup flutuante à direita como fórmula fixa de toda seção de hero/CTA, aplicada sem pensar no conteúdo real da seção.
* Badge/pill com fundo colorido translúcido (`bg-blue-500/10 text-blue-400`) usado indiscriminadamente como decoração de qualquer palavra-chave.

Antes de considerar um componente pronto, o agente deve verificar explicitamente contra esta lista, seguindo o protocolo da seção 6.12. Se qualquer item estiver presente sem justificativa registrada, o componente **não está concluído**.

---

## 6.2 Design system

Antes de criar um novo padrão visual, procure por um padrão existente. Centralize decisões reutilizáveis de cor, tipografia, espaçamento, radius, bordas, sombras, tamanho, motion, z-index, estados e breakpoints, usando os tokens e variáveis globais existentes.

Para Tailwind CSS, prefira tokens e variáveis do tema em vez de espalhar valores arbitrários por dezenas de componentes.

### 6.2.1 Ritmo espacial rígido (grid de 8px)

Todo espaçamento (padding, margin, gap, altura de elementos, tamanho de ícones) deve ser múltiplo de **8px** (`0.5rem`), com exceção pontual de **4px** apenas para ajustes finos dentro de componentes densos (ex.: espaço entre ícone e label num botão pequeno).

* Proibido: valores arbitrários como `13px`, `p-[7px]`, `gap-[10px]`, `mt-[22px]`.
* Proibido: misturar múltiplos de 8 com múltiplos de 4 e valores quebrados no mesmo componente sem motivo.
* A escala de espaçamento do Tailwind já usada no projeto deve ser mapeada explicitamente para esse grid (ex.: `space-2` = 8px, `space-4` = 16px, `space-6` = 24px, `space-8` = 32px, `space-12` = 48px, `space-16` = 64px, `space-24` = 96px) e essa escala é a única fonte de verdade de espaçamento — não valores arbitrários com colchetes.
* Qualquer exceção a este grid exige justificativa explícita (ex.: alinhamento óptico de tipografia), nunca "ficou parecido o suficiente".

### 6.2.2 Contraste por escala, não por cor

Hierarquia visual deve ser construída primariamente por **tamanho** e **peso** tipográfico, não por variação de cor de texto.

* Um título principal e um rótulo secundário devem se diferenciar por `text-4xl`/`text-5xl` vs `text-sm`, e por `font-light`/`font-semibold` vs `font-medium`, não apenas por um ser `text-gray-900` e outro `text-gray-500`.
* Cor é reservada para: estado (erro, sucesso, alerta), a cor de marca em pontos de ênfase deliberada, e informação semântica real. Cor não é a ferramenta padrão para "fazer esse texto parecer menos importante".
* Nunca use unicamente a cor para comunicar diferença de importância entre dois blocos de texto do mesmo tamanho e peso — isso também é uma falha de acessibilidade (ver 6.5).

### 6.2.3 Micro-tipografia

* Títulos grandes (`text-3xl` e acima) devem usar `tracking-tight` ou `tracking-tighter` como padrão, não o `tracking-normal` implícito.
* Texto em caixa alta usado como eyebrow/label (quando fizer sentido semântico, ver 6.3) deve usar `tracking-wide` ou `tracking-widest` combinado com tamanho pequeno e peso médio — nunca caixa alta com tracking normal, que lê como grito, não como rótulo.
* `line-height` de títulos grandes deve ser reduzido conscientemente (`leading-tight`/`leading-none` conforme o caso) — o `leading-normal` padrão do navegador raramente é a escolha certa em display type.
* Números e dados tabulares (preços, quantidades, métricas) devem considerar `tabular-nums` quando alinhados em coluna.

### 6.2.4 Espaço negativo

* Seções de página (hero, blocos de conteúdo, CTA) devem usar padding vertical generoso como padrão — pense em `py-24`/`py-32` em desktop para seções principais, nunca `py-4`/`py-6` "porque cabe mais conteúdo na tela".
* Densidade de informação alta é aceitável em telas operacionais (dashboards, tabelas internas), mas mesmo ali o respiro entre grupos lógicos deve ser deliberado, não comprimido por padrão.
* "Mais espaço em branco" nunca é a resposta errada quando em dúvida entre dois layouts de mesma clareza funcional.

### 6.2.5 Regras gerais do design system

Evite: cores hardcoded repetidas fora do token system; magic numbers sem necessidade; múltiplos radii quase idênticos; sombras inconsistentes; componentes visualmente equivalentes implementados de formas diferentes; duplicação de variantes; CSS específico quando uma regra reutilizável representa melhor a intenção.

Uma nova exceção visual deve ser intencional, registrada e justificada — nunca acidental.

---

## 6.3 Hierarquia e composição

Cada tela deve deixar evidente:

1. onde o usuário está;
2. o que é mais importante;
3. qual ação principal está disponível;
4. quais ações são secundárias;
5. qual é o estado atual do sistema;
6. o que acontecerá ao executar uma ação.

Evite telas em que todos os elementos competem pela mesma atenção. CTAs primários devem ser escassos — no máximo um CTA de destaque máximo por tela/seção. Elementos secundários não devem visualmente dominar a ação principal.

Cards não devem ser utilizados automaticamente para agrupar qualquer conteúdo. Use agrupamento, whitespace, tipografia e alinhamento (ver 6.2.4) antes de adicionar contêineres e bordas. Pergunte: "esse card existe porque o conteúdo precisa de um limite visual, ou porque é o reflexo automático de encapsular tudo numa caixa?" Se for a segunda opção, remova o card.

Numeração explícita (01 / 02 / 03) e "eyebrows" só devem ser usados quando o conteúdo é de fato sequencial ou categórico — nunca como decoração estrutural aplicada por hábito.

---

## 6.4 Responsividade

Toda feature visual deve funcionar adequadamente em:

* smartphones pequenos;
* smartphones modernos;
* tablets;
* notebooks;
* desktops;
* telas amplas.

Não implemente apenas para a largura observada durante o desenvolvimento.

Verifique, quando aplicável, larguras próximas de:

* 320–375 px;
* 768 px;
* 1024 px;
* 1280–1440 px;
* 1920 px.

A interface não pode apresentar overflow horizontal acidental.

Prefira layout fluido, Grid/Flex e sizing intrínseco a cálculos rígidos de viewport.

Elementos fixos devem considerar áreas seguras de dispositivos móveis.

Conteúdo importante não pode depender de hover.

Targets interativos em dispositivos touch devem possuir área confortável de interação.

Inputs em mobile não devem provocar zoom involuntário causado por tipografia excessivamente pequena.

Nunca desabilite o zoom do navegador para corrigir layout.

---

## 6.5 Acessibilidade

O objetivo mínimo do produto é **WCAG 2.2 AA**, quando aplicável.

Use HTML semântico antes de ARIA.

Siga padrões WAI-ARIA para componentes compostos que realmente precisem deles.

Toda interação deve ser utilizável por teclado.

Garanta:

* foco visível;
* ordem de foco lógica;
* gerenciamento de foco em dialogs e navegação relevante;
* labels associados a campos;
* accessible names em controles;
* headings em hierarquia coerente;
* landmarks adequados;
* skip navigation quando aplicável;
* alt text apropriado;
* mensagens assíncronas anunciáveis quando necessário;
* contraste adequado;
* estados que não dependem apenas de cor;
* suporte a `prefers-reduced-motion`.

Não use `div` clicável quando `button` ou `a` representam corretamente a interação.

Ícones sem texto precisam de nome acessível quando representam uma ação.

Ícones puramente decorativos não devem poluir a árvore de acessibilidade.

Como a hierarquia visual deve depender de escala e peso, e não apenas de cor (ver 6.2.2), a verificação de contraste deixa de ser a única defesa contra "informação que só existe pela cor" — ela passa a ser a segunda camada, depois da própria estrutura tipográfica.

---

## 6.6 Motion e microinterações

Animação deve comunicar:

* continuidade;
* mudança de estado;
* hierarquia;
* feedback;
* origem ou destino;
* sucesso;
* progresso.

Não adicione animação apenas para demonstrar sofisticação — e não deixe de adicionar animação onde ela é o que separa uma interface "funcional" de uma interface "com acabamento".

### 6.6.1 Padrões obrigatórios de microinteração

**Hover em grupos pai/filho (reveal pattern):** quando um elemento filho (ícone de ação, texto secundário, seta) só faz sentido no contexto de interação, ele deve nascer com opacidade reduzida (`opacity-0` ou `opacity-60`, conforme o caso) e transicionar suavemente para opacidade plena no `:hover`/`:focus-within` do elemento pai (`group` + `group-hover:opacity-100`), com `transition-opacity duration-200` (ou token equivalente do design system). Aparecimento abrupto, sem transição, de elementos interativos secundários no hover é considerado inacabado.

**Focus-visible customizado:** o outline padrão do navegador é proibido em elementos interativos customizados (botões, cards clicáveis, itens de lista interativos). Todo `:focus-visible` deve receber um estilo próprio da ItaSafety — por exemplo um `ring` com a cor de marca e offset consistente (`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`), nunca `outline: none` sem substituto, e nunca o azul padrão do navegador. Isso não é opcional: remover foco visível sem substituto viola tanto este princípio quanto a seção 6.5 e a regra da seção 25.

**Animações de entrada:** elementos que aparecem na tela por resultado de navegação, carregamento de dados ou revelação por scroll devem combinar **fade-in + slide-up sutil** (ex.: de `opacity-0 translate-y-2` para `opacity-100 translate-y-0`), nunca aparecimento instantâneo quando o conteúdo é o foco da atenção do usuário, e nunca movimento maior que ~8–16px (deslocamentos grandes leem como "hack de animação", não como refinamento).

### 6.6.2 Regras gerais de motion

Prefira CSS para microinterações simples. Priorize `transform` e `opacity` para animações frequentes. Evite animar propriedades que provoquem layout e repaint custosos sem necessidade. Não use `transition: all`. Toda animação significativa deve respeitar `prefers-reduced-motion`.

Motion deve ser:

* curto;
* responsivo;
* interrompível;
* previsível;
* coerente em todo o produto.

Evite delays que façam a interface parecer lenta.

---

## 6.7 Estados da interface

Não implemente somente o happy path.

Para todo fluxo relevante, considere:

* carregamento inicial;
* carregamento de ação;
* conteúdo vazio;
* sucesso;
* erro recuperável;
* erro irrecuperável;
* dados parciais;
* sessão expirada;
* acesso negado;
* ação indisponível;
* resultado zero;
* conexão lenta;
* conteúdo longo;
* conteúdo inesperado;
* múltiplas submissões;
* responsividade.

Skeletons devem preservar a geometria aproximada do conteúdo e evitar layout shift.

Não use skeleton por tempo artificial.

Erros devem explicar, de forma útil:

* o que não pôde ser concluído;
* o que o usuário pode fazer em seguida.

Nunca exiba stack trace, query, token, segredo ou detalhe interno ao usuário.

---

## 6.8 Formulários

Use os padrões já adotados pelo projeto, incluindo React Hook Form e Zod quando adequados.

Valide dados no cliente para UX e novamente na fronteira confiável para segurança.

Nunca trate validação de frontend como controle de segurança.

Campos devem possuir:

* label;
* estado de erro;
* instrução quando necessária;
* autocomplete adequado;
* feedback de submissão.

Preserve os dados digitados quando uma requisição falhar sempre que possível.

Não bloqueie colagem sem motivo de segurança comprovável.

A tecla Enter deve funcionar conforme a semântica esperada do formulário.

Evite double-submit.

Após início efetivo de uma submissão, apresente estado de progresso e impeça reenvios conflitantes.

A proteção real contra operações duplicadas deve existir também no backend quando a operação exigir idempotência.

---

## 6.9 Conteúdo e microcopy

Texto de interface deve ser:

* curto;
* direto;
* humano;
* específico;
* profissional;
* coerente com português do Brasil.

Prefira verbos de ação.

Evite jargão técnico para usuários finais.

Evite textos genéricos como:

* "Algo deu errado";
* "Erro desconhecido";
* "Clique aqui";
* "Saiba mais" quando uma ação mais específica puder ser usada.

Mensagens destrutivas devem indicar claramente a consequência.

Não use marketing exagerado para compensar falta de clareza.

---

## 6.10 Estado e arquitetura React

Use cada mecanismo para sua finalidade:

* TanStack Query para estado remoto e cache;
* URL/search params para estado compartilhável ou navegável;
* estado local para interação local;
* Context somente para estado realmente transversal;
* servidor para autorização e regras confiáveis.

Não duplique estado remoto em múltiplos contexts.

Não use `useEffect` para derivar valores que podem ser calculados durante renderização.

Evite componentes monolíticos.

Extraia componentes quando houver ganho real de:

* legibilidade;
* reutilização;
* isolamento;
* teste;
* responsabilidade.

Não fragmente componentes apenas para reduzir número de linhas.

Siga os padrões e APIs compatíveis com a versão de React efetivamente instalada.

---

## 6.11 Uso de referências externas como calibração (few-shot)

Quando o usuário anexar, colar ou referenciar um trecho de código de um produto de alto nível (Stripe, Linear, Apple, Vercel) como calibração de qualidade, trate esse trecho **apenas como padrão de refinamento técnico e sutileza visual** — nunca como fonte para reprodução literal de marca, texto, ilustração ou identidade visual de terceiros. O que deve ser extraído da referência é: disciplina de espaçamento, qualidade de transição, precisão de alinhamento e ausência de ruído — não o vocabulário cromático ou de conteúdo daquele produto específico, que pertence a outra marca.

---

## 6.12 Protocolo de geração e auditoria de código (obrigatório)

Sempre que o agente for solicitado a criar ou refatorar qualquer componente, tela ou trecho visual de frontend — independentemente da tecnologia específica (React, HTML de email, etc.) — a resposta deve ser dividida em duas partes estritas, nesta ordem:

1. **Checklist anti-padrão (auditoria pré-entrega).** Uma lista curta e explícita confirmando que o código que está prestes a ser gerado não incorre em nenhum item da seção 6.1.1, e que segue o ritmo espacial (6.2.1), a hierarquia por escala (6.2.2) e a micro-tipografia (6.2.3) definidos. Exemplo de formato:
   * Fundo genérico de biblioteca (`zinc-900`/`slate-950`): não utilizado — paleta deriva dos tokens `bg-background`/`bg-surface` do design system.
   * Borda em tudo: eliminada — separação via espaçamento e tipografia; borda usada só em `border-b` do cabeçalho.
   * Gradiente roxo→rosa: zero.
   * Ritmo espacial: todos os valores múltiplos de 8px (`py-12`, `px-8`, `gap-6`).
   * Hierarquia: resolvida por `text-3xl`/`text-xs` e `font-semibold`/`font-medium`, não por variação de cor.

2. **O código-fonte.** O componente limpo, tipado e estritamente aderente ao design system e aos tokens existentes no projeto (ver 6.2) — nunca cores hexadecimais arbitrárias soltas em `className`/`style` fora do token system, a menos que a exceção esteja nomeada e justificada no próprio checklist.

Se o agente gerar código diretamente, sem o checklist, a entrega é considerada incompleta pelos mesmos critérios da seção 26 e deve ser refeita.

### 6.12.1 O checklist é auditoria estática, não validação visual

O checklist desta seção verifica apenas o que é decidível a partir do próprio código-fonte (tokens usados, presença/ausência de padrões proibidos, valores de espaçamento). Ele **não** substitui a exigência da seção 20.1 de que nenhuma UI seja declarada "validada visualmente" sem observação real da interface renderizada, nem a exigência da seção 26 de registrar `não confirmado` quando um critério não puder ser verificado.

Concretamente: o agente pode confirmar no checklist que "nenhum gradiente foi escrito no código" (fato estático, verificável por leitura), mas não pode declarar que "a hierarquia visual está clara" ou que "o componente está visualmente refinado" como fato confirmado a menos que tenha efetivamente observado o resultado renderizado (screenshot, preview, etc.) quando essa observação estiver disponível no ambiente de trabalho. Quando não estiver disponível, a afirmação correspondente deve vir marcada como `não confirmado`, e não como sucesso.

### 6.12.2 Exemplo de referência (formato esperado, não conteúdo a copiar)

O exemplo abaixo ilustra apenas o **formato** da resposta esperada — checklist seguido de código — usando valores de exemplo. Os tokens específicos (`background`, `foreground`, `muted-foreground`, `border`, `primary`, `ring`) devem ser substituídos pelos tokens reais já definidos no design system do projeto, não usados literalmente:

```md
### Checklist anti-padrão

- Fundo genérico de IA: não utilizado — `bg-background` do token system.
- Borda em tudo: eliminada — apenas `border-b border-border` delimitando o cabeçalho.
- Gradiente roxo→rosa: zero.
- Ritmo espacial: `py-12 px-8`, `gap-6` — múltiplos de 8px.
- Hierarquia por escala: título em `text-3xl font-semibold tracking-tight`, eyebrow em `text-xs font-medium tracking-widest uppercase text-muted-foreground` — nenhuma diferenciação depende só de cor.
- Focus-visible customizado: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`, sem outline padrão do navegador.
```

```tsx
import React from 'react';

interface InspectionHeaderProps {
  unitName: string;
  reportCount: number;
}

export function InspectionHeader({ unitName, reportCount }: InspectionHeaderProps) {
  return (
    <header className="w-full bg-background border-b border-border py-12 px-8 font-sans antialiased text-foreground">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">

        {/* Hierarquia por escala e peso, não por cor */}
        <div className="space-y-3">
          <span className="block text-xs font-medium tracking-widest uppercase text-muted-foreground">
            {unitName} &bull; Relatórios Técnicos
          </span>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-foreground leading-tight">
            Inspeções de Segurança Industrial
          </h1>
          <p className="text-sm text-muted-foreground tracking-tight font-normal">
            Exibindo{' '}
            <span className="tabular-nums font-medium text-foreground">{reportCount}</span>{' '}
            auditorias ativas em conformidade com as normas vigentes.
          </p>
        </div>

        {/* Ação única e escassa (controle de atenção da tela) */}
        <div className="flex items-center gap-4">
          <button
            className="bg-primary text-primary-foreground text-sm font-medium px-4 py-2.5 rounded-md
                       hover:opacity-90 active:scale-[0.98] transition-all duration-200 ease-out
                       focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Nova Inspeção
          </button>
        </div>

      </div>
    </header>
  );
}
```

Note que `tabular-nums` é usado como classe Tailwind isolada (não como propriedade CSS colada dentro de `className`), e que toda cor vem de um token (`background`, `foreground`, `muted-foreground`, `border`, `primary`, `ring`) — nunca de hex arbitrário solto no JSX, salvo exceção nomeada.

---

# 7. TanStack Start e fronteira client/server

Respeite explicitamente o modelo de execução do TanStack Start.

Código executado no browser deve ser considerado não confiável.

Código server-only não pode acabar acidentalmente no bundle do cliente.

## Server Functions

Server Functions destinadas ao aplicativo devem:

* validar input;
* validar autenticação quando necessária;
* validar autorização;
* tratar erros;
* retornar apenas dados necessários;
* não confiar em campos de identidade enviados pelo cliente;
* evitar exposição de detalhes internos.

Para APIs HTTP externas ou integrações públicas, prefira Server Routes apropriadas em vez de transformar Server Functions internas em APIs públicas.

## CSRF

Server Functions são endpoints mutáveis e precisam manter proteção contra requisições cross-site.

Quando o projeto utilizar um `src/start.ts` customizado, a configuração deve preservar explicitamente a proteção CSRF compatível com a versão instalada do TanStack Start.

Nunca:

* remova middleware CSRF por conveniência;
* aceite origens amplas sem justificativa;
* substitua proteção de origem por validação apenas no frontend.

Ausência inesperada dessa proteção deve ser tratada como questão de segurança de alta prioridade e confirmada antes de mudanças relacionadas.

---

# 8. Performance de frontend

Performance faz parte da experiência.

Como referência de produção, busque Core Web Vitals em faixa "Good":

* LCP ≤ 2,5 s;
* INP ≤ 200 ms;
* CLS ≤ 0,1;

avaliados em condições reais quando houver telemetria disponível.

Não faça afirmações de Web Vitals a partir de build local sem medição.

O cliente principal já deve ser tratado com atenção especial a crescimento de bundle.

Toda dependência significativa adicionada ao browser deve justificar seu custo.

Prefira:

* SSR quando adequado;
* code splitting;
* carregamento sob demanda;
* imagens com dimensões conhecidas;
* formatos otimizados;
* lazy loading abaixo da dobra;
* preload apenas para recursos críticos;
* cache correto;
* consultas eficientes;
* evitar JavaScript para comportamentos resolvíveis por HTML/CSS;
* evitar trabalhos pesados na main thread.

Não prejudique legibilidade e arquitetura em troca de micro-otimizações sem evidência.

---

# 9. SEO e renderização

Rotas públicas relevantes devem manter:

* title adequado;
* meta description;
* canonical correto quando aplicável;
* metadados sociais quando previstos;
* estrutura semântica;
* conteúdo indexável;
* URLs estáveis;
* status HTTP coerente.

Não dependa exclusivamente de JavaScript client-side para conteúdo essencial de páginas destinadas à indexação quando o framework permitir renderização adequada.

Alterações de SEO não devem introduzir conteúdo enganoso, keyword stuffing ou texto criado apenas para motores de busca.

---

# 10. Backend

Backend deve ser projetado para falhar de forma segura.

Cada operação mutável precisa considerar:

* autenticação;
* autorização;
* validação;
* integridade;
* concorrência;
* idempotência;
* atomicidade;
* limites;
* abuso;
* observabilidade;
* recuperação.

Não distribua uma única regra crítica apenas entre frontend e convenções implícitas.

Regras de negócio importantes devem possuir enforcement em uma fronteira confiável.

---

## 10.1 Validação

Valide input o mais cedo possível e preserve garantias no banco sempre que apropriado.

Não confie em:

* IDs enviados pelo cliente;
* role enviada pelo browser;
* email declarado pelo frontend;
* preços calculados exclusivamente no cliente;
* estado de workflow fornecido pelo usuário;
* nomes de arquivos;
* MIME fornecido apenas pelo browser.

Para invariantes persistentes, considere também:

* constraints;
* foreign keys;
* unique constraints;
* checks;
* transações.

---

## 10.2 Atomicidade

Operações que representam uma única ação de negócio devem ser atômicas sempre que inconsistência intermediária puder gerar problema.

Evite sequências de múltiplos writes independentes no cliente quando uma transação ou RPC puder representar melhor a operação.

O fluxo de cotação existente deve ser tratado com cautela especial.

Não amplie uma sequência não atômica sem antes avaliar:

* criação parcial;
* retry;
* double-submit;
* concorrência;
* rollback;
* envio duplicado de notificação.

Ao corrigir esse tipo de fluxo, prefira uma fronteira transacional bem definida após confirmar o estado remoto do banco.

---

## 10.3 Concorrência e idempotência

Toda operação suscetível a concorrência deve determinar explicitamente o comportamento esperado.

Use, conforme o caso:

* unique constraints;
* row locks;
* transações;
* compare-and-set;
* idempotency keys;
* estado monotônico;
* claim pattern;
* outbox.

Não tente resolver concorrência somente com botão desabilitado no frontend.

---

# 11. Supabase, PostgreSQL e migrations

O project ref canônico pretendido para o ambiente principal é:

`porgyoqngtshxdxuwaft`

Entretanto, histórico recente do projeto registra divergência entre esse destino canônico e bindings utilizados por ambientes publicados.

**Nunca execute ação remota com base apenas nesse valor.**

Antes de qualquer operação remota:

1. confirme o ambiente alvo;
2. confirme o project ref efetivamente conectado;
3. confirme conta/organização quando aplicável;
4. obtenha evidência read-only do estado atual;
5. determine impacto;
6. prepare rollback;
7. somente então aplique a mudança autorizada.

Nunca use migrations ou metadados locais como prova isolada do banco de produção.

---

## 11.1 Migrations

`supabase/migrations` é o histórico versionado canônico de mudanças futuras do schema.

Nunca edite uma migration já aplicada para representar uma correção futura.

Crie uma nova migration:

* monotônica;
* determinística;
* revisável;
* verificável;
* segura para o estado real existente.

Quando houver migration histórica problemática, reconcilie o estado remoto.

Não reescreva silenciosamente a história de produção.

Mudanças destrutivas devem preferir estratégia expand/migrate/contract quando viável.

Não combine desnecessariamente:

* criação;
* backfill massivo;
* remoção;
* rename destrutivo;

em um único passo irreversível.

---

## 11.2 Grants e RLS

Considere PostgreSQL grants e Row Level Security como camadas complementares.

**GRANT determina quais operações um role pode tentar executar.**

**RLS determina quais linhas daquela operação são permitidas.**

Nunca conclua que uma policy de RLS, sozinha, representa autorização completa.

Tabelas expostas devem possuir:

* grants mínimos;
* RLS coerente;
* policies explícitas;
* testes por role.

Não use `authenticated` como sinônimo de "autorizado".

---

## 11.3 Matriz obrigatória de autorização

Mudanças relacionadas a dados protegidos devem testar, conforme aplicável:

* `anon`;
* usuário autenticado comum;
* usuário A;
* usuário B;
* admin;
* `service_role`.

Exemplos importantes:

* usuário A não acessa dados privados do usuário B;
* usuário não promove sua própria role;
* usuário comum não executa função administrativa;
* `anon` não acessa dados privados;
* admin executa apenas operações previstas;
* policies não recursam indevidamente;
* funções privilegiadas não ficam executáveis por `PUBLIC`.

---

## 11.4 SECURITY DEFINER

Funções `SECURITY DEFINER` exigem cuidado especial.

Toda função desse tipo deve:

* ter necessidade real;
* possuir `search_path` seguro e explícito;
* minimizar privilégios;
* validar o ator;
* derivar identidade de `auth.uid()` quando aplicável;
* não confiar em `user_id` ou `role` enviados pelo cliente;
* possuir grants de execução explícitos;
* revogar execução de roles não necessárias;
* ser testada como boundary de autorização.

Não crie `SECURITY DEFINER` apenas para contornar uma policy inconveniente.

---

## 11.5 service_role

`service_role` é altamente privilegiado e pertence exclusivamente a ambientes server-side confiáveis e Edge Functions que realmente precisem dele.

Nunca:

* exponha `service_role` ao browser;
* prefixe-o com `VITE_`;
* envie-o para logs;
* inclua-o em URL;
* use-o em documentação;
* retorne-o em erro;
* use-o como solução padrão para problemas de RLS.

Todo uso de `service_role` deve implementar sua própria autorização, validação, limitação de abuso e logging seguro.

---

## 11.6 Storage

Uploads devem considerar, no mínimo:

* autenticação;
* autorização;
* limite de tamanho;
* tipo permitido;
* extensão;
* MIME;
* assinatura/conteúdo quando necessário;
* path seguro;
* nomes não controlados diretamente pelo usuário;
* colisão;
* exposição pública;
* retenção;
* remoção.

Bucket público deve existir somente quando a exposição pública for requisito real.

---

# 12. Autenticação e autorização

O frontend pode esconder ou exibir controles por conveniência, mas isso nunca representa autorização.

Valores como `isAdmin` no browser são estado de apresentação.

A autoridade deve permanecer no servidor/banco.

Toda rota ou ação privilegiada deve possuir enforcement confiável.

Redirects de autenticação devem ser validados e não podem permitir open redirect arbitrário.

Sessões, OAuth, recuperação de conta e alteração de credenciais devem seguir os mecanismos seguros disponibilizados pela stack atual.

Nunca crie autenticação paralela sem necessidade arquitetural explícita.

---

# 13. Segurança de aplicação

Segurança deve ser aplicada por defesa em profundidade.

## Secrets

Nunca exponha:

* senhas;
* tokens;
* API keys privadas;
* JWTs;
* cookies de sessão;
* service keys;
* certificados privados;
* dados pessoais desnecessários.

Isso vale para:

* código;
* frontend;
* commits;
* docs;
* screenshots;
* fixtures;
* logs;
* mensagens de erro;
* exemplos;
* comandos compartilhados.

Variáveis `VITE_*` devem ser consideradas públicas ao browser.

Não coloque segredo em variável client-side.

---

## XSS e conteúdo

Prefira renderização segura padrão do React.

Não use `dangerouslySetInnerHTML` sem necessidade documentada e sanitização adequada.

Dados destinados a HTML, email ou outros formatos precisam ser codificados/escapados conforme o contexto.

Nunca monte HTML confiando diretamente em entrada do usuário.

---

## Rate limiting e abuso

Endpoints sensíveis devem considerar abuso por:

* IP;
* usuário;
* sessão;
* recurso;
* entidade;
* janela temporal.

Não utilize apenas um identificador controlável pelo atacante.

Ações especialmente sensíveis incluem:

* autenticação;
* recuperação de conta;
* envio de email;
* criação de cotação;
* respostas administrativas;
* uploads;
* endpoints públicos de integração.

---

## Logs

Logs devem ser úteis para diagnóstico sem se tornarem vazamento.

Não registre:

* senha;
* token completo;
* cookie;
* JWT;
* service key;
* corpo completo contendo PII sem necessidade;
* conteúdo sensível de autorização.

Use IDs de correlação quando necessário.

Erros internos detalhados pertencem ao ambiente de observabilidade, não à resposta pública.

---

## Headers e integrações externas

Não enfraqueça headers de segurança existentes para fazer uma integração funcionar.

Novos scripts, iframes, pixels ou serviços de terceiros devem considerar:

* origem;
* CSP;
* dados transmitidos;
* cookies;
* privacidade;
* LGPD;
* disponibilidade;
* impacto de performance;
* fallback.

Dependência externa deve permanecer atrás de uma fronteira clara sempre que possível.

A lógica de negócio não deve depender desnecessariamente do formato proprietário de um fornecedor.

---

# 14. Integrações

Toda integração externa deve possuir contrato e boundary explícitos.

Considere:

* timeout;
* indisponibilidade;
* retries;
* idempotência;
* quotas;
* autenticação;
* validação de resposta;
* formato inesperado;
* observabilidade;
* privacidade;
* fallback.

Não espalhe chamadas diretas a um fornecedor pela aplicação.

Prefira adaptadores ou serviços quando isso reduzir acoplamento real.

Não crie abstração genérica antecipadamente quando existe apenas uma implementação simples e nenhum benefício concreto.

---

# 15. Cloudflare e ambiente server-side

Código executado no Worker deve tratar variáveis de ambiente como segredo quando aplicável.

Não serialize `process.env`, bindings ou configurações privadas para o cliente.

Erros catastróficos de SSR não devem expor internals.

Antes de deploy remoto, confirme:

* conta;
* Worker alvo;
* ambiente;
* bindings;
* secrets;
* backend conectado;
* versão anterior disponível para rollback.

Deploy só deve ser realizado quando solicitado ou claramente autorizado.

---

# 16. Deploy e rollback

Build local não equivale a deploy.

Deploy concluído não equivale a sistema validado.

Depois de uma alteração remota, valide o comportamento efetivamente publicado.

Quando aplicável, verifique:

* health endpoint;
* home;
* autenticação;
* rota protegida;
* fluxo alterado;
* integração afetada;
* logs;
* versão/timestamp;
* backend conectado.

Nunca declare `deployado`, `corrigido em produção` ou equivalente sem evidência.

### Rollback

Rollback de aplicação não reverte automaticamente schema ou dados.

Antes de migration, considere se a versão anterior da aplicação continuará compatível com o novo schema.

Todo plano de rollback deve distinguir:

* código;
* configuração;
* Worker;
* Edge Function;
* migration;
* dados.

---

# 17. Performance e banco

Não crie queries N+1 ou carregamento indiscriminado de conjuntos grandes.

Selecione apenas colunas necessárias quando apropriado.

Paginação, filtros e ordenação relevantes devem ser executados na camada correta.

Antes de criar índice:

* identifique a query;
* confirme a necessidade;
* avalie custo de escrita e armazenamento;
* valide o plano quando possível.

Não execute experimentos destrutivos ou cargas pesadas em produção para "testar performance".

---

# 18. Qualidade TypeScript

Preserve tipagem forte.

Não introduza `any` apenas para silenciar erro.

Evite casts que apenas ocultam incompatibilidade.

Quando dados atravessarem uma trust boundary, valide runtime mesmo que TypeScript indique um tipo.

Tipos gerados do Supabase devem ser regenerados quando o schema aplicável mudar.

Não duplique manualmente tipos que já possuem uma fonte canônica confiável sem justificativa.

---

# 19. Tratamento de erros

Erros devem possuir comportamento definido.

No frontend:

* mensagem útil;
* ação recuperável quando possível;
* estado consistente;
* dados do formulário preservados quando seguro.

No servidor:

* status coerente;
* estrutura estável;
* logging seguro;
* informação interna protegida.

Não engula exceções silenciosamente.

Não transforme todo erro em `200 OK`.

Não exponha mensagem crua de banco ou stack trace ao cliente.

---

# 20. Testes e quality gates

Use os comandos efetivamente definidos em `package.json`.

O gate global padrão do projeto deve considerar, quando disponível:

`npm run check`

e os comandos individuais de:

* typecheck;
* lint;
* build;
* testes específicos relevantes.

Não desabilite regra de lint, TypeScript, validação de build ou verificação de ambiente para fazer uma alteração "passar".

Se um gate falhar por problema preexistente:

1. confirme que é preexistente;
2. registre-o separadamente;
3. não atribua falsamente a correção à tarefa atual;
4. não esconda a falha.

---

## 20.1 Testes de frontend

Mudanças visuais ou interativas devem verificar, conforme impacto:

* desktop;
* mobile;
* teclado;
* foco;
* loading;
* empty;
* error;
* success;
* conteúdo longo;
* acesso negado;
* reduced motion;
* console do navegador;
* navegação;
* refresh;
* deep link;
* comportamento autenticado e não autenticado quando aplicável.

Nunca declare uma UI "validada visualmente" analisando somente JSX/CSS.

Validação visual exige observar a interface renderizada. Ver também 6.12.1 sobre a diferença entre auditoria estática de código e validação visual real.

---

## 20.2 Testes de backend

Mudanças de backend devem testar:

* input válido;
* input inválido;
* não autenticado;
* autenticado sem permissão;
* autorizado;
* recurso inexistente;
* concorrência quando relevante;
* retry;
* erro da integração externa;
* duplicação quando relevante.

---

## 20.3 Testes de segurança

Mudanças de autorização devem incluir testes negativos.

É insuficiente provar que o usuário autorizado consegue fazer algo.

Também prove que usuários não autorizados **não conseguem**.

---

# 21. Documentação obrigatória

Toda mudança deve atualizar, conforme o impacto:

* `docs/product.md` — comportamento, regra de negócio ou jornada;
* `docs/frontend.md` — rota, componente, estado, UX ou contrato utilizado pelo frontend;
* `docs/backend.md` — tabela, RPC, policy, grant, trigger, Edge Function ou integração;
* `docs/architecture.md` — fronteira, dependência ou fluxo entre sistemas;
* `docs/security.md` — autenticação, autorização, dados sensíveis, ameaça ou mitigação;
* `docs/operations.md` — configuração, deploy, rollback, observabilidade ou manutenção;
* `docs/decisions/` — decisão arquitetural relevante e seus trade-offs.

Use `docs/feature-documentation-standard.md` como checklist.

Documentação deve representar a realidade atual.

Não registre uma intenção como se estivesse implantada.

- O project ref canônico pretendido de produção é `porgyoqngtshxdxuwaft`. Em
  03/08/2026 o runtime ainda estava conectado ao Supabase gerenciado pelo Lovable
  Cloud; a divergência e o plano de troca estão em
  `docs/decisions/0003-migracao-backend-supabase-canonico.md`. Confirme o ref
  efetivo antes de qualquer ação remota.

- Não exponha senhas, tokens, chaves privadas, JWTs ou dados pessoais em código,
  logs, documentação, commits ou respostas.
- Nunca edite uma migration já aplicada para representar uma correção futura.
  Crie uma migration nova, monotônica e verificável.
- Mudanças remotas exigem evidência anterior, plano de rollback e validação posterior.
- Testes de RLS devem cobrir `anon`, usuário comum, usuário A versus B, admin e
  `service_role` quando aplicável.
- `service_role` pertence apenas ao servidor e às Edge Functions.

Use estados explícitos como:

* implementado;
* aplicado;
* validado;
* pendente;
* planejado;
* não confirmado.

Nunca coloque valores secretos em documentação.

---

# 22. ADRs e decisões arquiteturais

Crie ou atualize ADR quando uma mudança introduzir decisão relevante e duradoura, por exemplo:

* novo serviço externo;
* nova trust boundary;
* alteração importante de autenticação;
* mudança de fonte de verdade;
* nova estratégia de estado;
* mudança relevante de schema;
* biblioteca estrutural;
* padrão que afetará diversas features;
* exceção significativa às regras do projeto.

Registre:

* contexto;
* decisão;
* alternativas;
* trade-offs;
* consequências;
* estratégia de migração quando aplicável.

Não crie ADR para decisões triviais ou puramente cosméticas.

---

# 23. Preservação do trabalho existente

Preserve alterações preexistentes do usuário.

Não reverta, formate em massa, reorganize ou "limpe" código fora do escopo sem necessidade.

Antes de editar arquivos compartilhados, observe mudanças não relacionadas.

Evite diffs ruidosos.

Prefira a menor alteração coerente que resolva completamente o problema.

"Menor" não significa incompleta.

---

# 24. Refatorações

Não misture refatoração extensa com correção funcional sem necessidade.

Refatoração deve possuir objetivo identificável.

Não introduza abstração apenas para aparentar arquitetura sofisticada.

Prefira:

* baixo acoplamento;
* alta coesão;
* contratos claros;
* nomes explícitos;
* funções pequenas o suficiente para serem compreendidas;
* módulos orientados à responsabilidade.

Não crie um "framework interno" para resolver um problema local.

---

# 25. Regras que nunca devem ser quebradas silenciosamente

É proibido:

* colocar secrets no cliente;
* colocar `service_role` no browser;
* confiar no frontend para autorização;
* editar migration aplicada como correção futura;
* assumir produção a partir do estado local;
* aplicar mudança remota sem confirmar o alvo;
* enfraquecer RLS para fazer uma query funcionar;
* tornar uma função pública para contornar autorização;
* usar `SECURITY DEFINER` como atalho;
* utilizar `any` como forma de esconder erro estrutural;
* remover validação para corrigir UX;
* desabilitar lint/typecheck/build para fazer CI passar;
* remover acessibilidade para simplificar componente;
* desabilitar zoom em mobile;
* depender somente de cor para comunicar estado;
* esconder erro sem alternativa ao usuário;
* criar animações que prejudiquem interação;
* adicionar bibliotecas grandes para comportamentos simples já suportados;
* duplicar componentes ou padrões existentes sem verificar reutilização;
* copiar visualmente Apple, Vercel, shadcn ou qualquer referência sem adaptar à ItaSafety;
* usar qualquer anti-padrão listado em 6.1.1 (fundo genérico, borda em tudo, gradiente roxo→rosa, efeito painel, etc.) sem justificativa registrada;
* entregar componente ou tela de frontend sem o checklist de auditoria da seção 6.12;
* afirmar validação visual sem observar a tela renderizada;
* afirmar deploy sem confirmar o ambiente;
* afirmar migration aplicada sem consultar o remoto;
* afirmar segurança apenas porque RLS está habilitado;
* afirmar sucesso quando algum requisito crítico permanece `não confirmado`.

---

# 26. Critério de conclusão

Uma entrega deve informar:

1. o que mudou;
2. por que mudou;
3. comportamento afetado;
4. arquivos e objetos afetados;
5. impacto visual e de UX, quando aplicável;
6. impacto de acessibilidade, quando aplicável;
7. impacto de segurança e dados;
8. migrations ou alterações remotas realizadas;
9. testes executados;
10. resultados dos testes;
11. estado de build;
12. estado de deploy;
13. validação pós-deploy, quando aplicável;
14. plano ou capacidade de rollback;
15. documentação atualizada;
16. riscos, limitações ou pendências restantes.

Se algo não puder ser confirmado, escreva explicitamente:

`não confirmado`

Nunca infira sucesso.

---

# 27. Padrão de excelência

Antes de concluir qualquer trabalho, faça uma revisão final como se a entrega fosse ser avaliada simultaneamente por:

* um engenheiro frontend sênior;
* um product designer;
* um especialista em acessibilidade;
* um engenheiro backend;
* um DBA PostgreSQL;
* um engenheiro de segurança;
* um SRE;
* e o usuário final.

Pergunte internamente:

**Está correto?**

**Está seguro?**

**Está simples?**

**Está coerente com a arquitetura?**

**Está visualmente refinado?**

**É intuitivo sem explicação?**

**Funciona em mobile e desktop?**

**Funciona por teclado?**

**Possui estados de erro e carregamento adequados?**

**Evita dependências e complexidade desnecessárias?**

**Sobrevive a concorrência e retry quando necessário?**

**Pode ser operado e revertido com segurança?**

**A documentação representa exatamente o que existe?**

Se uma resposta importante for "não", a entrega ainda não está pronta.

Se não houver evidência suficiente para responder, registre `não confirmado`.