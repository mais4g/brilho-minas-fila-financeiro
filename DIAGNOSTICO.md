# Diagnóstico · Brilho Minas

## 1. O problema de verdade

**O gargalo não está em atender o cliente. Está no caminho entre o pedido chegar e ser liberado.** São dois problemas que se alimentam:

1. **A liberação de crédito depende de uma pessoa consultando na mão.** A regra da Marta é objetiva (boleto vencido há mais de 5 dias, ou dívida + pedido acima do limite), mas para aplicá-la ela precisa parar, abrir o Sistemão e conferir os boletos, cerca de 40 vezes por dia. Daí vêm as **26 horas** até a liberação e o vendedor que promete entrega para um cliente bloqueado.
2. **O pedido não tem um lugar único.** Ele é escrito 3 vezes: no WhatsApp, na planilha e no Sistemão. Daí vêm os **12% de erro de digitação**, os **3 a 5 pedidos que somem por semana** (se não está na planilha, o Sérgio não vê) e os pedidos digitados em dobro. Nos dados de amostra já aparecem os sinais disso: o pedido 1108, que parece cópia do 1105; o mesmo restaurante cadastrado duas vezes, com o nome digitado de outro jeito e limites diferentes (e o pedido novo caiu justamente no cadastro "limpo", escondendo uma dívida com 72 dias de atraso); um hotel cadastrado de novo com o nome digitado errado ("Savasi" em vez de "Savassi"), sem CNPJ e sem vendedor; e um boleto que venceu há 12 dias e continua marcado como "aberto". E nenhum dos 110 pedidos registra quem liberou nem quando: a decisão da Marta acontece no WhatsApp e não fica em lugar nenhum.

**O robô que a Renata pediu não resolve.** Ele melhora a ponta que hoje funciona (o cliente consegue pedir e tem relação com o vendedor) e despeja mais pedidos, mais rápido, numa fila que trava no financeiro e na redigitação. Além disso, um robô tirando pedido sozinho sobre um cadastro com duplicidades e 12% de erro tende a errar mais, e na frente do cliente. Também não ajuda na terceira dor dela, de só descobrir a margem no dia 10. O robô pode fazer sentido **depois**, plugado numa base em que pedido e crédito já andam sozinhos.

## 2. Antes de construir: 3 perguntas

| Pergunta | Para quem | Como a resposta muda a solução |
|---|---|---|
| **Você libera pedidos fora da regra? Quando, e quem mais pode autorizar?** (cliente antigo, pagamento prometido, pedido pequeno) | Marta | **Se não:** pedidos dentro da regra podem ser liberados automaticamente, e a Marta passa a olhar só as exceções, o que muda a tela de "fila" para "caixa de exceções". **Se sim:** a tela precisa de "liberar mesmo assim" com justificativa e registro de quem liberou. |
| **Um pedido já liberado, mas ainda não faturado, já consome o limite? E, no cliente cadastrado em dobro (Sabor de Minas), qual limite vale: R$ 8 mil ou R$ 5 mil?** | Marta / Renata | Muda o cálculo do crédito disponível. No protótipo, só os boletos contam como dívida (um cliente com vários pedidos liberados no mesmo dia pode passar do limite sem a regra ver), e no cadastro duplicado usei o menor limite. Se a resposta for outra, a regra muda num lugar só e os testes mostram o impacto. |
| **O vendedor registraria o pedido ele mesmo, num formulário simples no celular, se isso garantisse a resposta do financeiro em minutos?** | Vendedores (Carlos) e Renata | Define onde o pedido nasce. **Se sim:** o vendedor lança o pedido uma vez, já com o catálogo e o cliente certos. **Se não:** o pedido continua chegando por áudio e texto no WhatsApp, e a IA entra para transformar isso num rascunho que o Bruno ou a Lia só conferem. |

## 3. A proposta: o que entra nas 3 semanas e o que fica para depois

A ordem segue a dor: primeiro destravar a liberação, que é a meta da Renata e é onde a regra já está pronta; depois acabar com a redigitação; só então colocar a IA, com dado limpo para trabalhar.

**Semana 1: liberação no mesmo dia** (é o recorte deste protótipo)
- A fila do financeiro lê clientes, pedidos e boletos direto da API do Sistemão, sugere Liberar, Atenção ou Bloquear com o motivo, e deixa a Marta decidir em um clique.
- O vendedor consulta no celular a situação dos próprios pedidos e clientes, sem valores de dívida, sem precisar perguntar à Marta.
- Um relatório de problemas no cadastro (cliente cadastrado em dobro, cliente sem vendedor ou sem limite, boleto com status errado) para a equipe corrigir.
- *Medir:* horas até a liberação e número de perguntas à Marta por dia.

**Semana 2: o pedido é lançado uma vez só**
- Um registro único do pedido, feito pelo vendedor ou pelo comercial (depende da pergunta 3), que grava direto no Sistemão pela API, que aceita escrita de pedidos.
- Cada pedido ganha número e status desde a entrada, então nada some, e um aviso de possível duplicidade aparece antes de gravar.
- A planilha vira um relatório gerado automaticamente, para o Sérgio não mudar de hábito na rota.
- *Medir:* pedidos digitados mais de uma vez, pedidos "sumidos" e erros de digitação.

**Semana 3: a IA onde ela rende**
- **IA para ler os pedidos do WhatsApp:** transforma o áudio, o print ou o texto do vendedor num rascunho de pedido, com cliente e produtos do catálogo, que uma pessoa confere antes de gravar. Ela não decide crédito, porque crédito é regra, não adivinhação. Como áudio e mensagem de cliente são dado pessoal, só vai para a IA o necessário para montar o pedido, sem guardar o áudio depois (LGPD).
- **IA para conferir o pedido:** marca quantidades fora do padrão do cliente (por exemplo, o pedido 1013 com 120 unidades quando "o cliente pediu 12").
- O vendedor recebe aviso quando o pedido é liberado ou bloqueado.

**Depois (fases seguintes)**
- **Painel diário de vendas e margem para a Renata.** Precisa do custo dos produtos, que hoje não vem na API.
- **Robô atendendo o cliente no WhatsApp.** Fica para depois de o registro único e a liberação automática estarem funcionando; antes disso, ele só aumentaria a fila.
- **Rota do Sérgio montada a partir do sistema**, e não da planilha.

## 4. Para a Renata entender

> Renata, olhando a operação, o que mais atrasa o pedido não é o atendimento: é a liberação no financeiro e o pedido digitado três vezes.
> Na 1ª semana, a Marta passa a ver na hora quem pode ser liberado e por quê, e o vendedor consulta isso no celular, sem perguntar.
> Na 2ª, o pedido é lançado uma vez só e para de sumir.
> Na 3ª, a inteligência artificial transforma os áudios dos vendedores em pedido pronto para conferir.
> O robô para atender cliente vem depois, em cima dessa base arrumada; antes disso, ele só aumentaria a fila.
