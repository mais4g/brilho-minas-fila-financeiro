# Anomalias encontradas nos dados

> Gerado automaticamente por `npm run gerar` (data de referência 2026-11-11). Não editar à mão.

6 ocorrências.

| Arquivo | Registro | O que tem de errado | O que o sistema faz |
|---|---|---|---|
| clientes | C038 Hotel Savasi Plaza | cadastro incompleto: sem CNPJ, sem vendedor responsável, limite de crédito 0 | qualquer pedido desse cliente é sugerido como Bloquear até o cadastro ser corrigido; sem vendedor, não aparece para nenhum vendedor |
| clientes | C001 Restaurante Sabor de Minas / C037 RESTAURANTE SABOR DE MINAS LTDA | mesma empresa cadastrada 2 vezes: mesmo CNPJ (91.214.125/0001-45), mesmo telefone, vendedor, cidade, nome digitado de jeitos diferentes ("Restaurante Sabor de Minas" / "RESTAURANTE SABOR DE MINAS LTDA"); limites diferentes (8000 e 5000) | tratados como um cliente só: a dívida de todos os cadastros soma; enquanto não se confirma qual limite vale, usa o menor |
| titulos_financeiros | T0132 (cliente C006) | status "aberto", mas venceu em 2026-10-30 (12 dias de atraso) | considerado vencido: a regra usa a data de vencimento, não o status |
| pedidos | 1006 (entregue) | sem vendedor; observação: "pedido veio por áudio, vendedor não identificado" | pedido já fechado: só registrado, não afeta a fila |
| pedidos | 1013 (entregue) | comissão 33.95, mas 3% do valor dá 206.1; observação: "cliente pediu 12, conferir" | pedido já fechado: só registrado, não afeta a fila |
| pedidos | 1108 (aguardando_liberacao) | observação: "digitado 2x? conferir" | aparece como alerta para o financeiro no pedido |
