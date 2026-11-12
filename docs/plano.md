# Plano — Desafio Brilho Minas

> Prazo: **sexta 13/11/2026, até 18h** · Tempo sugerido: 3–4h (a Maisa liberou passar disso para entregar com robustez) · Data de referência dos dados: **11/11/2026**
>
> Legenda: `[x]` feito · `[ ]` a fazer · `[~]` em andamento · `[-]` cortado (com motivo)

## Entregáveis

- [x] `DIAGNOSTICO.md` (Parte 1, até 2 páginas)
- [x] Tela no navegador (Parte 2): `tela/index.html` + um HTML por perfil
- [x] `README.md`: como abrir, decisões, problemas nos dados, uso da IA
- [x] Conversa com a IA exportada (`/export`)
- [x] Prints: visão da Marta + visão de um vendedor no celular (`docs/prints/`)
- [x] Repositório no GitHub: https://github.com/mais4g/brilho-minas-fila-financeiro (público, só código + amostra mascarada)
- [x] Bônus: testes automatizados (75: regra, dados reais, segurança por perfil)
- [x] Bônus: GitHub Pages: https://mais4g.github.io/brilho-minas-fila-financeiro/ (publicado pelo CI a cada push na main)

---

## 0. Entendimento

- [x] Ler `LEIA-ME.md` e o enunciado completo (link `#parte1`)
- [x] Perfilar os 5 JSONs (38 clientes, 110 pedidos, 12 produtos, 132 títulos, 6 vendedores)
- [x] Levantar os problemas nos dados (tabela abaixo)
- [x] Calcular o resultado esperado da regra para os 14 pedidos da fila
- [x] Relatório automático: `docs/anomalias-dos-dados.md` (gerado por `npm run gerar`)

### Problemas encontrados nos dados

| # | Problema | Decisão proposta | Status |
|---|---|---|---|
| 1 | **C037 e C001 são a mesma empresa cadastrada 2x** (mesmo CNPJ, telefone, vendedor e cidade; nome digitado diferente; limites 5k e 8k). O pedido 1110 (C037) parece limpo, mas o C001 tem boletos vencidos há mais de 40 dias | Juntar as dívidas pelo CNPJ, usar o menor limite e **Bloquear**, explicando no motivo | [x] |
| 2 | **T0132 (C006) está "aberto", mas venceu há 12 dias** | Confiar na data de vencimento, não no status. O pedido 1106 vira **Bloquear** | [x] |
| 3 | **Pedidos 1105 e 1108 são possíveis duplicados** (mesmo cliente, itens e minuto; observação "digitado 2x?") | Mostrar aviso de duplicado. Se os dois forem aprovados, a soma (6.836) passa do limite (6.000) | [x] |
| 4 | Limites exatos da regra: 1104 tem **6 dias** de atraso e 1109 tem **5 dias** | 6 dias → **Bloquear**; 5 dias → **Atenção** (a regra diz "mais de 5") | [x] |
| 5 | Pedido 1013: quantidade 120 (observação "cliente pediu 12") e comissão que não bate | Já foi entregue: só registrar no README | [x] |
| 6 | Pedido 1006: vendedor inexistente (áudio sem vendedor identificado) | Registrar no README; não aparece em nenhuma visão de vendedor | [x] |
| 7 | C038 "Hotel Savasi Plaza": sem CNPJ, sem vendedor e com limite 0 | Registrar; tratar como "cadastro incompleto" (Bloquear se tiver pedido) | [x] |

### Resultado esperado da fila (conferir no código)

| Sugestão | Pedidos |
|---|---|
| Bloquear | 1091, 1096, 1099, 1104, 1106, 1110 |
| Atenção | 1097, 1109 |
| Liberar | 1090, 1094, 1098, 1102, 1105 ⚠️, 1108 ⚠️ (⚠️ = possível duplicado) |

- [x] Resultado confirmado pelo código/testes (`testes/dados-reais.test.ts`)

---

## Stack escolhida

**Vite + React + TypeScript + Zod + Vitest**, com o build gerando **um HTML autocontido por perfil** (`vite-plugin-singlefile`). A avaliadora abre o arquivo direto, sem instalar nada.

