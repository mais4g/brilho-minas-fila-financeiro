# Brilho Minas · Fila do financeiro

Protótipo da fila de liberação de pedidos da Brilho Minas. A regra de crédito da Marta é aplicada sobre os dados do Sistemão e há uma tela para cada perfil: o **financeiro** vê a fila completa com sugestão e motivo, e cada **vendedor** vê só os próprios pedidos e clientes no celular, sem valores de dívida.

**Abrir a tela:** https://mais4g.github.io/brilho-minas-fila-financeiro/

| Marta (financeiro) | Vendedora no celular |
|---|---|
| ![Fila da Marta, tema claro](docs/prints/marta-claro.png) | ![Pedidos da Patrícia, tema claro](docs/prints/vendedor-pedidos-claro.png) |
| ![Fila da Marta, tema escuro](docs/prints/marta-escuro.png) | ![Pedidos da Patrícia, tema escuro](docs/prints/vendedor-pedidos-escuro.png) |

## Como abrir

- **Pelo link acima**, ou
- **Sem internet:** abra `tela/index.html` deste repositório com dois cliques. Cada página é um HTML único, com tudo dentro (inclusive as fontes); não precisa de servidor nem de instalar nada.

Escolha quem está olhando. Dentro de qualquer página, o seletor **"Ver como"** no topo troca de perfil, e o seletor **"Tema"** troca entre claro, escuro e o do sistema.

| Página | Quem |
|---|---|
| `tela/financeiro.html` | Marta (financeiro) |
| `tela/vendedor-v01.html` … `vendedor-v06.html` | cada um dos 6 vendedores (`#clientes` no fim abre direto a aba de clientes) |

### Para quem for mexer no código

Precisa do Node 24 ou mais recente.

```bash
npm ci
npm test            # 160 testes: regra de crédito, dados reais, segurança por perfil, contraste dos temas
npm run build       # gera tela/ (um HTML por perfil) e docs/anomalias-dos-dados.md
npm run dev         # servidor local com recarga (perfil financeiro; PERFIL=V01 npm run dev para um vendedor)
npm run check       # tipos + testes + build, o mesmo que o CI roda
```

O CI (GitHub Actions) roda tipos, testes e build a cada push, confere se a pasta `tela/` do repositório está igual ao build, e publica no GitHub Pages a cada push na `main`.

## Dados: por que estão no repositório

**Num projeto real, dados de clientes não iriam para o repositório.** CNPJ, telefone e histórico de pagamento são dados pessoais e de negócio (LGPD). Um repositório:
- é copiado para cada máquina que o clona;
- guarda tudo no histórico para sempre (apagar depois não resolve);
- costuma ter mais gente com acesso do que o necessário.

O certo seria ler os dados direto da API do Sistemão, com credencial, e nunca versioná-los. Também não seria publicar a tela num endereço aberto, como o Pages.

**Aqui os dados estão no repositório, de propósito:**
- **São fictícios.** A Brilho Minas é uma empresa inventada, e os arquivos foram entregues pela própria avaliadora junto com o desafio.
- **Assim os resultados batem com os dela.** Com os arquivos originais, quem avaliar vê na tela e nos testes exatamente os mesmos números dos JSONs que tem em mãos (o pedido 1110, os 72 dias de atraso do C001, o limite de R$ 6.000 da Lavanderia).
- **Dá para reproduzir tudo:** `npm test` e `npm run build` funcionam em qualquer máquina, sem pedir nada a ninguém.

**Cheguei a fazer do outro jeito.** Numa versão anterior, os dados ficaram fora do git e do histórico, e o CI usava uma cópia com CNPJ e telefone mascarados. A revisão de código mostrou que isso não bastava: a cópia mantinha nome, cidade e histórico de pagamento, e pelo nome da empresa dá para achar o CNPJ em qualquer consulta pública. Mascarar de verdade exigiria trocar também a razão social, e aí a tela deixaria de bater com os arquivos da avaliadora. Como os dados são fictícios, a troca não protegeria ninguém e atrapalharia a avaliação. Voltei aos originais e documentei o motivo aqui.

**A ferramenta ficou** ([`scripts/mascarar.ts`](scripts/mascarar.ts), `npm run mascarar`, com teste) para o dia em que houver dados reais. Ela troca CNPJ e telefone por valores fictícios de forma não reversível, mantém a duplicidade de cadastro detectável e não esconde CNPJ inválido. O próprio arquivo avisa o que ela **não** faz: trocar nome e cidade.

