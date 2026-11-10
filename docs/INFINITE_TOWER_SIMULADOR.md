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

## Busca simplificada: alcance e rush — 10/11/2026

A entrada principal passa a ter dois objetivos e o andar inicial. HP, DMG, andar-base, crescimento, elemento, Dodge, Elements Mode, Path do teste manual, quantidade de tentativas e referências dos prints ficam recolhidos em **Ajustes avançados**. Os atributos de calibração e as formações salvas são preservados. A busca sugere o resultado; usar no Infinite ou salvar no Deck continua exigindo a ação do proprietário.

Na migração inicial, quando andar, HP e DMG coincidem exatamente com um print conhecido, uma base antiga divergente é corrigida para o andar desse print, com aviso visível. Foi encontrada a combinação andar 1 / HP 18 / DMG 10 ainda associada à base 261. A correção passa a usar base 1. A migração ocorre uma única vez; atributos personalizados, crescimento e alterações posteriores em Ajustes avançados são preservados.

| Objetivo | Cenário de comparação | Ordem do ranking |
| --- | --- | --- |
| Chegar mais longe | Quatro inimigos por wave, até a equipe cair ou completar até 1.000 waves, respeitando o teto do andar 20.000 | Maior chegada média; depois abates, frequência de chegada ao teto, perdas e HP restante |
| Rush · limpar os 4 | Dez waves a partir do andar escolhido, ou menos perto do teto 20.000; quatro inimigos por wave | Maior frequência de sequência completa; depois menos ações aliadas por wave nas sequências vencidas; abates e sobrevivência desempatem |

O número de quatro inimigos por wave segue a orientação mais recente do proprietário. Ele substitui a hipótese anterior de um inimigo por andar; os campos antigos de quantidade e objetivo não determinam mais a busca automática. Os atributos dos quatro inimigos continuam aproximados a partir da referência escolhida: os prints não confirmam que os quatro tenham os mesmos atributos.

O alcance não é um máximo matemático: é a melhor candidata encontrada na busca guiada sob o modelo e o limite de segurança. Quando uma equipe atinge o teto, a interface informa que ela ainda pode ir além. O modo rush mede **ações aliadas**, incluindo ataques que erram, e não segundos reais. Uma derrota rápida não recebe vantagem por ter poucas ações. Se nenhuma sequência for vencida, ações por wave aparece sem valor e o resultado indica a falha em completar a sequência.

### Melhorias no motor e na busca

- Cada wave mantém quatro inimigos com HP próprio. Uma wave conta como limpa somente quando todos forem derrotados. Abates por splash e reflexão são contabilizados uma única vez; alvos já derrotados não exigem ataques fictícios.
- Erudition aplica o splash registrado de 8,8% aos outros inimigos vivos da wave, em vez de só ao próximo. Isso permite ao modelo comparar uma limpeza de vários alvos em uma ação quando o dano efetivamente for suficiente. Nenhuma habilidade inédita foi deduzida a partir de nomes, arte ou descrições incompletas.
- São comparados cartas, ordem de entrada, os seis suportes com implementação no motor e os sete Paths. A busca mantém Destruction Tier 5 e demais Tier 0. Suportes únicos são respeitados; a formação atual participa como candidata inicial quando válida.
- A triagem usa três amostras por candidata. As cinco líderes e a melhor de cada Path formam até doze finalistas distintas, todas comparadas com 120 testes usando as mesmas novas sementes. O resultado é escolhido novamente conforme o objetivo. A busca pode ser interrompida e entrega uma candidata conferida com aviso de resultado parcial.
- Atualizações da busca são divididas em intervalos curtos para permitir interação com o botão Parar. O teste manual e a comparação dos Paths usam o mesmo objetivo selecionado.

Validação automatizada: ranking distinto de distância e velocidade, rejeição de derrota rápida como bom rush, contabilização de waves parciais, splash em três alvos adicionais, ausência de turnos em alvos mortos, limites de segurança, reprodução por semente, sete Paths, candidatos válidos, suportes únicos, interrupção e preservação do catálogo. Executar `node scripts/test-infinite-search.js`, `node scripts/test-infinite-observations.js` e `node scripts/test-tree-planner-team.js`.

## Correção do resultado e referência do andar 822 — 10/11/2026

Esta seção revisa os números de alcance publicados anteriormente. A combinação de crescimento hipotético, ordem de ações simplificada e efeitos com persistência não confirmada permitia mostrar o teto de 1.000 como chegada média/melhor andar. Esse teto não era uma previsão validada no Roblox. A interface principal passa a exibir **Alcance real: não calibrado**; os números hipotéticos ficam em detalhes.

### Chain Avenger: inimigo observado no andar 822