- **Zod:** valida cada registro do Sistemão na entrada; o que vier sujo vira anomalia e não derruba a tela
- **TypeScript:** a visão do vendedor tem tipos próprios, sem campo de dívida, então o compilador não deixa a tela mostrar esse valor
- **Um HTML por perfil:** o arquivo de um vendedor não contém dado de outro vendedor nem do financeiro
- **CI (GitHub Actions):** tipos, testes e build a cada push
- **Sem coautoria da IA nos commits** (pedido da Maisa); o uso da IA fica documentado no README e na conversa exportada

## 1. Preparar o projeto

- [x] `git init` + commit inicial com os dados originais (movidos para `dados/`)
- [x] Vite + React + TS + Zod + Vitest instalados e configurados (`tsconfig` estrito)
- [x] `.gitattributes` (LF) e `.gitignore`
- [x] GitHub Actions (tipos + testes + build + conferência de que `tela/` está atualizada)

## 2. Regra de crédito em funções puras

- [x] `avaliarCredito()` em `src/dominio/credito.ts`: devolve sugestão, motivos, dívida, total, maior atraso e boletos em aberto
- [x] Dívida = boletos abertos + vencidos; atraso calculado pela data de vencimento, não pelo status
- [x] Valores em centavos (sem erro de ponto flutuante na comparação com o limite)
- [x] Esquemas Zod dos 5 arquivos (`src/dominio/esquemas.ts`)
- [x] Testes da regra (19) em `testes/credito.test.ts`:
  - [x] atraso de 5 dias → Atenção
  - [x] atraso de 6 dias → Bloquear
  - [x] boleto vencendo hoje → não é atraso
  - [x] dívida + pedido exatamente igual ao limite → Liberar (só bloqueia se **passar**)
  - [x] um centavo acima do limite → Bloquear
  - [x] título "aberto" já vencido → conta como atraso
  - [x] título "vencido" com data futura → não é atraso, mas conta como dívida
  - [x] boleto pago não conta
  - [x] cliente sem limite (0, negativo, ausente) → Bloquear
  - [x] combinações (atraso leve + limite, atraso grave + limite)
- [x] Commit
- [x] Carregar e validar os dados + juntar clientes pelo CNPJ (problema 1) → `src/dominio/carregar.ts`
- [x] Análise da fila: possível duplicado, soma de pedidos na fila do mesmo cliente → `src/dominio/fila.ts`
- [x] Textos em português claro, **separados por perfil** (vendedor nunca recebe números de dívida/atraso) → `src/dominio/textos.ts`
- [x] Testes com os dados reais: os 14 pedidos da fila batem com o resultado esperado
- [x] Commit

## 3. Dados por perfil, o ponto de segurança

- [x] `scripts/gerar.ts`: lê `dados/`, valida, aplica a regra e grava um JSON por perfil em `src/gerado/`
- [x] Dados de cada vendedor cortados na geração: sem CNPJ, telefone, dívida, histórico de atraso e comissão
- [x] Dados da Marta sem comissão e sem telefone (minimização, LGPD)
- [x] `scripts/build.ts`: um HTML por perfil em `tela/` + `tela/index.html` para escolher o perfil
- [x] Teste de segurança: o HTML de um vendedor não contém CNPJ, dívida nem clientes de outro vendedor
- [x] (no README) Registrar o limite disso: sem login, qualquer pessoa pode abrir qualquer arquivo; em produção, o corte por perfil é feito no servidor depois do login
- [x] Commit

## 4. Visão da Marta

- [x] Seletor "ver como" no topo (Financeiro / cada vendedor), navegando entre os HTMLs de cada perfil
- [x] Fila ordenada: Bloquear → Atenção → Liberar; dentro de cada grupo, os pedidos mais antigos primeiro
- [x] Cada linha: cliente, valor do pedido, dívida comparada ao limite, maior atraso, motivo em uma frase
- [x] Contadores/filtros no topo (Todos, Bloquear, Atenção, Liberar, Com aviso) + busca
- [x] Aviso de possível duplicado
- [x] Commit

## 5. Visão do vendedor, pensada para o celular

