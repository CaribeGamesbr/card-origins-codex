# Infinite Tower — laboratorio de times e Paths

Atualizado em 09/11/2026. Jogo Card Origins (Roblox). Esta e uma **ferramenta experimental criada a partir dos prints do jogador**, nao o codigo oficial de combate do jogo. Os resultados estimados nunca equivalem a uma vitoria confirmada in-game.

## Cenario usado como ponto de partida

- Captura da run em andamento: **floor 261**; tempo mostrado no print: **14:57**.
- Uma inimiga visivel na captura: **Game Princess**; HP atual 5.426, **HP maximo 6.061**, DMG 2.648. A habilidade exibida comeca com *"At battle start, mark the current enemy with No Continue. The first time they Heal, revive, or gain a..."*. A frase esta **cortada**; nao e possivel modelar o restante sem outro print.
- A tela de Paths sinaliza **The Destruction EQUIPPED**, Tier 5, +8% Power. Selecao dos demais Paths e mostrada com Tier 0, +0% Power. Todos os Paths mostram +10% Skill Tree e Unbound.
- Mensagem em tela: *"RUN IN PROGRESS -- NEW PICKS QUEUE FOR YOUR NEXT RUN"*. Qualquer novo Path precisa ser testado em uma **proxima run**.
- O valor do HP da Game Princess no print e **5.426/6.061**; **nao confundir HP atual com maximo**.
- O print atual do andar 261 nao substitui eventuais registros historicos de recordes maiores.

## Sete Paths — efeitos legiveis nas capturas

| Path | Tier na captura | Efeito transcrito | Aplicacao no simulador |
| --- | ---: | --- | --- |
| The Destruction | 5 | +2,2% DMG para cada 10% de HP faltante. Ataques: 5% de chance de Fatigue para cada 25% do HP maximo faltante. +8% Power. | Multiplicador de dano conforme HP perdido. Fatigue nao foi totalmente modelado. |
| The Remembrance | 0 | 26,5% de chance por hit de Freeze (1 turno); hit em alvo Frozen adiciona 26,5% DMG e quebra o gelo. | Freeze e Shatter aproximados. |
| The Nihility | 0 | Cada hit adiciona 3 Decay (maximo 5). Cada stack queima 3,3% do HP atual do inimigo. | Dano percentual por turno. |
| The Erudition | 0 | Single-target splash de 8,8% contra cada outro inimigo e buff de 8,8% Max HP. | Splash simplificado, buff inicial de HP. |
| The Harmony | 0 | Em cada inicio de turno, inclusive dos inimigos, um buff aleatorio: +16,5% Max HP, +22% Overshield ou +16,5% DMG. | Sorteio aproximado dos buffs por rodada de ataque. |
| The Hunt | 0 | Cada abate concede +16,5% DMG, acumulavel ate 3. | Buff acumulado entre inimigos. |
| The Abundance | 0 | Cura acima do HP maximo vira Overhealth temporario para toda a party. | Excesso de cura convertido em escudo simplificado da carta ativa. |

## Cartas e suportes disponiveis

- **371 cartas principais** no catalogo; **26 possuem HP, DMG e habilidades transcritas**. As outras **345 aguardam transcricao**. Seria desonesto simular estatisticas dessas 345 a partir da imagem ou nome.
- **37 suportes** no catalogo. O Infinite Tower permite equipar ate quatro suportes (diferentemente do Memory of Chaos, em que os dois times nao os usam). O motor considera **6 suportes com efeitos registrados**: Ashen Arcanum, Unbeatable Flavor, Binding Vow, Limit Breaker, Divine Spirit Waters e Serenity. A implementacao desses efeitos e simplificada.
- Mais quatro variantes registradas: **King of Curses** (Calamity/Fire; HP 3.871, DMG 1.290), **Little Owl Man** (Calamity/Wind; HP 3.450, DMG 1.151), **Rabbit Ghoul** (Umbral/Fire; HP 4.812, DMG 1.603), **Half Ghoul** (Normal/Physical; HP 2.937, DMG 978). As imagens estao em `assets/cards/`.
- O sequenciamento das quatro cartas importa: elas lutam em ordem e o motor passa para o proximo slot quando uma cai.

## Interface e rotina de busca

Abra a aba **Infinite Tower** na pagina do Card Origins Codex. O laboratorio tem:

1. **Alvo/inimigos:** andar atual (261 por padrao), andar desejado (300 por padrao), HP e DMG de referencia, crescimento percentual por andar, 1 a 4 inimigos por andar, elemento, Dodge e alternancia do Elements Mode.
2. **Time e Path:** quatro cartas principais diferentes, ate quatro suportes, um dos sete Paths e Tier equipado. Botao para importar o Team Builder.
3. **Simular meu time:** 120 partidas virtuais com sementes diferentes.
4. **Comparar 7 Paths:** 60 testes por Path e mais 120 testes do vencedor de comparacao.
5. **Buscar melhor time:** 1.400, 7.000 ou 21.000 **tentativas** de combinacoes de time, ordem, suportes e Paths (busca aleatoria guiada; **nao exaustiva**). Cada candidata valida e sondada com 3 simulacoes, e a melhor e verificada novamente em 120 partidas. Botao "Parar busca". Rank da melhor candidata por Path.
6. **Aplicar no Team Builder** e **Copiar formacao** para testar dentro do Roblox. Nao muda o time no jogo; a transferencia acontece somente dentro do site.