**O que continua valendo mesmo com dados fictícios:** cada perfil só recebe o que pode ver (próxima seção e [`testes/seguranca.test.ts`](testes/seguranca.test.ts)), e telefone não vai para nenhuma tela.

## O que a tela faz

**Marta (financeiro)**
- Mostra os 14 pedidos "aguardando liberação" agrupados pela sugestão: **Bloquear** primeiro, porque é o que exige ação dela; depois **Atenção**; depois **Liberar**, que é só conferir. Dentro de cada grupo, o pedido mais antigo vem primeiro, porque é o que está esperando há mais tempo.
- Cada pedido traz o motivo em uma frase ("Boleto vencido há 6 dias (a tolerância é de 5 dias)") e uma barra com dívida + pedido contra o limite.
- Avisos em azul (cor separada das cores de status) para o que a regra não cobre, mas ela precisa saber: cadastro duplicado, pedido possivelmente em dobro, boleto com status errado no Sistemão, e o caso em que liberar todos os pedidos do mesmo cliente estoura o limite.
- Cartões de resumo no topo, com quantidade e valor parado, que também filtram a lista. Busca por cliente, pedido ou vendedor.
- Ao clicar num pedido, o detalhe abre ao lado: motivos, conta de crédito, avisos, boletos e itens.
- **Botões para marcar a decisão**, e o próximo pedido pendente abre sozinho. Por enquanto a marcação fica só na tela (some ao recarregar), e a tela diz isso. Gravar no Sistemão é o próximo passo.
- **Não mostra comissão** de vendedor, que ela não pode ver.

**Vendedor (celular)**
- Só os próprios pedidos, com o que tem problema primeiro. Pedidos na fila mostram a **previsão** do financeiro ("Deve ser liberado", "Deve sair · cobrar cliente", "Deve ser bloqueado") e o que fazer: "O cliente tem um boleto em atraso. O pedido pode seguir, mas cobre o cliente."
- A aba **"Meus clientes"** mostra a situação de cada cliente antes de prometer entrega, que é a dor do Carlos. Dá para abrir direto em `vendedor-v01.html#clientes`.
- Avisa quando um pedido parece ter sido enviado duas vezes, que é a dor do Bruno.
- **Nenhum valor de dívida, limite, dias de atraso, CNPJ ou telefone.**

## Visual e acessibilidade

- **Identidade visual:** a do Divos da IA. Bordô, fundo levemente rosado, títulos em Playfair Display, texto em Inter e números em JetBrains Mono. Ela foi validada antes num protótipo, à parte do código.
- **Tema claro e escuro:** segue o sistema por padrão e dá para fixar um dos dois pelo seletor.
- **Acessibilidade, WCAG 2.2 AA como referência:**
  - contraste testado automaticamente nos dois temas, em 80 combinações de cor;
  - o status nunca depende só da cor;
  - tudo funciona pelo teclado, com foco visível;
  - estrutura e anúncios para leitor de tela;
  - tamanhos que acompanham o zoom e a fonte do navegador, sem rolagem lateral em 320px;
  - alvos de toque com pelo menos 44px;
  - suporte ao modo de alto contraste do Windows.

O detalhe de cada item, o que foi testado e como, e o que ainda falta estão em **[`docs/acessibilidade.md`](docs/acessibilidade.md)**.

## A regra de crédito

Fica em [`src/dominio/credito.ts`](src/dominio/credito.ts), como uma função pura, testada em [`testes/credito.test.ts`](testes/credito.test.ts).

| Sugestão | Quando |
|---|---|
| Bloquear | algum boleto vencido há **mais de 5 dias**, **ou** dívida (boletos abertos + vencidos) + pedido **passa** do limite, **ou** cliente sem limite cadastrado |
| Atenção | algum boleto vencido há 1 a 5 dias, sem nenhum motivo de bloqueio |
| Liberar | nenhum dos casos acima |

**Como interpretei os casos-limite** (cada um tem teste):
- **5 dias de atraso** dá Atenção e **6 dias** dá Bloquear, porque a regra diz "mais de 5". Nos dados, são os pedidos 1109 e 1104.
- **Dívida + pedido exatamente igual ao limite** libera, porque "passa do limite" é estritamente maior.
- **Boleto vencendo hoje** (11/11) ainda não está atrasado.
- **"Vencido" é decidido pela data de vencimento, não pelo campo status.** Um boleto "aberto" que venceu há 12 dias está vencido.
- Valores comparados **em centavos**, para não errar no centavo por arredondamento.
- **Atraso leve + acima do limite** dá Bloquear (o bloqueio prevalece), e o motivo mostra os dois quando houver.
- A data de referência é fixa em **11/11/2026** (a data do LEIA-ME), em [`src/dominio/config.ts`](src/dominio/config.ts).