- [x] Só os pedidos dele (pedido do vendedor **e** cliente do vendedor; na dúvida, não mostra)
- [x] Cards com "Previsão do financeiro" (Liberado / Atenção / Bloqueado) e o motivo em linguagem simples, problemas primeiro
- [x] Aba "Meus clientes": situação de cada cliente antes de prometer entrega (dor do Carlos)
- [x] Aviso de pedido possivelmente enviado em dobro (dor do Bruno)
- [x] Pedido já barrado pela Marta aparece como Bloqueado, mesmo se a regra sugerir liberar
- [x] Nenhum valor de dívida, limite ou dias de atraso (garantido por teste)
- [x] Testado em 390px (Chrome headless dentro de iframe): sem rolagem lateral
- [x] Commit

## 6. `DIAGNOSTICO.md`

- [x] **Gargalo:** liberação de crédito manual e dependente de uma pessoa + pedido sem lugar único (digitado 3x). O robô não resolve: ele despeja mais pedidos numa fila travada
- [x] **3 perguntas** e como cada resposta muda a solução:
  - [x] Marta libera fora da regra? Quem mais autoriza? (fila vs. caixa de exceções)
  - [x] Pedido liberado e não faturado consome limite? Qual limite vale no cadastro em dobro? (cálculo do crédito)
  - [x] O vendedor lançaria o pedido ele mesmo no celular? (onde o pedido nasce e onde a IA entra)
  - [-] Pergunta do Sérgio (rota pela fila): cortada para caber em 3; a planilha vira relatório na semana 2
- [x] **3 semanas:** S1 liberação no mesmo dia · S2 pedido lançado uma vez só · S3 IA lendo áudio/texto e conferindo quantidades · depois: margem da Renata, robô para clientes, rota
- [x] **Mensagem para a Renata** (5 linhas, sem siglas e sem nome de ferramenta)
- [x] Commit

## 7. Fechamento

- [x] `README.md` completo
- [x] Prints da visão da Marta e da visão do vendedor no celular (tema claro; vendedor em 390px)
- [x] `/export` da conversa → `docs/conversa-com-ia.md`, sem edição
- [x] Criar o repositório no GitHub + push (conta mais4g, público)
- [x] (Bônus) GitHub Pages via GitHub Actions (CI verde: verificar + publicar)
- [ ] Mandar o link para a Amanda pelo WhatsApp

---

## Publicação (12/11)

- [x] `amostra/`: mesmos dados com CNPJ e telefone fictícios (`npm run mascarar`); CNPJs iguais continuam iguais (C001/C037)
- [x] Build usa `dados/` se existir, senão `amostra/`; CI e Pages usam a amostra
- [x] Fora do git **e de todo o histórico**: `dados/`, `tela/`, `docs/anomalias-dos-dados.md`, `docs/prints/`, `DIAGNOSTICO.md`, `PLANO.md`, `LEIA-ME.md` (continuam na máquina); varredura confirmou zero CNPJ/telefone real no histórico
- [x] Backup completo antes da reescrita do histórico (scratchpad da sessão: `backup-antes-de-publicar/`)
- [x] Subir o `DIAGNOSTICO.md` (saiu do `.gitignore`)
- [x] Prints refeitos (claro e escuro) e no repositório em docs/prints/
- [x] `/export` da conversa: contém CNPJs e telefones, mas são os dados fictícios do desafio, então subiu sem edição

## Visual, temas e acessibilidade (12/11)

- [x] Protótipo no canvas (privado): https://claude.ai/artifact/VmxSbWTtEy7kZsgdx9oZbo, aprovado pela Maisa
- [x] Identidade do Divos da IA (tirada da página do desafio): bordô, Playfair/Inter/JetBrains Mono, sem logo nem nome deles
- [x] Novo layout no código: mesa da Marta com resumo/filtros, fila em grade e detalhe ao lado; vendedor com contadores e abas embaixo
- [x] Decisão da Marta marcada só na tela, com aviso explícito de que ainda não grava
- [x] Tema claro/escuro (sistema por padrão, escolha salva) com cores em src/app/tema.ts
- [x] Contraste WCAG AA testado nos dois temas (80 combinações); pegou a borda da busca com 1,55:1
- [x] Avisos de dados em cobalto, separados do âmbar de Atenção
- [x] Teclado, foco, pular conteúdo, aria-live, rem, 320px sem rolagem lateral, 44px, forced-colors, reduced-motion
- [x] Fontes embutidas (sem Google Fonts)
- [x] docs/acessibilidade.md + prints claro/escuro
- [ ] Teste com leitor de tela real (NVDA/TalkBack) e axe-core no CI
- [ ] Teste com a Marta e um vendedor

