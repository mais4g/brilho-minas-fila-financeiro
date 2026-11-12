# Diagnóstico · Brilho Minas

## 1. O problema de verdade

**O gargalo não é o atendimento: é o caminho entre o pedido chegar e ser liberado.**

1. **A liberação depende da Marta consultando na mão.** A regra é objetiva, mas ela para tudo, abre o Sistemão e confere os boletos cerca de 40 vezes por dia. Daí vêm as **26 horas** e o vendedor que promete entrega para cliente bloqueado.
2. **O pedido não tem um lugar único.** É escrito 3 vezes (WhatsApp, planilha e Sistemão). Daí vêm os **12% de erro** e os **pedidos que somem**.

Os dados confirmam: pedido digitado em dobro (1105 e 1108), o mesmo restaurante cadastrado duas vezes (o pedido novo caiu no cadastro "limpo" e escondeu 72 dias de atraso), boleto vencido marcado como "aberto" e nenhum pedido registrando quem liberou.

**O robô não resolve.** Ele acelera a ponta que já funciona e joga mais pedidos numa fila que trava no financeiro. Sobre um cadastro com duplicidades, erraria mais, e na frente do cliente. Faz sentido depois, com pedido e crédito funcionando.

## 2. Três perguntas antes de construir

| Pergunta | Como a resposta muda a solução |
|---|---|
| **Marta: você libera fora da regra? Quem mais pode autorizar?** | **Não:** o que está dentro da regra é liberado sozinho e ela olha só as exceções. **Sim:** a tela precisa de "liberar mesmo assim" com justificativa e registro de quem liberou. |
| **Marta/Renata: pedido liberado e ainda não faturado já consome o limite? No cadastro duplicado, vale R$ 8 mil ou R$ 5 mil?** | Muda o cálculo do crédito disponível. Hoje só os boletos contam e uso o menor limite; a regra muda num lugar só. |
| **Vendedores: vocês lançariam o pedido no celular se a resposta do financeiro viesse em minutos?** | **Sim:** o pedido nasce certo, com cliente e catálogo. **Não:** a IA transforma o áudio do WhatsApp num rascunho que o comercial só confere. |

## 3. A proposta

Primeiro destravar a liberação, depois acabar com a redigitação, e só então a IA, com dado limpo.

- **Semana 1, liberação no mesmo dia** (este protótipo): fila do financeiro lendo a API do Sistemão, com sugestão e motivo; vendedor consultando no celular, sem ver dívidas; lista de cadastros com problema. *Medir:* horas até liberar e perguntas à Marta.
- **Semana 2, pedido lançado uma vez só:** registro único gravado no Sistemão pela API, com número e status desde a entrada e aviso de duplicidade. A planilha do Sérgio passa a ser gerada pelo sistema. *Medir:* pedidos sumidos e erros de digitação.
- **Semana 3, IA onde ela rende:** ler áudio e texto do WhatsApp e montar o rascunho do pedido para conferência, e marcar quantidades fora do padrão (como o 1013, com 120 unidades quando o cliente pediu 12). A IA não decide crédito. Só vai para ela o necessário, sem guardar o áudio (LGPD).
- **Depois:** painel de margem para a Renata (depende do custo dos produtos), robô atendendo o cliente e rota do Sérgio a partir do sistema.

## 4. Para a Renata

> Renata, o que mais atrasa o pedido não é o atendimento: é a liberação no financeiro e o pedido digitado três vezes.
> Na 1ª semana, a Marta vê na hora quem pode ser liberado e por quê, e o vendedor consulta pelo celular.
> Na 2ª, o pedido é lançado uma vez só e para de sumir.
> Na 3ª, a inteligência artificial transforma os áudios dos vendedores em pedido pronto para conferir.
> O robô para atender cliente vem depois, em cima dessa base arrumada.