## O que NAO sabemos ainda

- Crescimento real de HP e DMG de cada andar, numero de inimigos, ordem de ataque, multiplicadores de critico, frequencia de ataques e variacoes de boss. O campo de crescimento predefinido em **1% por andar e somente hipotese editavel**.
- A mecanica integral de No Continue da Game Princess. Nao se deve inferir que a inimiga e trivial porque o motor a derrota.
- Habilidades completas de outras cartas/inimigos em andares posteriores, relíquias e detalhes do skill tree ja desbloqueado.
- O modelo atual nao aplica cada elemento do sistema de circuitos, nem todas as acoes condicionais dos cards, e tampouco representa com fidelidade todos os suportes; busca util para **priorizar tentativas**, nao demonstrar um time infalivel.

## Como calibrar com prints reais

1. No proximo andar, capturar a tela **antes** de qualquer dano: floor, inimigo, HP maximo, DMG e texto inteiro de habilidade.
2. Medir em quantos ataques uma carta derrotou o inimigo, quanto dano sofreu e se houve debuffs, criticos ou evasoes.
3. Atualizar os campos editaveis do simulador de acordo com essas observacoes. Registrar a rotacao se mudar inimigo/elemento.
4. Testar uma formacao promissora no Roblox, registrar ate onde chegou e comparar com a previsao; corrigir as regras do motor se surgirem divergencias.

**Regra de confianca:** sempre diferenciar print confirmado, valor editavel hipotetico, resultado do modelo e vitoria observada no jogo.

## Painel visual de equipe — 09/11/2026

A interface foi reorganizada a partir do Deck Builder: quatro prints ampliáveis, HP/DMG por carta, circuitos entre vizinhos, totais base e quatro suportes ilustrados por slot. O arquivo `infinite-panel.js` passa a ser a interface ativa; `infinite-ui.js` permanece como referência anterior e não é carregado pela página.

- Troca de cartas e suportes por busca com imagens; cartas repetidas e suportes declarados únicos são bloqueados nos outros slots.
- Setas mudam a ordem da equipe levando o suporte junto. A formação é salva em `codex-infinite-draft-v2`, separada do Deck geral. Importar Deck é uma ação explícita.
- Sete Paths em botões visuais, Tier editável, detalhes dos efeitos registrados e aviso de que a troca vale para a próxima run no Roblox.
- Cenário conserva os atributos confirmados do andar 261 e permite informar o andar-base dos atributos, sem fixá-lo silenciosamente em 261.
- Simulação de 120 batalhas, comparação dos sete Paths e busca guiada de até 21.000 tentativas continuam disponíveis. A busca usa Destruction Tier 5 e demais Tier 0, como antes, com esse escopo explícito na interface.
- Resultados podem ser carregados apenas no painel Infinite, copiados, ou salvos no Deck por ação específica. O resultado mostra a formação e os andares testados, mesmo se o usuário editar o painel depois.
- Totais são somas dos atributos registrados. Ressonância é exibida por slot; circuitos condicionais são identificados sem afirmar que todos os seus efeitos estão implementados.
- Layout responsivo: quatro cartas em telas grandes e duas colunas no celular; seletores e ampliação usam janela com navegação por teclado.

Não foram alterados o catálogo, as habilidades transcritas ou o motor de combate. No Continue, crescimento real e interações não confirmadas continuam pendentes. O novo painel facilita a preparação de testes; não torna as estimativas uma garantia de vitória.

## Referências reais dos andares 1 e 2 — 10/11/2026

| Andar | Inimigo | HP máximo exibido | DMG exibido |
| --- | --- | --- | --- |
| 1 | Widow | 18 (barra cheia: 18/18) | 10 |
| 2 | Sinner Ruler of Life | 22 (barra cheia: 22/22) | 11 |
| 261 | Game Princess (referência anterior) | 6.061 | 2.648 |

A diferença observada entre os dois primeiros prints é HP +22,222…% e DMG +10%. São **inimigos diferentes**, com habilidades parcialmente visíveis e modificadores da run não confirmados. Isso não identifica uma lei de crescimento por andar. O valor de 1% continua uma hipótese ajustável; não foi substituído pelos percentuais observados. Nenhuma habilidade cortada foi completada ou executada por suposição.

`infinite-observations.js` mantém os atributos de batalha separados do catálogo de cartas possuídas. O painel ativo (`infinite-panel.js`) exibe as referências e permite carregar HP, DMG, elemento e andar-base. O objetivo é conservado quando válido para o novo andar; caso contrário, passa para o próprio andar da referência. O crescimento, time, suportes, Path e Tier são preservados. Elements Mode é desligado ao carregar, para não reaplicar um multiplicador desconhecido sobre os valores já exibidos. Os presets não confirmam que a captura estava ou não nesse modo.

Prints: [Widow / andar 1](https://drive.google.com/file/d/1Zas_zBi4g0aXAmnh1QliI90-_uvoHdTC/view) e [Sinner Ruler of Life / andar 2](https://drive.google.com/file/d/1cEVB8QIaA_GOYIbA2q8n-cm-zqD6kDfo/view). Cópias originais em `assets/references/`.

Para calibrar, precisamos de mais andares com o mesmo inimigo e os mesmos modificadores, além de registros de dano, cura e habilidades durante batalhas. O motor de combate não foi alterado nesta inclusão de referências.