## Decisões e por quê

- **Um HTML por perfil, em vez de uma página só com todos os dados.** Uma página única que filtra na tela teria a dívida de todos os clientes dentro do arquivo do vendedor, visível para quem abrir o código-fonte. Aqui, o build gera um arquivo por perfil, e o do vendedor **só contém os dados dele**. Isso é verificado por teste ([`testes/seguranca.test.ts`](testes/seguranca.test.ts)), que confere a lista exata de campos permitidos, e por uma checagem no build.
- **Limite honesto disso:** sem login, qualquer pessoa pode abrir qualquer arquivo. Na versão real, cada pessoa entra com o próprio acesso e o servidor só entrega a projeção do perfil dela. As funções `projetarFinanceiro` e `projetarVendedor` ([`src/dominio/visoes.ts`](src/dominio/visoes.ts)) são exatamente o que esse servidor usaria.
- **Mínimo de dados.** Telefone não vai para nenhuma tela, porque nenhuma precisa dele (LGPD). O CNPJ só aparece para o financeiro.
- **Validação na entrada.** Cada registro do Sistemão passa por um esquema (Zod). O que vier com formato quebrado é registrado como anomalia e ignorado, em vez de derrubar a tela. Isso também tem teste.
- **Cliente cadastrado em dobro é tratado como um cliente só.** C001 e C037 são a mesma empresa: mesmo CNPJ, telefone, vendedor e cidade, com o nome digitado de outro jeito. A dívida dos dois cadastros soma e a Marta vê um aviso explicando. A única coisa que não dá para saber pelos dados é **qual dos dois limites vale** (R$ 8.000 ou R$ 5.000). Até alguém confirmar, uso o menor, e isso virou uma das perguntas do diagnóstico. Hoje não faz diferença: o 1110 bloqueia pelo atraso com qualquer um dos dois.
- **Para o vendedor, é "previsão" enquanto a Marta não decide.** Assim ele não promete entrega com base numa sugestão. E um pedido que a Marta **já barrou** aparece como Bloqueado, mesmo que a regra hoje sugira liberar, porque a decisão dela vale mais.
- **Os textos do vendedor saem de códigos, não do texto da Marta.** O vendedor recebe "pagamento atrasado", e nunca "43 dias" ou "R$ 4.195,64". Um teste garante que não há números nesses textos.
- **Valor do pedido:** se o valor informado não bater com a soma dos itens, a regra usa o maior e avisa. Nos dados atuais, todos batem.
- **Stack: TypeScript + React + Vite + Zod + Vitest**, empacotado em HTML autocontido. A primeira ideia foi HTML + JavaScript puro, mas preferi pagar um pouco mais de configuração para ter tipos (a visão do vendedor não tem campo de dívida, então a tela não consegue mostrar), validação e testes. O CI no GitHub roda tipos, testes e build a cada push.

## O que encontrei de estranho nos dados

O relatório completo é gerado automaticamente em [`docs/anomalias-dos-dados.md`](docs/anomalias-dos-dados.md) a cada `npm run build`. Os principais casos:

| O que | Impacto | O que fiz |
|---|---|---|
| **O mesmo restaurante cadastrado duas vezes, com o nome digitado de outro jeito:** C001 "Restaurante Sabor de Minas" e C037 "RESTAURANTE SABOR DE MINAS LTDA" têm o mesmo CNPJ, telefone, vendedor e cidade, mas limites diferentes (R$ 8.000 e R$ 5.000) | O pedido 1110 está no cadastro novo (C037), que não tem boleto e parece limpo; a dívida, com atraso de até 72 dias, está no C001 | Juntei os dois: **1110 vira Bloquear**, com aviso de cadastro em dobro. É o mesmo problema de redigitação da operação, agora no cadastro de clientes |
| **Boleto T0132 (C006) está "aberto", mas venceu em 30/10** | O pedido 1106 pareceria liberado | Vale a data: **1106 vira Bloquear**, com aviso de status desatualizado |
| **Pedidos 1105 e 1108:** mesmo cliente, mesmos itens, mesmo minuto (11:51); o 1108 tem a observação "digitado 2x? conferir" | Cada um sozinho cabe no limite; **os dois juntos passam** (R$ 6.836 de R$ 6.000) | Os dois ficam como Liberar, mas com aviso de duplicidade e de limite somado, para a Marta e para a vendedora |
| **C038 "Hotel Savasi Plaza":** sem CNPJ, sem vendedor e com limite 0 | Não tem pedido na fila hoje | Registrado; qualquer pedido dele seria Bloquear (sem limite) e não aparece para nenhum vendedor |
| **Pedido 1006** sem vendedor ("pedido veio por áudio, vendedor não identificado") | Já entregue | Registrado; não aparece para nenhum vendedor |
| **Pedido 1013:** 120 sacos de lixo com a observação "cliente pediu 12, conferir", e comissão de R$ 33,95 quando 3% daria R$ 206,10 | Já entregue | Registrado. É o tipo de erro de digitação (12%) que vale atacar com uma conferência automática de quantidades |