- O andar 822 foi informado pelo proprietário; não aparece no recorte.
- A barra mostra **1/104.144**. Portanto, **HP máximo 104.144**, HP restante 1.
- **DMG exibido 35.991**, observado durante o combate. Buffs ativos, elemento, Path, Tier e Elements Mode não estão confirmados; o valor não foi classificado como DMG-base sem modificadores.
- O recorte confirma apenas um inimigo. Não comprova que os quatro da wave tenham esses mesmos atributos.
- [Print original no Drive](https://drive.google.com/file/d/1im4NEWiR0Y6uE5I4ltLrNMkP4fP3RPjb/view); cópia em `assets/references/FLOOR_822_CHAIN_AVENGER.png`.

Texto visível: “Each direct hit binds the target with a Chain (max 3); each Chain cuts its DMG by 8% (4% for Bosses). At 3 Chains, Judgment Chain Silences the enemy for 1 turn and deals 60% DMG, then its Chains break. When an ally is defeated, enter Scarlet Eyes for 3 turns: +30% DMG and each hit binds 2 Chains.”

Português: cada acerto direto prende o alvo com uma Chain, até 3; cada uma reduz o DMG dele em 8% (4% contra chefes). Com 3, Judgment Chain aplica Silence por 1 turno e causa 60% do DMG, depois quebra as Chains. Quando um aliado é derrotado, entra em Scarlet Eyes por 3 turnos: +30% de DMG e cada hit aplica 2 Chains.

O relato de queda perto do andar 800 com uma carta de aproximadamente 40.000 HP e 15.000 DMG foi guardado separadamente. Nome, formação e condições não foram inferidos, e esses valores não substituem nenhum registro de carta possuída. Não foi ajustada uma taxa de crescimento para forçar derrota no 800.

### Teste independente e confiança do resultado

Cada candidata recebe também um teste isolado contra **um** Chain Avenger com os atributos exibidos de 822. A equipe começa com HP cheio e estados reiniciados. Elements Mode e crescimento não multiplicam novamente esses valores. Chains, Silence, Scarlet Eyes e outros modificadores não são executados neste teste. Ele mede resistência no modelo; não comprova vencer a wave completa nem reproduz a run até 822.

No modo alcance, a sobrevivência nesse teste independente vem antes dos desempates do cenário hipotético. No rush, a verificação é exibida separadamente e não altera a prioridade de velocidade nas waves escolhidas. Se nenhuma finalista vencer a referência, o resultado informa isso explicitamente. O crescimento entre inimigos e andares diferentes permanece sem calibração.

### Correções do motor

- Removida a reserva ilimitada de Overhealth de Abundance. A captura confirma que é temporário, mas não sua duração. O efeito fica omitido e o Path sai da busca automática, sem atribuir uma duração ou limite inventado. Seis Paths permanecem na busca; Abundance continua documentado com a pendência explícita.
- O bônus de King of Curses de +10% por abate é transcrito. Sua persistência entre waves ainda não foi validada. O modelo conserva os ganhos dentro de cada wave, mas deixa de transportá-los entre andares. Isso é uma limitação conservadora do simulador, **não uma afirmação de que o jogo reinicia o bônus a cada wave**.
- Retiradas variações aleatórias não confirmadas de HP/DMG, a chance-base presumida de errar, o bônus médio de dano inventado para Eye Deal e o Dodge aleatório de 15% atribuído a Demonic Swordsaint. Sorteios confirmados de habilidades e Paths continuam disponíveis. Sorcerer Killer não ganha acerto garantido por suposição.
- B.O.B. de Ashey passa a acompanhar o crítico, em vez de causar dano adicional em todos os hits. Blood Wounds de Blue Wolf passam a depender do ataque do inimigo marcado, em vez de acumular em hits livres contra inimigos que não chegaram a atacar.
- Serenity deixa de acumular proteção fatal com as cartas de resistência/revive intrínseco confirmado (Magician, Fullmetal Alchemist e Bomb Girl).
- Limit Breaker aplica os 6 pontos percentuais adicionais de splash com Erudition e os 2% de splash fora dele, conforme a transcrição já existente. Os demais efeitos continuam parciais.

### Recomendação visual completa

O resultado da busca agora mostra quatro cartas ampliáveis, os três pares de Origin Circuits com nome e descrição e quatro suportes ilustrados, vinculados aos slots da própria candidata. Há um link para o guia dos circuitos. As conexões são calculadas por `infinite-formation.js`, compartilhado com o painel; mostrar um vínculo não significa que todos os seus gatilhos já estejam modelados.

Regressão reproduzida: no cenário hipotético antigo (andar/base 1, HP inimigo 18, DMG 10, crescimento 1%, Elements Mode ligado), a recomendação King of Curses / Emy / Blue Wolf / Ashey com Erudition chegava ao teto de 1.000 em 120/120 testes. Com as correções, a mesma configuração deixou de completar esse teto e não venceu o teste isolado de 822. Isso valida a correção do modelo; não transforma seu novo número interno em alcance real calibrado.

Testes: `test-infinite-report.js` cobre a formação independente, circuitos e imagens/efeitos de suporte, HP máximo versus restante, um único inimigo observado, ordenação pelo teste 822, exclusão de Overhealth sem duração, restrição de Serenity, splash de Limit Breaker, Blood Wounds e a recomendação antiga. O catálogo mantém **423 registros** sem alterações.