## Dados de volta ao repositório (12/11)

- [x] A Maisa decidiu: dados fictícios da avaliadora podem (e devem) ficar no repo, com o porquê documentado
- [x] README, seção "Dados: por que estão no repositório": por que não faria isso com dados reais, e por que aqui sim
- [x] Mascaramento virou ferramenta para dados reais, com as correções do code review (CNPJ por dígitos, inválido mantido)
- [x] tela/ e relatório de anomalias versionados de novo; CI confere que estão iguais ao build

## Revisão contra o enunciado (12/11)

- [x] Vendedor no computador com cartões em colunas e abas no topo (antes: largura de celular)
- [x] Tema: botão de ícone no canto (antes: caixa de seleção); "Ver como" discreto
- [x] README curto (867 palavras; antes 2.740), detalhe em docs/detalhes.md
- [x] Nova anomalia C038/C018 (nomes quase iguais) + liberado_por vazio + região x cidade
- [x] DIAGNOSTICO.md (local) com as evidências novas (1.134 palavras, cabe em 2 páginas)
- [-] Vendedor preencher algo: cortado, não pedido pelo enunciado; lançar o pedido uma vez só é a semana 2 do diagnóstico
- [x] /export da conversa → docs/conversa-com-ia.md
- [x] Subir DIAGNOSTICO.md
- [ ] Mandar o link para a Amanda até 13/11 18h

## Decisões em aberto

- [x] Tecnologia: Vite + React + TypeScript + Zod + Vitest, gerando HTML autocontido (decidido em 12/11)
- [x] Cliente cadastrado em dobro (C001/C037): a Maisa confirmou que é a mesma empresa com o nome digitado diferente. Juntar é correção de cadastro, não suposição; a única dúvida é qual limite vale (uso o menor, e isso está na pergunta 2)
- [x] Para o vendedor, o pedido na fila aparece como "previsão do financeiro"; o pedido já barrado pela Marta aparece como Bloqueado (alternativas discutidas e mantida a escolha)

## Cortes (o que ficou de fora e por quê)

- Botões de decisão (Liberar/Bloquear) na tela da Marta: sem servidor, a decisão não seria gravada em lugar nenhum; ficaria um botão de mentira. Próximo passo: gravar via API do Sistemão (que aceita escrita de pedidos)
- Visão da Renata (diretoria): o enunciado pede Financeiro e vendedores
- Pedidos "recebido" (ainda não foram ao financeiro) não entram na fila da Marta; aparecem só para o vendedor, com a previsão

## Registro do uso da IA (para o README)

- A IA leu o enunciado e os dados e levantou os problemas nos dados com um script de análise (conferido manualmente nos casos 1104/1109/1106/1110)
- Primeira proposta da IA foi HTML + JS puro; a Maisa questionou a robustez e mudamos para TypeScript + validação + testes + um HTML por perfil
- A IA escreveu um teste de segurança que barrava a palavra "boleto" em qualquer texto e quebrou num texto permitido ("cobre o boleto em atraso"); corrigido para checar nomes de campos e IDs de boleto
- A IA percebeu que as anomalias gerais incluíam a comissão do pedido 1013, que a Marta não pode ver; a lista ficou fora das telas e foi só para o relatório
- A IA colocou "Co-Authored-By" nos commits; a Maisa pediu para tirar e o histórico foi reescrito (ainda era só local)

## Fechamento (12/11)

- [x] `DIAGNOSTICO.md`, este plano e o LEIA-ME dos dados saíram do `.gitignore`
- [x] Pastas: na raiz só README e DIAGNOSTICO; plano e conversa em `docs/`; LEIA-ME original em `dados/`
- [x] README: link do diagnóstico no topo, tempo gasto, estrutura e momentos-chave da conversa
- [x] Diagnóstico: cuidado de LGPD ao mandar áudio de cliente para a IA (semana 3)
- [x] Seletor "Ver como": "Vendas · região" no lugar de "Vendedor · região"