## O que ficou de fora

- **Gravar a decisão da Marta.** Os botões marcam a decisão só na tela, e a tela avisa isso. Gravar no Sistemão (a API aceita escrita de pedidos) e avisar o vendedor é o próximo passo.
- **Teste com leitor de tela real e com quem usa** (Marta e um vendedor no celular). Ver [`docs/acessibilidade.md`](docs/acessibilidade.md#o-que-ainda-falta).
- **Visão da Renata (diretoria).** O enunciado pedia financeiro e vendedores.
- **Pedidos "recebido"** (que ainda não foram ao financeiro) não entram na fila da Marta. Aparecem só para o vendedor, já com a previsão.
- **Atualização em tempo real.** Os dados são uma foto de 11/11; para atualizar, basta rodar `npm run build` com os novos JSONs em `dados/`.

## Como usei a IA

Usei o Claude Code do começo ao fim. A conversa exportada vai ficar em `docs/conversa-com-ia.md`.

**Onde ajudou**
- Leu o enunciado e escreveu um script para varrer os 5 arquivos atrás de inconsistências. Achou o CNPJ duplicado, o boleto com status errado e os pedidos em dobro antes de qualquer linha da tela.
- Escreveu a regra, os testes de casos-limite e as telas, e conferiu o visual em 390px com o Chrome em modo headless.
- Montou o deploy no GitHub Pages e, quando pedi um visual novo, um protótipo navegável antes de mexer no código, com a identidade do Divos da IA tirada da página do desafio.
- Fez o tema escuro e a acessibilidade, com um teste de contraste que pegou um problema real: a borda do campo de busca tinha 1,55:1 e quase sumia.

**Onde precisei corrigir ou direcionar**
- A primeira proposta foi HTML + JavaScript puro. Questionei se dava para ter mais robustez, e mudamos para TypeScript, validação, testes e um HTML por perfil.
- Ela colocou "Co-Authored-By" nos commits; pedi para tirar.
- Um teste de segurança escrito por ela barrava a palavra "boleto" em qualquer texto e quebrou num texto permitido ("cobre o boleto em atraso"). Foi corrigido para checar nomes de campos e identificadores de boleto.
- Ela mesma notou que a lista geral de anomalias tinha a comissão do pedido 1013, que a Marta não pode ver. A lista ficou fora das telas e foi só para o relatório.
- Os casos de borda (1104, 1109, 1106, 1110) foram calculados à parte, antes do código, e viraram testes com o resultado esperado. Assim, o código não "se confere sozinho".
- Ela tratou C001 e C037 como uma suposição ("o limite é por CNPJ?"). Mostrei que são a mesma empresa com o nome digitado diferente, e o texto da tela, o relatório e o diagnóstico foram ajustados.
- Pedi para esconder os dados sensíveis, e ela tirou os dados do repositório e montou uma cópia mascarada. Rodei uma revisão de código (`/code-review`), que mostrou que a máscara deixava nome e histórico expostos. Como os dados são fictícios, decidi voltar aos originais e documentar o porquê (seção "Dados").
- No protótipo, os avisos de dados usavam a mesma cor do status "Atenção". Isso foi trocado na versão final: cada cor tem um papel só.

## Estrutura

```
src/dominio/        regra e dados: esquemas, carregar, credito, fila, textos, visoes
src/app/            telas (React)
scripts/            gerar.ts (dados por perfil + relatório), build.ts (um HTML por perfil), mascarar.ts (para dados reais)
dados/              JSONs do Sistemão (fictícios, entregues com o desafio)
src/app/tema.ts     cores dos temas claro e escuro (fonte única, com contraste testado)
testes/             regra, dados reais, segurança por perfil, contraste, mascaramento
tela/               resultado do build: é isto que se abre no navegador (também publicado no Pages)
docs/               acessibilidade, relatório de anomalias e prints
```
