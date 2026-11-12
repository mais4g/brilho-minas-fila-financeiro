 ▐▛███▛█   Claude Code v2.1.283
▝▜██████▀  Opus 5.5 · Claude Team
 ▝▝   ▝▝   C:\projetos\dados-brilho-minas


❯ leia o readme e faça um plano                                                 

  Read 1 file, listed 1 directory (ctrl+o to expand)

● O LEIA-ME aponta para um artifact (#parte1), que provavelmente traz o
  enunciado da tarefa. Vou lê-lo.

● Artifact(read https://claude.ai/artifact/WXhYTg4SUx82CaeHaLmx65)
  ⎿  Received 84.4KB (200 OK)

● Vou ler o enunciado completo para pegar os detalhes da regra (casos-limite
  importam na avaliação).

  Ran 1 shell command (ctrl+o to expand)

● Agora um perfil rápido dos dados para o plano já considerar as "sujeiras"
  reais.

  Ran 2 shell commands (ctrl+o to expand)

● Li o LEIA-ME, o enunciado completo (o link #parte1) e rodei um perfil rápido
  dos 5 JSONs. Segue o plano.

  O que é a tarefa

  É um teste de seleção da Divos da IA. O prazo é sexta, 13/11, até 18h, e o
  tempo sugerido é de no máximo 3 a 4 horas.

  - Parte 1, DIAGNOSTICO.md (até 2 páginas): qual é o gargalo de verdade e se o
    robô que a Renata pediu resolve; 3 perguntas a fazer antes de programar; o
    que entra nas 3 primeiras semanas e o que fica para depois; e uma mensagem
    de WhatsApp de até 5 linhas para a Renata.
  - Parte 2, tela no navegador: uma fila "aguardando liberação" com a sugestão
    Liberar, Atenção ou Bloquear e o motivo em português claro. Um seletor "ver
    como" no topo troca entre a visão Financeiro (Marta) e a visão de cada
    vendedor. A visão do vendedor tem que funcionar no celular e não pode
    mostrar valores de dívida.
  - Entrega: repositório no GitHub com commits feitos aos poucos, README, a
    conversa com a IA (/export) e prints. Testes e um link publicado contam como
    bônus.

  O que já achei nos dados (vai para o README)

  #: 1
  Problema: C037 tem o mesmo CNPJ do C001 (mesmo restaurante, cadastrado duas
  vezes, com limites diferentes: 5k e 8k). O pedido 1110 é do C037, que parece
  "limpo", mas o C001 tem boletos vencidos há mais de 40 dias.
  O que pretendo fazer: Juntar as dívidas pelo CNPJ e usar o menor limite.
  Resultado: Bloquear, com o motivo explicando o cadastro duplicado.
  ────────────────────────────────────────
  #: 2
  Problema: T0132 (C006) está como "aberto", mas venceu há 12 dias.
  O que pretendo fazer: Confiar na data de vencimento, não no status. O pedido
  1106 vira Bloquear.
  ────────────────────────────────────────
  #: 3
  Problema: Os pedidos 1105 e 1108 parecem o mesmo pedido digitado 2 vezes
  (mesmo
  cliente, mesmos itens, mesmo minuto; a observação diz "digitado 2x?").
  O que pretendo fazer: Mostrar um aviso de "possível duplicado". Se os dois
  forem aprovados, a soma (6.836) passa do limite de 6.000.
  ────────────────────────────────────────
  #: 4
  Problema: Limites exatos da regra: 1104 tem atraso de 6 dias e 1109 tem atraso

  de 5 dias.
  O que pretendo fazer: 6 dias dá Bloquear. 5 dias dá Atenção, porque a regra
  diz
  "mais de 5" para bloquear. Os dois viram teste.
  ────────────────────────────────────────
  #: 5
  Problema: Pedido 1013: quantidade 120 (a observação diz "cliente pediu 12"), e

  a comissão não bate com o valor.
  O que pretendo fazer: Já foi entregue, então só registro no README.
  ────────────────────────────────────────
  #: 6
  Problema: Pedido 1006: vendedor que não existe (áudio sem vendedor
  identificado).
  O que pretendo fazer: Registro no README. Também não aparece em nenhuma visão
  de vendedor.
  ────────────────────────────────────────
  #: 7
  Problema: C038 "Hotel Savasi Plaza": sem CNPJ, sem vendedor e com limite 0.
  Não
  tem pedido na fila.
  O que pretendo fazer: Registro no README e trato como "cadastro incompleto",
  que vira Bloquear se aparecer algum pedido.

  Resultado esperado da regra nos 14 pedidos da fila (vou confirmar no código):

  - Bloquear: 1091, 1096, 1099, 1104, 1106, 1110
  - Atenção: 1097, 1109
  - Liberar: 1090, 1094, 1098, 1102, 1105 e 1108, os dois últimos com o aviso de
    duplicado

  Plano de execução (cerca de 3h30)

  1. Preparar o projeto (10 min)
  - git init e um primeiro commit com os dados originais.
  - Criar a estrutura: index.html, credito.js (só a regra), gerar-dados e
    testes/.

  2. Regra de crédito em funções puras (40 min)
  - avaliarPedido(pedido, cliente, titulos, dataRef) devolve {sugestao, 
    motivos[], alertas[]}.
  - Dívida = boletos abertos + vencidos. O atraso é calculado pela data de
    vencimento, não pelo status que vem no dado.
  - A data de referência é fixa: 11/11/2026.
  - Testes com node --test cobrindo 5 e 6 dias de atraso, dívida + pedido
    exatamente igual ao limite, o caso do CNPJ duplicado e o status "aberto" já
    vencido.
  - Commit.

  3. Dados por perfil, o ponto de segurança (30 min)
  - Um HTML que abre direto do arquivo não consegue fazer fetch dos JSONs. Por
    isso, um script pequeno gera os dados já embutidos na página.
  - Os dados de cada vendedor saem já cortados na geração: sem CNPJ, sem
    telefone, sem dívida e sem comissão.
  - A visão da Marta não mostra comissão.
  - No README, deixo claro o limite disso: sem servidor, quem abre a página
    consegue ver os dados embutidos nela. Em produção, o corte por perfil
    precisa ser feito no servidor.
  - Commit.

  4. Visão da Marta (50 min)
  - A fila vem ordenada por "precisa de decisão": Bloquear primeiro, depois
    Atenção, depois Liberar, e dentro de cada grupo os pedidos mais antigos
    primeiro.
  - Cada linha mostra o cliente, o valor do pedido, a dívida comparada ao
    limite, o maior atraso e o motivo em uma frase.
  - Contadores no topo e o aviso de duplicado.
  - Commit.

  5. Visão do vendedor, pensada para o celular (40 min)
  - Cards só com os pedidos dele: o status com cor e um texto simples, por
    exemplo "Liberado", "Liberado — cobre o boleto em atraso com o cliente" ou
    "Travado no financeiro — cliente com pendência".
  - Sem nenhum valor de dívida.
  - Commit.

  6. DIAGNOSTICO.md (40 min)
  - Gargalo: a liberação de crédito é manual e depende de uma pessoa (26 horas,
    40 perguntas por dia para a Marta), e o pedido é digitado 3 vezes sem um
    registro único. O robô atende o cliente, mas não resolve nenhum dos dois
    problemas: ele colocaria mais pedidos numa fila que já está travada.
  - Perguntas: a regra da Marta tem exceções informais? O CNPJ é a mesma empresa
    ou são filiais? O Sérgio poderia usar a fila em vez da planilha?
  - 3 semanas:
    - Semana 1: regra de crédito automática e fila do financeiro.
    - Semana 2: o vendedor consulta o status sozinho, e o pedido é lançado uma
      vez só, gravando direto no Sistemão.
    - Semana 3: a IA entra para transformar áudio e texto em rascunho de pedido,
      sempre com conferência humana.
    - Depois: robô falando com o cliente e painel de margem para a Renata.
  - Mensagem para a Renata: até 5 linhas.

  7. Fechamento (30 min)
  - README com: como abrir, decisões, problemas nos dados e uso da IA.
  - Prints da visão da Marta e da visão do vendedor no celular.
  - /export da conversa.
  - Push e, se der tempo, GitHub Pages.

  Pontos de decisão (vou seguir com estas escolhas se você não preferir outras)

  1. Tecnologia: HTML + JavaScript puro, sem build. É o mais simples de abrir.
  2. Cadastro duplicado pelo CNPJ: juntar as dívidas e bloquear. A alternativa
     seria só avisar e deixar a Marta decidir.
  3. Perguntar à Amanda: você pode mandar no WhatsApp a pergunta sobre o CNPJ
     duplicado ("perguntar também conta"), ou seguimos com a suposição
     registrada no README.

  Posso começar pelos passos 1 e 2 (regra de crédito com testes)?

✻ Cooked for 1m 34s · done 11:21 AM

❯ tranforme tudo num md onde voce vai marcando o que foi feito ou nao           

● Write(PLANO.md)
  ⎿  Wrote 136 lines to PLANO.md
       1 # Plano — Desafio Brilho Minas
       2 
       3 > Prazo: **sexta 13/11/2026, até 18h** · Tempo sugerido: **3–4h*
       4 >
       5 > Legenda: `[x]` feito · `[ ]` a fazer · `[~]` em andamento · `[
         -]` cortado (com motivo)
       6 
       8 
       9 - [ ] `DIAGNOSTICO.md` (Parte 1, até 2 páginas)
      10 - [ ] Tela no navegador (Parte 2): `index.html`
     … +173 lines (ctrl+o to expand)

  Wrote 2 memories (ctrl+o to expand)

● Criei o PLANO.md na raiz do projeto, com tudo o que planejamos em formato de
  checklist:

  - [x] feito
  - [ ] a fazer
  - [~] em andamento
  - [-] cortado, com o motivo

  Já está marcado como feito: a etapa 0, ou seja, ler o LEIA-ME e o enunciado,
  analisar os dados, levantar os 7 problemas nos dados e calcular o resultado
  esperado da fila.

  O arquivo também tem:
  - a lista de entregáveis no topo;
  - uma tabela com os problemas nos dados e uma coluna de status para cada um;
  - as etapas de 1 a 7 quebradas em tarefas pequenas, cada uma com o seu commit;
  - as decisões que ainda estão em aberto;
  - duas seções para preencher durante o trabalho: Cortes e Registro do uso da 
    IA. As duas vão alimentar o README depois.

  Vou atualizar o arquivo a cada etapa concluída. Posso começar pelas etapas 1 e
  2 (preparar o projeto e escrever a regra de crédito com testes)?

✻ Sautéed for 36s · done 11:22 AM

❯ o padrao é realmente html e js? nao tem como criar uma robustez?              

● Não, HTML com JS puro não é obrigatório. O enunciado deixa a tecnologia livre
  ("HTML com JavaScript, um script que gera a página, React, o que você
  domina"). A única restrição real é que a avaliadora consiga abrir sem instalar
  nada complicado. Eu tinha proposto HTML + JS só por ser o caminho mais curto,
  não por ser o padrão.

  Dá para ter robustez sem quebrar essa restrição. O ponto é que robustez aqui
  vem de onde ficam as garantias, não do framework.

  Onde a robustez realmente conta neste teste

  ┌──────────────────┬──────────────────────────────────────────────────────┐
  │  Risco avaliado  │               O que protege de verdade               │
  ├──────────────────┼──────────────────────────────────────────────────────┤
  │ Regra de crédito │ TypeScript + testes automatizados (Vitest) sobre     │
  │  errada nos      │ funções puras                                        │
  │ casos de borda   │                                                      │
  ├──────────────────┼──────────────────────────────────────────────────────┤
  │ Dado sujo do     │ Validação na entrada (Zod): cada registro é checado, │
  │ Sistemão         │  e o inválido vira um aviso em vez de travar a tela  │
  │ quebrando a tela │                                                      │
  ├──────────────────┼──────────────────────────────────────────────────────┤
  │ Vendedor vendo   │ Dados de cada perfil gerados já cortados, com tipos  │
  │ dado que não     │ diferentes por perfil (PedidoVisaoVendedor não tem   │
  │ pode             │ campo de dívida, então o compilador impede mostrar   │
  │                  │ esse valor)                                          │
  ├──────────────────┼──────────────────────────────────────────────────────┤
  │ "Funciona na     │ GitHub Actions rodando tipos e testes a cada push    │
  │ minha máquina"   │                                                      │
  ├──────────────────┼──────────────────────────────────────────────────────┤
  │ Avaliadora       │ Build gerando um único index.html autocontido (Vite  │
  │ conseguir abrir  │ + vite-plugin-singlefile), versionado no repositório │
  │                  │  e publicado no GitHub Pages                         │
  └──────────────────┴──────────────────────────────────────────────────────┘

  Minha recomendação

  Vite + TypeScript + Vitest + Zod, gerando um HTML único. A interface pode ser
  em React, se você domina, ou em TypeScript puro, se não. Com só duas telas,
  React ajuda pouco e custa tempo de configuração.

  O custo é de uns 30 a 40 minutos a mais de configuração e CI. Para caber nas 4
  horas, eu cortaria o GitHub Pages ou deixaria o visual mais simples.

  Um cuidado: o enunciado diz "algo pequeno e bem resolvido vale mais que algo
  grande e frágil". Por isso eu não colocaria Next.js, back-end, banco de dados
  nem monorepo. Isso seria complexidade, não robustez, e contaria contra no
  critério "saber cortar".

  Uma pergunta para fechar: você domina React?
  - Sim: vou de Vite + React + TypeScript.
  - Não: vou de Vite + TypeScript puro.

  Nos dois casos ficam Zod, Vitest, CI e o HTML único. Assim que você responder,
  atualizo o PLANO.md com a stack escolhida.

✻ Brewed for 15s · done 11:24 AM

❯ nao precisa se ater ao tempo; pode seguir com sua recomendação                

  Ran 2 shell commands (ctrl+o to expand)

● Seguindo com Vite + React + TypeScript + Zod + Vitest. Primeiro, a base do
  projeto e as dependências.

  Ran 2 shell commands (ctrl+o to expand)

● Ferramentas funcionando. Agora as configurações.

  Ran 1 shell command (ctrl+o to expand)

● Agora o domínio. Começo pelos esquemas de validação dos dados do Sistemão.

● Write(src\dominio\esquemas.ts)
  ⎿  Wrote 86 lines to src\dominio\esquemas.ts
      1 import { z } from 'zod';
      2 
         registro:
      4 // o que não bate com o formato vira anomalia e não entra no cálc
        ulo,
      6 
      7 const dataIso = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'data no 
        formato AAAA-MM-DD');
        {2}/, 'data e hora no formato AAAA-MM-DDTHH:MM');
      9 const dinheiro = z.number().finite();
     … +80 lines (ctrl+o to expand)

● Agora a regra de crédito, como funções puras, com valores em centavos para
  evitar erro de arredondamento nos casos-limite.

● Write(src\dominio\util.ts)
  ⎿  Wrote 13 lines to src\dominio\util.ts
       1 // Dinheiro em centavos (inteiro) para comparar com o limite sem
       2 // ponto flutuante: 0.1 + 0.2 !== 0.3, mas 10 + 20 === 30.
       3 export const centavos = (reais: number): number => Math.round(re
       4 export const reais = (centavos: number): number => centavos / 10
         0;
       6 const MS_POR_DIA = 24 * 60 * 60 * 1000;
       7 
         uência de fuso horário. */
       9 export function diasEntre(de: string, ate: string): number {
         (`${de}T00:00:00Z`)) / MS_POR_DIA);
     … +8 lines (ctrl+o to expand)

● Write(src\dominio\credito.ts)
  ⎿  Wrote 114 lines to src\dominio\credito.ts
       1 import type { StatusTitulo } from './esquemas';
       2 import { centavos, diasEntre, reais } from './util';
       3 
       5  * Regra de crédito que a Marta aplica hoje "de cabeça":
       6  *
       7  * - Bloquear: algum boleto vencido há MAIS de 5 dias, ou
       8  *             (tudo o que o cliente deve + valor do pedido) PAS
       9  * - Atenção:  algum boleto vencido há 1 a 5 dias (libera, mas o
          vendedor cobra).
      10  * - Liberar:  nenhum dos casos acima.
     … +122 lines (ctrl+o to expand)

● Testes da regra, com os casos-limite:

● Write(testes\credito.test.ts)
  ⎿  Wrote 116 lines to testes\credito.test.ts
       1 import { describe, expect, it } from 'vitest';
         ominio/credito';
       3 
       4 const HOJE = '2026-11-11';
       6 let seq = 0;
       7 /** Boleto que venceu `dias` atrás (negativo = ainda vai vencer)
       8 function boleto(valor: number, dias: number, status: TituloParaC
         redito['status'] = 'vencido'): TituloParaCredito {
       9   const venc = new Date(Date.UTC(2026, 10, 11 - dias)).toISOStri
      10   return { id: `T${++seq}`, valor, vencimento: venc, status };
     … +132 lines (ctrl+o to expand)

  Ran 1 shell command (ctrl+o to expand)
● Os 19 testes passaram. Faço o commit desta etapa.

  Ran 1 shell command (ctrl+o to expand)

❯ nao coloque co authored                                                       

● Entendido. Removo dos dois commits que já fiz (ainda são só locais, nada foi
  publicado) e não coloco mais.

  Ran 2 shell commands, wrote 1 memory (ctrl+o to expand)

● Pronto: os dois commits foram reescritos sem a linha de coautoria, e anotei
  isso na memória para os próximos. Agora atualizo o PLANO.md com a stack
  escolhida e o progresso.

  Read 1 file, ran 1 shell command (ctrl+o to expand)

● O PLANO.md está atualizado. Agora o carregamento dos dados: validação com Zod,
  verificação de consistência entre os arquivos e agrupamento dos clientes pelo
  CNPJ.

● Write(src\dominio\carregar.ts)
  ⎿  Wrote 240 lines to src\dominio\carregar.ts
       1 import type { z } from 'zod';
       2 import {
       3   type Cliente,
       4   clienteSchema,
       5   type Pedido,
       6   pedidoSchema,
       7   type Produto,
       8   produtoSchema,
       9   type Titulo,
      10   tituloSchema,
     … +303 lines (ctrl+o to expand)

● Agora a análise da fila: o pedido avaliado no grupo de crédito, mais os
  alertas para a Marta.

● Write(src\dominio\fila.ts)
  ⎿  Wrote 162 lines to src\dominio\fila.ts
       1 import { type Base, valorDosItens } from './carregar';
       2 import { avaliarCredito, type ResultadoCredito } from './credito
       3 import type { Pedido, StatusPedido } from './esquemas';
       4 import { centavos, diasEntre, reais } from './util';
       5 
       7 export const STATUS_COM_CREDITO: readonly StatusPedido[] = ['rec
         ebido', 'aguardando_liberacao', 'bloqueado_financeiro'];
       8 
         como possível duplicidade. */
      10 export const JANELA_DUPLICIDADE_MIN = 60;
     … +199 lines (ctrl+o to expand)

● Tiro os dois exports que não vão ser usados:

  Ran 1 shell command (ctrl+o to expand)

● Agora os textos, separados por perfil: a Marta recebe números e o vendedor
  recebe só a situação. O texto do vendedor é montado a partir dos códigos dos
  motivos, sem nenhum valor.

● Write(src\dominio\textos.ts)
  ⎿  Wrote 119 lines to src\dominio\textos.ts
       1 import type { Motivo, ResultadoCredito, Sugestao } from './credi
       2 import type { StatusPedido } from './esquemas';
       3 import type { Alerta } from './fila';
       4 
         currency: 'BRL' });
       6 export const formatarReais = (valor: number): string => brl.form
       7 
       8 /** "2026-11-10" ou "2026-11-10T08:07" → "10/11" ou "10/11 08:07
         ". */
      10   const [data = '', hora] = iso.split('T');
     … +153 lines (ctrl+o to expand)

● Agora vou montar as projeções por perfil, com o conteúdo de cada HTML. A
  anomalia da comissão errada no pedido 1013 não pode ir para nenhuma tela,
  porque a Marta não tem acesso a comissões, então ela fica só no relatório do
  README.

● Write(src\dominio\visoes.ts)
  ⎿  Wrote 195 lines to src\dominio\visoes.ts
       1 import type { Base } from './carregar';
       2 import type { Sugestao } from './credito';
       3 import type { StatusPedido } from './esquemas';
       4 import { analisarPedido, filaDoFinanceiro, STATUS_COM_CREDITO, s
         ituacaoDoCliente } from './fila';
       6   alertaFinanceiro,
       7   motivoFinanceiro,
       8   motivoParaVendedor,
       9   ROTULO_SITUACAO_VENDEDOR,
      10   ROTULO_STATUS,
     … +224 lines (ctrl+o to expand)

● O texto "Este pedido passa do crédito" não serve para a lista de clientes,
  onde ainda não existe pedido. Ajusto para cada contexto:

  Ran 1 shell command (ctrl+o to expand)

● Agora o script que gera os dados por perfil e o relatório de anomalias:

  Ran 1 shell command (ctrl+o to expand)

● As anomalias geradas batem com a análise manual. Confiro a fila pedido a
  pedido:

  Ran 1 shell command (ctrl+o to expand)

● Os 14 pedidos batem com o resultado esperado. Agora os testes com os dados
  reais e os testes de segurança das projeções:

● Write(testes\dados-reais.test.ts)
  ⎿  Wrote 96 lines to testes\dados-reais.test.ts
       1 import { describe, expect, it } from 'vitest';
       2 import { lerDados } from '../scripts/gerar';
       3 import { carregarBase } from '../src/dominio/carregar';
       4 import { DATA_REFERENCIA } from '../src/dominio/config';
       5 import { filaDoFinanceiro } from '../src/dominio/fila';
       6 
       7 const base = carregarBase(lerDados(), DATA_REFERENCIA);
       8 const fila = filaDoFinanceiro(base, DATA_REFERENCIA);
       9 const doPedido = (n: number) => {
      10   const a = fila.find((x) => x.pedido.numero === n);
     … +104 lines (ctrl+o to expand)

● Write(testes\seguranca.test.ts)
  ⎿  Wrote 90 lines to testes\seguranca.test.ts
      1 import { describe, expect, it } from 'vitest';
      2 import { gerarPerfis, lerDados } from '../scripts/gerar';
      3 import { carregarBase } from '../src/dominio/carregar';
      4 import { DATA_REFERENCIA } from '../src/dominio/config';
      5 
      7  * "Quem pode ver o quê", testado em cima do que de fato vai para
         cada página.
      8  * Se alguém adicionar um campo na projeção sem pensar no perfil,
         estes testes quebram.
      9  */
     … +109 lines (ctrl+o to expand)

  Ran 1 shell command (ctrl+o to expand)

● A falha vem do próprio teste: a regex barrava a palavra "boleto" num texto que
  é permitido ("cobre o cliente"). Ajusto para checar nomes de campo e
  identificadores de boleto, não palavras soltas:

● Update(testes\seguranca.test.ts)
  ⎿  Added 4 lines, removed 1 line
      45    it('não tem CNPJ, telefone, comissão, dívida, limite nem bole
          tos', () => {
      46      expect(json).not.toMatch(CNPJ);
      47      expect(json).not.toMatch(TELEFONE);
      48 -    expect(json).not.toMatch(/comiss|divida|dívida|limite|bolet
         -o|atraso"|T\d{4}/i);                                           
      48 +    // Nenhum campo com esses nomes (os textos podem dizer "bol
         +eto em atraso", sem valores).                                  
      49 +    expect(todasAsChaves(dados).join(' ')).not.toMatch(/comiss|
         +divida|limite|boleto|titulo|atraso|cnpj|telefone/i);           
      50 +    // Nenhum identificador de boleto.                         
      51 +    expect(json).not.toMatch(/"T\d{4}"/);                      
      52    });
      53  
      54    it('os textos de situação não trazem números (valores ou dias
           de atraso)', () => {

  Ran 1 shell command (ctrl+o to expand)

● Os 75 testes passam e a checagem de tipos não acusa nenhum erro. Commit:

  Ran 1 shell command (ctrl+o to expand)

● Agora a interface. Começo pela base: entrada, tipos do módulo de dados e o
  cabeçalho com o seletor "ver como".
  Read 1 file (ctrl+o to expand)

● Agora a visão da Marta:

● Write(src\app\VisaoFinanceiro.tsx)
  ⎿  Wrote 228 lines to src\app\VisaoFinanceiro.tsx
       1 import { useMemo, useState } from 'react';
       3 import { ROTULO_SUGESTAO } from '../dominio/textos';
       4 import type { DadosFinanceiro, PedidoFilaFinanceiro } from '../d
         ominio/visoes';
         rmato';
       6 
       8 
       9 const SECOES: { sugestao: Sugestao; titulo: string; dica: string
          }[] = [
          não liberar. Confira o motivo e avise o vendedor.' },
     … +260 lines (ctrl+o to expand)

● Agora a visão do vendedor, pensada primeiro para o celular:

● Write(src\app\VisaoVendedor.tsx)
  ⎿  Wrote 129 lines to src\app\VisaoVendedor.tsx
       1 import { useState } from 'react';
       2 import type { Sugestao } from '../dominio/credito';
         rom '../dominio/visoes';
       4 import { formatarData, formatarReais } from './formato';
       5 
       7 
       8 const ORDEM_SITUACAO: Record<Sugestao, number> = { bloquear: 0, 
         atencao: 1, liberar: 2 };
      10 export function VisaoVendedor({ dados }: { dados: DadosVendedor 
         }) {
     … +151 lines (ctrl+o to expand)

● Para pedidos ainda na fila, o selo vira "previsão" em vez de "Liberado", já
  que a Marta ainda não decidiu.

  Ran 1 shell command (ctrl+o to expand)

● Preciso tratar o pedido bloqueado pela Marta: ele não pode aparecer como
  "Liberado" para o vendedor, mesmo que a regra sugira liberar hoje.

  Ran 1 shell command (ctrl+o to expand)

● O vendedor também se beneficia de saber que o 1105 e o 1108 parecem repetidos
  (é o problema que o Bruno citou). Acrescento um aviso no pedido, sem nenhum
  dado sensível:

  Ran 1 shell command (ctrl+o to expand)

● Agora o CSS: mobile-first, com tema claro e escuro, e cores que nunca aparecem
  sozinhas (sempre acompanhadas do texto do selo).

● Write(src\app\estilos.css)
  ⎿  Wrote 678 lines to src\app\estilos.css
       1 /* Brilho Minas · fila do financeiro
       2    Mobile primeiro. A cor nunca é a única pista: todo estado tem
          texto (selo). */
       3 
       4 :root {
       6   --superficie: #ffffff;
       7   --superficie-2: #f0f2f5;
       8   --borda: #dde1e7;
       9   --texto: #1b2230;
      10   --texto-suave: #5b6578;
     … +681 lines (ctrl+o to expand)

● Agora o build, que gera um HTML autocontido por perfil, mais uma página
  inicial para escolher o perfil:

● Write(scripts\build.ts)
  ⎿  Wrote 91 lines to scripts\build.ts
       1 import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFil
         eSync } from 'node:fs';
       3 import { build } from 'vite';
       4 import { carregarBase } from '../src/dominio/carregar';
       5 import { DATA_REFERENCIA } from '../src/dominio/config';
         soes';
       7 import { gerarPerfis, lerDados } from './gerar';
       8 
      10  * Gera tela/: um HTML autocontido por perfil (abre com dois cli
         ques, sem
     … +108 lines (ctrl+o to expand)

  Ran 1 shell command (ctrl+o to expand)

● O build funcionou. O erro de tipos acontece porque o dados.d.ts tem o mesmo
  nome do dados.ts, e nesse caso o TypeScript ignora o .d.ts. Renomeio e confiro
  o vazamento direto nos HTMLs gerados:

  Ran 1 shell command (ctrl+o to expand)

● Cada cliente aparece só no HTML do seu vendedor, e o arquivo do financeiro não
  tem comissão. Agora a verificação visual, com o Edge em modo headless:

  Read 2 files, listed 1 directory, ran 1 shell command (ctrl+o to expand)

● A visão da Marta está boa, mas a do vendedor pode estar estourando a largura
  só por causa do Chrome headless. Vou renderizar a página num iframe de 390px
  para testar com a largura real.

  Read 1 file, ran 1 shell command (ctrl+o to expand)

● No celular, as duas visões cabem em 390px sem rolagem lateral, e o estouro
  vinha do Chrome headless. Vou ajustar a lista "Esperando o financeiro" para
  mostrar primeiro os casos com problema.

  Ran 1 shell command (ctrl+o to expand)

● A regra, os dados por perfil e as duas telas estão prontas com 75 testes
  passando; agora gero o build final, configuro o CI e faço o commit, seguido do
  DIAGNOSTICO.md, do README e dos prints.

  Ran 2 shell commands (ctrl+o to expand)

● Atualizo o PLANO.md com o que já foi concluído:

  Read 1 file, ran 2 shell commands (ctrl+o to expand)

● O índice foi calculado antes de uma substituição que deslocou o texto, e por
  isso as últimas linhas da seção 5 ficaram de fora. Corrijo direto:

  Ran 1 shell command (ctrl+o to expand)

● O PLANO.md está em dia. Agora o DIAGNOSTICO.md (Parte 1):

● Write(DIAGNOSTICO.md)
  ⎿  Wrote 52 lines to DIAGNOSTICO.md
      1 # Diagnóstico · Brilho Minas
      3 ## 1. O problema de verdade
      4 
        o pedido chegar e ser liberado.** São dois problemas que se alime
      6 
      7 1. **A liberação de crédito depende de uma pessoa consultando na 
        ias, ou dívida + pedido acima do limite), mas para aplicá-la ela 
        precisa parar, abrir o Sistemão e conferir os boletos, cerca de 4
        edor que promete entrega para um cliente bloqueado.
         WhatsApp, na planilha e no Sistemão. Daí vêm os **1
     … +104 lines (ctrl+o to expand)

● O diagnóstico está escrito. Agora os prints para o README. Vou gerá-los em
  tema claro, que lê melhor num repositório, com a visão da Marta no computador
  e a do vendedor em 390px.

  Read 1 file, ran 1 shell command (ctrl+o to expand)

● O tema claro está bom. Para o print do celular, a mesma técnica de antes: um
  iframe de 390px colado à esquerda de uma captura com 390px de largura.
  Read 2 files, ran 1 shell command (ctrl+o to expand)

● O clique na aba "Meus clientes" falhou porque o navegador bloqueia iframes
  quando a página abre como arquivo, então a aba passa a usar o endereço
  #clientes, que o vendedor pode salvar como atalho.

  Read 1 file, ran 1 shell command (ctrl+o to expand)

● Os prints ficaram bons. Copio para o repositório e escrevo o README:

  Ran 1 shell command (ctrl+o to expand)

● Write(README.md)
  ⎿  Wrote 130 lines to README.md
       1 # Brilho Minas · Fila do financeiro
       3 Protótipo da fila de liberação de pedidos da Brilho Minas. A reg
         ra de crédito da Marta é aplicada sobre os dados do Sistemão e h
          com sugestão e motivo, e cada **vendedor** vê só os próprios pe
         didos e clientes no celular, sem valores de dívida.
       5 - **Parte 1 (diagnóstico):** [`DIAGNOSTICO.md`](DIAGNOSTICO.md)
       6 - **Parte 2 (tela):** pasta [`tela/`](tela/)
         anomalias-dos-dados.md)
       8 - **Plano e acompanhamento:** [`PLANO.md`](PLANO.md)
      10 ## Como abrir
     … +230 lines (ctrl+o to expand)

● Uma correção de honestidade no README: escrevi "Conferi à mão os casos de
  borda" na sua voz, mas quem conferiu fui eu. Ajusto o texto para não atribuir
  a você algo que você não fez:

● Update(README.md)
  ⎿  Added 1 line, removed 1 line
      115  - Ela colocou "Co-Authored-By" nos commits; pedi para tirar.
      116  - Um teste de segurança escrito por ela barrava a palavra "bol
           eto" em qualquer texto e quebrou num texto permitido ("cobre o
            boleto em atraso"). Foi corrigido para checar nomes de campos
            e identificadores de boleto.
      117  - Ela mesma notou que a lista geral de anomalias tinha a comis
           são do pedido 1013, que a Marta não pode ver. A lista ficou fo
           ra das telas e foi só para o relatório.
      118 -- Conferi à mão os casos de borda (1104, 1109, 1106, 1110) con
          -tra a regra antes de aceitar o resultado.                     
      118 +- Os casos de borda (1104, 1109, 1106, 1110) foram calculados 
          +à parte, antes do código, e viraram testes com o resultado esp
          +erado. Assim, o código não "se confere sozinho".              
      119  
      120  ## Estrutura
      121  

  Ran 1 shell command (ctrl+o to expand)

● Tudo passando. Atualizo o PLANO.md e faço os commits separados:

  Ran 1 shell command (ctrl+o to expand)

● Por último, confiro se o build é determinístico. Sem isso, a etapa do CI que
  compara a pasta tela/ com o build falharia à toa.

  Ran 1 shell command (ctrl+o to expand)

● Tudo que dá para fazer localmente está pronto e com commit: 6 commits na
  branch main, 75 testes passando, checagem de tipos sem erros, e um build que
  gera sempre os mesmos arquivos.

  O que foi entregue
  - A tela: abra tela/index.html com dois cliques. Há um HTML por perfil, e o
    arquivo de cada vendedor só traz os dados dele. Um teste verifica a lista
    exata de campos que podem ir para cada perfil.
  - A regra: os 14 pedidos da fila dão o resultado que calculamos no começo:
    - Bloquear: 1091, 1096, 1099, 1104, 1106, 1110
    - Atenção: 1097, 1109
    - Liberar: 1090, 1094, 1098, 1102, 1105, 1108, os dois últimos com aviso de
      pedido em dobro
  - DIAGNOSTICO.md, README.md e prints em docs/prints/.
  - docs/anomalias-dos-dados.md: relatório das sujeiras nos dados, gerado
    automaticamente.
  - CI do GitHub: checa tipos, testes e build, mas só passa a rodar depois do
    push.
  - PLANO.md: atualizado, com cortes e uso da IA registrados.

  Duas decisões que tomei sem perguntar
  - Cadastros com o mesmo CNPJ contam como um cliente só: a dívida soma e vale o
    menor limite. É uma suposição; está no README e virou a pergunta 2 do
    diagnóstico.
  - Para o vendedor, o pedido na fila aparece como "Previsão do financeiro",
    para ele não prometer entrega com base numa sugestão. Um pedido que a Marta
    já barrou aparece como Bloqueado.

  Revise antes de enviar: a seção "Como usei a IA" do README e o texto do
  diagnóstico estão escritos na sua voz.

  Falta só o que depende de você:
  1. Exportar a conversa: rode /export e salve em docs/conversa-com-ia.md. O
     README já aponta para esse arquivo.
  2. Criar o repositório no GitHub e fazer o push. O GitHub Pages, que é bônus,
     vem junto se você quiser.
  3. Mandar o link para a Amanda até sexta, 18h.

  Não criei o repositório porque isso publica o trabalho. Quer que eu crie com o
  gh? Me diga se ele deve ser público ou privado com acesso para 
  @amandadinizmkt, e se quer o GitHub Pages.

✻ Cogitated for 13m 41s · done 11:44 AM

❯ sobre essas duas decisões, que outras opções tinhamos?                        

● 1. Cadastros com o mesmo CNPJ (C001 e C037)

  Opção: A. Ignorar, cada cadastro vale sozinho
  Resultado do pedido 1110: Liberar
  Prós: Segue os dados ao pé da letra
  Contras: Libera crédito para uma empresa com boleto atrasado há 72 dias. É o
  caso que o teste provavelmente plantou para ver se alguém percebe
  ────────────────────────────────────────
  Opção: B. Calcular separado e só avisar
  Resultado do pedido 1110: Liberar, com aviso "mesmo CNPJ do C001, que tem
  atraso"
  Prós: Não inventa regra; a Marta decide com a informação na mão
  Contras: A sugestão diz "Liberar" para um caso que ela quase certamente
  bloquearia. Com pressa, ela clica em liberar
  ────────────────────────────────────────
  Opção: C. Juntar pelo CNPJ (escolhida)
  Resultado do pedido 1110: Bloquear, com aviso
  Prós: Conservadora; protege o caixa; a explicação está na tela
  Contras: É uma suposição sobre a regra: estamos decidindo que limite é por
  empresa
  ────────────────────────────────────────
  Opção: D. Um 4º estado, "Revisar cadastro"
  Resultado do pedido 1110: Revisar
  Prós: Não chuta: o problema é de cadastro, não de crédito
  Contras: Sai das 3 sugestões da regra da Marta, que o enunciado pede

  Dentro da opção C, ainda havia a escolha de qual limite usar: o menor (R$ 5
  mil, o que escolhi), o do cadastro original (C001, R$ 8 mil), a soma dos dois
  (R$ 13 mil) ou o maior. Hoje isso não muda nada, porque o 1110 bloqueia pelo
  atraso de qualquer forma. Só mudaria num caso sem atraso.

  Também havia como agrupar. Usei os 14 dígitos do CNPJ. Agrupar pelos 8
  primeiros juntaria matriz e filiais da mesma empresa, o que pode ser certo ou
  errado dependendo da Brilho Minas. Por isso isso entrou na pergunta 2 do
  diagnóstico.

  2. O que o vendedor vê enquanto o pedido está na fila

  ┌──────────────────────┬──────────────────┬───────────────────────────────┐
  │        Opção         │       Prós       │            Contras            │
  ├──────────────────────┼──────────────────┼───────────────────────────────┤
  │ A. Só "Aguardando    │ Zero risco de    │ Não resolve a dor do Carlos   │
  │ financeiro" até a    │ prometer com     │ nem as 40 perguntas por dia à │
  │ Marta decidir        │ base numa        │  Marta. O vendedor continua   │
  │                      │ sugestão         │ no escuro                     │
  ├──────────────────────┼──────────────────┼───────────────────────────────┤
  │ B. Mostrar a         │                  │ Engana quando a Marta         │
  │ sugestão como se     │ Mais simples de  │ discorda da regra (ela pode   │
  │ fosse a decisão      │ ler              │ ter exceções; é a pergunta 1  │
  │ ("Liberado")         │                  │ do diagnóstico)               │
  ├──────────────────────┼──────────────────┼───────────────────────────────┤
  │                      │ Dá a informação  │                               │
  │ C. Mostrar como      │ cedo e deixa     │ Um rótulo a mais para o       │
  │ previsão (escolhida) │ claro quem       │ vendedor entender             │
  │                      │ decide           │                               │
  ├──────────────────────┼──────────────────┼───────────────────────────────┤
  │ D. Só a situação do  │                  │ Perde o caso "este pedido     │
  │ cliente, sem         │ Mais simples     │ passa do limite": o cliente   │
  │ previsão por pedido  │                  │ está em dia, mas este pedido  │
  │                      │                  │ não cabe (o 1096 da Fernanda) │
  └──────────────────────┴──────────────────┴───────────────────────────────┘

  Para o pedido que a Marta já barrou (o 1095), as alternativas eram mostrar o
  resultado da regra (que poderia dizer "Liberado" e contradizer a Marta),
  mostrar os dois, ou fazer o que fiz: a decisão dela vale.

  Minha leitura

  Eu manteria as duas escolhas, porque erram para o lado seguro e explicam o
  motivo na tela. A alternativa mais defensável é a 1B (só avisar): se você
  prefere não "inventar regra", ela respeita a regra literal e deixa a decisão
  com a Marta.

  Trocar qualquer uma das duas é uma mudança pequena:
  - A do CNPJ fica no agrupamento em src/dominio/carregar.ts.
  - A do vendedor fica em src/dominio/visoes.ts e src/app/VisaoVendedor.tsx.

  Os testes mostram na hora o que muda. Quer trocar alguma?

✻ Worked for 23s · done 11:48 AM

※ recap: Estamos fazendo o desafio da Brilho Minas; tela, testes, diagnóstico e README já estão prontos e com commit, e expliquei as alternativas às duas decisões. Próximo passo: você decide se troca alguma e se o repositório no GitHub será público ou privado. (disable recaps in /config)

❯ NOTE QUE AMBOS SAO A MESMA EMPRESA MAS DIGITADA COM O NOME DIFERENTE          
  ⎿  ⧉ Selected 10 lines from dados\clientes.json in Visual Studio Code

● Isso deixa o caso mais simples. Não é matriz e filial, nem uma regra de
  "limite por empresa" a decidir: é a mesma empresa cadastrada duas vezes. Os
  dois cadastros têm o mesmo CNPJ, o mesmo telefone, o mesmo vendedor e a mesma
  cidade; só o nome foi digitado de outro jeito ("Restaurante Sabor de Minas" e
  "RESTAURANTE SABOR DE MINAS LTDA").

  O que isso muda:
  - Juntar os dois cadastros deixa de ser suposição. É corrigir um erro de
    cadastro. O pedido 1110 continua Bloquear.
  - Resta uma dúvida de verdade: qual dos dois limites vale, R$ 8 mil ou R$ 5
    mil. Mantenho o menor até alguém confirmar.
  - O caso vira evidência do diagnóstico: é o problema de "digitar a mesma coisa
    várias vezes" aparecendo no cadastro de clientes.

  Ajusto o texto da tela, o relatório, o README e o diagnóstico:

  Searched for 1 pattern, ran 1 shell command (ctrl+o to expand)

● O aviso na tela já foi atualizado, mas o relatório docs/anomalias-dos-dados.md
  ainda mostra o texto antigo, porque o npm run build não o regenera. Vou
  corrigir esse build e fazer o aviso falar de nome diferente só quando os nomes
  forem realmente diferentes.

  Ran 1 shell command (ctrl+o to expand)

● A substituição em lote falhou na primeira edição e nada foi aplicado. Faço as
  edições uma a uma, com a ferramenta de edição:

  Read 1 file (ctrl+o to expand)

● Update(scripts\gerar.ts)
  ⎿  Added 2 lines, removed 1 line
      46    ].join('\n');
      47  }
      48  
      49 -function principal() {                                         
      49 +/** Grava src/gerado/<perfil>.json e docs/anomalias-dos-dados.m
         +d. O build usa a mesma função. */                              
      50 +export function gravarTudo(): { base: Base; perfis: Map<string,
         + DadosPerfil> } {                                              
      51    const base = carregarBase(lerDados(), DATA_REFERENCIA);
      52    const perfis = gerarPerfis(base);
      53  

● Update(scripts\gerar.ts)
  ⎿  Added 4 lines
      58    }
      59    mkdirSync(resolve(raiz, 'docs'), { recursive: true });
      60    writeFileSync(resolve(raiz, 'docs/anomalias-dos-dados.md'), r
          elatorioAnomalias(base.anomalias));
      61 +  return { base, perfis };                                     
      62 +}                                                              
      63  
      64 +function principal() {                                         
      65 +  const { base, perfis } = gravarTudo();                       
      66    const fin = perfis.get('financeiro');
      67    const fila = fin?.perfil === 'financeiro' ? fin.fila : [];
      68    const conta = (s: string) => fila.filter((p) => p.sugestao ==
          = s).length;

  Read 1 file (ctrl+o to expand)

● Update(scripts\build.ts)
  ⎿  Added 1 line, removed 6 lines
      20  const escapar = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '
          &': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] ?? c
          );
      21  
      22  async function principal() {
      23 -  const base = carregarBase(lerDados(), DATA_REFERENCIA);      
      24 -  const perfis = gerarPerfis(base);                            
      23 +  const { base, perfis } = gravarTudo();                       
      24  
      26 -  const gerado = resolve(raiz, 'src/gerado');                  
      27 -  mkdirSync(gerado, { recursive: true });                      
      28 -  for (const [id, dados] of perfis) writeFileSync(resolve(gerad
         -o, `${id}.json`), `${JSON.stringify(dados, null, 2)}\n`);      
      29 -                                                               
      25    rmSync(saida, { recursive: true, force: true });
      26    mkdirSync(saida, { recursive: true });
      27  

● Update(scripts\build.ts)
  ⎿  Added 1 line, removed 3 lines
       1  import { copyFileSync, mkdirSync, readFileSync, rmSync, writeFi
          leSync } from 'node:fs';
       2  import { resolve } from 'node:path';
       3  import { build } from 'vite';
       4 -import { carregarBase } from '../src/dominio/carregar';        
       5 -import { DATA_REFERENCIA } from '../src/dominio/config';       
       4  import { arquivoDoPerfil, listarPerfis } from '../src/dominio/v
          isoes';
       7 -import { gerarPerfis, lerDados } from './gerar';               
       5 +import { gravarTudo } from './gerar';                          
       6  
       7  /**
       8   * Gera tela/: um HTML autocontido por perfil (abre com dois cl
          iques, sem

● Agora o aviso condicional (nomesDiferentes):

  Ran 1 shell command (ctrl+o to expand)
● Agora o relatório e o aviso estão coerentes. Acrescento um teste para esse
  caso e refaço o print da Marta, que mostrava o texto antigo do aviso:

● Update(testes\dados-reais.test.ts)
  ⎿  Added 1 line, removed 1 line
      48  
      49    it('1110 (C037) herda os boletos do C001, que tem o mesmo CNP
          J', () => {
      50      const a = doPedido(1110);
      51 -    expect(tiposAlerta(1110)).toContain('cadastro_duplicado'); 
      51 +    expect(doPedido(1110).alertas).toContainEqual(expect.object
         +Containing({ tipo: 'cadastro_duplicado', nomesDiferentes: true 
         +}));                                                           
      52      expect(a.credito.titulosEmAberto.length).toBeGreaterThan(0)
          ;
      53      expect(a.credito.limite).toBe(5000);
      54    });

  Ran 2 shell commands (ctrl+o to expand)

● Você tem razão, e isso fortalece a decisão. C001 e C037 têm o mesmo CNPJ, o
  mesmo telefone, o mesmo vendedor e a mesma cidade; só o nome foi digitado
  diferente ("Restaurante Sabor de Minas" e "RESTAURANTE SABOR DE MINAS LTDA").
  Não é matriz e filial, e não é uma regra a decidir: é um cadastro duplicado 
  por erro de digitação.

  O que isso muda na decisão
  - Juntar os dois cadastros deixa de ser suposição e vira correção de cadastro.
    As opções A e B da minha resposta anterior, que tratavam os cadastros como
    separados, perdem o sentido.
  - Resta uma dúvida: qual limite vale, R$ 8 mil ou R$ 5 mil. Continuo usando o
    menor até alguém confirmar. Hoje isso não muda o resultado, porque o 1110
    bloqueia pelo atraso de qualquer forma.
  - O caso virou argumento no diagnóstico. É a redigitação aparecendo no
    cadastro de clientes. E o pedido novo caiu justamente no cadastro sem
    boletos, o que escondia uma dívida com 72 dias de atraso.

  O que atualizei
  - Aviso na tela da Marta: agora diz "Cliente cadastrado em dobro: é a mesma
    empresa (mesmo CNPJ) que C001… com o nome digitado de outro jeito".
  - Relatório de anomalias: lista o que bate entre os dois cadastros (CNPJ,
    telefone, vendedor, cidade) e os dois nomes.
  - README, DIAGNOSTICO.md e PLANO.md: a pergunta 2 agora é "pedido liberado e
    ainda não faturado já consome o limite? E qual limite vale no cadastro
    duplicado?".
  - Print da Marta: refeito com o texto novo.

  Bug que achei no caminho: o npm run build não regenerava o
  docs/anomalias-dos-dados.md, então o relatório tinha ficado com o texto
  antigo. Corrigi.

  Os 75 testes passam, e o novo commit está feito.

  Ainda falta o que depende de você: rodar o /export da conversa, e me dizer se
  o repositório no GitHub deve ser público ou privado com acesso para
  @amandadinizmkt.

✻ Crunched for 2m 32s · done 11:54 AM

※ recap: A entrega do desafio Brilho Minas está pronta localmente: tela, regra de crédito com testes, diagnóstico e README, com commits feitos. O próximo passo é você rodar o /export e me dizer se o repositório no GitHub será público ou privado. (disable recaps in /config)

❯ pode gerar o commit, esconda os arquivos sensiveis, mantenha apenas o codigo. 
  podemos fazer um pages tambem e com isso vamos ajustando o que for            
  identificado                                                                  

● Antes de mexer, confiro o estado do gh e o que existe hoje de dado sensível no
  repositório:

  Ran 1 shell command (ctrl+o to expand)

● Mostrar os dados e publicar no GitHub Pages ao mesmo tempo não é possível por
  completo: a página publicada traz CNPJ, dívidas e boletos, e dados/,
  docs/anomalias-dos-dados.md e os prints também têm informações sensíveis que o
  enunciado pede manter no repositório. Vou sinalizar esse conflito antes de
  seguir.

● User answered Claude's questions:
  ⎿  · Como tratar os dados sensíveis no repositório e no Pages? → Código no 
     repo, dados fora (Recomendado)
     · O repositório no GitHub deve ser público ou privado? → Público 
     (Recomendado)

❯ confirme qual conta do github                                                 

  Ran 1 shell command (ctrl+o to expand)

● Esta é a conta em que o gh está logado, a única configurada nesta máquina:

  - Conta: mais4g (Maisa Gomes), https://github.com/mais4g
  - Repositório que eu criaria:
    https://github.com/mais4g/brilho-minas-fila-financeiro, público, com o Pages
    em https://mais4g.github.io/brilho-minas-fila-financeiro/

  Antes de publicar, atenção a um ponto: todos os commits estão assinados como
  Maisa Gomes <maisakichlergms@gmail.com>. Num repositório público, esse e-mail
  fica visível no histórico para qualquer pessoa. Se preferir não expor, posso
  reescrever os commits com o e-mail privado do GitHub
  (<id>+mais4g@users.noreply.github.com). Ainda não há nada publicado, então dá
  para trocar sem efeito colateral.

  Me confirme duas coisas:
  1. A conta mais4g e o nome brilho-minas-fila-financeiro estão certos, ou
     prefere outro nome?
  2. Mantenho o e-mail pessoal nos commits ou troco pelo e-mail privado do
     GitHub?

✻ Baked for 12s · done 12:01 PM

❯ pode seguir; o diagnostico nao precisa subir ainda                            

● Vou seguir com a conta mais4g, o repositório público
  brilho-minas-fila-financeiro e o e-mail que já está nos commits, que é o mesmo
  dos seus outros repositórios.

  O plano:
  1. Gerar uma amostra/ com os mesmos dados, mas com CNPJ e telefone trocados
     por valores fictícios. É ela que o CI e o Pages usam.
  2. Tirar do git e de todo o histórico: dados/, tela/, o relatório de
     anomalias, os prints, o DIAGNOSTICO.md, o PLANO.md e o LEIA-ME.md. Todos
     continuam na sua máquina.
  3. Configurar o CI para publicar no Pages.

  Antes de reescrever o histórico, faço um backup completo da pasta:

  Ran 1 shell command (ctrl+o to expand)

● O backup está pronto, incluindo o .git e os 7 commits. Em seguida, vou
  escrever o script de mascaramento com trocas sequenciais, não hash, e manter
  CNPJs iguais iguais para que a duplicidade entre C001 e C037 continue
  detectável.

● Write(scripts\mascarar.ts)
  ⎿  Wrote 66 lines to scripts\mascarar.ts
       1 import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
       2 import { resolve } from 'node:path';
       3 
       5  * Gera amostra/ a partir de dados/: os mesmos registros, com CN
         PJ e telefone
         o, o CI e o Pages.
       7  *
         sh: não dá para
       9  *   voltar ao original por força bruta.
         inua detectável),
     … +73 lines (ctrl+o to expand)

● Agora a leitura passa a usar dados/ quando a pasta existe (na sua máquina) e
  amostra/ quando não existe (no CI e no Pages):

● Update(scripts\gerar.ts)
  ⎿  Added 8 lines, removed 1 line
      12  
      13  const raiz = resolve(import.meta.dirname, '..');
      14  
      15 -export function lerDados(pasta = resolve(raiz, 'dados')): Dados
         -Brutos {                                                       
      15 +/**                                                            
      16 + * dados/ tem os JSONs originais e fica fora do repositório (CN
         +PJ, telefone).                                                 
      17 + * Sem ela (CI, Pages, quem clonar), usa amostra/: os mesmos da
         +dos mascarados.                                                
      18 + */                                                            
      19 +export const pastaDeDados = (): string =>                      
      20 +  process.env.DADOS ? resolve(raiz, process.env.DADOS) : exists
         +Sync(resolve(raiz, 'dados/clientes.json')) ? resolve(raiz, 'dad
         +os') : resolve(raiz, 'amostra');                               
      21 +                                                               
      22 +export function lerDados(pasta = pastaDeDados()): DadosBrutos {
      23    const ler = (nome: string): unknown => JSON.parse(readFileSyn
          c(resolve(pasta, `${nome}.json`), 'utf-8'));
      24    return {
      25      clientes: ler('clientes'),

  Ran 1 shell command (ctrl+o to expand)

● A troca está certa: C001 e C037 mantêm o mesmo CNPJ falso, C038 segue sem
  CNPJ, e continuam 37 CNPJs distintos. Agora vou conferir que só esses dois
  campos mudaram e rodar os testes sobre a amostra.

  Ran 1 shell command (ctrl+o to expand)

● Só CNPJ e telefone mudaram, e os 77 testes passam em cima da amostra. Agora o
  .gitignore e o CI com o deploy no Pages:

  Searched for 1 pattern (ctrl+o to expand)

● O README não tem CNPJ nem telefone. Ajusto as partes que apontam para arquivos
  que não vão subir:

  Read 1 file, ran 2 shell commands (ctrl+o to expand)

● Agora o commit, que tira esses arquivos do controle do git sem apagá-los do
  disco:

  Ran 1 shell command (ctrl+o to expand)

● Os arquivos continuam no disco. Agora removo esses caminhos de todo o 
  histórico, porque os commits antigos ainda guardam os dados originais:

  Ran 1 shell command (ctrl+o to expand)

● O histórico está limpo. Para ter certeza, procuro qualquer CNPJ ou telefone
  que não seja da amostra em todas as versões de todos os arquivos:

  Ran 1 shell command (ctrl+o to expand)

● Nenhum dado real ficou no histórico. Agora crio o repositório público e faço o
  push:
  Ran 1 shell command (ctrl+o to expand)

● O repositório foi criado e o Pages está habilitado. O push disparou o CI antes
  de o Pages existir, então acompanho a execução:

  Ran 2 shell commands (ctrl+o to expand)

● O CI passou e o site está no ar, servindo os CNPJs fictícios da amostra.
  Registro tudo no PLANO.md, que agora fica só na sua máquina:

  Ran 1 shell command (ctrl+o to expand)

● O repositório e o site estão publicados, e o CI passou nas duas etapas (testes
  e publicação).

  - Repositório (público):
    https://github.com/mais4g/brilho-minas-fila-financeiro
  - Site no GitHub Pages: https://mais4g.github.io/brilho-minas-fila-financeiro/

  O que subiu: só código, testes, CI, README e a amostra/. A amostra tem os
  mesmos dados, mas com CNPJ e telefone trocados por valores fictícios. CNPJs
  que eram iguais continuam iguais, então o cadastro em dobro do C001 e C037
  continua sendo detectado. Os 77 testes passam em cima dela, e o site publicado
  usa essa versão.

  O que ficou só na sua máquina: dados/, tela/, o relatório de anomalias, os
  prints, o DIAGNOSTICO.md, o PLANO.md e o LEIA-ME.md. Eles saíram também de
  todo o histórico de commits, não só do último. Varri todas as versões de todos
  os arquivos e não sobrou nenhum CNPJ ou telefone real. Antes de reescrever o
  histórico, fiz um backup completo da pasta no diretório temporário da sessão.

  Como fica o ajuste daqui pra frente: cada push na main testa, gera e republica
  o site sozinho em 1 a 2 minutos. Na sua máquina, o build continua usando os
  dados originais de dados/.

  Pendências antes da entrega:
  1. Conversa com a IA: quando você rodar /export, saiba que a conversa contém
     CNPJs e telefones originais, que apareceram na análise dos dados. Precisa
     mascarar antes de subir, e eu posso fazer isso.
  2. Prints: o enunciado pede. Posso refazê-los a partir do site publicado, que
     já usa os dados fictícios, e subir.
  3. DIAGNOSTICO.md: sobe quando você liberar. É só tirar a linha dele do
     .gitignore.

  Os commits continuam com o seu e-mail pessoal, como combinamos. Me diga o que
  ajustar no site.

✻ Cooked for 4m 44s · done 12:06 PM

※ recap: Estamos fazendo o desafio da Brilho Minas, e o código já está no GitHub com o site publicado usando dados mascarados. Próximo passo: você rodar o `/export` da conversa para eu mascarar os CNPJs e telefones antes de subir. (disable recaps in /config)

❯ /code-review                                                                  
  ⎿  Running in the background as @code-review

❯ vamos ajustar o visual, faça um prototipo                                     

● Vou montar o protótipo visual como uma página separada, para você comparar com
  a tela atual antes de eu mexer no código. Ele vai usar os dados mascarados da
  amostra.

● Artifact(quickstart design)
  ⎿  found the type to start from

● Artifact(→ new artifact from type 
          https://claude.ai/artifact/QKN21svewxgyPb6SYRqWnd)
  ⎿  Created ⧉ https://claude.ai/artifact/VmxSbWTtEy7kZsgdx9oZbo from 
     Artifact type ⧉ https://claude.ai/artifact/QKN21svewxgyPb6SYRqWnd, 
     read its instructions

● Antes de desenhar, puxo os números exatos da fila e da visão da Patrícia, para
  o protótipo usar dados reais (sem CNPJ nem telefone):

  Ran 1 shell command (ctrl+o to expand)

● Defini a direção visual como uma mesa de trabalho clara e densa, com as 14
  linhas numa tela só e o detalhe ao lado; gero agora os dados das linhas a
  partir da fila.

  Ran 1 shell command (ctrl+o to expand)

● Agent "/code-review" finished · 1m 4s

● A revisão de código terminou e encontrou um ponto sobre o mascaramento, que
  vou detalhar no fim. Enquanto isso, sigo com o protótipo, pois a variável de
  ambiente estava no lugar errado do comando.

  Read 1 file, ran 1 shell command (ctrl+o to expand)

● Com os dados em mãos, monto o protótipo: primeiro o índice da tela de desenho
  e a mesa da Marta, que é interativa. Dá para clicar nas linhas, filtrar e
  marcar decisões.

  Made 2 scratchpad edits +350 (ctrl+o to expand)

● Artifact("proto/project/canvas.json")
  ⎿  Updated ⧉ https://claude.ai/artifact/VmxSbWTtEy7kZsgdx9oZbo

● A mesa da Marta está publicada. Agora a tela de pedidos da vendedora no
  celular:

  Made 1 scratchpad edit +146 (ctrl+o to expand)

● Artifact("proto/project/Vendedor-Pedidos.dc.html")
  ⎿  Updated ⧉ https://claude.ai/artifact/VmxSbWTtEy7kZsgdx9oZbo

❯ aplique conceitos de UI/UX e siga a identidade visual do Divos da IA, produto 
  da Amanda                                                                     

● Vou extrair cores, fontes e estilo da página do desafio que a Amanda publicou
  e que salvei mais ccedo, já que é a fonte mais confiável para a identidade
  visual do Divos da IA.

  Ran 2 shell commands (ctrl+o to expand)

● Encontrei a identidade do Divos da IA na página do desafio: bordô #741E31,
  fundo #FBF8F9, fontes Playfair Display, Inter e JetBrains Mono. Vou usar essas
  cores e fontes sem a marca, e deixo os avisos em azul-cobalto para separá-los
  do âmbar de Atenção.

  Ran 1 shell command (ctrl+o to expand)

● Agora a tela "Meus clientes", já no estilo novo:

  Made 1 scratchpad edit +138, ran 1 shell command (ctrl+o to expand)

● Artifact("proto/project/Vendedor-Clientes.dc.html")
  ⎿  Updated ⧉ https://claude.ai/artifact/VmxSbWTtEy7kZsgdx9oZbo
● O protótipo está pronto, já com a identidade visual do Divos da IA: ⧉
  https://claude.ai/artifact/VmxSbWTtEy7kZsgdx9oZbo

  Ele é privado; só você abre o link, a menos que compartilhe pelo menu da
  página. Ainda não mexi no código real: a ideia é você aprovar ou pedir ajustes
  aqui primeiro.

  O que tem lá (3 telas lado a lado)
  1. Marta, no computador (interativa): você pode clicar nas linhas, filtrar
     pelos cartões de resumo, buscar e marcar Liberar ou Bloquear.
  2. Vendedora, pedidos (celular): ao tocar em "Meus clientes" na barra de
     baixo, vai para a terceira tela.
  3. Vendedora, clientes (celular).

  Identidade visual: tirei da própria página do desafio da Amanda:
  - bordô #741E31 como cor principal e fundo levemente rosado;
  - títulos em Playfair Display, com destaque em itálico bordô ("Pedidos
    aguardando liberação", "Olá, Patrícia");
  - texto em Inter e números de pedido e boleto em JetBrains Mono;
  - rótulos pequenos em caixa alta e espaçados, e cápsulas com contorno.

  Mantive o nome "Brilho Minas" e não usei a marca do Divos, para o protótipo
  não parecer um produto deles.

  Conceitos de UI/UX aplicados
  - O que exige ação vem primeiro: cartões de resumo com quantidade e valor ("R$
    4.770,60 parados"), que também funcionam como filtro.
  - Detalhe sob demanda: a lista mostra as 14 linhas numa tela só, com o motivo
    resumido em cada uma, e o detalhe completo abre num painel ao lado, sem
    perder a lista de vista.
  - Retorno imediato: ao decidir, a linha fica marcada, o próximo pedido
    pendente abre sozinho e dá para desfazer.
  - Cor nunca sozinha: cada status tem ícone (✕, !, ✓) e texto, além da cor.
  - Cada cor tem um significado só: vermelho, âmbar e verde ficam para a decisão
    de crédito, e o azul-cobalto para avisos de dados. Antes, aviso e "Atenção"
    usavam a mesma cor.
  - Botões pela consequência: o botão principal segue a sugestão; Bloquear é
    vermelho e Liberar é verde.
  - Celular: o que precisa da vendedora vem primeiro, as abas ficam embaixo, ao
    alcance do polegar, e todos os alvos de toque têm pelo menos 44px.

  Atenção: os botões de decisão da Marta só existem no protótipo. No código real
  eles ainda não gravam nada; no README isso está como "fica para a próxima
  fase".

  Resultado da revisão de código (/code-review)
  1. Importante: a amostra publicada ainda tem dados sensíveis. Ela troca só
     CNPJ e telefone, mas mantém nomes reais das empresas, cidades e todo o
     histórico de pagamento (titulos_financeiros). Pelo nome e cidade, daria
     para descobrir o CNPJ e ligar a dívida à empresa. O README promete mais do
     que o código entrega. Como a empresa é fictícia, o risco real é nenhum, mas
     a inconsistência existe e está pública. Opções:
     - também trocar os nomes por fictícios na amostra;
     - ou corrigir o README para dizer exatamente o que é mascarado.
  2. Menor: o mascaramento compara o CNPJ pelo texto exato. Um mesmo CNPJ
     escrito com e sem pontuação geraria dois CNPJs falsos diferentes, e a
     duplicidade sumiria da amostra. Um CNPJ inválido viraria um falso válido,
     escondendo a anomalia. Hoje não afeta nada, mas a correção é simples.

  Me diga o que ajustar no protótipo. Quando aprovar, passo o visual para o
  código real, refaço os prints e publico no site. Também quer que eu corrija os
  dois pontos da revisão? Para o primeiro, prefere trocar os nomes ou ajustar o
  README?

✻ Cogitated for 7m 6s · done 12:18 PM

❯ pode seguir assim, mas gostaria que tivesse um tema escuro tambem e aplicasse 
  conceitos de acessibilidade; pode documentar isso                             

● Combinado: sigo com esse visual e acrescento o tema escuro e o trabalho de
  acessibilidade. Antes de reescrever as telas, instalo as fontes dentro do 
  próprio HTML, em vez de carregá-las do Google Fonts. Assim a tela funciona sem
  internet e não faz requisições a terceiros, o que também ajuda com a LGPD.

  Ran 1 shell command (ctrl+o to expand)

❯ sobre o code review, todos os dados sao ficticios, inclusive nao tem problema 
  utilizar os que ela passou, talvez seja ate melhor na verdade; mas ter        
  documentado o porque nao fazer isso e porque foi feito dessa forma            

● Entendido: como os dados são fictícios, uso os originais do repositório, já
  que batem com os da Amanda. Documento depois por que dados reais de clientes
  não iriam ao repositório, e começo agora pelas cores, com um teste de
  contraste WCAG AA nos dois temas.

● Write(src\app\tema.ts)
  ⎿  Wrote 185 lines to src\app\tema.ts
      1 /**
         (bordô,
      3  * fundo rosado, verde/âmbar/vermelho/cobalto suaves). O tema esc
        uro é derivado
      5  *
      6  * As cores ficam aqui (e não soltas no CSS) para que testes/cont
      7  * confira o contraste mínimo do WCAG 2.2 AA em cada par usado na
         tela.
      8  * As variáveis CSS são geradas a partir deste arquivo em main.ts
      9  */
     … +189 lines (ctrl+o to expand)

  Ran 1 shell command (ctrl+o to expand)

● Todos os 70 pares passaram de primeira, o que pede uma conferência. Imprimo os
  valores mais apertados para garantir que o teste mede de verdade:

  Ran 2 shell commands (ctrl+o to expand)

● Os valores estão corretos e com folga: o par mais apertado dá 3,36:1, acima do
  mínimo de 3:1. A seguir aplico as fontes e o tema logo no início da página,
  antes de qualquer desenho.

  Read 1 file (ctrl+o to expand)

● Agora o cabeçalho, com o link "Pular para o conteúdo", o seletor de tema e o
  "Ver como", e os ícones de status:

  Read 1 file (ctrl+o to expand)

● Agora a mesa da Marta, no novo layout, com foco gerenciado e anúncios para
  leitor de tela:

● Write(src\app\VisaoFinanceiro.tsx)
  ⎿  Added 403 lines, removed 177 lines
        1 -import { useMemo, useState } from 'react';                    
        1 +import { useId, useMemo, useRef, useState } from 'react';     
        2  import type { Sugestao } from '../dominio/credito';
        3  import { ROTULO_SUGESTAO } from '../dominio/textos';
        4  import type { DadosFinanceiro, PedidoFilaFinanceiro } from '..
           /dominio/visoes';
        5  import { formatarCanal, formatarData, formatarReais } from './
           formato';
        6 +import { IconeAviso, IconeBusca, IconeStatus } from './Icones'
          +;                                                             
        7  
        7 -type Filtro = 'todos' | Sugestao | 'alertas';                 
        8 +type Filtro = 'todos' | Sugestao | 'aviso';                   
        9 +type Decisao = 'liberado' | 'bloqueado';                      
       10  
        9 -const SECOES: { sugestao: Sugestao; titulo: string; dica: stri
          -ng }[] = [                                                    
       10 -  { sugestao: 'bloquear', titulo: 'Bloquear', dica: 'Pela regr
          -a, não liberar. Confira o motivo e avise o vendedor.' },      
       11 -  { sugestao: 'atencao', titulo: 'Atenção', dica: 'Pode libera
          -r, mas o vendedor precisa cobrar o boleto em atraso.' },      
       12 -  { sugestao: 'liberar', titulo: 'Liberar', dica: 'Dentro da r
          -egra. Confira os avisos, se houver, e libere.' },             
       11 +const GRUPOS: { sugestao: Sugestao; dica: string }[] = [      
       12 +  { sugestao: 'bloquear', dica: 'Pela regra, não liberar. Fale
          + com o vendedor antes.' },                                    
       13 +  { sugestao: 'atencao', dica: 'Pode liberar; o vendedor preci
          +sa cobrar o atraso.' },                                       
       14 +  { sugestao: 'liberar', dica: 'Dentro da regra. Confira os av
          +isos e libere.' },                                            
       15  ];
       16  
       17 +const soma = (pedidos: PedidoFilaFinanceiro[]) => formatarReai
          +s(pedidos.reduce((s, p) => s + p.valor, 0));                  
       18 +const normalizar = (t: string) => t.normalize('NFD').replace(/
          +\p{Diacritic}/gu, '').toLowerCase();                          
       19 +                                                              
       20  export function VisaoFinanceiro({ dados }: { dados: DadosFinan
           ceiro }) {
       21 +  const fila = dados.fila;                                    
       22    const [filtro, setFiltro] = useState<Filtro>('todos');
       23    const [busca, setBusca] = useState('');
       24 +  const [selecionado, setSelecionado] = useState<number | unde
          +fined>(fila[0]?.numero);                                      
       25 +  const [decisoes, setDecisoes] = useState<Record<number, Deci
          +sao>>({});                                                    
       26 +  const [anuncio, setAnuncio] = useState('');                 
       27 +  const tituloDetalhe = useRef<HTMLHeadingElement>(null);     
       28  
       19 -  const contagem = useMemo(() => {                            
       20 -    const c = { todos: dados.fila.length, bloquear: 0, atencao
          -: 0, liberar: 0, alertas: 0 };                                
       21 -    for (const p of dados.fila) {                             
       22 -      c[p.sugestao] += 1;                                     
       23 -      if (p.alertas.length > 0) c.alertas += 1;               
       24 -    }                                                         
       25 -    return c;                                                 
       26 -  }, [dados.fila]);                                           
       29 +  const resumo = useMemo(() => {                              
       30 +    const de = (s: Sugestao) => fila.filter((p) => p.sugestao 
          +=== s);                                                       
       31 +    const comAviso = fila.filter((p) => p.alertas.length > 0);
       32 +    return [                                                  
       33 +      { id: 'todos' as const, rotulo: 'Na fila', numero: fila.
          +length, detalhe: `${soma(fila)} em pedidos` },                
       34 +      { id: 'bloquear' as const, rotulo: 'Bloquear', numero: d
          +e('bloquear').length, detalhe: `${soma(de('bloquear'))} parado
          +s` },                                                         
       35 +      { id: 'atencao' as const, rotulo: 'Atenção', numero: de(
          +'atencao').length, detalhe: `${soma(de('atencao'))} · cobrar a
          +traso` },                                                     
       36 +      { id: 'liberar' as const, rotulo: 'Liberar', numero: de(
          +'liberar').length, detalhe: `${soma(de('liberar'))} prontos` }
          +,                                                             
       37 +      { id: 'aviso' as const, rotulo: 'Com aviso', numero: com
          +Aviso.length, detalhe: 'conferir antes de decidir' },         
       38 +    ];                                                        
       39 +  }, [fila]);                                                 
       40  
       41    const termo = normalizar(busca.trim());
       29 -  const visiveis = dados.fila.filter(                         
       42 +  const visiveis = fila.filter(                               
       43      (p) =>
       31 -      (filtro === 'todos' || (filtro === 'alertas' ? p.alertas
          -.length > 0 : p.sugestao === filtro)) &&                      
       44 +      (filtro === 'todos' || (filtro === 'aviso' ? p.alertas.l
          +ength > 0 : p.sugestao === filtro)) &&                        
       45        (!termo || normalizar(`${p.numero} ${p.cliente?.razaoSoc
           ial ?? ''} ${p.vendedor?.nome ?? ''}`).includes(termo)),
       46    );
       47 +  const pedido = fila.find((p) => p.numero === selecionado) ??
          + fila[0];                                                     
       48 +  const decididos = Object.keys(decisoes).length;             
       49  
       35 -  const filtros: { id: Filtro; rotulo: string }[] = [         
       36 -    { id: 'todos', rotulo: 'Todos' },                         
       37 -    { id: 'bloquear', rotulo: 'Bloquear' },                   
       38 -    { id: 'atencao', rotulo: 'Atenção' },                     
       39 -    { id: 'liberar', rotulo: 'Liberar' },                     
       40 -    { id: 'alertas', rotulo: 'Com aviso' },                   
       41 -  ];                                                          
       50 +  function abrir(numero: number, focar: boolean) {            
       51 +    setSelecionado(numero);                                   
       52 +    // Em tela estreita o detalhe fica abaixo da lista: leva o
          + foco (e a rolagem) até ele.                                  
       53 +    if (focar && window.matchMedia('(max-width: 1099px)').matc
          +hes) {                                                        
       54 +      requestAnimationFrame(() => tituloDetalhe.current?.focus
          +());                                                          
       55 +    }                                                         
       56 +  }                                                           
       57  
       58 +  function decidir(numero: number, decisao: Decisao) {        
       59 +    const novas = { ...decisoes, [numero]: decisao };         
       60 +    setDecisoes(novas);                                       
       61 +    const proximo = fila.find((p) => !novas[p.numero]);       
       62 +    if (proximo) setSelecionado(proximo.numero);              
       63 +    setAnuncio(                                               
       64 +      `Pedido ${numero} marcado como ${decisao}.${proximo ? ` 
          +Abrindo o pedido ${proximo.numero}.` : ' Todos os pedidos fora
          +m decididos.'}`,                                              
       65 +    );                                                        
       66 +  }                                                           
       67 +                                                              
       68 +  function desfazer(numero: number) {                         
       69 +    const { [numero]: _, ...resto } = decisoes;               
       70 +    setDecisoes(resto);                                       
       71 +    setAnuncio(`Decisão do pedido ${numero} desfeita.`);      
       72 +  }                                                           
       73 +                                                              
       74 +  function mudarFiltro(f: Filtro) {                           
       75 +    setFiltro(f);                                             
       76 +    const n = fila.filter((p) => f === 'todos' || (f === 'avis
          +o' ? p.alertas.length > 0 : p.sugestao === f)).length;        
       77 +    setAnuncio(`${n} ${n === 1 ? 'pedido' : 'pedidos'} na list
          +a.`);                                                         
       78 +  }                                                           
       79 +                                                              
       80    return (
       44 -    <section aria-labelledby="titulo-fila">                   
       45 -      <div className="cabecalho-visao">                       
       46 -        <h1 id="titulo-fila">Pedidos aguardando liberação</h1>
       47 -        <p className="subtitulo">                             
       48 -          {contagem.todos} pedidos na fila. A sugestão segue a
          - sua regra de crédito; a decisão continua sendo sua.          
       49 -        </p>                                                  
       50 -      </div>                                                  
       81 +    <div className="mesa">                                    
       82 +      <p className="so-leitor" aria-live="polite">            
       83 +        {anuncio}                                             
       84 +      </p>                                                    
       85  
       52 -      <div className="barra-filtros">                         
       53 -        <div className="filtros" role="group" aria-label="Filt
          -rar pela sugestão">                                           
       54 -          {filtros.map((f) => (                               
       86 +      <section className="mesa__fila" aria-labelledby="titulo-
          +fila">                                                        
       87 +        <div className="mesa__titulo">                        
       88 +          <div>                                               
       89 +            <h1 id="titulo-fila" className="titulo">          
       90 +              Pedidos aguardando <em>liberação</em>           
       91 +            </h1>                                             
       92 +            <p className="subtitulo">A sugestão segue a sua re
          +gra de crédito. Quem decide é você.</p>                       
       93 +          </div>                                              
       94 +          <p className="mesa__progresso">                     
       95 +            {decididos === 0 ? 'Nenhum pedido decidido ainda' 
          +: `${decididos} de ${fila.length} decididos`}                 
       96 +          </p>                                                
       97 +        </div>                                                
       98 +                                                              
       99 +        <div className="resumo" role="group" aria-label="Filtr
          +ar a fila">                                                   
      100 +          {resumo.map((r) => (                                
      101              <button
       56 -              key={f.id}                                      
      102 +              key={r.id}                                      
      103                type="button"
       58 -              className={`filtro filtro--${f.id}`}            
       59 -              aria-pressed={filtro === f.id}                  
       60 -              onClick={() => setFiltro(f.id)}                 
      104 +              className={`resumo__item resumo__item--${r.id}`}
      105 +              aria-pressed={filtro === r.id}                  
      106 +              onClick={() => mudarFiltro(r.id)}               
      107              >
       62 -              {f.rotulo} <span className="filtro__numero">{con
          -tagem[f.id]}</span>                                           
      108 +              <span className="resumo__rotulo">               
      109 +                <span className="resumo__ponto" aria-hidden="t
          +rue" />                                                       
      110 +                {r.rotulo}                                    
      111 +              </span>                                         
      112 +              <span className="resumo__numero">{r.numero}</spa
          +n>                                                            
      113 +              <span className="resumo__detalhe">{r.detalhe}</s
          +pan>                                                          
      114              </button>
      115            ))}
      116          </div>
       66 -        <input                                                
       67 -          className="busca"                                   
       68 -          type="search"                                       
       69 -          placeholder="Buscar cliente, pedido ou vendedor"    
       70 -          aria-label="Buscar cliente, pedido ou vendedor"     
       71 -          value={busca}                                       
       72 -          onChange={(e) => setBusca(e.target.value)}          
      117 +                                                              
      118 +        <label className="busca">                             
      119 +          <IconeBusca />                                      
      120 +          <span className="so-leitor">Buscar na fila</span>   
      121 +          <input                                              
      122 +            type="search"                                     
      123 +            value={busca}                                     
      124 +            onChange={(e) => setBusca(e.target.value)}        
      125 +            placeholder="Buscar cliente, número do pedido ou v
          +endedor"                                                      
      126 +          />                                                  
      127 +        </label>                                              
      128 +                                                              
      129 +        <div className="tabela-fila">                         
      130 +          <div className="tabela-fila__cabecalho" aria-hidden=
          +"true">                                                       
      131 +            <span>Sugestão</span>                             
      132 +            <span>Pedido e motivo</span>                      
      133 +            <span>Vendedor</span>                             
      134 +            <span>Entrou</span>                               
      135 +            <span className="numero">Valor</span>             
      136 +            <span>Crédito usado</span>                        
      137 +          </div>                                              
      138 +                                                              
      139 +          {visiveis.length === 0 && <p className="vazio">Nenhu
          +m pedido com esse filtro.</p>}                                
      140 +                                                              
      141 +          {GRUPOS.map(({ sugestao, dica }) => {               
      142 +            const pedidos = visiveis.filter((p) => p.sugestao 
          +=== sugestao);                                                
      143 +            if (pedidos.length === 0) return null;            
      144 +            return (                                          
      145 +              <section key={sugestao} aria-labelledby={`grupo-
          +${sugestao}`}>                                                
      146 +                <div className="grupo">                       
      147 +                  <h2 id={`grupo-${sugestao}`} className={`gru
          +po__titulo tom-${sugestao}`}>                                 
      148 +                    {ROTULO_SUGESTAO[sugestao]} · {pedidos.len
          +gth}                                                          
      149 +                  </h2>                                       
      150 +                  <p className="grupo__dica">{dica}</p>       
      151 +                </div>                                        
      152 +                <ul className="linhas">                       
      153 +                  {pedidos.map((p) => (                       
      154 +                    <li key={p.numero}>                       
      155 +                      <LinhaPedido                            
      156 +                        pedido={p}                            
      157 +                        selecionado={p.numero === pedido?.nume
          +ro}                                                           
      158 +                        decisao={decisoes[p.numero]}          
      159 +                        onAbrir={() => abrir(p.numero, true)} 
      160 +                      />                                      
      161 +                    </li>                                     
      162 +                  ))}                                         
      163 +                </ul>                                         
      164 +              </section>                                      
      165 +            );                                                
      166 +          })}                                                 
      167 +        </div>                                                
      168 +      </section>                                              
      169 +                                                              
      170 +      {pedido && (                                            
      171 +        <Detalhe                                              
      172 +          pedido={pedido}                                     
      173 +          decisao={decisoes[pedido.numero]}                   
      174 +          tituloRef={tituloDetalhe}                           
      175 +          onDecidir={(d) => decidir(pedido.numero, d)}        
      176 +          onDesfazer={() => desfazer(pedido.numero)}          
      177          />
       74 -      </div>                                                  
      178 +      )}                                                      
      179 +    </div>                                                    
      180 +  );                                                          
      181 +}                                                             
      182  
       76 -      {visiveis.length === 0 && <p className="vazio">Nenhum pe
          -dido com esse filtro.</p>}                                    
      183 +function SeloSugestao({ sugestao, prefixo = '' }: { sugestao: 
          +Sugestao; prefixo?: string }) {                               
      184 +  return (                                                    
      185 +    <span className={`selo selo--${sugestao}`}>               
      186 +      <IconeStatus sugestao={sugestao} />                     
      187 +      {prefixo}                                               
      188 +      {ROTULO_SUGESTAO[sugestao]}                             
      189 +    </span>                                                   
      190 +  );                                                          
      191 +}                                                             
      192  
       78 -      {SECOES.map((secao) => {                                
       79 -        const pedidos = visiveis.filter((p) => p.sugestao === 
          -secao.sugestao);                                              
       80 -        if (pedidos.length === 0) return null;                
       81 -        return (                                              
       82 -          <section key={secao.sugestao} className="secao" aria
          --labelledby={`secao-${secao.sugestao}`}>                      
       83 -            <h2 id={`secao-${secao.sugestao}`} className={`sec
          -ao__titulo secao__titulo--${secao.sugestao}`}>                
       84 -              {secao.titulo} <span className="secao__numero">{
          -pedidos.length}</span>                                        
       85 -            </h2>                                             
       86 -            <p className="secao__dica">{secao.dica}</p>       
       87 -            <ol className="lista-pedidos">                    
       88 -              {pedidos.map((p) => (                           
       89 -                <li key={p.numero}>                           
       90 -                  <CartaoPedido pedido={p} />                 
       91 -                </li>                                         
       92 -              ))}                                             
       93 -            </ol>                                             
       94 -          </section>                                          
       95 -        );                                                    
       96 -      })}                                                     
       97 -    </section>                                                
      193 +function LinhaPedido({                                        
      194 +  pedido: p,                                                  
      195 +  selecionado,                                                
      196 +  decisao,                                                    
      197 +  onAbrir,                                                    
      198 +}: {                                                          
      199 +  pedido: PedidoFilaFinanceiro;                               
      200 +  selecionado: boolean;                                       
      201 +  decisao: Decisao | undefined;                               
      202 +  onAbrir: () => void;                                        
      203 +}) {                                                          
      204 +  const pct = p.limite ? Math.round((p.totalComPedido / p.limi
          +te) * 100) : null;                                            
      205 +  return (                                                    
      206 +    <button                                                   
      207 +      type="button"                                           
      208 +      className={`linha ${selecionado ? 'linha--selecionada' :
          + ''} ${decisao ? 'linha--decidida' : ''}`}                    
      209 +      aria-current={selecionado ? 'true' : undefined}         
      210 +      aria-controls="detalhe-pedido"                          
      211 +      onClick={onAbrir}                                       
      212 +    >                                                         
      213 +      <span className="linha__sugestao">                      
      214 +        <SeloSugestao sugestao={p.sugestao} />                
      215 +      </span>                                                 
      216 +      <span className="linha__principal">                     
      217 +        <span className="linha__topo">                        
      218 +          <span className="mono linha__numero">               
      219 +            <span className="so-leitor">Pedido </span>        
      220 +            {p.numero}                                        
      221 +          </span>                                             
      222 +          <span className="linha__cliente">{p.cliente?.razaoSo
          +cial ?? 'Cliente não encontrado'}</span>                      
      223 +          {p.alertas.length > 0 && (                          
      224 +            <span className="etiqueta etiqueta--info">        
      225 +              <IconeAviso tamanho={12} />                     
      226 +              {p.alertas.length === 1 ? '1 aviso' : `${p.alert
          +as.length} avisos`}                                           
      227 +            </span>                                           
      228 +          )}                                                  
      229 +          {decisao && <span className="etiqueta etiqueta--deci
          +sao">{decisao === 'liberado' ? 'Liberado' : 'Bloqueado'}</span
          +>}                                                            
      230 +        </span>                                               
      231 +        <span className="linha__motivo">{p.motivos[0]}</span> 
      232 +      </span>                                                 
      233 +      <span className="linha__vendedor">{p.vendedor?.nome ?? '
          +sem vendedor'}</span>                                         
      234 +      <span className="linha__quando">                        
      235 +        {formatarData(p.criadoEm)}                            
      236 +        <span className="linha__canal">{formatarCanal(p.canal)
          +}</span>                                                      
      237 +      </span>                                                 
      238 +      <span className="linha__valor numero">{formatarReais(p.v
          +alor)}</span>                                                 
      239 +      <span className="linha__credito">                       
      240 +        <BarraCredito pedido={p} fina />                      
      241 +        <span className={`linha__pct ${p.limite !== null && p.
          +totalComPedido > p.limite ? 'tom-bloquear' : ''}`}>           
      242 +          {pct === null ? 'sem limite' : `${pct}%`}           
      243 +          <span className="so-leitor"> do limite</span>       
      244 +        </span>                                               
      245 +      </span>                                                 
      246 +    </button>                                                 
      247    );
      248  }
      249  
      101 -function CartaoPedido({ pedido: p }: { pedido: PedidoFilaFinan
          -ceiro }) {                                                    
      250 +function BarraCredito({ pedido: p, fina = false }: { pedido: P
          +edidoFilaFinanceiro; fina?: boolean }) {                      
      251 +  if (p.limite === null) return <span className={`barra ${fina
          + ? 'barra--fina' : ''}`} aria-hidden="true" />;               
      252 +  const escala = Math.max(p.limite, p.totalComPedido);        
      253 +  const passou = p.totalComPedido > p.limite;                 
      254    return (
      103 -    <article className={`cartao cartao--${p.sugestao}`} aria-l
          -abel={`Pedido ${p.numero}: ${ROTULO_SUGESTAO[p.sugestao]}`}>  
      104 -      <div className="cartao__topo">                          
      105 -        <span className={`selo selo--${p.sugestao}`}>{ROTULO_S
          -UGESTAO[p.sugestao]}</span>                                   
      106 -        <div className="cartao__identificacao">               
      107 -          <h3 className="cartao__cliente">{p.cliente?.razaoSoc
          -ial ?? 'Cliente não encontrado'}</h3>                         
      108 -          <p className="cartao__meta">                        
      109 -            Pedido {p.numero} · {formatarData(p.criadoEm)} · {
          -p.vendedor?.nome ?? 'sem vendedor'} · {formatarCanal(p.canal)}
      110 -          </p>                                                
      255 +    <span className={`barra ${fina ? 'barra--fina' : ''}`} ari
          +a-hidden="true">                                              
      256 +      <span className="barra__divida" style={{ width: `${(p.di
          +vida / escala) * 100}%` }} />                                 
      257 +      <span className={`barra__pedido ${passou ? 'barra__pedid
          +o--passou' : ''}`} style={{ width: `${(p.valor / escala) * 100
          +}%` }} />                                                     
      258 +      <span className="barra__limite" style={{ left: `${(p.lim
          +ite / escala) * 100}%` }} />                                  
      259 +    </span>                                                   
      260 +  );                                                          
      261 +}                                                             
      262 +                                                              
      263 +function Detalhe({                                            
      264 +  pedido: p,                                                  
      265 +  decisao,                                                    
      266 +  tituloRef,                                                  
      267 +  onDecidir,                                                  
      268 +  onDesfazer,                                                 
      269 +}: {                                                          
      270 +  pedido: PedidoFilaFinanceiro;                               
      271 +  decisao: Decisao | undefined;                               
      272 +  tituloRef: React.RefObject<HTMLHeadingElement | null>;      
      273 +  onDecidir: (d: Decisao) => void;                            
      274 +  onDesfazer: () => void;                                     
      275 +}) {                                                          
      276 +  const idTabela = useId();                                   
      277 +  const bloqueia = p.sugestao === 'bloquear';                 
      278 +  const passou = p.limite !== null && p.totalComPedido > p.lim
          +ite;                                                          
      279 +                                                              
      280 +  return (                                                    
      281 +    <aside id="detalhe-pedido" className="detalhe" aria-labell
          +edby="titulo-detalhe">                                        
      282 +      <div className="detalhe__cabecalho">                    
      283 +        <div className="detalhe__linha">                      
      284 +          <SeloSugestao sugestao={p.sugestao} prefixo="Sugestã
          +o: " />                                                       
      285 +          <span className="mono detalhe__numero">Pedido {p.num
          +ero}</span>                                                   
      286          </div>
      112 -        <div className="cartao__valor">                       
      113 -          <span className="cartao__valor-rotulo">Pedido</span>
      114 -          <strong>{formatarReais(p.valor)}</strong>           
      115 -        </div>                                                
      287 +        <h2 id="titulo-detalhe" className="detalhe__cliente" r
          +ef={tituloRef} tabIndex={-1}>                                 
      288 +          {p.cliente?.razaoSocial ?? 'Cliente não encontrado'}
      289 +        </h2>                                                 
      290 +        <p className="detalhe__meta">                         
      291 +          {p.vendedor?.nome ?? 'sem vendedor'} · entrou {forma
          +tarData(p.criadoEm)} por {formatarCanal(p.canal)}             
      292 +        </p>                                                  
      293        </div>
      294  
      118 -      <ul className="motivos">                                
      119 -        {p.motivos.map((m) => (                               
      120 -          <li key={m}>{m}</li>                                
      121 -        ))}                                                   
      122 -      </ul>                                                   
      295 +      <div className="detalhe__corpo">                        
      296 +        <section aria-labelledby="sec-porque">                
      297 +          <h3 id="sec-porque" className="rotulo-secao">       
      298 +            Por quê                                           
      299 +          </h3>                                               
      300 +          <ul className="motivos">                            
      301 +            {p.motivos.map((m) => (                           
      302 +              <li key={m} className={`motivos__item tom-marcad
          +or-${p.sugestao}`}>                                           
      303 +                {m}                                           
      304 +              </li>                                           
      305 +            ))}                                               
      306 +          </ul>                                               
      307 +        </section>                                            
      308  
      124 -      <BarraCredito pedido={p} />                             
      309 +        <section aria-labelledby="sec-credito">               
      310 +          <h3 id="sec-credito" className="rotulo-secao">      
      311 +            Crédito                                           
      312 +          </h3>                                               
      313 +          {p.limite === null ? (                              
      314 +            <p className="tom-bloquear forte">Sem limite de cr
          +édito cadastrado.</p>                                         
      315 +          ) : (                                               
      316 +            <>                                                
      317 +              <BarraCredito pedido={p} />                     
      318 +              <dl className="credito">                        
      319 +                <div>                                         
      320 +                  <dt>                                        
      321 +                    <span className="legenda legenda--divida" 
          +aria-hidden="true" />                                         
      322 +                    Dívida                                    
      323 +                  </dt>                                       
      324 +                  <dd>{formatarReais(p.divida)}</dd>          
      325 +                </div>                                        
      326 +                <div>                                         
      327 +                  <dt>                                        
      328 +                    <span className={`legenda ${passou ? 'lege
          +nda--passou' : 'legenda--pedido'}`} aria-hidden="true" />     
      329 +                    Este pedido                               
      330 +                  </dt>                                       
      331 +                  <dd>{formatarReais(p.valor)}</dd>           
      332 +                </div>                                        
      333 +                <div>                                         
      334 +                  <dt>Total</dt>                              
      335 +                  <dd className={passou ? 'tom-bloquear forte'
          + : 'forte'}>{formatarReais(p.totalComPedido)}</dd>            
      336 +                </div>                                        
      337 +                <div>                                         
      338 +                  <dt>                                        
      339 +                    <span className="legenda legenda--limite" 
          +aria-hidden="true" />                                         
      340 +                    Limite                                    
      341 +                  </dt>                                       
      342 +                  <dd>{formatarReais(p.limite)}</dd>          
      343 +                </div>                                        
      344 +              </dl>                                           
      345 +            </>                                               
      346 +          )}                                                  
      347 +        </section>                                            
      348  
      126 -      {p.alertas.length > 0 && (                              
      127 -        <ul className="avisos" aria-label="Avisos">           
      128 -          {p.alertas.map((a) => (                             
      129 -            <li key={a}>{a}</li>                              
      130 -          ))}                                                 
      131 -        </ul>                                                 
      132 -      )}                                                      
      349 +        {p.alertas.length > 0 && (                            
      350 +          <section className="aviso" aria-labelledby="sec-avis
          +os">                                                          
      351 +            <h3 id="sec-avisos" className="aviso__titulo">    
      352 +              <IconeAviso tamanho={16} />                     
      353 +              Antes de decidir                                
      354 +            </h3>                                             
      355 +            <ul className="aviso__lista">                     
      356 +              {p.alertas.map((a) => (                         
      357 +                <li key={a}>{a}</li>                          
      358 +              ))}                                             
      359 +            </ul>                                             
      360 +          </section>                                          
      361 +        )}                                                    
      362  
      134 -      <details className="detalhes">                          
      135 -        <summary>Itens e boletos</summary>                    
      136 -        <div className="detalhes__grade">                     
      137 -          <div>                                               
      138 -            <h4>Itens</h4>                                    
      363 +        <section aria-labelledby={idTabela}>                  
      364 +          <h3 id={idTabela} className="rotulo-secao">         
      365 +            Boletos em aberto                                 
      366 +          </h3>                                               
      367 +          {p.boletosEmAberto.length === 0 ? (                 
      368 +            <p className="suave">Nenhum. Cliente em dia.</p>  
      369 +          ) : (                                               
      370              <table className="tabela">
      371 +              <caption className="so-leitor">Boletos em aberto
          + do cliente</caption>                                         
      372 +              <thead>                                         
      373 +                <tr>                                          
      374 +                  <th scope="col">Boleto</th>                 
      375 +                  <th scope="col">Vencimento</th>             
      376 +                  <th scope="col" className="numero">         
      377 +                    Valor                                     
      378 +                  </th>                                       
      379 +                </tr>                                         
      380 +              </thead>                                        
      381                <tbody>
      141 -                {p.itens.map((i) => (                         
      142 -                  <tr key={i.descricao}>                      
      143 -                    <td>{i.quantidade}×</td>                  
      144 -                    <td>{i.descricao}</td>                    
      145 -                    <td className="numero">{formatarReais(i.qu
          -antidade * i.precoUnitario)}</td>                             
      382 +                {p.boletosEmAberto.map((b) => (               
      383 +                  <tr key={b.id}>                             
      384 +                    <td className="mono">                     
      385 +                      {b.id}                                  
      386 +                      {p.cliente && b.clienteId !== p.cliente.
          +id && <span className="etiqueta">{b.clienteId}</span>}        
      387 +                    </td>                                     
      388 +                    <td>                                      
      389 +                      {formatarData(b.vencimento)} ·{' '}     
      390 +                      <span className={b.diasAtraso > 5 ? 'tom
          +-bloquear forte' : b.diasAtraso > 0 ? 'tom-atencao forte' : 's
          +uave'}>                                                       
      391 +                        {b.diasAtraso > 0 ? `${b.diasAtraso} $
          +{b.diasAtraso === 1 ? 'dia' : 'dias'} de atraso` : 'a vencer'}
      392 +                      </span>                                 
      393 +                    </td>                                     
      394 +                    <td className="numero forte">{formatarReai
          +s(b.valor)}</td>                                              
      395                    </tr>
      396                  ))}
      397                </tbody>
      398              </table>
      150 -          </div>                                              
      151 -          <div>                                               
      152 -            <h4>Boletos em aberto</h4>                        
      153 -            {p.boletosEmAberto.length === 0 ? (               
      154 -              <p className="sem-itens">Nenhum.</p>            
      155 -            ) : (                                             
      156 -              <table className="tabela">                      
      157 -                <thead>                                       
      158 -                  <tr>                                        
      159 -                    <th>Boleto</th>                           
      160 -                    <th>Vencimento</th>                       
      161 -                    <th className="numero">Valor</th>         
      162 -                  </tr>                                       
      163 -                </thead>                                      
      164 -                <tbody>                                       
      165 -                  {p.boletosEmAberto.map((b) => (             
      166 -                    <tr key={b.id} className={b.diasAtraso > 5
          - ? 'linha--grave' : b.diasAtraso > 0 ? 'linha--leve' : ''}>   
      167 -                      <td>                                    
      168 -                        {b.id}                                
      169 -                        {p.cliente && b.clienteId !== p.client
          -e.id && <span className="etiqueta">{b.clienteId}</span>}      
      170 -                      </td>                                   
      171 -                      <td>                                    
      172 -                        {formatarData(b.vencimento)}          
      173 -                        {b.diasAtraso > 0 && <span className="
          -atraso"> · {b.diasAtraso} {b.diasAtraso === 1 ? 'dia' : 'dias'
          -} de atraso</span>}                                           
      174 -                      </td>                                   
      175 -                      <td className="numero">{formatarReais(b.
          -valor)}</td>                                                  
      176 -                    </tr>                                     
      177 -                  ))}                                         
      178 -                </tbody>                                      
      179 -              </table>                                        
      180 -            )}                                                
      181 -          </div>                                              
      182 -        </div>                                                
      183 -        {p.cliente && (                                       
      184 -          <p className="detalhes__cliente">                   
      185 -            {p.cliente.id} · CNPJ {p.cliente.cnpj || 'não info
          -rmado'} · {p.cliente.segmento} · {p.cliente.cidade}           
      186 -          </p>                                                
      187 -        )}                                                    
      188 -      </details>                                              
      189 -    </article>                                                
      190 -  );                                                          
      191 -}                                                             
      399 +          )}                                                  
      400 +        </section>                                            
      401  
      193 -/** Quanto do limite fica comprometido se este pedido for libe
          -rado. */                                                      
      194 -function BarraCredito({ pedido: p }: { pedido: PedidoFilaFinan
          -ceiro }) {                                                    
      195 -  if (p.limite === null) {                                    
      196 -    return <p className="credito credito--sem-limite">Sem limi
          -te de crédito cadastrado.</p>;                                
      197 -  }                                                           
      198 -  const escala = Math.max(p.limite, p.totalComPedido);        
      199 -  const pctDivida = (p.divida / escala) * 100;                
      200 -  const pctPedido = (p.valor / escala) * 100;                 
      201 -  const pctLimite = (p.limite / escala) * 100;                
      202 -  const passou = p.totalComPedido > p.limite;                 
      402 +        <section aria-labelledby="sec-itens">                 
      403 +          <h3 id="sec-itens" className="rotulo-secao">        
      404 +            Itens                                             
      405 +          </h3>                                               
      406 +          <ul className="itens">                              
      407 +            {p.itens.map((i, n) => (                          
      408 +              <li key={`${i.descricao}-${n}`}>                
      409 +                <span>                                        
      410 +                  {i.quantidade}× {i.descricao}               
      411 +                </span>                                       
      412 +                <span className="numero suave">{formatarReais(
          +i.quantidade * i.precoUnitario)}</span>                       
      413 +              </li>                                           
      414 +            ))}                                               
      415 +          </ul>                                               
      416 +          {p.cliente && (                                     
      417 +            <p className="detalhe__cadastro">                 
      418 +              {p.cliente.id} · CNPJ {p.cliente.cnpj || 'não in
          +formado'} · {p.cliente.cidade}                                
      419 +            </p>                                              
      420 +          )}                                                  
      421 +        </section>                                            
      422 +      </div>                                                  
      423  
      204 -  return (                                                    
      205 -    <div className="credito">                                 
      206 -      <div                                                    
      207 -        className="credito__barra"                            
      208 -        role="img"                                            
      209 -        aria-label={`Dívida ${formatarReais(p.divida)} mais pe
          -dido ${formatarReais(p.valor)} somam ${formatarReais(p.totalCo
          -mPedido)} de ${formatarReais(p.limite)} de limite`}           
      210 -      >                                                       
      211 -        <span className="credito__divida" style={{ width: `${p
          -ctDivida}%` }} />                                             
      212 -        <span className={`credito__pedido ${passou ? 'credito_
          -_pedido--passou' : ''}`} style={{ width: `${pctPedido}%` }} />
      213 -        <span className="credito__limite" style={{ left: `${pc
          -tLimite}%` }} />                                              
      424 +      <div className="detalhe__acoes">                        
      425 +        {decisao ? (                                          
      426 +          <div className="decidido">                          
      427 +            <p>                                               
      428 +              <strong>Marcado como {decisao}.</strong> Por enq
          +uanto fica só nesta tela; na versão integrada, grava no Sistem
          +ão e avisa o vendedor.                                        
      429 +            </p>                                              
      430 +            <button type="button" className="botao botao--secu
          +ndario" onClick={onDesfazer}>                                 
      431 +              Desfazer                                        
      432 +            </button>                                         
      433 +          </div>                                              
      434 +        ) : (                                                 
      435 +          <>                                                  
      436 +            <div className="acoes">                           
      437 +              <button                                         
      438 +                type="button"                                 
      439 +                className={`botao ${bloqueia ? 'botao--bloquea
          +r' : 'botao--liberar'}`}                                      
      440 +                onClick={() => onDecidir(bloqueia ? 'bloqueado
          +' : 'liberado')}                                              
      441 +              >                                               
      442 +                {bloqueia ? 'Bloquear pedido' : p.sugestao ===
          + 'atencao' ? 'Liberar e pedir cobrança' : 'Liberar pedido'}   
      443 +              </button>                                       
      444 +              <button type="button" className="botao botao--se
          +cundario" onClick={() => onDecidir(bloqueia ? 'liberado' : 'bl
          +oqueado')}>                                                   
      445 +                {bloqueia ? 'Liberar mesmo assim' : 'Bloquear'
          +}                                                             
      446 +              </button>                                       
      447 +            </div>                                            
      448 +            <p className="acoes__nota">Ao decidir, o próximo p
          +edido pendente abre aqui.</p>                                 
      449 +          </>                                                 
      450 +        )}                                                    
      451        </div>
      215 -      <p className="credito__legenda">                        
      216 -        <span className="legenda legenda--divida">Dívida {form
          -atarReais(p.divida)}</span>                                   
      217 -        <span className="legenda legenda--pedido">+ pedido {fo
          -rmatarReais(p.valor)}</span>                                  
      218 -        <span className={passou ? 'legenda--passou' : ''}>    
      219 -          = {formatarReais(p.totalComPedido)} de {formatarReai
          -s(p.limite)}                                                  
      220 -        </span>                                               
      221 -      </p>                                                    
      222 -    </div>                                                    
      452 +    </aside>                                                  
      453    );
      454  }
      225 -                                                              
      226 -function normalizar(texto: string) {                          
      227 -  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '')
          -.toLowerCase();                                               
      228 -}                                                             

● Agora a visão do vendedor:

● Write(src\app\VisaoVendedor.tsx)
  ⎿  Error writing file

  Ran 1 shell command (ctrl+o to expand)

● A escrita do VisaoVendedor.tsx foi recusada porque o arquivo mudou desde a
  última leitura (por uma edição minha anterior). Leio o arquivo e reescrevo:

  Read 1 file (ctrl+o to expand)

● Write(src\app\VisaoVendedor.tsx)
  ⎿  Added 178 lines, removed 87 lines
        2  import type { Sugestao } from '../dominio/credito';
        3  import type { ClienteVendedor, DadosVendedor, PedidoVendedor }
            from '../dominio/visoes';
        4  import { formatarData, formatarReais } from './formato';
        5 +import { IconeAviso, IconeBusca, IconeClientes, IconePedidos, 
          +IconeStatus } from './Icones';                                
        6  
        7  type Aba = 'pedidos' | 'clientes';
        8  
        8 -const ORDEM_SITUACAO: Record<Sugestao, number> = { bloquear: 0
          -, atencao: 1, liberar: 2 };                                   
        9 +const ORDEM: Record<Sugestao, number> = { bloquear: 0, atencao
          +: 1, liberar: 2 };                                            
       10  
       11 +/** Enquanto a Marta não decide, o vendedor vê uma previsão, n
          +unca uma decisão. */                                          
       12 +const PREVISAO: Record<Sugestao, string> = {                  
       13 +  bloquear: 'Deve ser bloqueado',                             
       14 +  atencao: 'Deve sair · cobrar cliente',                      
       15 +  liberar: 'Deve ser liberado',                               
       16 +};                                                            
       17 +                                                              
       18 +const SITUACAO_CLIENTE: Record<Sugestao, string> = {          
       19 +  bloquear: 'Bloqueado',                                      
       20 +  atencao: 'Atenção',                                         
       21 +  liberar: 'Liberado',                                        
       22 +};                                                            
       23 +                                                              
       24 +function abaDoEndereco(): Aba {                               
       25 +  return window.location.hash === '#clientes' ? 'clientes' : '
          +pedidos';                                                     
       26 +}                                                             
       27 +                                                              
       28  export function VisaoVendedor({ dados }: { dados: DadosVendedo
           r }) {
       29 +  const [aba, setAbaEstado] = useState<Aba>(abaDoEndereco);   
       30 +  const primeiroNome = dados.vendedor.nome.split(' ')[0];     
       31 +                                                              
       32    // A aba fica no endereço (#clientes) para dar para salvar u
           m atalho direto.
       12 -  const [aba, setAbaEstado] = useState<Aba>(() => (window.loca
          -tion.hash === '#clientes' ? 'clientes' : 'pedidos'));         
       33    const setAba = (nova: Aba) => {
       34      setAbaEstado(nova);
       35      window.history.replaceState(null, '', nova === 'clientes' 
           ? '#clientes' : window.location.pathname);
       36 +    window.scrollTo({ top: 0 });                              
       37    };
       17 -  const primeiroNome = dados.vendedor.nome.split(' ')[0];     
       38  
       19 -  // O que tem problema primeiro; dentro de cada situação, o m
          -ais recente.                                                  
       39    const noFinanceiro = dados.pedidos
       40      .filter((p) => p.situacao !== null)
       22 -    .sort((a, b) => ORDEM_SITUACAO[a.situacao?.sugestao ?? 'li
          -berar'] - ORDEM_SITUACAO[b.situacao?.sugestao ?? 'liberar'] ||
          - b.criadoEm.localeCompare(a.criadoEm));                       
       23 -  const emAndamento = dados.pedidos.filter((p) => p.status ===
          - 'separacao' || p.status === 'em_rota');                      
       41 +    .sort((a, b) => ORDEM[a.situacao?.sugestao ?? 'liberar'] -
          + ORDEM[b.situacao?.sugestao ?? 'liberar'] || b.criadoEm.locale
          +Compare(a.criadoEm));                                         
       42 +  const precisam = noFinanceiro.filter((p) => p.situacao?.suge
          +stao !== 'liberar');                                          
       43 +  const devemSair = noFinanceiro.filter((p) => p.situacao?.sug
          +estao === 'liberar');                                         
       44 +  const andamento = dados.pedidos.filter((p) => p.status === '
          +separacao' || p.status === 'em_rota');                        
       45    const historico = dados.pedidos.filter((p) => p.status === '
           entregue' || p.status === 'cancelado');
       25 -  const travados = noFinanceiro.filter((p) => p.situacao?.suge
          -stao === 'bloquear').length;                                  
       46 +  const conta = (s: Sugestao) => noFinanceiro.filter((p) => p.
          +situacao?.sugestao === s).length;                             
       47  
       48    return (
       28 -    <section className="vendedor" aria-labelledby="titulo-vend
          -edor">                                                        
       29 -      <div className="cabecalho-visao">                       
       30 -        <h1 id="titulo-vendedor">Olá, {primeiroNome}</h1>     
       31 -        <p className="subtitulo">                             
       32 -          {noFinanceiro.length === 0                          
       33 -            ? 'Nenhum pedido seu esperando o financeiro.'     
       34 -            : `${noFinanceiro.length} ${noFinanceiro.length ==
          -= 1 ? 'pedido esperando' : 'pedidos esperando'} o financeiro${
          -travados > 0 ? `, ${travados} com problema` : ''}.`}          
       35 -        </p>                                                  
       36 -      </div>                                                  
       37 -                                                              
       38 -      <div className="abas" role="tablist" aria-label="O que v
          -er">                                                          
       39 -        <button type="button" role="tab" id="aba-pedidos" aria
          --controls="painel-pedidos" aria-selected={aba === 'pedidos'} c
          -lassName="aba" onClick={() => setAba('pedidos')}>             
       40 -          Meus pedidos                                        
       41 -        </button>                                             
       42 -        <button type="button" role="tab" id="aba-clientes" ari
          -a-controls="painel-clientes" aria-selected={aba === 'clientes'
          -} className="aba" onClick={() => setAba('clientes')}>         
       43 -          Meus clientes                                       
       44 -        </button>                                             
       45 -      </div>                                                  
       46 -                                                              
       49 +    <div className="celular">                                 
       50        {aba === 'pedidos' ? (
       48 -        <div role="tabpanel" id="painel-pedidos" aria-labelled
          -by="aba-pedidos">                                             
       49 -          <Grupo titulo="Esperando o financeiro" pedidos={noFi
          -nanceiro} vazio="Nada esperando o financeiro." />             
       50 -          <Grupo titulo="Em separação ou a caminho" pedidos={e
          -mAndamento} vazio="Nenhum pedido em separação ou a caminho." /
          ->                                                             
       51 +        <section aria-labelledby="titulo-vendedor">           
       52 +          <div className="celular__cabecalho">                
       53 +            <h1 id="titulo-vendedor" className="titulo">      
       54 +              Olá, <em>{primeiroNome}</em>                    
       55 +            </h1>                                             
       56 +            <p className="subtitulo">                         
       57 +              {noFinanceiro.length === 0                      
       58 +                ? 'Nenhum pedido seu esperando o financeiro.' 
       59 +                : `${noFinanceiro.length} ${noFinanceiro.lengt
          +h === 1 ? 'pedido esperando' : 'pedidos esperando'} o financei
          +ro`}                                                          
       60 +            </p>                                              
       61 +            {noFinanceiro.length > 0 && (                     
       62 +              <ul className="contadores" aria-label="Resumo"> 
       63 +                <li className="contadores__item contadores__it
          +em--bloquear">                                                
       64 +                  <strong>{conta('bloquear')}</strong> travado
          +s                                                             
       65 +                </li>                                         
       66 +                <li className="contadores__item contadores__it
          +em--atencao">                                                 
       67 +                  <strong>{conta('atencao')}</strong> cobrar c
          +liente                                                        
       68 +                </li>                                         
       69 +                <li className="contadores__item contadores__it
          +em--liberar">                                                 
       70 +                  <strong>{conta('liberar')}</strong> devem sa
          +ir                                                            
       71 +                </li>                                         
       72 +              </ul>                                           
       73 +            )}                                                
       74 +          </div>                                              
       75 +                                                              
       76 +          <Grupo titulo="Precisam de você" pedidos={precisam} 
          +/>                                                            
       77 +          <Grupo titulo="Devem ser liberados" pedidos={devemSa
          +ir} />                                                        
       78 +          <Grupo titulo="Em separação ou a caminho" pedidos={a
          +ndamento} />                                                  
       79            {historico.length > 0 && (
       80              <details className="historico">
       53 -              <summary>Entregues e cancelados ({historico.leng
          -th})</summary>                                                
       54 -              <ol className="lista-pedidos">                  
       81 +              <summary>Ver {historico.length} entregues e canc
          +elados</summary>                                              
       82 +              <ul className="cartoes">                        
       83                  {historico.map((p) => (
       84                    <li key={p.numero}>
       57 -                    <CartaoPedidoVendedor pedido={p} />       
       85 +                    <CartaoPedido pedido={p} />               
       86                    </li>
       87                  ))}
       60 -              </ol>                                           
       88 +              </ul>                                           
       89              </details>
       90            )}
       63 -        </div>                                                
       91 +        </section>                                            
       92        ) : (
       65 -        <div role="tabpanel" id="painel-clientes" aria-labelle
          -dby="aba-clientes">                                           
       66 -          <ListaClientes clientes={dados.clientes} />         
       67 -        </div>                                                
       93 +        <Clientes clientes={dados.clientes} />                
       94        )}
       69 -    </section>                                                
       95 +                                                              
       96 +      <nav className="abas-inferiores" aria-label="Seções">   
       97 +        <button type="button" className="aba-inferior" aria-cu
          +rrent={aba === 'pedidos' ? 'page' : undefined} onClick={() => 
          +setAba('pedidos')}>                                           
       98 +          <IconePedidos />                                    
       99 +          Meus pedidos                                        
      100 +        </button>                                             
      101 +        <button type="button" className="aba-inferior" aria-cu
          +rrent={aba === 'clientes' ? 'page' : undefined} onClick={() =>
          + setAba('clientes')}>                                         
      102 +          <IconeClientes />                                   
      103 +          Meus clientes                                       
      104 +        </button>                                             
      105 +      </nav>                                                  
      106 +    </div>                                                    
      107    );
      108  }
      109  
       73 -function Grupo({ titulo, pedidos, vazio }: { titulo: string; p
          -edidos: PedidoVendedor[]; vazio: string }) {                  
      110 +function Grupo({ titulo, pedidos }: { titulo: string; pedidos:
          + PedidoVendedor[] }) {                                        
      111 +  if (pedidos.length === 0) return null;                      
      112    return (
       75 -    <section className="secao">                               
       76 -      <h2 className="secao__titulo">                          
       77 -        {titulo} <span className="secao__numero">{pedidos.leng
          -th}</span>                                                    
      113 +    <section className="celular__grupo" aria-label={titulo}>  
      114 +      <h2 className="rotulo-secao">                           
      115 +        {titulo} · {pedidos.length}                           
      116        </h2>
       79 -      {pedidos.length === 0 ? (                               
       80 -        <p className="vazio">{vazio}</p>                      
       81 -      ) : (                                                   
       82 -        <ol className="lista-pedidos">                        
       83 -          {pedidos.map((p) => (                               
       84 -            <li key={p.numero}>                               
       85 -              <CartaoPedidoVendedor pedido={p} />             
       86 -            </li>                                             
       87 -          ))}                                                 
       88 -        </ol>                                                 
       89 -      )}                                                      
      117 +      <ul className="cartoes">                                
      118 +        {pedidos.map((p) => (                                 
      119 +          <li key={p.numero}>                                 
      120 +            <CartaoPedido pedido={p} />                       
      121 +          </li>                                               
      122 +        ))}                                                   
      123 +      </ul>                                                   
      124      </section>
      125    );
      126  }
      127  
       94 -function CartaoPedidoVendedor({ pedido: p }: { pedido: PedidoV
          -endedor }) {                                                  
      128 +function CartaoPedido({ pedido: p }: { pedido: PedidoVendedor 
          +}) {                                                          
      129    const s = p.situacao;
      130 +  const barrado = p.status === 'bloqueado_financeiro';        
      131    return (
       97 -    <article className={`cartao cartao--compacto ${s ? `cartao
          ---${s.sugestao}` : 'cartao--neutro'}`}>                       
      132 +    <article className="cartao" aria-labelledby={`pedido-${p.n
          +umero}`}>                                                     
      133        <div className="cartao__linha">
       99 -        <h3 className="cartao__cliente">{p.cliente}</h3>      
      100 -        <strong className="cartao__valor-simples">{formatarRea
          -is(p.valor)}</strong>                                         
      134 +        {s ? (                                                
      135 +          <span className={`selo selo--${s.sugestao}`}>       
      136 +            <IconeStatus sugestao={s.sugestao} />             
      137 +            {barrado ? 'Barrado pelo financeiro' : PREVISAO[s.
          +sugestao]}                                                    
      138 +          </span>                                             
      139 +        ) : (                                                 
      140 +          <span className="selo selo--neutro">{p.rotuloStatus}
          +</span>                                                       
      141 +        )}                                                    
      142 +        <span className="cartao__valor">{formatarReais(p.valor
          +)}</span>                                                     
      143        </div>
      144 +      <h3 id={`pedido-${p.numero}`} className="cartao__cliente
          +">                                                            
      145 +        {p.cliente}                                           
      146 +      </h3>                                                   
      147 +      {s && <p className="cartao__mensagem">{s.texto}</p>}    
      148 +      {p.aviso && (                                           
      149 +        <p className="cartao__aviso">                         
      150 +          <IconeAviso tamanho={16} />                         
      151 +          {p.aviso}                                           
      152 +        </p>                                                  
      153 +      )}                                                      
      154        <p className="cartao__meta">
      103 -        Pedido {p.numero} · {formatarData(p.criadoEm)} · {p.ro
          -tuloStatus}                                                   
      155 +        <span className="mono">Pedido {p.numero}</span> · {for
          +matarData(p.criadoEm)}                                        
      156 +        {s && !barrado ? ' · na fila do financeiro' : ''}     
      157        </p>
      105 -      {s && (                                                 
      106 -        <div className={`situacao situacao--${s.sugestao}`}>  
      107 -          <p className="situacao__titulo">                    
      108 -            {p.status === 'bloqueado_financeiro' ? 'Financeiro
          -' : 'Previsão do financeiro'}{' '}                            
      109 -            <span className={`selo selo--${s.sugestao}`}>{s.ro
          -tulo}</span>                                                  
      110 -          </p>                                                
      111 -          <p>{s.texto}</p>                                    
      112 -        </div>                                                
      113 -      )}                                                      
      114 -      {p.aviso && <p className="aviso-vendedor">{p.aviso}</p>}
      115 -      <p className="itens-resumo">{p.itens.map((i) => `${i.qua
          -ntidade}× ${i.descricao}`).join(' · ')}</p>                   
      158 +      <p className="cartao__itens">{p.itens.map((i) => `${i.qu
          +antidade}× ${i.descricao}`).join(' · ')}</p>                  
      159      </article>
      160    );
      161  }
      162  
      120 -function ListaClientes({ clientes }: { clientes: ClienteVended
          -or[] }) {                                                     
      121 -  const ordenados = [...clientes].sort(                       
      122 -    (a, b) => ORDEM_SITUACAO[a.situacao.sugestao] - ORDEM_SITU
          -ACAO[b.situacao.sugestao] || a.razaoSocial.localeCompare(b.raz
          -aoSocial, 'pt-BR'),                                           
      123 -  );                                                          
      163 +function Clientes({ clientes }: { clientes: ClienteVendedor[] 
          +}) {                                                          
      164 +  const [busca, setBusca] = useState('');                     
      165 +  const termo = busca.trim().toLowerCase();                   
      166 +  const filtrados = clientes                                  
      167 +    .filter((c) => !termo || c.razaoSocial.toLowerCase().inclu
          +des(termo))                                                   
      168 +    .sort((a, b) => ORDEM[a.situacao.sugestao] - ORDEM[b.situa
          +cao.sugestao] || a.razaoSocial.localeCompare(b.razaoSocial, 'p
          +t-BR'));                                                      
      169 +  const conversar = filtrados.filter((c) => c.situacao.sugesta
          +o !== 'liberar');                                             
      170 +  const emDia = filtrados.filter((c) => c.situacao.sugestao ==
          += 'liberar');                                                 
      171 +                                                              
      172    return (
      125 -    <section className="secao">                               
      126 -      <p className="secao__dica">Antes de prometer entrega, ve
          -ja como está o cliente no financeiro.</p>                     
      127 -      <ul className="lista-clientes">                         
      128 -        {ordenados.map((c) => (                               
      129 -          <li key={c.id} className={`cliente cliente--${c.situ
          -acao.sugestao}`}>                                             
      130 -            <div className="cartao__linha">                   
      131 -              <h3 className="cartao__cliente">{c.razaoSocial}<
          -/h3>                                                          
      132 -              <span className={`selo selo--${c.situacao.sugest
          -ao}`}>{c.situacao.rotulo}</span>                              
      133 -            </div>                                            
      134 -            <p className="cartao__meta">{c.cidade}</p>        
      135 -            {c.situacao.sugestao !== 'liberar' && <p className
          -="cliente__texto">{c.situacao.texto}</p>}                     
      136 -          </li>                                               
      137 -        ))}                                                   
      138 -      </ul>                                                   
      173 +    <section aria-labelledby="titulo-clientes">               
      174 +      <div className="celular__cabecalho">                    
      175 +        <h1 id="titulo-clientes" className="titulo">          
      176 +          Meus <em>clientes</em>                              
      177 +        </h1>                                                 
      178 +        <p className="subtitulo">Antes de prometer entrega, ve
          +ja como o cliente está no financeiro.</p>                     
      179 +        <label className="busca busca--redonda">              
      180 +          <IconeBusca />                                      
      181 +          <span className="so-leitor">Buscar cliente</span>   
      182 +          <input type="search" value={busca} onChange={(e) => 
          +setBusca(e.target.value)} placeholder="Buscar cliente" />     
      183 +        </label>                                              
      184 +      </div>                                                  
      185 +                                                              
      186 +      {filtrados.length === 0 && <p className="vazio">Nenhum c
          +liente com esse nome.</p>}                                    
      187 +                                                              
      188 +      {conversar.length > 0 && (                              
      189 +        <section className="celular__grupo" aria-label="Precis
          +am de conversa">                                              
      190 +          <h2 className="rotulo-secao">Precisam de conversa · 
          +{conversar.length}</h2>                                       
      191 +          <ul className="cartoes">                            
      192 +            {conversar.map((c) => (                           
      193 +              <li key={c.id} className="cartao">              
      194 +                <div className="cartao__linha">               
      195 +                  <div>                                       
      196 +                    <h3 className="cartao__cliente">{c.razaoSo
          +cial}</h3>                                                    
      197 +                    <p className="cartao__meta">{c.cidade}</p>
      198 +                  </div>                                      
      199 +                  <span className={`selo selo--${c.situacao.su
          +gestao}`}>                                                    
      200 +                    <IconeStatus sugestao={c.situacao.sugestao
          +} />                                                          
      201 +                    {SITUACAO_CLIENTE[c.situacao.sugestao]}   
      202 +                  </span>                                     
      203 +                </div>                                        
      204 +                <p className="cartao__mensagem">{c.situacao.te
          +xto}</p>                                                      
      205 +              </li>                                           
      206 +            ))}                                               
      207 +          </ul>                                               
      208 +        </section>                                            
      209 +      )}                                                      
      210 +                                                              
      211 +      {emDia.length > 0 && (                                  
      212 +        <section className="celular__grupo" aria-label="Em dia
          +">                                                            
      213 +          <h2 className="rotulo-secao">Em dia · {emDia.length}
          +</h2>                                                         
      214 +          <ul className="lista-compacta">                     
      215 +            {emDia.map((c) => (                               
      216 +              <li key={c.id}>                                 
      217 +                <div>                                         
      218 +                  <h3 className="cartao__cliente">{c.razaoSoci
          +al}</h3>                                                      
      219 +                  <p className="cartao__meta">{c.cidade}</p>  
      220 +                </div>                                        
      221 +                <span className="selo selo--liberar">         
      222 +                  <IconeStatus sugestao="liberar" />          
      223 +                  Liberado                                    
      224 +                </span>                                       
      225 +              </li>                                           
      226 +            ))}                                               
      227 +          </ul>                                               
      228 +        </section>                                            
      229 +      )}                                                      
      230      </section>
      231    );
      232  }

● O CSS está completo: as cores vêm de variáveis para os dois temas, os tamanhos
  em rem, o layout se adapta à largura, e há suporte ao alto contraste e a
  menos movimento.

● Write(src\app\estilos.css)
  ⎿  Added 954 lines, removed 382 lines
       1  /* Brilho Minas · fila do financeiro
       2 -   Mobile primeiro. A cor nunca é a única pista: todo estado te
         -m texto (selo). */                                             
       2 +   Identidade visual baseada no Divos da IA. Cores em src/app/t
         +ema.ts (claro e                                                
       3 +   escuro, com contraste testado). Tamanhos em rem: respeitam a
         + fonte que a                                                   
       4 +   pessoa escolheu no navegador. A cor nunca é a única pista: t
         +odo status tem                                                 
       5 +   ícone e texto. */                                           
       6  
       7  :root {
       5 -  --fundo: #f5f6f8;                                            
       6 -  --superficie: #ffffff;                                       
       7 -  --superficie-2: #f0f2f5;                                     
       8 -  --borda: #dde1e7;                                            
       9 -  --texto: #1b2230;                                            
      10 -  --texto-suave: #5b6578;                                      
      11 -  --marca: #0f5c8c;                                            
      12 -  --foco: #1a73e8;                                             
      13 -                                                               
      14 -  --liberar: #1e7b45;                                          
      15 -  --liberar-fundo: #e5f4ea;                                    
      16 -  --atencao: #8a5a00;                                          
      17 -  --atencao-fundo: #fff2d6;                                    
      18 -  --atencao-forte: #d99a00;                                    
      19 -  --bloquear: #b42318;                                         
      20 -  --bloquear-fundo: #fde7e5;                                   
      21 -  --aviso-fundo: #fff8e1;                                      
      22 -  --aviso-borda: #f0c75e;                                      
      23 -                                                               
      24 -  --divida: #8b95a7;                                           
      25 -  --pedido: #0f5c8c;                                           
      26 -                                                               
      27 -  --raio: 10px;                                                
      28 -  --sombra: 0 1px 2px rgb(16 24 40 / 6%), 0 1px 3px rgb(16 24 4
         -0 / 8%);                                                       
      29 -  color-scheme: light;                                         
       8 +  --fonte-titulo: 'Playfair Display', Georgia, 'Times New Roman
         +', serif;                                                      
       9 +  --fonte-texto: Inter, system-ui, -apple-system, 'Segoe UI', R
         +oboto, sans-serif;                                             
      10 +  --fonte-mono: 'JetBrains Mono', ui-monospace, 'SF Mono', Menl
         +o, Consolas, monospace;                                        
      11 +  --raio: 0.875rem;                                            
      12 +  --altura-topo: 4rem;                                         
      13  }
      14  
      32 -@media (prefers-color-scheme: dark) {                          
      33 -  :root:not([data-theme='light']) {                            
      34 -    --fundo: #0f1419;                                          
      35 -    --superficie: #182029;                                     
      36 -    --superficie-2: #1f2933;                                   
      37 -    --borda: #2e3a47;                                          
      38 -    --texto: #e6eaf0;                                          
      39 -    --texto-suave: #9aa5b5;                                    
      40 -    --marca: #6cb4e4;                                          
      41 -    --foco: #8ab4f8;                                           
      42 -    --liberar: #5fd08e;                                        
      43 -    --liberar-fundo: #13321f;                                  
      44 -    --atencao: #f2c14e;                                        
      45 -    --atencao-fundo: #3a2c0b;                                  
      46 -    --atencao-forte: #f2c14e;                                  
      47 -    --bloquear: #ff8a80;                                       
      48 -    --bloquear-fundo: #3d1714;                                 
      49 -    --aviso-fundo: #2f2810;                                    
      50 -    --aviso-borda: #8a6d1d;                                    
      51 -    --divida: #6b7688;                                         
      52 -    --pedido: #6cb4e4;                                         
      53 -    --sombra: none;                                            
      54 -    color-scheme: dark;                                        
      55 -  }                                                            
      56 -}                                                              
      57 -                                                               
      15  *,
      16  *::before,
      17  *::after {
      18    box-sizing: border-box;
      19  }
      20  
      21 +html {                                                         
      22 +  -webkit-text-size-adjust: 100%;                              
      23 +}                                                              
      24 +                                                               
      25  body {
      26    margin: 0;
      27    background: var(--fundo);
      28    color: var(--texto);
      68 -  font: 16px/1.45 system-ui, -apple-system, 'Segoe UI', Roboto,
         - sans-serif;                                                   
      69 -  -webkit-text-size-adjust: 100%;                              
      29 +  font-family: var(--fonte-texto);                             
      30 +  font-size: 1rem;                                             
      31 +  line-height: 1.5;                                            
      32 +  -webkit-font-smoothing: antialiased;                         
      33  }
      34  
      35  h1,
      36  h2,
      37  h3,
      75 -h4,                                                            
      76 -p {                                                            
      38 +p,                                                             
      39 +ul,                                                            
      40 +dl,                                                            
      41 +dd {                                                           
      42    margin: 0;
      43  }
      44  
      45 +ul {                                                           
      46 +  padding: 0;                                                  
      47 +  list-style: none;                                            
      48 +}                                                              
      49 +                                                               
      50  button,
      51  input,
      52  select {
     ...
        54    color: inherit;
        55  }
        56  
        57 +button {                                                     
        58 +  cursor: pointer;                                           
        59 +}                                                            
        60 +                                                             
        61  :focus-visible {
        62    outline: 3px solid var(--foco);
        63    outline-offset: 2px;
        64  }
        65  
        66 +[tabindex='-1']:focus:not(:focus-visible) {                  
        67 +  outline: none;                                             
        68 +}                                                            
        69 +                                                             
        70 +.so-leitor {                                                 
        71 +  position: absolute;                                        
        72 +  width: 1px;                                                
        73 +  height: 1px;                                               
        74 +  padding: 0;                                                
        75 +  margin: -1px;                                              
        76 +  overflow: hidden;                                          
        77 +  clip: rect(0 0 0 0);                                       
        78 +  white-space: nowrap;                                       
        79 +  border: 0;                                                 
        80 +}                                                            
        81 +                                                             
        82 +.pular {                                                     
        83 +  position: absolute;                                        
        84 +  left: 1rem;                                                
        85 +  top: -4rem;                                                
        86 +  z-index: 100;                                              
        87 +  padding: 0.75rem 1rem;                                     
        88 +  border-radius: 0.5rem;                                     
        89 +  background: var(--marca);                                  
        90 +  color: var(--sobre-marca);                                 
        91 +  font-weight: 600;                                          
        92 +  text-decoration: none;                                     
        93 +}                                                            
        94 +                                                             
        95 +.pular:focus {                                               
        96 +  top: 0.75rem;                                              
        97 +}                                                            
        98 +                                                             
        99 +.mono {                                                      
       100 +  font-family: var(--fonte-mono);                            
       101 +  font-size: 0.9em;                                          
       102 +}                                                            
       103 +                                                             
       104 +.numero {                                                    
       105 +  text-align: right;                                         
       106 +  font-variant-numeric: tabular-nums;                        
       107 +  white-space: nowrap;                                       
       108 +}                                                            
       109 +                                                             
       110 +.forte {                                                     
       111 +  font-weight: 700;                                          
       112 +}                                                            
       113 +                                                             
       114 +.suave {                                                     
       115 +  color: var(--texto-suave);                                 
       116 +}                                                            
       117 +                                                             
       118 +.tom-bloquear {                                              
       119 +  color: var(--bloquear);                                    
       120 +}                                                            
       121 +.tom-atencao {                                               
       122 +  color: var(--atencao);                                     
       123 +}                                                            
       124 +.tom-liberar {                                               
       125 +  color: var(--liberar);                                     
       126 +}                                                            
       127 +                                                             
       128 +.vazio {                                                     
       129 +  padding: 2rem 1.25rem;                                     
       130 +  color: var(--texto-suave);                                 
       131 +}                                                            
       132 +                                                             
       133  /* ---- Topo ------------------------------------------------
            ---------------- */
       134  
       135  .topo {
       136    position: sticky;
       137    top: 0;
        97 -  z-index: 10;                                               
       138 +  z-index: 20;                                               
       139    background: var(--superficie);
        99 -  border-bottom: 1px solid var(--borda);                     
       140 +  border-bottom: 1px solid var(--linha);                     
       141  }
       142  
       143  .topo__conteudo {
       103 -  max-width: 1080px;                                         
       144 +  max-width: 96rem;                                          
       145 +  min-height: var(--altura-topo);                            
       146    margin: 0 auto;
       105 -  padding: 10px 16px;                                        
       147 +  padding: 0.5rem 1rem;                                      
       148    display: flex;
       149    flex-wrap: wrap;
       108 -  gap: 8px 16px;                                             
       150    align-items: center;
       151    justify-content: space-between;
       152 +  gap: 0.5rem 1.5rem;                                        
       153  }
       154  
       155 +.topo__conteudo--estreito {                                  
       156 +  max-width: 40rem;                                          
       157 +}                                                            
       158 +                                                             
       159  .marca {
       160    display: flex;
       115 -  flex-direction: column;                                    
       161 +  align-items: center;                                       
       162 +  gap: 0.75rem;                                              
       163  }
       164  
       165 +.marca__simbolo {                                            
       166 +  width: 2rem;                                               
       167 +  height: 2rem;                                              
       168 +  border-radius: 0.5rem;                                     
       169 +  display: grid;                                             
       170 +  place-items: center;                                       
       171 +  background: var(--marca);                                  
       172 +  color: var(--sobre-marca);                                 
       173 +}                                                            
       174 +                                                             
       175  .marca__nome {
       176 +  font-family: var(--fonte-titulo);                          
       177    font-weight: 700;
       120 -  color: var(--marca);                                       
       178 +  font-size: 1.125rem;                                       
       179  }
       180  
       123 -.marca__data {                                               
       124 -  font-size: 0.8rem;                                         
       181 +.marca__secao {                                              
       182 +  padding-left: 0.75rem;                                     
       183 +  border-left: 1px solid var(--linha);                       
       184    color: var(--texto-suave);
       185 +  font-weight: 500;                                          
       186  }
       187  
       128 -.seletor {                                                   
       188 +.topo__controles {                                           
       189    display: flex;
       190 +  flex-wrap: wrap;                                           
       191    align-items: center;
       131 -  gap: 8px;                                                  
       132 -  flex: 1 1 auto;                                            
       133 -  justify-content: flex-end;                                 
       134 -  min-width: 0;                                              
       192 +  gap: 0.5rem 1rem;                                          
       193  }
       194  
       137 -.seletor__rotulo {                                           
       138 -  font-size: 0.85rem;                                        
       195 +.topo__data {                                                
       196    color: var(--texto-suave);
       197 +  font-size: 0.875rem;                                       
       198 +}                                                            
       199 +                                                             
       200 +.controle {                                                  
       201 +  display: flex;                                             
       202 +  align-items: center;                                       
       203 +  gap: 0.5rem;                                               
       204 +}                                                            
       205 +                                                             
       206 +.controle__rotulo {                                          
       207 +  font-size: 0.8125rem;                                      
       208 +  color: var(--texto-suave);                                 
       209    white-space: nowrap;
       210  }
       211  
       143 -.seletor__campo {                                            
       144 -  min-height: 44px;                                          
       145 -  min-width: 0;                                              
       212 +.controle__campo {                                           
       213 +  min-height: 2.75rem;                                       
       214    max-width: 100%;
       147 -  padding: 0 10px;                                           
       148 -  border: 1px solid var(--borda);                            
       149 -  border-radius: 8px;                                        
       150 -  background: var(--superficie-2);                           
       215 +  padding: 0 0.75rem;                                        
       216 +  border: 1px solid var(--controle);                         
       217 +  border-radius: 0.5rem;                                     
       218 +  background: var(--superficie);                             
       219 +}                                                            
       220 +                                                             
       221 +.controle__campo--forte {                                    
       222    font-weight: 600;
       223  }
       224  
       225 +@media (min-width: 40rem) {                                  
       226 +  .topo__conteudo {                                          
       227 +    padding-inline: 2rem;                                    
       228 +  }                                                          
       229 +}                                                            
       230 +                                                             
       231 +@media (max-width: 39.99rem) {                               
       232 +  .topo__data,                                               
       233 +  .marca__secao {                                            
       234 +    display: none;                                           
       235 +  }                                                          
       236 +}                                                            
       237 +                                                             
       238  /* ---- Página ----------------------------------------------
            ---------------- */
       239  
       240  .pagina {
       157 -  max-width: 1080px;                                         
       241 +  max-width: 96rem;                                          
       242    margin: 0 auto;
       159 -  padding: 16px 16px 48px;                                   
       243 +  padding: 1.5rem 1rem 3rem;                                 
       244  }
       245  
       162 -.cabecalho-visao {                                           
       163 -  margin-bottom: 16px;                                       
       246 +.pagina:focus {                                              
       247 +  outline: none;                                             
       248  }
       249  
       166 -.cabecalho-visao h1 {                                        
       167 -  font-size: 1.4rem;                                         
       168 -  line-height: 1.2;                                          
       250 +@media (min-width: 40rem) {                                  
       251 +  .pagina {                                                  
       252 +    padding-inline: 2rem;                                    
       253 +  }                                                          
       254  }
       255  
       256 +.titulo {                                                    
       257 +  font-family: var(--fonte-titulo);                          
       258 +  font-weight: 700;                                          
       259 +  font-size: clamp(1.625rem, 1.2rem + 1.5vw, 2rem);          
       260 +  line-height: 1.15;                                         
       261 +  text-wrap: balance;                                        
       262 +}                                                            
       263 +                                                             
       264 +.titulo em {                                                 
       265 +  font-style: italic;                                        
       266 +  font-weight: 600;                                          
       267 +  color: var(--marca);                                       
       268 +}                                                            
       269 +                                                             
       270  .subtitulo {
       172 -  margin-top: 4px;                                           
       271 +  margin-top: 0.25rem;                                       
       272    color: var(--texto-suave);
       273  }
       274  
       176 -.vazio,                                                      
       177 -.sem-itens {                                                 
       178 -  color: var(--texto-suave);                                 
       179 -  padding: 8px 0;                                            
       275 +.rotulo-secao {                                              
       276 +  font-size: 0.75rem;                                        
       277 +  font-weight: 600;                                          
       278 +  letter-spacing: 0.14em;                                    
       279 +  text-transform: uppercase;                                 
       280 +  color: var(--marca);                                       
       281  }
       282  
       182 -/* ---- Filtros ---------------------------------------------
           ----------------- */                                          
       283 +/* ---- Selos e etiquetas -----------------------------------
           +---------------- */                                          
       284  
       184 -.barra-filtros {                                             
       185 -  display: flex;                                             
       186 -  flex-wrap: wrap;                                           
       187 -  gap: 10px;                                                 
       188 -  margin-bottom: 8px;                                        
       285 +.selo {                                                      
       286 +  display: inline-flex;                                      
       287 +  align-items: center;                                       
       288 +  gap: 0.375rem;                                             
       289 +  padding: 0.25rem 0.75rem 0.25rem 0.5rem;                   
       290 +  border-radius: 999px;                                      
       291 +  border: 1px solid transparent;                             
       292 +  font-size: 0.8125rem;                                      
       293 +  font-weight: 700;                                          
       294 +  white-space: nowrap;                                       
       295  }
       296  
       191 -.filtros {                                                   
       192 -  display: flex;                                             
       193 -  flex-wrap: wrap;                                           
       194 -  gap: 6px;                                                  
       297 +.selo--bloquear {                                            
       298 +  background: var(--bloquear-fundo);                         
       299 +  color: var(--bloquear);                                    
       300  }
       301 +.selo--atencao {                                             
       302 +  background: var(--atencao-fundo);                          
       303 +  color: var(--atencao);                                     
       304 +}                                                            
       305 +.selo--liberar {                                             
       306 +  background: var(--liberar-fundo);                          
       307 +  color: var(--liberar);                                     
       308 +}                                                            
       309 +.selo--neutro {                                              
       310 +  background: var(--superficie2);                            
       311 +  color: var(--texto-suave);                                 
       312 +  padding-left: 0.75rem;                                     
       313 +}                                                            
       314  
       197 -.filtro {                                                    
       198 -  min-height: 40px;                                          
       199 -  padding: 0 12px;                                           
       200 -  border: 1px solid var(--borda);                            
       315 +.etiqueta {                                                  
       316 +  display: inline-flex;                                      
       317 +  align-items: center;                                       
       318 +  gap: 0.25rem;                                              
       319 +  flex-shrink: 0;                                            
       320 +  margin-left: 0.375rem;                                     
       321 +  padding: 0 0.5rem;                                         
       322    border-radius: 999px;
       202 -  background: var(--superficie);                             
       203 -  cursor: pointer;                                           
       204 -  font-size: 0.9rem;                                         
       323 +  background: var(--superficie2);                            
       324 +  color: var(--texto-suave);                                 
       325 +  font-family: var(--fonte-texto);                           
       326 +  font-size: 0.75rem;                                        
       327 +  font-weight: 700;                                          
       328  }
       329  
       207 -.filtro[aria-pressed='true'] {                               
       330 +.etiqueta--info {                                            
       331 +  background: var(--info-fundo);                             
       332 +  color: var(--info);                                        
       333 +}                                                            
       334 +                                                             
       335 +.etiqueta--decisao {                                         
       336    background: var(--texto);
       209 -  border-color: var(--texto);                                
       337    color: var(--superficie);
       338  }
       339  
       213 -.filtro__numero {                                            
       214 -  font-weight: 700;                                          
       215 -  margin-left: 2px;                                          
       340 +/* ---- Mesa da Marta ---------------------------------------
           +---------------- */                                          
       341 +                                                             
       342 +.mesa {                                                      
       343 +  display: grid;                                             
       344 +  gap: 1.5rem;                                               
       345  }
       346  
       218 -.busca {                                                     
       219 -  flex: 1 1 220px;                                           
       220 -  min-height: 40px;                                          
       221 -  padding: 0 12px;                                           
       222 -  border: 1px solid var(--borda);                            
       223 -  border-radius: 999px;                                      
       347 +@media (min-width: 68.75rem) {                               
       348 +  .mesa {                                                    
       349 +    grid-template-columns: minmax(0, 1fr) 28rem;             
       350 +    align-items: start;                                      
       351 +  }                                                          
       352 +}                                                            
       353 +                                                             
       354 +.mesa__fila {                                                
       355 +  display: flex;                                             
       356 +  flex-direction: column;                                    
       357 +  gap: 1rem;                                                 
       358 +  min-width: 0;                                              
       359 +}                                                            
       360 +                                                             
       361 +.mesa__titulo {                                              
       362 +  display: flex;                                             
       363 +  flex-wrap: wrap;                                           
       364 +  align-items: flex-end;                                     
       365 +  justify-content: space-between;                            
       366 +  gap: 0.5rem 1rem;                                          
       367 +}                                                            
       368 +                                                             
       369 +.mesa__progresso {                                           
       370 +  font-size: 0.875rem;                                       
       371 +  color: var(--texto-suave);                                 
       372 +}                                                            
       373 +                                                             
       374 +.resumo {                                                    
       375 +  display: grid;                                             
       376 +  grid-template-columns: repeat(auto-fit, minmax(9.5rem, 1fr)
           +);                                                           
       377 +  gap: 0.625rem;                                             
       378 +}                                                            
       379 +                                                             
       380 +.resumo__item {                                              
       381 +  display: flex;                                             
       382 +  flex-direction: column;                                    
       383 +  gap: 0.125rem;                                             
       384 +  min-height: 5.5rem;                                        
       385 +  padding: 0.75rem 0.875rem;                                 
       386 +  text-align: left;                                          
       387 +  border: 1px solid var(--linha);                            
       388 +  border-radius: 0.75rem;                                    
       389    background: var(--superficie);
       390  }
       391  
       227 -/* ---- Seções ----------------------------------------------
           ----------------- */                                          
       392 +.resumo__item:hover {                                        
       393 +  border-color: var(--controle);                             
       394 +}                                                            
       395  
       229 -.secao {                                                     
       230 -  margin-top: 20px;                                          
       396 +.resumo__item[aria-pressed='true'] {                         
       397 +  background: var(--marca);                                  
       398 +  border-color: var(--marca);                                
       399 +  color: var(--sobre-marca);                                 
       400  }
       401  
       233 -.secao__titulo {                                             
       234 -  font-size: 1.05rem;                                        
       402 +.resumo__rotulo {                                            
       403    display: flex;
       404    align-items: center;
       237 -  gap: 8px;                                                  
       405 +  gap: 0.375rem;                                             
       406 +  font-size: 0.8125rem;                                      
       407 +  font-weight: 600;                                          
       408  }
       409  
       240 -.secao__titulo::before {                                     
       241 -  content: '';                                               
       242 -  width: 10px;                                               
       243 -  height: 10px;                                              
       410 +.resumo__ponto {                                             
       411 +  width: 0.5rem;                                             
       412 +  height: 0.5rem;                                            
       413    border-radius: 50%;
       245 -  background: var(--texto-suave);                            
       414 +  background: var(--marca);                                  
       415  }
       416  
       248 -.secao__titulo--bloquear::before {                           
       417 +.resumo__item--bloquear .resumo__ponto {                     
       418    background: var(--bloquear);
       419  }
       251 -.secao__titulo--atencao::before {                            
       420 +.resumo__item--atencao .resumo__ponto {                      
       421    background: var(--atencao-forte);
       422  }
       254 -.secao__titulo--liberar::before {                            
       423 +.resumo__item--liberar .resumo__ponto {                      
       424    background: var(--liberar);
       425  }
       426 +.resumo__item--aviso .resumo__ponto {                        
       427 +  background: var(--info);                                   
       428 +}                                                            
       429  
       258 -.secao__numero {                                             
       259 -  font-size: 0.85rem;                                        
       260 -  font-weight: 600;                                          
       430 +.resumo__item[aria-pressed='true'] .resumo__ponto {          
       431 +  background: var(--sobre-marca);                            
       432 +}                                                            
       433 +                                                             
       434 +.resumo__numero {                                            
       435 +  font-family: var(--fonte-titulo);                          
       436 +  font-weight: 700;                                          
       437 +  font-size: 1.875rem;                                       
       438 +  line-height: 1.05;                                         
       439 +}                                                            
       440 +                                                             
       441 +.resumo__detalhe {                                           
       442 +  font-size: 0.75rem;                                        
       443    color: var(--texto-suave);
       444 +  font-variant-numeric: tabular-nums;                        
       445  }
       446  
       264 -.secao__dica {                                               
       265 -  margin: 2px 0 10px;                                        
       266 -  font-size: 0.9rem;                                         
       447 +.resumo__item[aria-pressed='true'] .resumo__detalhe {        
       448 +  color: var(--sobre-marca);                                 
       449 +}                                                            
       450 +                                                             
       451 +.busca {                                                     
       452 +  display: flex;                                             
       453 +  align-items: center;                                       
       454 +  gap: 0.625rem;                                             
       455 +  min-height: 2.75rem;                                       
       456 +  padding: 0 0.875rem;                                       
       457 +  border: 1px solid var(--controle);                         
       458 +  border-radius: 0.625rem;                                   
       459 +  background: var(--superficie);                             
       460    color: var(--texto-suave);
       461  }
       462  
       270 -.lista-pedidos,                                              
       271 -.lista-clientes {                                            
       272 -  list-style: none;                                          
       273 -  margin: 0;                                                 
       274 -  padding: 0;                                                
       275 -  display: grid;                                             
       276 -  gap: 10px;                                                 
       463 +.busca:focus-within {                                        
       464 +  outline: 3px solid var(--foco);                            
       465 +  outline-offset: 2px;                                       
       466  }
       467  
       279 -/* ---- Cartão de pedido ------------------------------------
           ----------------- */                                          
       468 +.busca input {                                               
       469 +  flex: 1;                                                   
       470 +  min-width: 0;                                              
       471 +  min-height: 2.625rem;                                      
       472 +  border: 0;                                                 
       473 +  outline: none;                                             
       474 +  background: transparent;                                   
       475 +  color: var(--texto);                                       
       476 +}                                                            
       477  
       281 -.cartao {                                                    
       478 +.busca input::placeholder {                                  
       479 +  color: var(--texto-suave);                                 
       480 +  opacity: 1;                                                
       481 +}                                                            
       482 +                                                             
       483 +.busca--redonda {                                            
       484 +  border-radius: 999px;                                      
       485 +}                                                            
       486 +                                                             
       487 +/* Tabela da fila: em grade quando há espaço; empilhada quand
           +o não há. */                                                 
       488 +.tabela-fila {                                               
       489 +  container-type: inline-size;                               
       490    background: var(--superficie);
       283 -  border: 1px solid var(--borda);                            
       284 -  border-left: 5px solid var(--borda);                       
       491 +  border: 1px solid var(--linha);                            
       492    border-radius: var(--raio);
       286 -  box-shadow: var(--sombra);                                 
       287 -  padding: 14px;                                             
       288 -  display: grid;                                             
       289 -  gap: 10px;                                                 
       493 +  overflow: hidden;                                          
       494  }
       495  
       292 -.cartao--bloquear {                                          
       293 -  border-left-color: var(--bloquear);                        
       496 +.tabela-fila__cabecalho {                                    
       497 +  display: none;                                             
       498  }
       295 -.cartao--atencao {                                           
       296 -  border-left-color: var(--atencao-forte);                   
       499 +                                                             
       500 +.grupo {                                                     
       501 +  display: flex;                                             
       502 +  flex-wrap: wrap;                                           
       503 +  align-items: baseline;                                     
       504 +  gap: 0 0.75rem;                                            
       505 +  padding: 0.875rem 1.25rem 0.5rem;                          
       506 +  background: var(--superficie2);                            
       507 +  border-bottom: 1px solid var(--linha);                     
       508  }
       298 -.cartao--liberar {                                           
       299 -  border-left-color: var(--liberar);                         
       509 +                                                             
       510 +.grupo__titulo {                                             
       511 +  font-size: 1rem;                                           
       512 +  font-weight: 700;                                          
       513  }
       301 -.cartao--neutro {                                            
       302 -  border-left-color: var(--borda);                           
       514 +                                                             
       515 +.grupo__titulo.tom-bloquear {                                
       516 +  color: var(--bloquear);                                    
       517  }
       518  
       305 -.cartao--compacto {                                          
       306 -  gap: 6px;                                                  
       519 +.grupo__dica {                                               
       520 +  font-size: 0.875rem;                                       
       521 +  color: var(--texto-suave);                                 
       522  }
       523  
       309 -.cartao__topo {                                              
       524 +.linha {                                                     
       525 +  width: 100%;                                               
       526 +  min-height: 3.5rem;                                        
       527 +  padding: 0.75rem 1.25rem;                                  
       528    display: grid;
       311 -  grid-template-columns: auto 1fr;                           
       312 -  gap: 6px 12px;                                             
       313 -  align-items: start;                                        
       529 +  grid-template-columns: minmax(0, 1fr) auto;                
       530 +  grid-template-areas:                                       
       531 +    'principal valor'                                        
       532 +    'sugestao credito'                                       
       533 +    'meta meta';                                             
       534 +  gap: 0.375rem 1rem;                                        
       535 +  align-items: center;                                       
       536 +  text-align: left;                                          
       537 +  border: 0;                                                 
       538 +  border-bottom: 1px solid var(--linha);                     
       539 +  background: var(--superficie);                             
       540  }
       541  
       316 -.cartao__identificacao {                                     
       317 -  min-width: 0;                                              
       542 +.linha:hover {                                               
       543 +  background: var(--superficie2);                            
       544  }
       545  
       320 -.cartao__cliente {                                           
       321 -  font-size: 1rem;                                           
       322 -  line-height: 1.3;                                          
       323 -  overflow-wrap: anywhere;                                   
       546 +.linha--selecionada,                                         
       547 +.linha--selecionada:hover {                                  
       548 +  background: var(--marca-clara);                            
       549 +  box-shadow: inset 4px 0 0 var(--marca);                    
       550  }
       551  
       326 -.cartao__meta {                                              
       327 -  font-size: 0.85rem;                                        
       328 -  color: var(--texto-suave);                                 
       552 +.linha--decidida:not(.linha--selecionada) .linha__principal, 
       553 +.linha--decidida:not(.linha--selecionada) .linha__credito {  
       554 +  opacity: 0.7;                                              
       555  }
       556  
       331 -.cartao__valor {                                             
       332 -  grid-column: 2;                                            
       333 -  display: flex;                                             
       334 -  gap: 6px;                                                  
       335 -  align-items: baseline;                                     
       557 +.linha__sugestao {                                           
       558 +  grid-area: sugestao;                                       
       559  }
       560  
       338 -.cartao__valor-rotulo {                                      
       339 -  font-size: 0.8rem;                                         
       340 -  color: var(--texto-suave);                                 
       561 +.linha__principal {                                          
       562 +  grid-area: principal;                                      
       563 +  min-width: 0;                                              
       564  }
       565  
       343 -.cartao__linha {                                             
       566 +.linha__topo {                                               
       567    display: flex;
       345 -  justify-content: space-between;                            
       346 -  align-items: flex-start;                                   
       347 -  gap: 10px;                                                 
       568 +  align-items: center;                                       
       569 +  min-width: 0;                                              
       570  }
       571  
       350 -.cartao__valor-simples {                                     
       572 +.linha__numero {                                             
       573 +  margin-right: 0.5rem;                                      
       574 +  color: var(--texto-suave);                                 
       575 +  font-size: 0.8125rem;                                      
       576 +}                                                            
       577 +                                                             
       578 +.linha__cliente {                                            
       579 +  font-weight: 600;                                          
       580    white-space: nowrap;
       581 +  overflow: hidden;                                          
       582 +  text-overflow: ellipsis;                                   
       583  }
       584  
       354 -@media (min-width: 720px) {                                  
       355 -  .cartao__topo {                                            
       356 -    grid-template-columns: auto 1fr auto;                    
       357 -  }                                                          
       358 -  .cartao__valor {                                           
       359 -    grid-column: auto;                                       
       360 -    flex-direction: column;                                  
       361 -    align-items: flex-end;                                   
       362 -    gap: 0;                                                  
       363 -  }                                                          
       364 -  .cartao__valor strong {                                    
       365 -    font-size: 1.1rem;                                       
       366 -  }                                                          
       585 +.linha__motivo {                                             
       586 +  display: block;                                            
       587 +  font-size: 0.875rem;                                       
       588 +  color: var(--texto-suave);                                 
       589  }
       590  
       369 -/* ---- Selo ------------------------------------------------
           ----------------- */                                          
       591 +.linha__vendedor,                                            
       592 +.linha__quando {                                             
       593 +  grid-area: meta;                                           
       594 +  font-size: 0.8125rem;                                      
       595 +  color: var(--texto-suave);                                 
       596 +}                                                            
       597  
       371 -.selo {                                                      
       372 -  display: inline-block;                                     
       373 -  padding: 3px 10px;                                         
       374 -  border-radius: 999px;                                      
       375 -  font-size: 0.8rem;                                         
       376 -  font-weight: 700;                                          
       377 -  white-space: nowrap;                                       
       378 -  text-transform: uppercase;                                 
       379 -  letter-spacing: 0.02em;                                    
       598 +.linha__vendedor {                                           
       599 +  display: none;                                             
       600  }
       601  
       382 -.selo--liberar {                                             
       383 -  background: var(--liberar-fundo);                          
       384 -  color: var(--liberar);                                     
       602 +.linha__canal {                                              
       603 +  margin-left: 0.375rem;                                     
       604  }
       386 -.selo--atencao {                                             
       387 -  background: var(--atencao-fundo);                          
       388 -  color: var(--atencao);                                     
       389 -}                                                            
       390 -.selo--bloquear {                                            
       391 -  background: var(--bloquear-fundo);                         
       392 -  color: var(--bloquear);                                    
       393 -}                                                            
       605  
       395 -/* ---- Motivos, avisos -------------------------------------
           ----------------- */                                          
       396 -                                                             
       397 -.motivos {                                                   
       398 -  margin: 0;                                                 
       399 -  padding-left: 18px;                                        
       400 -  display: grid;                                             
       401 -  gap: 2px;                                                  
       606 +.linha__canal::before {                                      
       607 +  content: '· ';                                             
       608  }
       609  
       404 -.motivos li:first-child {                                    
       610 +.linha__valor {                                              
       611 +  grid-area: valor;                                          
       612    font-weight: 600;
       613  }
       614  
       408 -.avisos {                                                    
       409 -  margin: 0;                                                 
       410 -  padding: 10px 12px 10px 30px;                              
       411 -  background: var(--aviso-fundo);                            
       412 -  border: 1px solid var(--aviso-borda);                      
       413 -  border-radius: 8px;                                        
       414 -  font-size: 0.9rem;                                         
       415 -  display: grid;                                             
       416 -  gap: 4px;                                                  
       615 +.linha__credito {                                            
       616 +  grid-area: credito;                                        
       617 +  display: flex;                                             
       618 +  align-items: center;                                       
       619 +  gap: 0.625rem;                                             
       620 +  min-width: 9rem;                                           
       621  }
       622  
       419 -.avisos li::marker {                                         
       420 -  content: '⚠ ';                                             
       623 +.linha__pct {                                                
       624 +  min-width: 2.75rem;                                        
       625 +  text-align: right;                                         
       626 +  font-size: 0.8125rem;                                      
       627 +  font-weight: 600;                                          
       628 +  font-variant-numeric: tabular-nums;                        
       629 +  color: var(--texto-suave);                                 
       630  }
       631  
       423 -.aviso-vendedor {                                            
       424 -  padding: 8px 10px;                                         
       425 -  background: var(--aviso-fundo);                            
       426 -  border: 1px solid var(--aviso-borda);                      
       427 -  border-radius: 8px;                                        
       428 -  font-size: 0.9rem;                                         
       632 +.linha__pct.tom-bloquear {                                   
       633 +  color: var(--bloquear);                                    
       634  }
       635  
       431 -/* ---- Barra de crédito ------------------------------------
           ----------------- */                                          
       636 +@container (min-width: 52rem) {                              
       637 +  .tabela-fila__cabecalho,                                   
       638 +  .linha {                                                   
       639 +    display: grid;                                           
       640 +    grid-template-columns: 7.5rem minmax(0, 1fr) 8.5rem 6.5re
           +m 6.75rem 9.5rem;                                            
       641 +    grid-template-areas: none;                               
       642 +    gap: 1rem;                                               
       643 +  }                                                          
       644  
       433 -.credito {                                                   
       434 -  display: grid;                                             
       435 -  gap: 4px;                                                  
       645 +  .tabela-fila__cabecalho {                                  
       646 +    padding: 0.625rem 1.25rem;                               
       647 +    border-bottom: 1px solid var(--linha);                   
       648 +    font-size: 0.6875rem;                                    
       649 +    font-weight: 600;                                        
       650 +    letter-spacing: 0.12em;                                  
       651 +    text-transform: uppercase;                               
       652 +    color: var(--texto-suave);                               
       653 +  }                                                          
       654 +                                                             
       655 +  .linha > * {                                               
       656 +    grid-area: auto;                                         
       657 +  }                                                          
       658 +                                                             
       659 +  .linha__motivo {                                           
       660 +    white-space: nowrap;                                     
       661 +    overflow: hidden;                                        
       662 +    text-overflow: ellipsis;                                 
       663 +  }                                                          
       664 +                                                             
       665 +  .linha__vendedor {                                         
       666 +    display: block;                                          
       667 +    font-size: 0.875rem;                                     
       668 +    color: var(--texto);                                     
       669 +  }                                                          
       670 +                                                             
       671 +  .linha__quando {                                           
       672 +    font-size: 0.875rem;                                     
       673 +    color: var(--texto);                                     
       674 +    font-variant-numeric: tabular-nums;                      
       675 +  }                                                          
       676 +                                                             
       677 +  .linha__canal {                                            
       678 +    display: block;                                          
       679 +    margin: 0;                                               
       680 +    font-size: 0.75rem;                                      
       681 +    color: var(--texto-suave);                               
       682 +  }                                                          
       683 +                                                             
       684 +  .linha__canal::before {                                    
       685 +    content: none;                                           
       686 +  }                                                          
       687 +                                                             
       688 +  .linha__credito {                                          
       689 +    min-width: 0;                                            
       690 +  }                                                          
       691  }
       692  
       438 -.credito__barra {                                            
       693 +/* ---- Barra de crédito ------------------------------------
           +---------------- */                                          
       694 +                                                             
       695 +.barra {                                                     
       696    position: relative;
       697    display: flex;
       441 -  height: 10px;                                              
       442 -  background: var(--superficie-2);                           
       698 +  flex: 1;                                                   
       699 +  height: 0.875rem;                                          
       700    border-radius: 999px;
       444 -  overflow: visible;                                         
       701 +  background: var(--trilho);                                 
       702 +  overflow: hidden;                                          
       703  }
       704  
       447 -.credito__divida {                                           
       705 +.barra--fina {                                               
       706 +  height: 0.5rem;                                            
       707 +}                                                            
       708 +                                                             
       709 +.barra__divida {                                             
       710    background: var(--divida);
       449 -  border-radius: 999px 0 0 999px;                            
       711  }
       712  
       452 -.credito__pedido {                                           
       453 -  background: var(--pedido);                                 
       713 +.barra__pedido {                                             
       714 +  background: var(--marca);                                  
       715  }
       716  
       456 -.credito__pedido--passou {                                   
       717 +.barra__pedido--passou {                                     
       718    background: var(--bloquear);
       719  }
       720  
       460 -.credito__limite {                                           
       721 +.barra__limite {                                             
       722    position: absolute;
       462 -  top: -4px;                                                 
       463 -  bottom: -4px;                                              
       464 -  width: 2px;                                                
       465 -  margin-left: -1px;                                         
       723 +  top: 0;                                                    
       724 +  bottom: 0;                                                 
       725 +  width: 3px;                                                
       726 +  margin-left: -3px;                                         
       727    background: var(--texto);
       728  }
       729  
       469 -.credito__legenda {                                          
       730 +/* ---- Detalhe ---------------------------------------------
           +---------------- */                                          
       731 +                                                             
       732 +.detalhe {                                                   
       733    display: flex;
       471 -  flex-wrap: wrap;                                           
       472 -  gap: 2px 8px;                                              
       473 -  font-size: 0.85rem;                                        
       474 -  color: var(--texto-suave);                                 
       734 +  flex-direction: column;                                    
       735 +  background: var(--superficie);                             
       736 +  border: 1px solid var(--linha);                            
       737 +  border-radius: var(--raio);                                
       738 +  overflow: hidden;                                          
       739  }
       740  
       477 -.legenda::before {                                           
       478 -  content: '';                                               
       479 -  display: inline-block;                                     
       480 -  width: 8px;                                                
       481 -  height: 8px;                                               
       482 -  margin-right: 4px;                                         
       483 -  border-radius: 2px;                                        
       741 +@media (min-width: 68.75rem) {                               
       742 +  .detalhe {                                                 
       743 +    position: sticky;                                        
       744 +    top: calc(var(--altura-topo) + 1rem);                    
       745 +    max-height: calc(100vh - var(--altura-topo) - 2rem);     
       746 +  }                                                          
       747  }
       748  
       486 -.legenda--divida::before {                                   
       487 -  background: var(--divida);                                 
       749 +.detalhe__cabecalho {                                        
       750 +  display: flex;                                             
       751 +  flex-direction: column;                                    
       752 +  gap: 0.625rem;                                             
       753 +  padding: 1.375rem 1.5rem 1.125rem;                         
       754 +  border-bottom: 1px solid var(--linha);                     
       755  }
       489 -.legenda--pedido::before {                                   
       490 -  background: var(--pedido);                                 
       756 +                                                             
       757 +.detalhe__linha {                                            
       758 +  display: flex;                                             
       759 +  flex-wrap: wrap;                                           
       760 +  align-items: center;                                       
       761 +  justify-content: space-between;                            
       762 +  gap: 0.5rem;                                               
       763  }
       764  
       493 -.legenda--passou {                                           
       494 -  color: var(--bloquear);                                    
       765 +.detalhe__numero {                                           
       766 +  color: var(--texto-suave);                                 
       767 +}                                                            
       768 +                                                             
       769 +.detalhe__cliente {                                          
       770 +  font-family: var(--fonte-titulo);                          
       771    font-weight: 700;
       772 +  font-size: 1.5rem;                                         
       773 +  line-height: 1.15;                                         
       774 +  overflow-wrap: anywhere;                                   
       775  }
       776  
       498 -.credito--sem-limite {                                       
       499 -  font-size: 0.9rem;                                         
       500 -  color: var(--bloquear);                                    
       501 -  font-weight: 600;                                          
       777 +.detalhe__meta {                                             
       778 +  font-size: 0.875rem;                                       
       779 +  color: var(--texto-suave);                                 
       780  }
       781  
       504 -/* ---- Detalhes --------------------------------------------
           ----------------- */                                          
       782 +.detalhe__corpo {                                            
       783 +  flex: 1;                                                   
       784 +  min-height: 0;                                             
       785 +  overflow: auto;                                            
       786 +  padding: 1.125rem 1.5rem;                                  
       787 +  display: flex;                                             
       788 +  flex-direction: column;                                    
       789 +  gap: 1.25rem;                                              
       790 +}                                                            
       791  
       506 -.detalhes summary,                                           
       507 -.historico summary {                                         
       508 -  cursor: pointer;                                           
       509 -  font-size: 0.9rem;                                         
       510 -  color: var(--marca);                                       
       511 -  min-height: 32px;                                          
       792 +.detalhe__corpo > section {                                  
       793    display: flex;
       513 -  align-items: center;                                       
       794 +  flex-direction: column;                                    
       795 +  gap: 0.5rem;                                               
       796  }
       797  
       516 -.detalhes__grade {                                           
       798 +.detalhe__cadastro {                                         
       799 +  font-size: 0.8125rem;                                      
       800 +  color: var(--texto-suave);                                 
       801 +}                                                            
       802 +                                                             
       803 +.motivos {                                                   
       804    display: grid;
       518 -  gap: 12px;                                                 
       519 -  margin-top: 8px;                                           
       805 +  gap: 0.375rem;                                             
       806  }
       807  
       522 -@media (min-width: 720px) {                                  
       523 -  .detalhes__grade {                                         
       524 -    grid-template-columns: 1fr 1fr;                          
       525 -  }                                                          
       808 +.motivos__item {                                             
       809 +  position: relative;                                        
       810 +  padding-left: 1rem;                                        
       811 +  font-weight: 500;                                          
       812  }
       813  
       528 -.detalhes h4 {                                               
       529 -  font-size: 0.85rem;                                        
       530 -  color: var(--texto-suave);                                 
       531 -  margin-bottom: 4px;                                        
       814 +.motivos__item::before {                                     
       815 +  content: '';                                               
       816 +  position: absolute;                                        
       817 +  left: 0;                                                   
       818 +  top: 0.55em;                                               
       819 +  width: 0.375rem;                                           
       820 +  height: 0.375rem;                                          
       821 +  border-radius: 50%;                                        
       822 +  background: var(--texto-suave);                            
       823  }
       824  
       534 -.detalhes__cliente {                                         
       535 -  margin-top: 8px;                                           
       536 -  font-size: 0.85rem;                                        
       825 +.tom-marcador-bloquear::before {                             
       826 +  background: var(--bloquear);                               
       827 +}                                                            
       828 +.tom-marcador-atencao::before {                              
       829 +  background: var(--atencao-forte);                          
       830 +}                                                            
       831 +.tom-marcador-liberar::before {                              
       832 +  background: var(--liberar);                                
       833 +}                                                            
       834 +                                                             
       835 +.credito {                                                   
       836 +  display: grid;                                             
       837 +  grid-template-columns: repeat(2, minmax(0, 1fr));          
       838 +  gap: 0.5rem 1.25rem;                                       
       839 +  margin-top: 0.25rem;                                       
       840 +  font-variant-numeric: tabular-nums;                        
       841 +}                                                            
       842 +                                                             
       843 +.credito div {                                               
       844 +  display: flex;                                             
       845 +  justify-content: space-between;                            
       846 +  gap: 0.5rem;                                               
       847 +}                                                            
       848 +                                                             
       849 +.credito dt {                                                
       850 +  display: inline-flex;                                      
       851 +  align-items: center;                                       
       852 +  gap: 0.375rem;                                             
       853    color: var(--texto-suave);
       854  }
       855  
       856 +.legenda {                                                   
       857 +  width: 0.625rem;                                           
       858 +  height: 0.625rem;                                          
       859 +  border-radius: 2px;                                        
       860 +}                                                            
       861 +                                                             
       862 +.legenda--divida {                                           
       863 +  background: var(--divida);                                 
       864 +}                                                            
       865 +.legenda--pedido {                                           
       866 +  background: var(--marca);                                  
       867 +}                                                            
       868 +.legenda--passou {                                           
       869 +  background: var(--bloquear);                               
       870 +}                                                            
       871 +.legenda--limite {                                           
       872 +  width: 3px;                                                
       873 +  height: 0.75rem;                                           
       874 +  background: var(--texto);                                  
       875 +}                                                            
       876 +                                                             
       877 +.aviso {                                                     
       878 +  padding: 0.75rem 0.875rem;                                 
       879 +  border-radius: 0.625rem;                                   
       880 +  background: var(--info-fundo);                             
       881 +  border: 1px solid var(--info-borda);                       
       882 +}                                                            
       883 +                                                             
       884 +.aviso__titulo {                                             
       885 +  display: flex;                                             
       886 +  align-items: center;                                       
       887 +  gap: 0.375rem;                                             
       888 +  font-size: 0.875rem;                                       
       889 +  font-weight: 700;                                          
       890 +  color: var(--info);                                        
       891 +}                                                            
       892 +                                                             
       893 +.aviso__lista {                                              
       894 +  display: grid;                                             
       895 +  gap: 0.375rem;                                             
       896 +  font-size: 0.875rem;                                       
       897 +}                                                            
       898 +                                                             
       899  .tabela {
       900    width: 100%;
       901    border-collapse: collapse;
       543 -  font-size: 0.85rem;                                        
       902 +  font-size: 0.875rem;                                       
       903  }
       904  
       905  .tabela th {
       906    text-align: left;
       907 +  font-size: 0.75rem;                                        
       908    font-weight: 600;
       909    color: var(--texto-suave);
       910  }
       911  
       912  .tabela th,
       913  .tabela td {
       554 -  padding: 4px 6px 4px 0;                                    
       555 -  border-bottom: 1px solid var(--borda);                     
       914 +  padding: 0.375rem 0.5rem 0.375rem 0;                       
       915 +  border-bottom: 1px solid var(--linha);                     
       916    vertical-align: top;
       917  }
       918  
       919  .tabela .numero {
       560 -  text-align: right;                                         
       561 -  white-space: nowrap;                                       
       920 +  padding-right: 0;                                          
       921  }
       922  
       564 -.linha--grave td {                                           
       565 -  color: var(--bloquear);                                    
       923 +.itens {                                                     
       924 +  display: grid;                                             
       925 +  gap: 0.25rem;                                              
       926 +  font-size: 0.875rem;                                       
       927  }
       567 -.linha--leve td {                                            
       568 -  color: var(--atencao);                                     
       928 +                                                             
       929 +.itens li {                                                  
       930 +  display: flex;                                             
       931 +  justify-content: space-between;                            
       932 +  gap: 1rem;                                                 
       933  }
       934  
       571 -.atraso {                                                    
       935 +.detalhe__acoes {                                            
       936 +  padding: 1rem 1.5rem 1.25rem;                              
       937 +  border-top: 1px solid var(--linha);                        
       938 +  display: flex;                                             
       939 +  flex-direction: column;                                    
       940 +  gap: 0.625rem;                                             
       941 +}                                                            
       942 +                                                             
       943 +.acoes {                                                     
       944 +  display: flex;                                             
       945 +  flex-wrap: wrap;                                           
       946 +  gap: 0.625rem;                                             
       947 +}                                                            
       948 +                                                             
       949 +.acoes__nota {                                               
       950 +  font-size: 0.8125rem;                                      
       951 +  color: var(--texto-suave);                                 
       952 +}                                                            
       953 +                                                             
       954 +.botao {                                                     
       955 +  min-height: 2.875rem;                                      
       956 +  padding: 0 1rem;                                           
       957 +  border-radius: 0.625rem;                                   
       958 +  border: 1px solid transparent;                             
       959 +  font-weight: 700;                                          
       960 +}                                                            
       961 +                                                             
       962 +.acoes .botao:first-child {                                  
       963 +  flex: 1 1 12rem;                                           
       964 +}                                                            
       965 +                                                             
       966 +.botao--bloquear {                                           
       967 +  background: var(--botao-bloquear);                         
       968 +  color: var(--sobre-botao-bloquear);                        
       969 +}                                                            
       970 +                                                             
       971 +.botao--liberar {                                            
       972 +  background: var(--botao-liberar);                          
       973 +  color: var(--sobre-botao-liberar);                         
       974 +}                                                            
       975 +                                                             
       976 +.botao--secundario {                                         
       977 +  background: var(--superficie);                             
       978 +  border-color: var(--controle);                             
       979    font-weight: 600;
       980  }
       981  
       575 -.etiqueta {                                                  
       576 -  margin-left: 6px;                                          
       577 -  padding: 0 6px;                                            
       578 -  border-radius: 4px;                                        
       579 -  background: var(--superficie-2);                           
       580 -  font-size: 0.75rem;                                        
       982 +.decidido {                                                  
       983 +  display: flex;                                             
       984 +  flex-wrap: wrap;                                           
       985 +  align-items: center;                                       
       986 +  justify-content: space-between;                            
       987 +  gap: 0.75rem;                                              
       988 +  padding: 0.75rem 0.875rem;                                 
       989 +  border-radius: 0.625rem;                                   
       990 +  background: var(--superficie2);                            
       991 +  font-size: 0.875rem;                                       
       992  }
       993  
       583 -/* ---- Vendedor --------------------------------------------
           ----------------- */                                          
       994 +.decidido p {                                                
       995 +  flex: 1 1 14rem;                                           
       996 +}                                                            
       997  
       585 -.vendedor {                                                  
       586 -  max-width: 640px;                                          
       587 -  margin: 0 auto;                                            
       998 +/* ---- Vendedor (celular primeiro) -------------------------
           +---------------- */                                          
       999 +                                                             
      1000 +.pagina--celular {                                           
      1001 +  max-width: 40rem;                                          
      1002 +  padding: 0;                                                
      1003  }
      1004  
       590 -.abas {                                                      
      1005 +.celular {                                                   
      1006 +  min-height: calc(100vh - var(--altura-topo));              
      1007 +  display: flex;                                             
      1008 +  flex-direction: column;                                    
      1009 +}                                                            
      1010 +                                                             
      1011 +.celular > section {                                         
      1012 +  flex: 1;                                                   
      1013 +  padding: 1.25rem 1rem 1.5rem;                              
      1014 +}                                                            
      1015 +                                                             
      1016 +.celular__cabecalho {                                        
      1017 +  display: flex;                                             
      1018 +  flex-direction: column;                                    
      1019 +  gap: 0.75rem;                                              
      1020 +  margin-bottom: 0.5rem;                                     
      1021 +}                                                            
      1022 +                                                             
      1023 +.celular__grupo {                                            
      1024 +  margin-top: 1.25rem;                                       
      1025 +  display: flex;                                             
      1026 +  flex-direction: column;                                    
      1027 +  gap: 0.625rem;                                             
      1028 +}                                                            
      1029 +                                                             
      1030 +.contadores {                                                
      1031    display: grid;
       592 -  grid-template-columns: 1fr 1fr;                            
       593 -  background: var(--superficie-2);                           
       594 -  border-radius: 999px;                                      
       595 -  padding: 4px;                                              
      1032 +  grid-template-columns: repeat(3, minmax(0, 1fr));          
      1033 +  gap: 0.5rem;                                               
      1034  }
      1035  
       598 -.aba {                                                       
       599 -  min-height: 44px;                                          
       600 -  border: 0;                                                 
       601 -  border-radius: 999px;                                      
       602 -  background: transparent;                                   
      1036 +.contadores__item {                                          
      1037 +  display: flex;                                             
      1038 +  flex-direction: column;                                    
      1039 +  padding: 0.5rem 0.75rem;                                   
      1040 +  border-radius: 0.625rem;                                   
      1041 +  font-size: 0.75rem;                                        
      1042    font-weight: 600;
       604 -  cursor: pointer;                                           
      1043  }
      1044  
       607 -.aba[aria-selected='true'] {                                 
       608 -  background: var(--superficie);                             
       609 -  box-shadow: var(--sombra);                                 
      1045 +.contadores__item strong {                                   
      1046 +  font-family: var(--fonte-titulo);                          
      1047 +  font-size: 1.5rem;                                         
      1048 +  line-height: 1.2;                                          
      1049  }
      1050  
       612 -.situacao {                                                  
       613 -  padding: 10px 12px;                                        
       614 -  border-radius: 8px;                                        
      1051 +.contadores__item--bloquear {                                
      1052 +  background: var(--bloquear-fundo);                         
      1053 +  color: var(--bloquear);                                    
      1054 +}                                                            
      1055 +.contadores__item--atencao {                                 
      1056 +  background: var(--atencao-fundo);                          
      1057 +  color: var(--atencao);                                     
      1058 +}                                                            
      1059 +.contadores__item--liberar {                                 
      1060 +  background: var(--liberar-fundo);                          
      1061 +  color: var(--liberar);                                     
      1062 +}                                                            
      1063 +                                                             
      1064 +.cartoes {                                                   
      1065    display: grid;
       616 -  gap: 4px;                                                  
      1066 +  gap: 0.625rem;                                             
      1067  }
      1068  
       619 -.situacao--liberar {                                         
       620 -  background: var(--liberar-fundo);                          
      1069 +.cartao {                                                    
      1070 +  display: flex;                                             
      1071 +  flex-direction: column;                                    
      1072 +  gap: 0.5rem;                                               
      1073 +  padding: 0.875rem;                                         
      1074 +  background: var(--superficie);                             
      1075 +  border: 1px solid var(--linha);                            
      1076 +  border-radius: var(--raio);                                
      1077  }
       622 -.situacao--atencao {                                         
       623 -  background: var(--atencao-fundo);                          
      1078 +                                                             
      1079 +.cartao__linha {                                             
      1080 +  display: flex;                                             
      1081 +  align-items: flex-start;                                   
      1082 +  justify-content: space-between;                            
      1083 +  gap: 0.625rem;                                             
      1084  }
       625 -.situacao--bloquear {                                        
       626 -  background: var(--bloquear-fundo);                         
      1085 +                                                             
      1086 +.cartao__valor {                                             
      1087 +  font-weight: 600;                                          
      1088 +  font-variant-numeric: tabular-nums;                        
      1089 +  white-space: nowrap;                                       
      1090  }
      1091  
       629 -.situacao__titulo {                                          
       630 -  font-size: 0.8rem;                                         
       631 -  color: var(--texto-suave);                                 
      1092 +.cartao__cliente {                                           
      1093 +  font-size: 1rem;                                           
      1094 +  font-weight: 600;                                          
      1095 +  overflow-wrap: anywhere;                                   
      1096 +}                                                            
      1097 +                                                             
      1098 +.cartao__mensagem {                                          
      1099 +  padding: 0.625rem 0.75rem;                                 
      1100 +  border-radius: 0.625rem;                                   
      1101 +  background: var(--superficie2);                            
      1102 +}                                                            
      1103 +                                                             
      1104 +.cartao__aviso {                                             
      1105    display: flex;
       633 -  flex-wrap: wrap;                                           
       634 -  align-items: center;                                       
       635 -  gap: 6px;                                                  
      1106 +  gap: 0.5rem;                                               
      1107 +  padding: 0.625rem 0.75rem;                                 
      1108 +  border-radius: 0.625rem;                                   
      1109 +  background: var(--info-fundo);                             
      1110 +  border: 1px solid var(--info-borda);                       
      1111 +  font-size: 0.875rem;                                       
      1112  }
      1113  
       638 -.situacao .selo {                                            
       639 -  background: var(--superficie);                             
      1114 +.cartao__aviso svg {                                         
      1115 +  flex-shrink: 0;                                            
      1116 +  margin-top: 0.15rem;                                       
      1117 +  color: var(--info);                                        
      1118  }
      1119  
       642 -.itens-resumo {                                              
       643 -  font-size: 0.85rem;                                        
      1120 +.cartao__meta {                                              
      1121 +  font-size: 0.8125rem;                                      
      1122    color: var(--texto-suave);
      1123  }
      1124  
      1125 +.cartao__itens {                                             
      1126 +  font-size: 0.8125rem;                                      
      1127 +  color: var(--texto-suave);                                 
      1128 +}                                                            
      1129 +                                                             
      1130  .historico {
       648 -  margin-top: 20px;                                          
      1131 +  margin-top: 1.25rem;                                       
      1132  }
      1133  
       651 -.historico .lista-pedidos {                                  
       652 -  margin-top: 8px;                                           
      1134 +.historico summary {                                         
      1135 +  min-height: 2.75rem;                                       
      1136 +  display: flex;                                             
      1137 +  align-items: center;                                       
      1138 +  justify-content: center;                                   
      1139 +  border: 1px dashed var(--controle);                        
      1140 +  border-radius: 0.75rem;                                    
      1141 +  color: var(--marca);                                       
      1142 +  font-weight: 600;                                          
      1143 +  cursor: pointer;                                           
      1144  }
      1145  
       655 -.cliente {                                                   
      1146 +.historico[open] summary {                                   
      1147 +  margin-bottom: 0.625rem;                                   
      1148 +}                                                            
      1149 +                                                             
      1150 +.lista-compacta {                                            
      1151    background: var(--superficie);
       657 -  border: 1px solid var(--borda);                            
       658 -  border-left: 5px solid var(--borda);                       
      1152 +  border: 1px solid var(--linha);                            
      1153    border-radius: var(--raio);
       660 -  padding: 12px 14px;                                        
      1154 +  overflow: hidden;                                          
      1155 +}                                                            
      1156 +                                                             
      1157 +.lista-compacta li {                                         
      1158 +  display: flex;                                             
      1159 +  align-items: center;                                       
      1160 +  justify-content: space-between;                            
      1161 +  gap: 0.625rem;                                             
      1162 +  padding: 0.75rem 0.875rem;                                 
      1163 +  border-bottom: 1px solid var(--linha);                     
      1164 +}                                                            
      1165 +                                                             
      1166 +.lista-compacta li:last-child {                              
      1167 +  border-bottom: 0;                                          
      1168 +}                                                            
      1169 +                                                             
      1170 +.abas-inferiores {                                           
      1171 +  position: sticky;                                          
      1172 +  bottom: 0;                                                 
      1173 +  z-index: 10;                                               
      1174    display: grid;
       662 -  gap: 2px;                                                  
      1175 +  grid-template-columns: repeat(2, minmax(0, 1fr));          
      1176 +  background: var(--superficie);                             
      1177 +  border-top: 1px solid var(--linha);                        
      1178 +  padding-bottom: env(safe-area-inset-bottom, 0);            
      1179  }
      1180  
       665 -.cliente--bloquear {                                         
       666 -  border-left-color: var(--bloquear);                        
      1181 +.aba-inferior {                                              
      1182 +  min-height: 4.25rem;                                       
      1183 +  display: flex;                                             
      1184 +  flex-direction: column;                                    
      1185 +  align-items: center;                                       
      1186 +  justify-content: center;                                   
      1187 +  gap: 0.125rem;                                             
      1188 +  border: 0;                                                 
      1189 +  background: transparent;                                   
      1190 +  color: var(--texto-suave);                                 
      1191 +  font-size: 0.8125rem;                                      
      1192 +  font-weight: 600;                                          
      1193  }
       668 -.cliente--atencao {                                          
       669 -  border-left-color: var(--atencao-forte);                   
      1194 +                                                             
      1195 +.aba-inferior[aria-current='page'] {                         
      1196 +  color: var(--marca);                                       
      1197 +  font-weight: 700;                                          
      1198 +  box-shadow: inset 0 3px 0 var(--marca);                    
      1199  }
       671 -.cliente--liberar {                                          
       672 -  border-left-color: var(--liberar);                         
      1200 +                                                             
      1201 +/* ---- Preferências de acessibilidade do sistema -----------
           +---------------- */                                          
      1202 +                                                             
      1203 +@media (prefers-reduced-motion: reduce) {                    
      1204 +  *,                                                         
      1205 +  *::before,                                                 
      1206 +  *::after {                                                 
      1207 +    scroll-behavior: auto !important;                        
      1208 +    transition: none !important;                             
      1209 +    animation: none !important;                              
      1210 +  }                                                          
      1211  }
      1212  
       675 -.cliente__texto {                                            
       676 -  margin-top: 4px;                                           
       677 -  font-size: 0.9rem;                                         
      1213 +/* Modo de alto contraste do Windows: o sistema troca as core
           +s; garantimos que                                            
      1214 +   barras, selos e a seleção continuem visíveis com as cores 
           +dele. */                                                     
      1215 +@media (forced-colors: active) {                             
      1216 +  .selo,                                                     
      1217 +  .etiqueta,                                                 
      1218 +  .contadores__item,                                         
      1219 +  .resumo__item,                                             
      1220 +  .cartao__aviso,                                            
      1221 +  .aviso {                                                   
      1222 +    border: 1px solid CanvasText;                            
      1223 +  }                                                          
      1224 +                                                             
      1225 +  .barra {                                                   
      1226 +    border: 1px solid CanvasText;                            
      1227 +    forced-color-adjust: none;                               
      1228 +    background: Canvas;                                      
      1229 +  }                                                          
      1230 +                                                             
      1231 +  .barra__divida {                                           
      1232 +    background: GrayText;                                    
      1233 +  }                                                          
      1234 +                                                             
      1235 +  .barra__pedido,                                            
      1236 +  .barra__pedido--passou {                                   
      1237 +    background: Highlight;                                   
      1238 +  }                                                          
      1239 +                                                             
      1240 +  .barra__limite {                                           
      1241 +    background: CanvasText;                                  
      1242 +  }                                                          
      1243 +                                                             
      1244 +  .linha--selecionada,                                       
      1245 +  .aba-inferior[aria-current='page'],                        
      1246 +  .resumo__item[aria-pressed='true'] {                       
      1247 +    outline: 3px solid Highlight;                            
      1248 +    outline-offset: -3px;                                    
      1249 +  }                                                          
      1250  }

● O fundo da linha selecionada e o do cursor sobre a linha criam combinações de
  cor que o teste ainda não cobria. Acrescento esses pares e rodo tudo:

  Ran 1 shell command (ctrl+o to expand)

● 158 testes passam (incluindo os de contraste), a checagem de tipos está limpa
  e o build concluiu. Vou conferir visualmente os dois temas a seguir.

  Read 2 files, ran 1 shell command (ctrl+o to expand)

● Os dois temas já funcionam, mas os nomes de clientes estão cortados na lista e
  a área de crédito ficou apertada. Vou corrigir isso e depois checar a versão
  do celular.

  Read 1 file (ctrl+o to expand)

● No celular, os seletores de tema e de visualização ocupam três linhas do
  cabeçalho; vou corrigir isso junto com os ajustes da tabela e do detalhe de
  crédito.

  Read 2 files, ran 1 shell command (ctrl+o to expand)

● Visual novo, tema escuro e acessibilidade já estão funcionando nas duas telas.
  Em seguida, volto aos dados originais, corrijo o mascaramento comparando o
  CNPJ só pelos dígitos e documento tudo para publicar.

  Ran 1 shell command (ctrl+o to expand)
● Agora o teste do mascaramento deixa de ler a pasta amostra/ e passa a testar a
  função direto, cobrindo os casos que a revisão levantou:

  Ran 1 shell command (ctrl+o to expand)

● 160 testes passando. Agora refaço os prints nos dois temas, para documentação
  e entrega:

  Read 1 file, ran 1 shell command (ctrl+o to expand)

● Os prints estão corretos nos dois temas. Agora a documentação de
  acessibilidade:

● Write(docs\acessibilidade.md)
  ⎿  Wrote 93 lines to docs\acessibilidade.md
       1 # Acessibilidade e temas
       3 A Marta passa o dia nessa tela, e os vendedores a usam no celula
         r, na rua, no sol, às vezes com uma mão só. Por isso a referênci
         ma usado por qualquer pessoa, inclusive quem usa leitor de tela,
       4 
       5 O que está garantido **por teste automatizado** é dito como tal.
         e foi conferido e como](#o-que-foi-conferido-e-como).
       6 
       8 
      10 |---|---|---|
     … +161 lines (ctrl+o to expand)

● O documento afirma duas coisas que eu ainda não tinha medido: o contraste de
  1,5:1 da borda antiga e a ausência de rolagem lateral em 320px. Confiro as
  duas antes de publicar:

  Read 1 file, ran 1 shell command (ctrl+o to expand)

● No horizontal scroll at 320px, and the old border was indeed 1.55:1. I'm also
  letting Marta's summary cards sit two per row on very narrow screens, and then
  I'll rewrite the README.

  Read 1 file, ran 2 shell commands (ctrl+o to expand)

● O heredoc do bash quebrou com as aspas do conteúdo. Para evitar o problema,
  gravo o script num arquivo e executo de lá:

  Made 1 scratchpad edit +117, ran 1 shell command (ctrl+o to expand)

● O README está atualizado. Gero o build final, rodo a verificação completa e
  confiro que o build continua determinístico:

  Ran 1 shell command (ctrl+o to expand)

● 160 testes passando e build determinístico. Faço os commits em duas partes
  (visual e acessibilidade; dados e documentação), sem coautoria:

  Ran 1 shell command (ctrl+o to expand)

● Faço o push e acompanho o CI e a publicação:

  Ran 1 shell command (ctrl+o to expand)

● O CI passou e o site está atualizado. Registro tudo no PLANO.md, que continua
  só na sua máquina:

  Ran 1 shell command (ctrl+o to expand)

● O visual novo, o tema escuro e a acessibilidade estão no site e no
  repositório, com a documentação. O CI passou nas duas etapas, com 160 testes.

  - Site: https://mais4g.github.io/brilho-minas-fila-financeiro/
  - Repositório: https://github.com/mais4g/brilho-minas-fila-financeiro

  Visual
  - É o do protótipo aprovado, com a identidade do Divos da IA.
  - Marta: cartões de resumo que também filtram, a fila em grade e o detalhe do
    pedido ao lado.
  - Vendedor: contadores no topo e abas embaixo.
  - Decisão da Marta: os botões marcam a decisão e o próximo pedido pendente
    abre sozinho. A marcação fica só na tela, e a própria tela avisa que ainda
    não grava no Sistemão.

  Tema escuro
  - Segue o tema do sistema por padrão, e o seletor "Tema" no topo permite fixar
    claro ou escuro. A escolha fica salva no navegador.
  - As cores ficam num arquivo só (src/app/tema.ts), o que permite testá-las.

  Acessibilidade (referência: WCAG 2.2 AA)
  - Contraste testado automaticamente nos dois temas: são 80 combinações de cor,
    e o CI falha se alguém quebrar uma. O teste já pegou um problema real: a
    borda do campo de busca tinha 1,55:1 e quase sumia.
  - O status nunca depende só da cor: tem ícone e texto. Os avisos de dados
    passaram para azul, para não serem confundidos com o "Atenção" âmbar.
  - Teclado: foco visível, link "Pular para o conteúdo", e o foco vai para o
    detalhe em telas estreitas.
  - Leitor de tela: estrutura de títulos e regiões, e anúncios ao filtrar e ao
    decidir.
  - Zoom e telas pequenas: tamanhos acompanham a fonte do navegador. Conferi por
    print que não há rolagem lateral em 320px.
  - Toque e preferências do sistema: alvos de pelo menos 44px, e suporte ao alto
    contraste do Windows e à preferência por menos movimento.
  - Fontes embutidas no HTML: funciona sem internet e não faz requisição ao
    Google.
  - Documentação: docs/acessibilidade.md separa o que é testado automaticamente
    do que foi só revisado no código. Ainda não testei com leitor de tela de
    verdade (NVDA ou TalkBack); isso está listado como pendência.

  Dados
  - Os originais voltaram ao repositório. A seção "Dados: por que estão no 
    repositório" do README explica:
    - por que, num projeto real, dados de clientes não iriam para o git;
    - por que aqui foi feito assim: são fictícios, vieram da avaliadora e os
      números batem com os arquivos dela;
    - que chegamos a mascarar e a revisão de código mostrou que a máscara não
      bastava.
  - O script de mascaramento continua no repositório como ferramenta para quando
    houver dados reais, já com os dois achados da revisão corrigidos.

  Observações
  - Cada página ficou com cerca de 900 KB por causa das fontes embutidas. Se
    preferir páginas mais leves, dá para carregar as fontes da internet, ao
    custo de não funcionar offline.
  - tela/, os prints e o relatório de anomalias voltaram a ser versionados,
    porque o enunciado pede a tela e os prints no repositório.

  O que ainda falta:
  1. Rodar o /export da conversa e salvar em docs/conversa-com-ia.md.
  2. Subir o DIAGNOSTICO.md quando você liberar.

  Depois disso, é mandar o link para a Amanda.

✻ Worked for 13m 20s · done 12:34 PM

❯ porque a visao ta como celular mesmo estando no pc? e porque o tema esta numa 
  box? e porque eu tenho o seletor tao na frente ao inves de ficar mais pro     
  cantinho discreto?                                                            

● Os três pontos procedem:

  1. A visão do vendedor estava travada com largura de celular, mesmo no
     computador. Ela vai se adaptar à tela: no computador, os cartões ficam em
     colunas e as abas sobem para o topo; no celular, continua como está.
  2. O tema virou uma caixa de seleção porque eu queria oferecer três opções
     (sistema, claro, escuro). Fica pesado para algo que se usa raramente. Troco
     por um botão de ícone discreto (sol/lua) que alterna o tema.
  3. O "Ver como" é uma ferramenta de demonstração, não faz parte do produto, e
     estava com o mesmo peso da marca. Ele vira um seletor pequeno, em texto, no
     canto.

  Made 1 scratchpad edit +144, searched for 1 pattern, read 1 file (ctrl+o to expand)

● Agora estou escrevendo o CSS da visão do vendedor, com as abas no início do
  código para que a ordem do Tab e do leitor de tela fique lógica em qualquer
  largura.

  Ran 1 shell command (ctrl+o to expand)

❯ e o vendedor nao preenche nada? nao ta faltando coisa? revise tudo que foi    
  pedido com o projeto e veja se falta alguma coisa                             

● Vou terminar os ajustes do cabeçalho e do vendedor, depois a revisão completa,
  e em seguida os componentes: ícones, botão de tema, "Ver como" e as abas.

  Ran 1 shell command (ctrl+o to expand)

● Os componentes já compilam; agora vou conferir o enunciado item a item e fazer
  uma varredura extra nos dados em busca de anomalias.

  Ran 1 shell command (ctrl+o to expand)

● O cabeçalho novo e o layout do vendedor já estão no código; a revisão achou
  que C038 "Hotel Savasi Plaza" provavelmente é um erro de digitação de C018
  "Hotel Savassi Plaza", e que o campo liberado_por está vazio em todos os
  pedidos. Agora vou conferir o visual novo.

  Read 2 files, ran 1 shell command (ctrl+o to expand)

● O layout está certo no computador e no celular; faltam dois ajustes visuais, o
  espaço vazio do "Ver como" e o fundo quase invisível da mensagem no cartão.
  Depois disso, eu faço a detecção de nomes parecidos para pegar o C038/C018.

  Searched for 1 pattern, ran 1 shell command (ctrl+o to expand)

● A regex word boundary (\b) seems to have been corrupted when the file was
  saved, so "me" was matching inside words like "Academia"; I'm fixing that
  directly in the file.

  Read 1 file, ran 1 shell command (ctrl+o to expand)

● A barra invertida se perdeu de novo, agora no escape do shell. Uso a
  ferramenta de edição, que grava o texto literalmente:
● Update(src\dominio\carregar.ts)
  ⎿  Error editing file

  Ran 1 shell command (ctrl+o to expand)

● Ainda sobrou um caractere de controle invisível no arquivo. Leio e corrijo as
  duas coisas:

  Made 1 scratchpad edit +7, searched for 1 pattern, read 1 file, ran 1 shell command (ctrl+o to expand)

● As verificações passam e C038/C018 já aparece no relatório. Vou enxugar o
  README, que tem 2.740 palavras e deveria ser curto, movendo o detalhe para
  docs/decisoes.md.

  Read 1 file (ctrl+o to expand)

● Divido assim: o README atual vira docs/detalhes.md, com os links ajustados
  para a nova pasta, e escrevo um README curto no lugar.

  Made 1 scratchpad edit +34, ran 1 shell command (ctrl+o to expand)

● Os links do docs/detalhes.md estão certos. Agora o README curto, focado em
  abrir a tela e entender o essencial:

● Write(README.md)
  ⎿  Added 58 lines, removed 145 lines
        1  # Brilho Minas · Fila do financeiro
        2  
        3 -Protótipo da fila de liberação de pedidos da Brilho Minas. A r
          -egra de crédito da Marta é aplicada sobre os dados do Sistemão
          - e há uma tela para cada perfil: o **financeiro** vê a fila co
          -mpleta com sugestão e motivo, e cada **vendedor** vê só os pró
          -prios pedidos e clientes no celular, sem valores de dívida.   
        3 +A fila de liberação de pedidos da Brilho Minas, com a regra de
          + crédito da Marta aplicada aos dados do Sistemão:             
        4 +- **Financeiro:** vê a fila com a sugestão (Liberar, Atenção o
          +u Bloquear) e o motivo de cada pedido.                        
        5 +- **Vendedor:** vê no celular só os próprios pedidos e cliente
          +s, sem valores de dívida.                                     
        6  
        5 -**Abrir a tela:** https://mais4g.github.io/brilho-minas-fila-f
          -inanceiro/                                                    
        7 +**Abrir:** https://mais4g.github.io/brilho-minas-fila-financei
          +ro/                                                           
        8  
        9  | Marta (financeiro) | Vendedora no celular |
       10  |---|---|
        9 -| ![Fila da Marta, tema claro](docs/prints/marta-claro.png) | 
          -![Pedidos da Patrícia, tema claro](docs/prints/vendedor-pedido
          -s-claro.png) |                                                
       10 -| ![Fila da Marta, tema escuro](docs/prints/marta-escuro.png) 
          -| ![Pedidos da Patrícia, tema escuro](docs/prints/vendedor-ped
          -idos-escuro.png) |                                            
       11 +| ![Fila da Marta](docs/prints/marta-claro.png) | ![Pedidos da
          + Patrícia](docs/prints/vendedor-pedidos-claro.png) |          
       12  
       13  ## Como abrir
       14  
       15  - **Pelo link acima**, ou
       15 -- **Sem internet:** abra `tela/index.html` deste repositório c
          -om dois cliques. Cada página é um HTML único, com tudo dentro 
          -(inclusive as fontes); não precisa de servidor nem de instalar
          - nada.                                                        
       16 +- **Sem internet:** abra `tela/index.html` deste repositório c
          +om dois cliques. Cada página é um arquivo único, com tudo dent
          +ro; não precisa instalar nada.                                
       17  
       17 -Escolha quem está olhando. Dentro de qualquer página, o seleto
          -r **"Ver como"** no topo troca de perfil, e o seletor **"Tema"
          -** troca entre claro, escuro e o do sistema.                  
       18 +**Para usar a tela:**                                         
       19 +- Escolha quem está olhando. No canto superior direito, **"Ver
          + como"** troca de perfil, e o ícone de **lua/sol** troca o tem
          +a.                                                            
       20 +- Marta: clique num pedido para ver o detalhe ao lado. Os cart
          +ões do topo filtram a fila.                                   
       21 +- Vendedor: a aba **"Meus clientes"** mostra quem está liberad
          +o antes de prometer entrega.                                  
       22  
       19 -| Página | Quem |                                             
       20 -|---|---|                                                     
       21 -| `tela/financeiro.html` | Marta (financeiro) |               
       22 -| `tela/vendedor-v01.html` … `vendedor-v06.html` | cada um dos
          - 6 vendedores (`#clientes` no fim abre direto a aba de cliente
          -s) |                                                          
       23 +## Decisões principais                                        
       24  
       24 -### Para quem for mexer no código                             
       25 +- **A regra:**                                                
       26 +  - **Bloquear:** boleto vencido há **mais de 5 dias**, ou dív
          +ida + pedido **passando** do limite.                          
       27 +  - **Atenção:** 1 a 5 dias de atraso.                        
       28 +  - **Liberar:** nenhum dos casos acima.                      
       29 +  - **Casos-limite:** 5 dias dá Atenção e 6 dá Bloquear; exata
          +mente no limite libera; o vencimento vale mais que o status do
          + boleto. Cada caso tem teste.                                 
       30 +- **Um arquivo por perfil.** O arquivo do vendedor só contém o
          +s dados dele, e isso é verificado por teste. Sem login, qualqu
          +er arquivo abre; no sistema real, o servidor entregaria só o p
          +erfil de quem entrou.                                         
       31 +- **Para o vendedor, é previsão.** Enquanto a Marta não decide
          +, ele vê "Deve ser liberado", e não "Liberado", para não prome
          +ter em cima de uma sugestão.                                  
       32 +- **A decisão da Marta fica só na tela** e a tela avisa isso. 
          +Gravar no Sistemão é o próximo passo.                         
       33 +- **O vendedor só consulta, não preenche nada.** O enunciado p
          +ede a visão dele, não o lançamento de pedidos; lançar o pedido
          + uma vez só é a semana 2 da proposta.                         
       34 +- **Os dados estão no repositório porque são fictícios** e vie
          +ram com o desafio, então os números batem com os arquivos orig
          +inais. Com dados reais, não estariam aqui: a explicação comple
          +ta está em [detalhes](docs/detalhes.md#dados-por-que-estão-no-
          +repositório).                                                 
       35 +- **Visual com a identidade do Divos da IA**, tema claro e esc
          +uro, e acessibilidade (WCAG 2.2 AA como referência, com contra
          +ste testado nos dois temas): [`docs/acessibilidade.md`](docs/a
          +cessibilidade.md).                                            
       36 +- **Stack:** TypeScript, React, Zod (valida cada registro do S
          +istemão) e Vitest (161 testes), empacotados num HTML por perfi
          +l. O CI testa e publica a cada push.                          
       37  
       26 -Precisa do Node 24 ou mais recente.                           
       38 +## O que encontrei de estranho nos dados                      
       39  
       28 -```bash                                                       
       29 -npm ci                                                        
       30 -npm test            # 160 testes: regra de crédito, dados reai
          -s, segurança por perfil, contraste dos temas                  
       31 -npm run build       # gera tela/ (um HTML por perfil) e docs/a
          -nomalias-dos-dados.md                                         
       32 -npm run dev         # servidor local com recarga (perfil finan
          -ceiro; PERFIL=V01 npm run dev para um vendedor)               
       33 -npm run check       # tipos + testes + build, o mesmo que o CI
          - roda                                                         
       34 -```                                                           
       35 -                                                              
       36 -O CI (GitHub Actions) roda tipos, testes e build a cada push, 
          -confere se a pasta `tela/` do repositório está igual ao build,
          - e publica no GitHub Pages a cada push na `main`.             
       37 -                                                              
       38 -## Dados: por que estão no repositório                        
       39 -                                                              
       40 -**Num projeto real, dados de clientes não iriam para o reposit
          -ório.** CNPJ, telefone e histórico de pagamento são dados pess
          -oais e de negócio (LGPD). Um repositório:                     
       41 -- é copiado para cada máquina que o clona;                    
       42 -- guarda tudo no histórico para sempre (apagar depois não reso
          -lve);                                                         
       43 -- costuma ter mais gente com acesso do que o necessário.      
       44 -                                                              
       45 -O certo seria ler os dados direto da API do Sistemão, com cred
          -encial, e nunca versioná-los. Também não seria publicar a tela
          - num endereço aberto, como o Pages.                           
       46 -                                                              
       47 -**Aqui os dados estão no repositório, de propósito:**         
       48 -- **São fictícios.** A Brilho Minas é uma empresa inventada, e
          - os arquivos foram entregues pela própria avaliadora junto com
          - o desafio.                                                   
       49 -- **Assim os resultados batem com os dela.** Com os arquivos o
          -riginais, quem avaliar vê na tela e nos testes exatamente os m
          -esmos números dos JSONs que tem em mãos (o pedido 1110, os 72 
          -dias de atraso do C001, o limite de R$ 6.000 da Lavanderia).  
       50 -- **Dá para reproduzir tudo:** `npm test` e `npm run build` fu
          -ncionam em qualquer máquina, sem pedir nada a ninguém.        
       51 -                                                              
       52 -**Cheguei a fazer do outro jeito.** Numa versão anterior, os d
          -ados ficaram fora do git e do histórico, e o CI usava uma cópi
          -a com CNPJ e telefone mascarados. A revisão de código mostrou 
          -que isso não bastava: a cópia mantinha nome, cidade e históric
          -o de pagamento, e pelo nome da empresa dá para achar o CNPJ em
          - qualquer consulta pública. Mascarar de verdade exigiria troca
          -r também a razão social, e aí a tela deixaria de bater com os 
          -arquivos da avaliadora. Como os dados são fictícios, a troca n
          -ão protegeria ninguém e atrapalharia a avaliação. Voltei aos o
          -riginais e documentei o motivo aqui.                          
       53 -                                                              
       54 -**A ferramenta ficou** ([`scripts/mascarar.ts`](scripts/mascar
          -ar.ts), `npm run mascarar`, com teste) para o dia em que houve
          -r dados reais. Ela troca CNPJ e telefone por valores fictícios
          - de forma não reversível, mantém a duplicidade de cadastro det
          -ectável e não esconde CNPJ inválido. O próprio arquivo avisa o
          - que ela **não** faz: trocar nome e cidade.                   
       55 -                                                              
       56 -**O que continua valendo mesmo com dados fictícios:** cada per
          -fil só recebe o que pode ver (próxima seção e [`testes/seguran
          -ca.test.ts`](testes/seguranca.test.ts)), e telefone não vai pa
          -ra nenhuma tela.                                              
       57 -                                                              
       58 -## O que a tela faz                                           
       59 -                                                              
       60 -**Marta (financeiro)**                                        
       61 -- Mostra os 14 pedidos "aguardando liberação" agrupados pela s
          -ugestão: **Bloquear** primeiro, porque é o que exige ação dela
          -; depois **Atenção**; depois **Liberar**, que é só conferir. D
          -entro de cada grupo, o pedido mais antigo vem primeiro, porque
          - é o que está esperando há mais tempo.                        
       62 -- Cada pedido traz o motivo em uma frase ("Boleto vencido há 6
          - dias (a tolerância é de 5 dias)") e uma barra com dívida + pe
          -dido contra o limite.                                         
       63 -- Avisos em azul (cor separada das cores de status) para o que
          - a regra não cobre, mas ela precisa saber: cadastro duplicado,
          - pedido possivelmente em dobro, boleto com status errado no Si
          -stemão, e o caso em que liberar todos os pedidos do mesmo clie
          -nte estoura o limite.                                         
       64 -- Cartões de resumo no topo, com quantidade e valor parado, qu
          -e também filtram a lista. Busca por cliente, pedido ou vendedo
          -r.                                                            
       65 -- Ao clicar num pedido, o detalhe abre ao lado: motivos, conta
          - de crédito, avisos, boletos e itens.                         
       66 -- **Botões para marcar a decisão**, e o próximo pedido pendent
          -e abre sozinho. Por enquanto a marcação fica só na tela (some 
          -ao recarregar), e a tela diz isso. Gravar no Sistemão é o próx
          -imo passo.                                                    
       67 -- **Não mostra comissão** de vendedor, que ela não pode ver.  
       68 -                                                              
       69 -**Vendedor (celular)**                                        
       70 -- Só os próprios pedidos, com o que tem problema primeiro. Ped
          -idos na fila mostram a **previsão** do financeiro ("Deve ser l
          -iberado", "Deve sair · cobrar cliente", "Deve ser bloqueado") 
          -e o que fazer: "O cliente tem um boleto em atraso. O pedido po
          -de seguir, mas cobre o cliente."                              
       71 -- A aba **"Meus clientes"** mostra a situação de cada cliente 
          -antes de prometer entrega, que é a dor do Carlos. Dá para abri
          -r direto em `vendedor-v01.html#clientes`.                     
       72 -- Avisa quando um pedido parece ter sido enviado duas vezes, q
          -ue é a dor do Bruno.                                          
       73 -- **Nenhum valor de dívida, limite, dias de atraso, CNPJ ou te
          -lefone.**                                                     
       74 -                                                              
       75 -## Visual e acessibilidade                                    
       76 -                                                              
       77 -- **Identidade visual:** a do Divos da IA. Bordô, fundo leveme
          -nte rosado, títulos em Playfair Display, texto em Inter e núme
          -ros em JetBrains Mono. Ela foi validada antes num protótipo, à
          - parte do código.                                             
       78 -- **Tema claro e escuro:** segue o sistema por padrão e dá par
          -a fixar um dos dois pelo seletor.                             
       79 -- **Acessibilidade, WCAG 2.2 AA como referência:**            
       80 -  - contraste testado automaticamente nos dois temas, em 80 co
          -mbinações de cor;                                             
       81 -  - o status nunca depende só da cor;                         
       82 -  - tudo funciona pelo teclado, com foco visível;             
       83 -  - estrutura e anúncios para leitor de tela;                 
       84 -  - tamanhos que acompanham o zoom e a fonte do navegador, sem
          - rolagem lateral em 320px;                                    
       85 -  - alvos de toque com pelo menos 44px;                       
       86 -  - suporte ao modo de alto contraste do Windows.             
       87 -                                                              
       88 -O detalhe de cada item, o que foi testado e como, e o que aind
          -a falta estão em **[`docs/acessibilidade.md`](docs/acessibilid
          -ade.md)**.                                                    
       89 -                                                              
       90 -## A regra de crédito                                         
       91 -                                                              
       92 -Fica em [`src/dominio/credito.ts`](src/dominio/credito.ts), co
          -mo uma função pura, testada em [`testes/credito.test.ts`](test
          -es/credito.test.ts).                                          
       93 -                                                              
       94 -| Sugestão | Quando |                                         
       40 +| O que | O que fiz |                                         
       41  |---|---|
       96 -| Bloquear | algum boleto vencido há **mais de 5 dias**, **ou*
          -* dívida (boletos abertos + vencidos) + pedido **passa** do li
          -mite, **ou** cliente sem limite cadastrado |                  
       97 -| Atenção | algum boleto vencido há 1 a 5 dias, sem nenhum mot
          -ivo de bloqueio |                                             
       98 -| Liberar | nenhum dos casos acima |                          
       42 +| **Mesmo restaurante cadastrado 2 vezes** (C001 e C037: mesmo
          + CNPJ e telefone, nome digitado diferente, limites diferentes)
          +. O pedido 1110 caiu no cadastro "limpo" e esconderia 72 dias 
          +de atraso | Juntei os dois: **1110 vira Bloquear**, com aviso.
          + Uso o menor limite até confirmar qual vale |                 
       43 +| **Boleto T0132 "aberto", mas vencido há 12 dias** | Vale a d
          +ata: **1106 vira Bloquear**, com aviso |                      
       44 +| **Pedidos 1105 e 1108 iguais**, no mesmo minuto ("digitado 2
          +x?") | Aviso de pedido em dobro para a Marta e para a vendedor
          +a; juntos, passariam do limite |                              
       45 +| **C038 "Hotel Savasi Plaza"**: sem CNPJ, sem vendedor, limit
          +e 0, e nome quase igual ao C018 "Hotel Savassi Plaza" | Aparec
          +e no relatório como provável cadastro repetido; não junto sem 
          +CNPJ para confirmar |                                         
       46 +| **Pedido 1013**: 120 unidades ("cliente pediu 12") e comissã
          +o errada; **pedido 1006** sem vendedor | Já entregues: só regi
          +strados |                                                     
       47 +| **Ninguém registra quem liberou** (`liberado_por` vazio nos 
          +110 pedidos) | Registrado; reforça o diagnóstico |            
       48  
      100 -**Como interpretei os casos-limite** (cada um tem teste):     
      101 -- **5 dias de atraso** dá Atenção e **6 dias** dá Bloquear, po
          -rque a regra diz "mais de 5". Nos dados, são os pedidos 1109 e
          - 1104.                                                        
      102 -- **Dívida + pedido exatamente igual ao limite** libera, porqu
          -e "passa do limite" é estritamente maior.                     
      103 -- **Boleto vencendo hoje** (11/11) ainda não está atrasado.   
      104 -- **"Vencido" é decidido pela data de vencimento, não pelo cam
          -po status.** Um boleto "aberto" que venceu há 12 dias está ven
          -cido.                                                         
      105 -- Valores comparados **em centavos**, para não errar no centav
          -o por arredondamento.                                         
      106 -- **Atraso leve + acima do limite** dá Bloquear (o bloqueio pr
          -evalece), e o motivo mostra os dois quando houver.            
      107 -- A data de referência é fixa em **11/11/2026** (a data do LEI
          -A-ME), em [`src/dominio/config.ts`](src/dominio/config.ts).   
       49 +A lista completa é gerada a cada build em [`docs/anomalias-dos
          +-dados.md`](docs/anomalias-dos-dados.md).                     
       50  
      109 -## Decisões e por quê                                         
      110 -                                                              
      111 -- **Um HTML por perfil, em vez de uma página só com todos os d
          -ados.** Uma página única que filtra na tela teria a dívida de 
          -todos os clientes dentro do arquivo do vendedor, visível para 
          -quem abrir o código-fonte. Aqui, o build gera um arquivo por p
          -erfil, e o do vendedor **só contém os dados dele**. Isso é ver
          -ificado por teste ([`testes/seguranca.test.ts`](testes/seguran
          -ca.test.ts)), que confere a lista exata de campos permitidos, 
          -e por uma checagem no build.                                  
      112 -- **Limite honesto disso:** sem login, qualquer pessoa pode ab
          -rir qualquer arquivo. Na versão real, cada pessoa entra com o 
          -próprio acesso e o servidor só entrega a projeção do perfil de
          -la. As funções `projetarFinanceiro` e `projetarVendedor` ([`sr
          -c/dominio/visoes.ts`](src/dominio/visoes.ts)) são exatamente o
          - que esse servidor usaria.                                    
      113 -- **Mínimo de dados.** Telefone não vai para nenhuma tela, por
          -que nenhuma precisa dele (LGPD). O CNPJ só aparece para o fina
          -nceiro.                                                       
      114 -- **Validação na entrada.** Cada registro do Sistemão passa po
          -r um esquema (Zod). O que vier com formato quebrado é registra
          -do como anomalia e ignorado, em vez de derrubar a tela. Isso t
          -ambém tem teste.                                              
      115 -- **Cliente cadastrado em dobro é tratado como um cliente só.*
          -* C001 e C037 são a mesma empresa: mesmo CNPJ, telefone, vende
          -dor e cidade, com o nome digitado de outro jeito. A dívida dos
          - dois cadastros soma e a Marta vê um aviso explicando. A única
          - coisa que não dá para saber pelos dados é **qual dos dois lim
          -ites vale** (R$ 8.000 ou R$ 5.000). Até alguém confirmar, uso 
          -o menor, e isso virou uma das perguntas do diagnóstico. Hoje n
          -ão faz diferença: o 1110 bloqueia pelo atraso com qualquer um 
          -dos dois.                                                     
      116 -- **Para o vendedor, é "previsão" enquanto a Marta não decide.
          -** Assim ele não promete entrega com base numa sugestão. E um 
          -pedido que a Marta **já barrou** aparece como Bloqueado, mesmo
          - que a regra hoje sugira liberar, porque a decisão dela vale m
          -ais.                                                          
      117 -- **Os textos do vendedor saem de códigos, não do texto da Mar
          -ta.** O vendedor recebe "pagamento atrasado", e nunca "43 dias
          -" ou "R$ 4.195,64". Um teste garante que não há números nesses
          - textos.                                                      
      118 -- **Valor do pedido:** se o valor informado não bater com a so
          -ma dos itens, a regra usa o maior e avisa. Nos dados atuais, t
          -odos batem.                                                   
      119 -- **Stack: TypeScript + React + Vite + Zod + Vitest**, empacot
          -ado em HTML autocontido. A primeira ideia foi HTML + JavaScrip
          -t puro, mas preferi pagar um pouco mais de configuração para t
          -er tipos (a visão do vendedor não tem campo de dívida, então a
          - tela não consegue mostrar), validação e testes. O CI no GitHu
          -b roda tipos, testes e build a cada push.                     
      120 -                                                              
      121 -## O que encontrei de estranho nos dados                      
      122 -                                                              
      123 -O relatório completo é gerado automaticamente em [`docs/anomal
          -ias-dos-dados.md`](docs/anomalias-dos-dados.md) a cada `npm ru
          -n build`. Os principais casos:                                
      124 -                                                              
      125 -| O que | Impacto | O que fiz |                               
      126 -|---|---|---|                                                 
      127 -| **O mesmo restaurante cadastrado duas vezes, com o nome digi
          -tado de outro jeito:** C001 "Restaurante Sabor de Minas" e C03
          -7 "RESTAURANTE SABOR DE MINAS LTDA" têm o mesmo CNPJ, telefone
          -, vendedor e cidade, mas limites diferentes (R$ 8.000 e R$ 5.0
          -00) | O pedido 1110 está no cadastro novo (C037), que não tem 
          -boleto e parece limpo; a dívida, com atraso de até 72 dias, es
          -tá no C001 | Juntei os dois: **1110 vira Bloquear**, com aviso
          - de cadastro em dobro. É o mesmo problema de redigitação da op
          -eração, agora no cadastro de clientes |                       
      128 -| **Boleto T0132 (C006) está "aberto", mas venceu em 30/10** |
          - O pedido 1106 pareceria liberado | Vale a data: **1106 vira B
          -loquear**, com aviso de status desatualizado |                
      129 -| **Pedidos 1105 e 1108:** mesmo cliente, mesmos itens, mesmo 
          -minuto (11:51); o 1108 tem a observação "digitado 2x? conferir
          -" | Cada um sozinho cabe no limite; **os dois juntos passam** 
          -(R$ 6.836 de R$ 6.000) | Os dois ficam como Liberar, mas com a
          -viso de duplicidade e de limite somado, para a Marta e para a 
          -vendedora |                                                   
      130 -| **C038 "Hotel Savasi Plaza":** sem CNPJ, sem vendedor e com 
          -limite 0 | Não tem pedido na fila hoje | Registrado; qualquer 
          -pedido dele seria Bloquear (sem limite) e não aparece para nen
          -hum vendedor |                                                
      131 -| **Pedido 1006** sem vendedor ("pedido veio por áudio, vended
          -or não identificado") | Já entregue | Registrado; não aparece 
          -para nenhum vendedor |                                        
      132 -| **Pedido 1013:** 120 sacos de lixo com a observação "cliente
          - pediu 12, conferir", e comissão de R$ 33,95 quando 3% daria R
          -$ 206,10 | Já entregue | Registrado. É o tipo de erro de digit
          -ação (12%) que vale atacar com uma conferência automática de q
          -uantidades |                                                  
      133 -                                                              
       51  ## O que ficou de fora
       52  
      136 -- **Gravar a decisão da Marta.** Os botões marcam a decisão só
          - na tela, e a tela avisa isso. Gravar no Sistemão (a API aceit
          -a escrita de pedidos) e avisar o vendedor é o próximo passo.  
      137 -- **Teste com leitor de tela real e com quem usa** (Marta e um
          - vendedor no celular). Ver [`docs/acessibilidade.md`](docs/ace
          -ssibilidade.md#o-que-ainda-falta).                            
      138 -- **Visão da Renata (diretoria).** O enunciado pedia financeir
          -o e vendedores.                                               
      139 -- **Pedidos "recebido"** (que ainda não foram ao financeiro) n
          -ão entram na fila da Marta. Aparecem só para o vendedor, já co
          -m a previsão.                                                 
      140 -- **Atualização em tempo real.** Os dados são uma foto de 11/1
          -1; para atualizar, basta rodar `npm run build` com os novos JS
          -ONs em `dados/`.                                              
       53 +- Gravar a decisão da Marta e avisar o vendedor.              
       54 +- Visão da diretoria (Renata).                                
       55 +- Teste com leitor de tela real, e com a Marta e um vendedor d
          +e verdade.                                                    
       56  
       57  ## Como usei a IA
       58  
      144 -Usei o Claude Code do começo ao fim. A conversa exportada vai 
          -ficar em `docs/conversa-com-ia.md`.                           
       59 +Usei o Claude Code do começo ao fim. A conversa exportada fica
          + em `docs/conversa-com-ia.md`.                                
       60  
      146 -**Onde ajudou**                                               
      147 -- Leu o enunciado e escreveu um script para varrer os 5 arquiv
          -os atrás de inconsistências. Achou o CNPJ duplicado, o boleto 
          -com status errado e os pedidos em dobro antes de qualquer linh
          -a da tela.                                                    
      148 -- Escreveu a regra, os testes de casos-limite e as telas, e co
          -nferiu o visual em 390px com o Chrome em modo headless.       
      149 -- Montou o deploy no GitHub Pages e, quando pedi um visual nov
          -o, um protótipo navegável antes de mexer no código, com a iden
          -tidade do Divos da IA tirada da página do desafio.            
      150 -- Fez o tema escuro e a acessibilidade, com um teste de contra
          -ste que pegou um problema real: a borda do campo de busca tinh
          -a 1,55:1 e quase sumia.                                       
       61 +**Onde ajudou:**                                              
       62 +- achou as sujeiras dos dados antes de qualquer tela;         
       63 +- escreveu a regra com os testes de casos-limite;             
       64 +- fez as telas, o protótipo visual, os temas, a acessibilidade
          + e o deploy.                                                  
       65  
      152 -**Onde precisei corrigir ou direcionar**                      
      153 -- A primeira proposta foi HTML + JavaScript puro. Questionei s
          -e dava para ter mais robustez, e mudamos para TypeScript, vali
          -dação, testes e um HTML por perfil.                           
      154 -- Ela colocou "Co-Authored-By" nos commits; pedi para tirar.  
      155 -- Um teste de segurança escrito por ela barrava a palavra "bol
          -eto" em qualquer texto e quebrou num texto permitido ("cobre o
          - boleto em atraso"). Foi corrigido para checar nomes de campos
          - e identificadores de boleto.                                 
      156 -- Ela mesma notou que a lista geral de anomalias tinha a comis
          -são do pedido 1013, que a Marta não pode ver. A lista ficou fo
          -ra das telas e foi só para o relatório.                       
      157 -- Os casos de borda (1104, 1109, 1106, 1110) foram calculados 
          -à parte, antes do código, e viraram testes com o resultado esp
          -erado. Assim, o código não "se confere sozinho".              
      158 -- Ela tratou C001 e C037 como uma suposição ("o limite é por C
          -NPJ?"). Mostrei que são a mesma empresa com o nome digitado di
          -ferente, e o texto da tela, o relatório e o diagnóstico foram 
          -ajustados.                                                    
      159 -- Pedi para esconder os dados sensíveis, e ela tirou os dados 
          -do repositório e montou uma cópia mascarada. Rodei uma revisão
          - de código (`/code-review`), que mostrou que a máscara deixava
          - nome e histórico expostos. Como os dados são fictícios, decid
          -i voltar aos originais e documentar o porquê (seção "Dados"). 
      160 -- No protótipo, os avisos de dados usavam a mesma cor do statu
          -s "Atenção". Isso foi trocado na versão final: cada cor tem um
          - papel só.                                                    
       66 +**Onde precisei corrigir:**                                   
       67 +- A primeira proposta foi HTML + JavaScript puro, e pedi mais 
          +robustez.                                                     
       68 +- Ela tratou C001/C037 como suposição; eram a mesma empresa co
          +m o nome digitado diferente.                                  
       69 +- A visão do vendedor ficou com largura de celular até no comp
          +utador.                                                       
       70 +- A revisão de código mostrou que o mascaramento dos dados não
          + protegia de verdade.                                         
       71  
      162 -## Estrutura                                                  
       72 +**Ela mesma corrigiu:**                                       
       73 +- um teste de segurança errado;                               
       74 +- a comissão que vazaria para a Marta;                        
       75 +- a borda da busca sem contraste.                             
       76  
       77 +A lista completa está em [detalhes](docs/detalhes.md#como-usei
          +-a-ia).                                                       
       78 +                                                              
       79 +## Para quem for mexer no código                              
       80 +                                                              
       81 +```bash                                                       
       82 +npm ci && npm run check   # tipos + 161 testes + build (o mesm
          +o que o CI)                                                   
       83 +npm run dev               # servidor local (PERFIL=V01 npm run
          + dev para um vendedor)                                        
       84  ```
      165 -src/dominio/        regra e dados: esquemas, carregar, credito
          -, fila, textos, visoes                                        
      166 -src/app/            telas (React)                             
      167 -scripts/            gerar.ts (dados por perfil + relatório), b
          -uild.ts (um HTML por perfil), mascarar.ts (para dados reais)  
      168 -dados/              JSONs do Sistemão (fictícios, entregues co
          -m o desafio)                                                  
      169 -src/app/tema.ts     cores dos temas claro e escuro (fonte únic
          -a, com contraste testado)                                     
      170 -testes/             regra, dados reais, segurança por perfil, 
          -contraste, mascaramento                                       
      171 -tela/               resultado do build: é isto que se abre no 
          -navegador (também publicado no Pages)                         
      172 -docs/               acessibilidade, relatório de anomalias e p
          -rints                                                         
      173 -```                                                           
       85 +                                                              
       86 +A estrutura do código e todas as decisões, uma a uma, estão em
          + [`docs/detalhes.md`](docs/detalhes.md).                      

  Ran 1 shell command (ctrl+o to expand)

● O README caiu de 2.740 para 867 palavras. Os documentos ainda citam o seletor
  de tema antigo; atualizo:

  Made 1 scratchpad edit +34, ran 1 shell command (ctrl+o to expand)

● Acrescento as duas evidências novas ao DIAGNOSTICO.md, que continua só na sua
  máquina. Depois refaço o build e os prints com o cabeçalho novo:

  Made 1 scratchpad edit +11, read 1 file, ran 1 shell command (ctrl+o to expand)

● Agora o "Ver como" tem o tamanho certo, a mensagem do cartão não parece mais
  recuada e os cartões ficam em colunas no computador. Faço o commit e o push:

  Ran 2 shell commands (ctrl+o to expand)

● Os três ajustes estão no site, junto com a revisão completa. O CI passou.

  Os três ajustes de UX
  1. Vendedor no computador: os cartões agora ficam em colunas e as abas vão
     para o topo. No celular continua como antes, com as abas embaixo.
  2. Tema: virou um botão de ícone (lua/sol) no canto, sem caixa de seleção.
  3. "Ver como": ficou discreto no canto, como texto pequeno, porque é uma
     ferramenta de demonstração e não parte do produto.

  O vendedor não preenche nada?
  Não, e o enunciado não pede que preencha. Ele pede a visão do vendedor: só os
  pedidos dele, com status e motivo, sem valores de dívida, funcionando no
  celular. Lançar o pedido é a semana 2 do diagnóstico, e criar um formulário
  agora sairia do recorte que a Amanda definiu para comparar as candidatas.
  Deixei isso explícito no README.

  Se quiser uma interação do vendedor, a que mais faz sentido é pequena: no
  aviso de pedido em dobro (1105/1108), botões "Era repetido" e "São dois 
  pedidos". Isso responde a pergunta que a Marta teria que fazer no WhatsApp.
  Ficaria só na tela, como a decisão da Marta. Quer que eu faça?

  Revisão contra o enunciado

  Pedido no enunciado: Ler os dados JSON
  Situação: ✅
  ────────────────────────────────────────
  Pedido no enunciado: Sugestão + motivo em português claro para cada pedido
  aguardando
  Situação: ✅ 14 pedidos, casos-limite testados
  ────────────────────────────────────────
  Pedido no enunciado: Seletor "ver como" no topo (Financeiro ou vendedor)
  Situação: ✅ no canto superior direito
  ────────────────────────────────────────
  Pedido no enunciado: Visão da Marta: o que ver primeiro para decidir rápido
  Situação: ✅
  ────────────────────────────────────────
  Pedido no enunciado: Vendedor: só os pedidos dele, sem dívida, funcionando no
  celular
  Situação: ✅ verificado por teste
  ────────────────────────────────────────
  Pedido no enunciado: Tela abre sem instalar nada
  Situação: ✅ tela/index.html e o site no Pages
  ────────────────────────────────────────
  Pedido no enunciado: Repositório com commits em etapas
  Situação: ✅
  ────────────────────────────────────────
  Pedido no enunciado: Prints da Marta e do vendedor no celular
  Situação: ✅ claro e escuro, e também o vendedor no computador
  ────────────────────────────────────────
  Pedido no enunciado: README: como abrir, decisões, dados estranhos, uso da IA
  Situação: ✅
  ────────────────────────────────────────
  Pedido no enunciado: README "curto"
  Situação: ⚠️ Estava com 2.740 palavras. Reduzi para 867, e o detalhe foi para
  docs/detalhes.md
  ────────────────────────────────────────
  Pedido no enunciado: Anomalias nos dados
  Situação: ⚠️ Faltavam duas. O C038 "Hotel Savasi Plaza" é quase certamente o
  C018 "Hotel Savassi Plaza" com o nome digitado errado. E nenhum pedido
  registra quem liberou (liberado_por vazio nos 110). Agora as duas aparecem no
   relatório, no README e no diagnóstico
  ────────────────────────────────────────
  Pedido no enunciado: Bônus: testes e site publicado
  Situação: ✅ 161 testes; Pages
  ────────────────────────────────────────
  Pedido no enunciado: DIAGNOSTICO.md
  Situação: ❌ ainda fora do repositório, como você pediu. Atualizei com as
  evidências novas; tem 1.134 palavras e cabe nas 2 páginas
  ────────────────────────────────────────
  Pedido no enunciado: Conversa com a IA exportada
  Situação: ❌ depende de você

  No caminho, corrigi um bug meu: a expressão que remove "LTDA/ME" dos nomes
  tinha perdido o \b (limite de palavra) ao ser gravada pelo shell. Sem ele,
  "Academia" perderia o "me" do meio. Já está corrigido e conferido.

  Para entregar até amanhã, 18h:
  1. Rodar o /export e salvar em docs/conversa-com-ia.md.
  2. Liberar a subida do DIAGNOSTICO.md.
  3. Mandar o link para a Amanda.

✻ Sautéed for 7m 14s · done 12:42 PM

❯ no da marta o botao de tema ainda esta estranho                               

● Vou ver como o botão aparece na tela da Marta:

  Read 1 file, ran 3 shell commands (ctrl+o to expand)

● A captura do tema escuro travou com a janela de 80px. Refaço com uma janela
  maior:

  Read 1 file, ran 1 shell command (ctrl+o to expand)

● Meus prints em 1440px, nos dois temas, mostram o botão normal, então o
  problema pode depender da largura da tela. Vou testar as larguras mais comuns
  de notebook.

  Read 2 files, ran 2 shell commands (ctrl+o to expand)

● Em todas as larguras que testei (900, 1100, 1280 e 1440px, nos dois temas), o
  botão da Marta aparece como deveria: um ícone de lua ou sol, sem caixa, no
  canto direito.

  O motivo mais provável é cache do navegador. O GitHub Pages manda o navegador
  guardar a página por 10 minutos (max-age=600), e a versão nova foi publicada
  há pouco. Se você abriu o link antes disso, o navegador ainda está mostrando a
  versão antiga, com a caixa "Tema: Do sistema". Confirmei que o servidor já
  entrega a versão nova.

  Para ver a atual, recarregue ignorando o cache: Ctrl+F5 (ou Ctrl+Shift+R). Se
  você abriu o arquivo local tela/financeiro.html, basta recarregar.

  Se depois disso ainda estiver estranho, me mande um print ou me diga o que
  incomoda. Por exemplo: o ícone parece solto sem nenhuma moldura, o desenho da
  lua está esquisito, ou o botão está desalinhado com o "Ver como". Não quero
  mexer no que não vi; com isso eu corrijo direto.

✻ Crunched for 2m 36s · done 12:47 PM

※ recap: Estamos finalizando o desafio da Brilho Minas para a Amanda, e agora o foco é o botão de tema na tela da Marta, que nos meus testes aparece normal. Próximo passo: recarregue com Ctrl+F5 e, se continuar estranho, me mande um print.

❯ agora confira se tudo esta como o solicitado                                  

● Vou conferir item por item com evidência: testes, o site publicado, os
  arquivos no repositório, os links do README e os dados de cada perfil.

  Ran 1 shell command (ctrl+o to expand)

● O repositório, o CI e o site estão em dia. Agora confiro o conteúdo: o
  resultado da regra, os dados de cada perfil nos HTMLs publicados, os links do
  README e o diagnóstico:

  Ran 2 shell commands (ctrl+o to expand)

● Conferi tudo contra o enunciado, com evidência em cada item. Tudo o que 
  depende de mim está como foi pedido. Faltam só os dois itens que dependem de
  você.

  Parte 2: a tela

  ┌───────────────────────┬─────────────────────────────────────────────────┐
  │        Pedido         │                    Conferido                    │
  ├───────────────────────┼─────────────────────────────────────────────────┤
  │ Ler os dados JSON     │ ✅ os 5 arquivos, validados um a um             │
  ├───────────────────────┼─────────────────────────────────────────────────┤
  │ Sugestão e motivo     │ ✅ 14 pedidos: Bloquear 1091, 1099, 1096, 1110, │
  │ para cada pedido      │  1104, 1106; Atenção 1097, 1109; Liberar 1090,  │
  │ "aguardando           │ 1094, 1098, 1102, 1105, 1108. Bate com o        │
  │ liberação"            │ cálculo feito à parte no início                 │
  ├───────────────────────┼─────────────────────────────────────────────────┤
  │                       │ ✅ 5 dias dá Atenção e 6 dá Bloquear;           │
  │ Casos-limite da regra │ exatamente no limite libera; o vencimento vale  │
  │                       │ mais que o status. Tudo coberto por testes      │
  ├───────────────────────┼─────────────────────────────────────────────────┤
  │ Seletor "ver como" no │                                                 │
  │  topo (Financeiro ou  │ ✅ no canto superior direito                    │
  │ um vendedor)          │                                                 │
  ├───────────────────────┼─────────────────────────────────────────────────┤
  │ Visão da Marta:       │ ✅ o que bloqueia vem primeiro, com o motivo na │
  │ decidir rápido        │  linha e o detalhe ao lado                      │
  ├───────────────────────┼─────────────────────────────────────────────────┤
  │ Vendedor: só os       │ ✅ verifiquei os 6 HTMLs publicados: zero CNPJ, │
  │ pedidos dele, sem     │  telefone, dívida, limite ou comissão, e nenhum │
  │ dívida, no celular    │  cliente de outro vendedor. No HTML da Marta    │
  │                       │ também não há comissão                          │
  ├───────────────────────┼─────────────────────────────────────────────────┤
  │ Abrir sem instalar    │ ✅ tela/index.html no repositório; as 8 páginas │
  │ nada                  │  do site respondem                              │
  └───────────────────────┴─────────────────────────────────────────────────┘

  Parte 1: o diagnóstico (DIAGNOSTICO.md, só na sua máquina)
  - ✅ As 4 seções pedidas: o problema de verdade, 3 perguntas, proposta de 3
    semanas e mensagem para a Renata.
  - ✅ 1.134 palavras, cabe em 2 páginas.
  - ✅ A mensagem para a Renata tem 5 linhas, sem siglas e sem nome de
    ferramenta.
  - ❌ Ainda não está no repositório, como você pediu.

  Entrega

  ┌────────────────────────────────┬────────────────────────────────────────┐
  │             Pedido             │               Conferido                │
  ├────────────────────────────────┼────────────────────────────────────────┤
  │ Repositório no GitHub          │ ✅ público, então a Amanda não precisa │
  │                                │  de convite                            │
  ├────────────────────────────────┼────────────────────────────────────────┤
  │ Commits em várias etapas       │ ✅ 10 commits, sem linha de coautoria  │
  ├────────────────────────────────┼────────────────────────────────────────┤
  │ Prints da Marta e do vendedor  │ ✅ claro e escuro, e também o vendedor │
  │ no celular                     │  no computador                         │
  ├────────────────────────────────┼────────────────────────────────────────┤
  │ Link publicado (bônus)         │ ✅ o CI passou nos 3 últimos pushes    │
  ├────────────────────────────────┼────────────────────────────────────────┤
  │ Testes automatizados (bônus)   │ ✅ 161 passando, no computador e no CI │
  ├────────────────────────────────┼────────────────────────────────────────┤
  │ README curto: como abrir,      │ ✅ 867 palavras, com os 4 itens; o     │
  │ decisões, dados estranhos, uso │ detalhe está em docs/detalhes.md       │
  │  da IA                         │                                        │
  ├────────────────────────────────┼────────────────────────────────────────┤
  │ Links dos documentos           │ ✅ todos funcionam                     │
  ├────────────────────────────────┼────────────────────────────────────────┤
  │ Conversa com a IA              │ ❌ docs/conversa-com-ia.md ainda não   │
  │                                │ existe                                 │
  └────────────────────────────────┴────────────────────────────────────────┘

  Para fechar a entrega (prazo: amanhã, 13/11, às 18h):
  1. Exportar a conversa: rode /export e salve como docs/conversa-com-ia.md. O
     README já aponta para esse caminho.
  2. Liberar o DIAGNOSTICO.md: é só me avisar, que eu tiro ele do .gitignore,
     faço o commit e o push.
  3. Mandar para a Amanda pelo WhatsApp:
     - repositório: https://github.com/mais4g/brilho-minas-fila-financeiro
     - site: https://mais4g.github.io/brilho-minas-fila-financeiro/

  Quando você fizer o /export, eu posso conferir o arquivo e subir junto com o
  diagnóstico num commit só.

✻ Cogitated for 1m 23s · done 2:11 PM

※ recap: A entrega do desafio Brilho Minas está pronta, publicada e conferida contra o enunciado. Falta você rodar o /export, salvar em docs/conversa-com-ia.md e liberar o DIAGNOSTICO.md para eu subir os dois juntos.